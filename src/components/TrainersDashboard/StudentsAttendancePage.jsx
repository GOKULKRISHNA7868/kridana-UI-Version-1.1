import React, { useEffect, useMemo, useState } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Pagination } from "./shared";

const StudentsAttendancePage = () => {
  const user = auth.currentUser;

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const currentMonth = selectedDate.slice(0, 7);

  const [trainerUID, setTrainerUID] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔢 Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 🔄 Track saving student
  const [savingStudentId, setSavingStudentId] = useState(null);

  /* ======================================
     🔍 RESOLVE TRAINER UID
     ====================================== */
  useEffect(() => {
    if (!user) return;

    const resolveTrainerUID = async () => {
      const trainerSnap = await getDoc(doc(db, "trainers", user.uid));
      if (trainerSnap.exists()) {
        setTrainerUID(user.uid);
        return;
      }

      const studentSnap = await getDoc(doc(db, "trainerstudents", user.uid));
      if (studentSnap.exists()) {
        setTrainerUID(studentSnap.data().trainerUID);
      }
    };

    resolveTrainerUID();
  }, [user]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  /* ======================================
     🎓 FETCH STUDENTS
     ====================================== */
  useEffect(() => {
    if (!trainerUID) return;

    const fetchStudents = async () => {
      const trainerSnap = await getDoc(doc(db, "trainers", trainerUID));
      if (!trainerSnap.exists()) return;

      const ids = trainerSnap.data().students || [];

      const list = await Promise.all(
        ids.map(async (id) => {
          const snap = await getDoc(doc(db, "trainerstudents", id));
          if (!snap.exists()) return null;
          return { id, ...snap.data() };
        })
      );

      setStudents(list.filter(Boolean));
      setLoading(false);
    };

    fetchStudents();
  }, [trainerUID]);

  /* ======================================
     📅 FETCH ATTENDANCE
     ====================================== */
  useEffect(() => {
    if (!trainerUID) return;

    const fetchAttendance = async () => {
      const docId = `${trainerUID}_${currentMonth}`;
      const snap = await getDoc(doc(db, "trainerstudentsattendance", docId));

      setAttendanceData(snap.exists() ? snap.data().records || {} : {});
    };

    fetchAttendance();
  }, [trainerUID, currentMonth]);

  /* ======================================
     📅 DATE VALIDATION
     ====================================== */
  const canEditAttendance = (joinedDate) => {
    const selected = new Date(selectedDate);
    return selected >= new Date(joinedDate) && selected <= new Date(today);
  };

  const getBlockMessage = (joinedDate) => {
    const selected = new Date(selectedDate);
    if (selected < new Date(joinedDate))
      return "⚠️ Attendance cannot be marked before joining date";
    if (selected > new Date(today))
      return "⚠️ Future date attendance is not allowed";
    return "";
  };

  /* ======================================
     ✅ UPDATE ATTENDANCE
     ====================================== */
  const markAttendance = async (studentUID, status, joinedDate) => {
    if (!canEditAttendance(joinedDate)) {
      setMessage(getBlockMessage(joinedDate));
      return;
    }

    try {
      setSavingStudentId(studentUID);
      setMessage("");

      const docId = `${trainerUID}_${currentMonth}`;

      await setDoc(
        doc(db, "trainerstudentsattendance", docId),
        {
          trainerUID,
          month: currentMonth,
          updatedAt: serverTimestamp(),
          records: {
            [studentUID]: {
              [selectedDate]: status,
            },
          },
        },
        { merge: true }
      );

      setAttendanceData((prev) => ({
        ...prev,
        [studentUID]: {
          ...(prev[studentUID] || {}),
          [selectedDate]: status,
        },
      }));

      setMessage("✅ Attendance saved successfully");
    } catch (err) {
      console.error("Attendance update failed:", err);
      setMessage("❌ Failed to update attendance");
    } finally {
      setSavingStudentId(null);
    }
  };

  /* ======================================
     📊 COUNT PRESENT / ABSENT
     ====================================== */
  const getCounts = (studentUID) => {
    const records = attendanceData[studentUID] || {};
    let present = 0;
    let absent = 0;

    Object.values(records).forEach((v) => {
      if (v === "present") present++;
      if (v === "absent") absent++;
    });

    return { present, absent };
  };

  /* ======================================
     🔍 SEARCH FILTER
     ====================================== */
  const filteredRows = useMemo(
    () =>
      students.filter((s) =>
        `${s.firstName} ${s.lastName}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [students, search]
  );

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRows.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRows, currentPage]);

  if (loading) return <div className="p-6 text-[#3F2A14]">Loading...</div>;

  return (
    <div className="h-full bg-white text-[#3F2A14] p-6 rounded-lg">
      {/* Search & Date */}
      <div className="mb-4">
        <div className="flex items-center bg-gray-100 border border-gray-300 rounded-full px-4 py-2 w-full max-w-md">
          🔍
          <input
            placeholder="Search students by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm w-full ml-2 text-[#3F2A14] placeholder-[#A16207]"
          />
        </div>
      </div>

      {/* 🟠 Heading + Date */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-extrabold text-orange-500">
          Students Attendance
        </h1>

        <input
          type="date"
          value={selectedDate}
          max={today}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setMessage("");
          }}
          className="bg-orange-500 text-white px-4 py-2 rounded-full"
        />
      </div>

      {message && (
        <div className="mb-3 text-orange-600 font-semibold text-sm">
          {message}
        </div>
      )}

      {/* Table */}
      <div className="bg-[#FED7AA] rounded-t-xl border border-orange-300">
        <div className="grid grid-cols-7 px-4 py-3 text-black font-semibold">
          <div>Name</div>
          <div>Category</div>
          <div>Joined</div>
          <div className="text-center">Present</div>
          <div className="text-center">Absent</div>
          <div className="text-center">P</div>
          <div className="text-center">A</div>
        </div>

        <div className="bg-white text-black">
          {paginatedRows.length === 0 ? (
            /* ✅ EMPTY STATE */
            <div className="grid grid-cols-7 px-4 py-4 border-t text-center text-gray-500 font-medium">
              <div className="col-span-7">No students assigned</div>
            </div>
          ) : (
            paginatedRows.map((s) => {
              const todayStatus = attendanceData[s.id]?.[selectedDate];
              const counts = getCounts(s.id);
              const editable = canEditAttendance(s.joinedDate);
              const saving = savingStudentId === s.id;

              return (
                <div
                  key={s.id}
                  className="grid grid-cols-7 px-4 py-3 border-t items-center text-sm"
                >
                  <div className="font-semibold">
                    {s.firstName} {s.lastName}
                  </div>
                  <div>{s.category || "-"}</div>
                  <div className="text-xs text-gray-500">{s.joinedDate}</div>

                  <div className="flex justify-center">
                    <button
                      disabled={!editable || saving}
                      onClick={() =>
                        markAttendance(s.id, "present", s.joinedDate)
                      }
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        todayStatus === "present"
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {saving ? "Saving..." : "Present"}
                    </button>
                  </div>

                  <div className="flex justify-center">
                    <button
                      disabled={!editable || saving}
                      onClick={() =>
                        markAttendance(s.id, "absent", s.joinedDate)
                      }
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        todayStatus === "absent"
                          ? "bg-red-500 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {saving ? "Saving..." : "Absent"}
                    </button>
                  </div>

                  <div className="font-semibold text-green-600 text-center">
                    {counts.present}
                  </div>
                  <div className="font-semibold text-red-600 text-center">
                    {counts.absent}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
};

export default StudentsAttendancePage;
