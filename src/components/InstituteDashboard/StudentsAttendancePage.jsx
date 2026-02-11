import React, { useEffect, useMemo, useState, useRef } from "react";

import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { Pagination } from "./shared";
import { Search, Download, ChevronDown } from "lucide-react";

const today = new Date().toISOString().split("T")[0];

const MONTHS = [
  { label: "January", value: "01" },
  { label: "February", value: "02" },
  { label: "March", value: "03" },
  { label: "April", value: "04" },
  { label: "May", value: "05" },
  { label: "June", value: "06" },
  { label: "July", value: "07" },
  { label: "August", value: "08" },
  { label: "September", value: "09" },
  { label: "October", value: "10" },
  { label: "November", value: "11" },
  { label: "December", value: "12" },
];
const TIME_SLOTS = [
  { value: "09:00", label: "09:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "13:00", label: "01:00 PM" },
  { value: "14:00", label: "02:00 PM" },
  { value: "15:00", label: "03:00 PM" },
  { value: "16:00", label: "04:00 PM" },
  { value: "17:00", label: "05:00 PM" },
  { value: "18:00", label: "06:00 PM" },
  { value: "19:00", label: "07:00 PM" },
  { value: "20:00", label: "08:00 PM" },
  { value: "21:00", label: "09:00 PM" },
  { value: "22:00", label: "10:00 PM" },
];

const SESSIONS = ["Morning", "Afternoon", "Evening"];

const StudentsAttendancePage = () => {
  const [selectedTime, setSelectedTime] = useState("");
  const timeRef = useRef(null);
  const monthRef = useRef(null);

  const { user, institute } = useAuth();

  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [search, setSearch] = useState("");

  const [selectedMonth, setSelectedMonth] = useState("");

  const [selectedSession, setSelectedSession] = useState("");
  const [selectedDate, setSelectedDate] = useState(today);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);

  const [summary, setSummary] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load Students
  useEffect(() => {
    if (!user || institute?.role !== "institute") return;

    const q = query(
      collection(db, "students"),
      where("instituteId", "==", user.uid),
    );

    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
      setStudents(list);
    });
  }, [user, institute]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        timeRef.current &&
        !timeRef.current.contains(e.target) &&
        monthRef.current &&
        !monthRef.current.contains(e.target)
      ) {
        setShowTimeDropdown(false);
        setShowMonthDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ FIXED SUMMARY + ATTENDANCE COUNT (NO DOUBLE COUNT)
  useEffect(() => {
    if (!user || !selectedMonth) return;

    const monthKey = `${new Date().getFullYear()}-${selectedMonth}`;

    const q = query(
      collection(db, "attendance"),
      where("instituteId", "==", user.uid),
      where("month", "==", monthKey),
    );

    return onSnapshot(q, (snap) => {
      const map = {};

      // ONLY count unique student for selected date + session
      const todayStatusMap = {};

      snap.docs.forEach((docSnap) => {
        const d = docSnap.data();

        if (!map[d.studentId]) map[d.studentId] = {};
        map[d.studentId][`${d.date}_${d.session}_${d.time}`] = d.status;

        // Only count for selected date + session
        if (d.date === selectedDate && d.session === selectedSession) {
          todayStatusMap[d.studentId] = d.status;
        }
      });

      let presentToday = 0;
      let absentToday = 0;

      Object.values(todayStatusMap).forEach((status) => {
        if (status === "present") presentToday++;
        if (status === "absent") absentToday++;
      });

      setAttendance(map);

      setSummary({
        totalStudents: students.length,
        presentToday,
        absentToday,
      });
    });
  }, [user, selectedMonth, selectedDate, selectedSession, students.length]);

  // Filter
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const name = `${s.firstName} ${s.lastName}`.toLowerCase();

      const matchSearch = name.includes(search.toLowerCase());

      // 🔥 NEW FILTERS
      const matchSession = !selectedSession || s.sessions === selectedSession;

      const matchTime = !selectedTime || s.timings === selectedTime;

      return matchSearch && matchSession && matchTime;
    });
  }, [students, search, selectedSession, selectedTime]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage]);

  // Save Attendance
  const setStudentAttendance = async (student, status) => {
    const monthKey = selectedDate.slice(0, 7);

    await setDoc(
      doc(
        db,
        "attendance",
        `${student.uid}_${selectedDate}_${selectedSession}_${selectedTime}`,
      ),
      {
        instituteId: user.uid,
        studentId: student.uid,
        session: selectedSession,
        date: selectedDate,
        month: monthKey,
        status: status,
        createdAt: serverTimestamp(),
        time: selectedTime,
      },
      { merge: true },
    );
  };

  // Export CSV
  const exportData = async () => {
    const monthKey = `${new Date().getFullYear()}-${selectedMonth}`;

    const q = query(
      collection(db, "attendance"),
      where("instituteId", "==", user.uid),
      where("month", "==", monthKey),
    );

    const snap = await getDocs(q);

    let csv = "Student Name,Session,Date,Status\n";

    snap.forEach((docSnap) => {
      const d = docSnap.data();
      const student = students.find((s) => s.uid === d.studentId);

      csv += `${student?.firstName || ""} ${student?.lastName || ""},${d.session},"${d.date}",${d.status}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${monthKey}.csv`;
    a.click();
  };

  return (
    <div className="p-6 bg-[#F3F4F6] min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-orange-500 flex items-center gap-2">
          Students Attendance
        </h1>

        <div ref={monthRef} className="relative min-w-[170px]">
          <button
            onClick={() => setShowMonthDropdown(!showMonthDropdown)}
            className="bg-orange-500 text-white rounded-lg px-4 py-3 font-semibold w-full flex items-center justify-between"
          >
            <span>
              {selectedMonth
                ? MONTHS.find((m) => m.value === selectedMonth)?.label
                : "Select Month"}
            </span>

            <ChevronDown
              size={16}
              className={`ml-2 transition-transform ${
                showMonthDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {showMonthDropdown && (
            <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-md max-h-48 overflow-y-auto">
              {MONTHS.map((m) => (
                <div
                  key={m.value}
                  onClick={() => {
                    setSelectedMonth(m.value);
                    setShowMonthDropdown(false);
                  }}
                  className="px-4 py-2 hover:bg-blue-100 cursor-pointer text-black"
                >
                  {m.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SUMMARY */}
      <div className="bg-white border border-orange-200 rounded-xl p-5 flex justify-between mb-6">
        <div>
          <p className="text-gray-600">Total Students</p>
          <h2 className="text-xl font-bold text-orange-500">
            {summary.totalStudents}
          </h2>
        </div>

        <div>
          <p className="text-gray-600">Present Today</p>
          <h2 className="text-xl font-bold text-orange-500">
            {summary.presentToday}
          </h2>
        </div>

        <div>
          <p className="text-gray-600">Absent Today</p>
          <h2 className="text-xl font-bold text-orange-500">
            {summary.absentToday}
          </h2>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white border border-orange-200 rounded-xl p-4 flex justify-between items-center mb-6">
        <div className="flex gap-6 items-center">
          <div className="text-lg font-bold text-black">Attendance Records</div>

          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="bg-white border border-orange-300 rounded-lg px-4 py-2 font-semibold outline-none"
          >
            <option value="" disabled>
              Session
            </option>

            {SESSIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <div ref={timeRef} className="relative min-w-[200px]">
            <button
              onClick={() => setShowTimeDropdown(!showTimeDropdown)}
              className="w-full border border-orange-300 bg-white rounded-lg px-4 py-2 font-semibold flex items-center justify-between"
            >
              <span>
                {selectedTime
                  ? TIME_SLOTS.find((t) => t.value === selectedTime)?.label
                  : "Timings"}
              </span>

              <ChevronDown
                size={16}
                className={`ml-2 transition-transform ${
                  showTimeDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showTimeDropdown && (
              <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-md max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400">
                {TIME_SLOTS.map((t) => (
                  <div
                    key={t.value}
                    onClick={() => {
                      setSelectedTime(t.value);
                      setShowTimeDropdown(false);
                    }}
                    className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                  >
                    {t.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <div className="flex items-center border border-orange-400 rounded-lg px-3 py-2">
            <Search size={18} className="text-gray-500" />
            <input
              placeholder="Search Name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none ml-2"
            />
          </div>

          <button
            onClick={exportData}
            className="border border-orange-400 text-gray-700 px-5 py-2 rounded-lg flex items-center gap-2"
          >
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="border border-orange-300 rounded-xl overflow-hidden">
        <div className="grid grid-cols-4 bg-[#1F2937] text-orange-400 font-semibold p-4">
          <div>Students Name</div>
          <div>Session</div>
          <div className="text-center">Present</div>
          <div className="text-center">Absent</div>
        </div>

        <div className="bg-white min-h-[300px]">
          {paginatedStudents.map((s, index) => {
            const currentStatus =
              attendance[s.uid]?.[
                `${selectedDate}_${selectedSession}_${selectedTime}`
              ];

            return (
              <div
                key={s.uid}
                className="grid grid-cols-4 p-4 border-t items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="mr-1 text-gray-500 font-semibold">
                    {(currentPage - 1) * itemsPerPage + index + 1}.
                  </div>

                  <div className="font-semibold">
                    {s.firstName} {s.lastName}
                  </div>
                </div>

                <div>{s.sessions || "-"}</div>

                <div className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={currentStatus === "present"}
                    onChange={() => setStudentAttendance(s, "present")}
                    className="w-5 h-5"
                  />
                </div>

                <div className="flex justify-center">
                  <input
                    type="checkbox"
                    checked={currentStatus === "absent"}
                    onChange={() => setStudentAttendance(s, "absent")}
                    className="w-5 h-5"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default StudentsAttendancePage;
