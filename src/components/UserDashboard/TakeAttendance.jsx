import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function TrainerAttendance() {
  const [trainerId, setTrainerId] = useState("");
  const [instituteId, setInstituteId] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({});
  const today = new Date().toISOString().split("T")[0];
  const isFutureDate = date > today;

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleDateChange = (e) => {
    setDate(e.target.value);
    setSelectedSlot(null);
    setStudents([]);
    setAttendance({});
  };

  /* ================= AUTH ================= */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const snap = await getDocs(
        query(
          collection(db, "InstituteTrainers"),
          where("trainerUid", "==", user.uid),
        ),
      );

      if (!snap.empty) {
        const data = snap.docs[0].data();
        setTrainerId(data.trainerUid);
        setInstituteId(data.instituteId);
      }
    });

    return () => unsub();
  }, []);

  /* ================= LOAD CLASSES ================= */
  useEffect(() => {
    if (!trainerId || !instituteId) return;
    setLoading(true);

    const load = async () => {
      const snap = await getDocs(
        query(
          collection(db, "institutes", instituteId, "timetable"),
          where("trainerId", "==", trainerId),
        ),
      );
      setSchedule(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };

    load();
  }, [trainerId, instituteId]);

  /* ================= LOAD STUDENTS AND ATTENDANCE ================= */
  const loadStudents = async (slot) => {
    setSelectedSlot(slot);
    setLoading(true);

    // 🔹 LOAD ONLY STUDENTS MAPPED TO THIS SLOT
    const stuSnap = await getDocs(
      query(
        collection(db, "students"),
        where("instituteId", "==", instituteId),
      ),
    );

    const list = stuSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      // ✅ ADDITION: filter students mapped to class
      .filter((s) => slot.students?.includes(s.id));

    setStudents(list);

    /* ===== LOAD ALL ATTENDANCE FOR SUMMARY ===== */
    const allAttSnap = await getDocs(
      query(
        collection(db, "institutes", instituteId, "attendance"),
        where("category", "==", slot.category),
        where("trainerId", "==", trainerId),
      ),
    );

    const summaryMap = {};
    allAttSnap.forEach((d) => {
      const data = d.data();
      if (!summaryMap[data.studentId]) summaryMap[data.studentId] = [];
      summaryMap[data.studentId].push(data.status);
    });

    /* ===== LOAD TODAY ATTENDANCE ===== */
    const todaySnap = await getDocs(
      query(
        collection(db, "institutes", instituteId, "attendance"),
        where("category", "==", slot.category),
        where("trainerId", "==", trainerId),
        where("date", "==", date),
      ),
    );

    const todayMap = {};
    todaySnap.forEach((d) => {
      todayMap[d.data().studentId] = d.data().status;
    });

    setAttendance(todayMap);
    setSummary(summaryMap);
    setLoading(false);
  };

  /* ================= SAVE ATTENDANCE ================= */
  const saveAttendance = async () => {
    setLoading(true);
    for (const s of students) {
      await addDoc(collection(db, "institutes", instituteId, "attendance"), {
        studentId: s.id,
        studentName: s.firstName,
        trainerId,
        category: selectedSlot.category,
        day: selectedSlot.day,
        time: selectedSlot.time,
        batchNumber: s.batchNumber || "", // ✅ ADDITION
        date,
        status: attendance[s.id] || "Absent",
        createdAt: serverTimestamp(),
      });
    }
    alert("Attendance Saved Successfully");
    setLoading(false);
  };

  const selectedDay = days[new Date(date).getDay()];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Trainer Attendance
      </h2>

      {/* DATE */}
      <div className="mb-5">
        <label className="block text-gray-700 dark:text-gray-300 mb-1">
          Select Date
        </label>
        <input
          type="date"
          value={date}
          onChange={handleDateChange}
          className="border px-3 py-2 rounded w-full sm:w-60 
             bg-white text-black 
             dark:bg-gray-800 dark:text-white 
             dark:[color-scheme:dark]"
        />
      </div>

      {/* CLASS CARDS */}
      {loading && (
        <p className="text-gray-700 dark:text-gray-300">Loading...</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {schedule.filter((s) => s.day === selectedDay).length === 0 &&
          !loading && (
            <p className="text-gray-700 dark:text-gray-300 col-span-3">
              No classes on selected date
            </p>
          )}
        {schedule
          .filter((s) => s.day === selectedDay)
          .map((slot) => (
            <div
              key={slot.id}
              onClick={() => loadStudents(slot)}
              className="cursor-pointer rounded-lg border p-4 bg-white dark:bg-gray-800 hover:ring-2 hover:ring-blue-500"
            >
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                {slot.category}
              </h3>
              <p className="text-sm text-gray-500">{slot.time}</p>
              {slot.batchNumber && (
                <p className="text-xs text-purple-600">
                  Batch: {slot.batchNumber}
                </p>
              )}
            </div>
          ))}
      </div>

      {/* ATTENDANCE TABLE */}
      {selectedSlot && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {selectedSlot.category} — {selectedSlot.time}
          </h3>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 overflow-x-auto">
            <table className="w-full border border-gray-300 dark:border-gray-700">
              <thead className="bg-gray-200 dark:bg-gray-700">
                <tr>
                  <th className="p-3 text-left text-black dark:text-white">
                    Student
                  </th>
                  <th className="p-3 text-left text-black dark:text-white">
                    Batch
                  </th>
                  <th className="p-3 text-left text-black dark:text-white">
                    Present
                  </th>
                  <th className="p-3 text-left text-black dark:text-white">
                    Absent
                  </th>
                  <th className="p-3 text-left text-black dark:text-white">
                    Total Taken
                  </th>
                  <th className="p-3 text-left text-black dark:text-white">
                    Total Absent
                  </th>
                  <th className="p-3 text-left text-black dark:text-white">
                    Present %
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const allStatus = summary[s.id] || [];
                  const totalTaken = allStatus.length;
                  const totalAbsent = allStatus.filter(
                    (st) => st === "Absent",
                  ).length;
                  const totalPresent = totalTaken - totalAbsent;
                  const presentPercent =
                    totalTaken === 0
                      ? 0
                      : Math.round((totalPresent / totalTaken) * 100);

                  return (
                    <tr
                      key={s.id}
                      className="border-t border-gray-300 dark:border-gray-700 
                    hover:bg-gray-100 dark:hover:bg-gray-700 
                    text-gray-900 dark:text-gray-100"
                    >
                      <td className="p-2">{s.firstName}</td>
                      <td className="p-2 text-purple-600">
                        {s.batchNumber || "—"}
                      </td>
                      <td className="text-center">
                        <input
                          type="radio"
                          name={s.id}
                          checked={attendance[s.id] === "Present"}
                          onClick={() => {
                            if (isFutureDate) return alert("❌ Future date");
                            setAttendance({
                              ...attendance,
                              [s.id]: "Present",
                            });
                          }}
                        />
                      </td>
                      <td className="text-center">
                        <input
                          type="radio"
                          name={s.id}
                          checked={attendance[s.id] === "Absent"}
                          onClick={() => {
                            if (isFutureDate) return alert("❌ Future date");
                            setAttendance({
                              ...attendance,
                              [s.id]: "Absent",
                            });
                          }}
                        />
                      </td>
                      <td className="text-center">{totalTaken}</td>
                      <td className="text-center">{totalAbsent}</td>
                      <td className="text-center">{presentPercent}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <button
              onClick={saveAttendance}
              disabled={isFutureDate}
              className={`mt-5 px-6 py-2 rounded text-white ${
                isFutureDate
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              Save Attendance
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
