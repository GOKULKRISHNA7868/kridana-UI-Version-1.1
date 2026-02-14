import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function ClassTime() {
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState("weekly");

  const weeklyDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const monthlyDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const yearlyMonths = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const columns =
    viewMode === "weekly"
      ? weeklyDays
      : viewMode === "monthly"
        ? monthlyDays
        : yearlyMonths;

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

  const [instituteId, setInstituteId] = useState("");
  const [trainers, setTrainers] = useState([]);
  const [students, setStudents] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    day: "",
    time: "09:00",
    category: "",
    session: "",
    trainerId: "",
    students: [],
  });

  /* ---------------- AUTH ---------------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setInstituteId(user.uid);
    });
    return () => unsub();
  }, []);

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    if (!instituteId) return;

    const loadData = async () => {
      const trainerSnap = await getDocs(
        query(
          collection(db, "InstituteTrainers"),
          where("instituteId", "==", instituteId),
        ),
      );
      setTrainers(trainerSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      const studentSnap = await getDocs(
        query(
          collection(db, "students"),
          where("instituteId", "==", instituteId),
        ),
      );
      setStudents(studentSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      const timetableSnap = await getDocs(
        collection(db, "institutes", instituteId, "timetable"),
      );
      setSchedule(timetableSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };

    loadData();
  }, [instituteId]);

  /* ---------------- SAVE / UPDATE ---------------- */
  const saveClass = async () => {
    if (
      !form.category ||
      !form.trainerId ||
      !form.session ||
      form.students.length === 0 ||
      !form.day
    ) {
      alert("Please fill all fields");
      return;
    }

    const batchConflict = schedule.find(
      (s) =>
        s.viewMode === viewMode &&
        s.day === form.day &&
        s.time === form.time &&
        s.session === form.session &&
        s.id !== editId,
    );

    if (batchConflict) {
      alert(
        `Session ${form.session} already has a class on ${form.day} at ${form.time}`,
      );
      return;
    }

    const trainerConflict = schedule.find(
      (s) =>
        s.viewMode === viewMode &&
        s.day === form.day &&
        s.time === form.time &&
        s.trainerId === form.trainerId &&
        s.id !== editId,
    );

    if (trainerConflict) {
      alert(`Trainer is already assigned on ${form.day} at ${form.time}`);
      return;
    }

    const trainer = trainers.find((t) => t.id === form.trainerId);

    const payload = {
      viewMode: viewMode, // weekly | monthly | yearly
      day: form.day, // Mon / 1 / Jan
      time: form.time,
      category: form.category,
      session: form.session,
      trainerId: trainer.id,
      trainerName: trainer.firstName,
      students: form.students,
      updatedAt: serverTimestamp(),
    };

    if (editId) {
      await updateDoc(
        doc(db, "institutes", instituteId, "timetable", editId),
        payload,
      );
    } else {
      await addDoc(collection(db, "institutes", instituteId, "timetable"), {
        ...payload,
        createdAt: serverTimestamp(),
      });
    }

    setShowModal(false);
    setEditId(null);
    setForm({
      day: "",
      time: "09:00",
      category: "",
      session: "",
      trainerId: "",
      students: [],
    });

    const snap = await getDocs(
      collection(db, "institutes", instituteId, "timetable"),
    );
    setSchedule(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg min-h-screen text-black dark:text-white">
      <h2 className="text-2xl font-bold mb-2 text-orange-600">
        {viewMode === "weekly" && "Weekly Timetable"}
        {viewMode === "monthly" && "Monthly Timetable"}
        {viewMode === "yearly" && "Yearly Timetable"}
      </h2>

      <div className="flex gap-2 mb-4">
        {["weekly", "monthly", "yearly"].map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-4 py-1 rounded ${
              viewMode === mode ? "bg-orange-500 text-white" : "bg-gray-200"
            }`}
          >
            {mode.toUpperCase()}
          </button>
        ))}
      </div>

      <div
        className="grid"
        style={{ gridTemplateColumns: `100px repeat(${columns.length},1fr)` }}
      >
        <div></div>

        {columns.map((d) => (
          <div
            key={d}
            className="text-center font-semibold bg-orange-100 dark:bg-gray-700 py-2"
          >
            {d}
          </div>
        ))}

        {times.map((time) => (
          <React.Fragment key={time}>
            <div className="bg-orange-100 dark:bg-gray-700 p-2 font-semibold">
              {time}
            </div>

            {columns.map((day) => {
              const slots = schedule.filter(
                (s) =>
                  s.viewMode === viewMode && s.day === day && s.time === time,
              );

              return (
                <div
                  key={day + time}
                  className="border p-2 min-h-[70px] space-y-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => {
                    setEditId(null);
                    setForm({
                      day,
                      time,
                      category: "",
                      session: "",
                      trainerId: "",
                      students: [],
                    });
                    setShowModal(true);
                  }}
                >
                  {slots.map((s) => (
                    <div
                      key={s.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditId(s.id);
                        setForm({
                          day: s.day,
                          time: s.time,
                          category: s.category,
                          session: s.session,
                          trainerId: s.trainerId,
                          students: s.students || [],
                        });
                        setShowModal(true);
                      }}
                      className="bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded text-xs"
                    >
                      <div className="font-semibold">{s.category}</div>
                      <div className="text-gray-600 dark:text-gray-300">
                        {s.session} Session • {s.trainerName}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded w-[360px] space-y-3">
            <h3 className="text-lg font-bold">
              {editId ? "Edit Class" : "Add Class"}
            </h3>

            <input
              className="w-full border p-2 bg-transparent"
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />

            <select
              className="w-full border p-2 bg-transparent"
              value={form.session}
              onChange={(e) =>
                setForm({
                  ...form,
                  session: e.target.value,
                  students: [],
                })
              }
            >
              <option value="">Sessions</option>
              <option>Morning</option>
              <option>Afternoon</option>
              <option>Evening</option>
            </select>

            <select
              className="w-full border p-2 bg-transparent"
              value={form.trainerId}
              onChange={(e) => setForm({ ...form, trainerId: e.target.value })}
            >
              <option value="">Select Trainer</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.firstName}
                </option>
              ))}
            </select>

            <select
              multiple
              className="w-full border p-2 h-28 bg-transparent"
              value={form.students}
              onChange={(e) =>
                setForm({
                  ...form,
                  students: Array.from(e.target.selectedOptions).map(
                    (o) => o.value,
                  ),
                })
              }
            >
              {students
                .filter((s) => s.sessions === form.session)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName}
                  </option>
                ))}
            </select>

            <button
              onClick={saveClass}
              className="bg-green-600 text-white w-full py-2 rounded"
            >
              {editId ? "Update Class" : "Save Class"}
            </button>

            <button
              onClick={() => setShowModal(false)}
              className="w-full text-sm mt-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
