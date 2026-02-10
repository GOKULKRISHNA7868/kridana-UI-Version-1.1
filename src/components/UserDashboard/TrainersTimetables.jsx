import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

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

export default function TrainerTimetable() {
  const [trainer, setTrainer] = useState(null);
  const [instituteId, setInstituteId] = useState("");
  const [classes, setClasses] = useState([]);
  const [studentsMap, setStudentsMap] = useState({});
  const [attendanceMap, setAttendanceMap] = useState({});
  const [selectedClass, setSelectedClass] = useState(null);

  /* ================= AUTH ================= */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const q = query(
        collection(db, "InstituteTrainers"),
        where("trainerUid", "==", user.uid)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        const data = snap.docs[0].data();
        setTrainer({
          uid: user.uid,
          name: data.trainerName,
        });
        setInstituteId(data.instituteId);
      }
    });

    return () => unsub();
  }, []);

  /* ================= LOAD TIMETABLE ================= */
  useEffect(() => {
    if (!trainer || !instituteId) return;

    const load = async () => {
      const q = query(
        collection(db, "institutes", instituteId, "timetable"),
        where("trainerId", "==", trainer.uid)
      );
      const snap = await getDocs(q);
      setClasses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };

    load();
  }, [trainer, instituteId]);

  /* ================= LOAD STUDENTS + ATTENDANCE ================= */
  const loadDetails = async (slot) => {
    setSelectedClass(slot);

    const studentData = {};
    for (const sid of slot.students) {
      const sRef = doc(db, "students", sid);
      const sSnap = await getDoc(sRef);
      if (sSnap.exists()) studentData[sid] = sSnap.data();
    }
    setStudentsMap(studentData);

    // Attendance
    const attSnap = await getDocs(
      query(
        collection(db, "institutes", instituteId, "attendance"),
        where("category", "==", slot.category)
      )
    );

    const map = {};
    attSnap.forEach((d) => {
      const { studentId, status } = d.data();
      if (!map[studentId]) map[studentId] = { total: 0, present: 0 };
      map[studentId].total++;
      if (status === "Present") map[studentId].present++;
    });

    setAttendanceMap(map);
  };

  const getPercentage = (sid) => {
    const a = attendanceMap[sid];
    if (!a || a.total === 0) return "0%";
    return `${Math.round((a.present / a.total) * 100)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        📅 Trainer Timetable
      </h1>

      {/* TIMETABLE */}
      <div className="overflow-x-auto">
        <div className="grid grid-cols-8 gap-1 min-w-[900px]">
          <div />
          {days.map((d) => (
            <div
              key={d}
              className="text-center font-semibold p-2 bg-blue-600 text-white rounded"
            >
              {d}
            </div>
          ))}

          {times.map((time) => (
            <>
              <div className="bg-gray-700 text-white p-2 text-center font-semibold rounded">
                {time}
              </div>

              {days.map((day) => {
                const cls = classes.find(
                  (c) => c.day === day && c.time === time
                );

                return cls ? (
                  <div
                    key={day + time}
                    onClick={() => loadDetails(cls)}
                    className="cursor-pointer p-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    <p className="text-sm font-semibold">{cls.category}</p>
                    <p className="text-xs">{cls.students.length} students</p>
                  </div>
                ) : (
                  <div
                    key={day + time}
                    className="bg-gray-200 dark:bg-gray-800 rounded"
                  />
                );
              })}
            </>
          ))}
        </div>
      </div>

      {/* POPUP */}
      {selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {selectedClass.category}
            </h2>

            <p className="text-gray-700 dark:text-gray-300">
              {selectedClass.day} • {selectedClass.time}
            </p>

            <table className="w-full mt-4 border">
              <thead className="bg-gray-200 dark:bg-gray-700">
                <tr>
                  <th className="p-2 text-left text-gray-900 dark:text-white">
                    Student
                  </th>
                  <th className="p-2 text-center text-gray-900 dark:text-white">
                    Attendance %
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(studentsMap).map(([sid, s]) => (
                  <tr key={sid} className="border-t">
                    <td className="p-2 text-gray-900 dark:text-gray-100">
                      {s.firstName} {s.lastName}
                    </td>
                    <td className="p-2 text-center font-semibold text-blue-600 dark:text-blue-400">
                      {getPercentage(sid)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={() => {
                setSelectedClass(null);
                setStudentsMap({});
                setAttendanceMap({});
              }}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}