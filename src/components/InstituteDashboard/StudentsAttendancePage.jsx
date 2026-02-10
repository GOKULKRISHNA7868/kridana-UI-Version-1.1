import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { Pagination } from "./shared";

const today = new Date().toISOString().split("T")[0];

const normalizeDate = (date) => {
  if (!date) return null;

  // Firestore Timestamp
  if (date.seconds) {
    return new Date(date.seconds * 1000).toISOString().split("T")[0];
  }

  // JS Date
  if (date instanceof Date) {
    return date.toISOString().split("T")[0];
  }

  // String (ISO or YYYY-MM-DD)
  return date.split("T")[0];
};

const isSameDate = (joinedDate, selectedDate) => {
  if (!selectedDate) return true; // no filter applied
  const joined = normalizeDate(joinedDate);
  return joined === selectedDate;
};




const StudentsAttendancePage = () => {
  const { user, institute } = useAuth();

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [attendance, setAttendance] = useState({});
  const [summary, setSummary] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  // 🔢 Pagination state
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10;


  // 🔒 Load institute students
  useEffect(() => {
    if (!user || institute?.role !== "institute") return;

    const q = query(
      collection(db, "students"),
      where("instituteId", "==", user.uid)
    );

    return onSnapshot(q, (snap) => {
      setStudents(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
    });
  }, [user, institute]);

  useEffect(() => {
  setCurrentPage(1);
}, [search, selectedDate]);

  // 📅 Load attendance for selected date
  useEffect(() => {
    if (!user || !selectedDate) {
  setAttendance({});
  return;
}


    const q = query(
      collection(db, "attendance"),
      where("instituteId", "==", user.uid),
      where("date", "==", selectedDate)
    );

    return onSnapshot(q, (snap) => {
      const map = {};
      snap.docs.forEach((d) => {
        map[d.data().studentId] = d.data().status === "present";
      });
      setAttendance(map);
    });
  }, [user, selectedDate]);

  // 📊 Load attendance summary (after joining date)
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "attendance"),
      where("instituteId", "==", user.uid)
    );

    return onSnapshot(q, (snap) => {
      const stats = {};

      snap.docs.forEach((d) => {
        const { studentId, status, date } = d.data();
        if (!stats[studentId]) {
          stats[studentId] = { present: 0, total: 0 };
        }

        stats[studentId].total++;
        if (status === "present") stats[studentId].present++;
      });

      setSummary(stats);
    });
  }, [user]);

  // 🔍 Search filter
  const filteredStudents = useMemo(() => {
  return students.filter((s) => {
    const fullName = `${s.firstName} ${s.lastName}`
      .toLowerCase()
      .includes(search.toLowerCase());

   const validForDate = isSameDate(s.joinedDate || s.createdAt, selectedDate);

    return fullName && validForDate;
  });
}, [students, search, selectedDate]);

  // 📄 Pagination calculations
const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

const paginatedStudents = useMemo(() => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredStudents.slice(startIndex, endIndex);
}, [filteredStudents, currentPage]);



  useEffect(() => {
  console.log(
    students.map(s => ({
      name: `${s.firstName} ${s.lastName}`,
      joinedDate: s.joinedDate
    }))
  );
}, [students]);

const canEditDate = (joinDate) => {
  if (!selectedDate) return false;
  if (selectedDate > today) return false;

  const joined = normalizeDate(joinDate);
  if (joined && selectedDate < joined) return false;

  return true;
};



  // ✅ Save attendance
  const markAttendance = async (student, value) => {
    if (!canEditDate(student.joinedDate)) return;

    await setDoc(
      doc(db, "attendance", `${student.uid}_${selectedDate}`),
      {
        instituteId: user.uid,
        studentId: student.uid,
        date: selectedDate,
        month: selectedDate.slice(0, 7),
        status: value ? "present" : "absent",
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  return (
    <div className="h-full bg-white text-[#3F2A14] p-6 rounded-lg"> 
      {/* 🔍 Search */}
      <div className="flex items-center mb-4">
        <div className="flex items-center bg-gray-100 border border-gray-300 rounded-full px-4 py-2 w-full max-w-md">

          🔍
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students by name..."
            className="bg-transparent outline-none text-sm w-full ml-2 text-[#3F2A14] placeholder-[#A16207]"
          />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-extrabold text-orange-500">
          Students Attendance
        </h1>
        <input
  type="date"
  value={selectedDate}
  onChange={(e) => setSelectedDate(e.target.value)}
  className="bg-orange-500 text-white px-4 py-2 rounded-full"
  placeholder="dd-mm-yyyy"
/>

      </div>

      {/* Table */}
    <div className="bg-[#FED7AA] rounded-xl border border-white shadow-sm">

      <div className="grid grid-cols-4 gap-4 px-4 py-3 text-black font-semibold text-sm">
  <div className="text-left">Student Name</div>
  <div className="text-left">Category</div>
  <div className="text-center">Present</div>
  <div className="text-center">Absent</div>
</div>


       <div className="bg-white text-black">
  {paginatedStudents.length === 0 ? (
    /* ✅ EMPTY STATE */
    <div className="grid grid-cols-4 px-4 py-4 border-t text-center text-gray-500 font-medium">
      <div className="col-span-4">
        No students assigned
      </div>
    </div>
  ) : (
    paginatedStudents.map((s) => {
      const stat = summary[s.uid] || { present: 0, total: 0 };
      const percentage =
        stat.total === 0
          ? 0
          : Math.round((stat.present / stat.total) * 100);

      return (
        <div
          key={s.uid}
          className="grid grid-cols-4 gap-4 px-4 py-3 border-t items-center text-sm"
        >
          <div className="font-semibold">
            {s.firstName} {s.lastName}
            <div className="text-xs text-gray-500">
              {stat.present}/{stat.total} • {percentage}%
            </div>
          </div>

          <div>{s.category || "-"}</div>

          <div className="flex justify-center">
            <button
              disabled={!canEditDate(s.joinedDate)}
              onClick={() => markAttendance(s, true)}
              className={
                "px-3 py-1 rounded-full text-xs font-semibold w-fit " +
                (attendance[s.uid] === true
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-700")
              }
            >
              Present
            </button>
          </div>

          <div className="flex justify-center">
            <button
              disabled={!canEditDate(s.joinedDate)}
              onClick={() => markAttendance(s, false)}
              className={
                "px-3 py-1 rounded-full text-xs font-semibold w-fit " +
                (attendance[s.uid] === false
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 text-gray-700")
              }
            >
              Absent
            </button>
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