import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../firebase";
import dayjs from "dayjs";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const times = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

export default function StudentTimetable() {
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  const instituteId = "sTTI0zsvJOeKZF2iPn8GSEjDcqo2";
  const today = dayjs().format("ddd");
  const todayDate = dayjs().format("YYYY-MM-DD");

  /* ---------------- AUTH ---------------- */
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsub();
  }, []);

  /* ---------------- FETCH TIMETABLE ---------------- */
  useEffect(() => {
    if (!user) return;

    const fetchTimetable = async () => {
      const q = query(
        collection(db, "institutes", instituteId, "timetable"),
        where("students", "array-contains", user.uid)
      );
      const snap = await getDocs(q);
      setClasses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };

    fetchTimetable();
  }, [user]);

  /* ---------------- FETCH ATTENDANCE ---------------- */
  useEffect(() => {
    if (!user) return;

    const fetchAttendance = async () => {
      const q = query(
        collection(db, "institutes", instituteId, "attendance"),
        where("studentId", "==", user.uid)
      );
      const snap = await getDocs(q);
      setAttendance(snap.docs.map((d) => d.data()));
    };

    fetchAttendance();
  }, [user]);

  /* ---------------- HELPERS ---------------- */
  const getAttendance = (day, time) => {
    return attendance.find((a) => a.day === day && a.time === time);
  };

  const attendancePercent = () => {
    if (attendance.length === 0) return 0;
    const present = attendance.filter((a) => a.status === "Present").length;
    return Math.round((present / attendance.length) * 100);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-4">📅 My Class Timetable</h1>

      {/* ATTENDANCE SUMMARY */}
      <div className="mb-6 p-4 bg-gray-800 rounded-xl">
        <p className="text-lg font-semibold">
          📊 Attendance Percentage:{" "}
          <span className="text-green-400">{attendancePercent()}%</span>
        </p>
      </div>

      {/* TIMETABLE GRID */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-8 gap-1">
          {/* HEADER */}
          <div />
          {days.map((d) => (
            <div
              key={d}
              className={`text-center font-bold p-2 rounded 
                ${d === today ? "bg-blue-600" : "bg-gray-700"}`}
            >
              {d}
            </div>
          ))}

          {/* TIME ROWS */}
          {times.map((time) => (
            <React.Fragment key={time}>
              <div className="bg-gray-700 p-2 text-center font-semibold">
                {time}
              </div>

              {days.map((day) => {
                const cls = classes.find(
                  (c) => c.day === day && c.time === time
                );
                const att = getAttendance(day, time);
                const isToday = day === today;

                if (!cls) return <div key={day} />;

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedClass({ cls, att })}
                    className={`
                      cursor-pointer p-2 rounded text-sm text-center
                      ${isToday ? "animate-pulse border-2 border-blue-400" : ""}
                      ${
                        att?.status === "Absent" ? "bg-red-700" : "bg-green-700"
                      }
                    `}
                  >
                    <p className="font-semibold">{cls.category}</p>
                    <p className="text-xs">{cls.trainerName}</p>
                    <p className="text-xs mt-1">
                      {att ? att.status : "Not Marked"}
                    </p>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* CLASS DETAIL MODAL */}
      {selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-xl w-96">
            <h2 className="text-xl font-bold mb-2">
              {selectedClass.cls.category}
            </h2>
            <p>Trainer: {selectedClass.cls.trainerName}</p>
            <p>Day: {selectedClass.cls.day}</p>
            <p>Time: {selectedClass.cls.time}</p>

            <p
              className={`mt-3 font-bold ${
                selectedClass.att?.status === "Absent"
                  ? "text-red-400"
                  : "text-green-400"
              }`}
            >
              Attendance: {selectedClass.att?.status || "Not Marked"}
            </p>

            <button
              onClick={() => setSelectedClass(null)}
              className="mt-4 w-full bg-blue-600 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MONTHLY ATTENDANCE */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-3">
          📆 Monthly Attendance Calendar
        </h2>

        <div className="grid grid-cols-7 gap-2">
          {attendance.map((a, i) => (
            <div
              key={i}
              className={`p-2 rounded text-center text-xs
                ${a.status === "Absent" ? "bg-red-700" : "bg-green-700"}`}
            >
              {a.date}
              <br />
              {a.status}
            </div>
          ))}
        </div>
      </div>

      {/* PARENT REPORT */}
      <div className="mt-10 p-4 bg-gray-800 rounded-xl">
        <h2 className="text-xl font-bold mb-2">👨‍👩‍👧 Parent Attendance Report</h2>

        <p>Total Classes: {attendance.length}</p>
        <p className="text-green-400">
          Present: {attendance.filter((a) => a.status === "Present").length}
        </p>
        <p className="text-red-400">
          Absent: {attendance.filter((a) => a.status === "Absent").length}
        </p>
      </div>
    </div>
  );
}