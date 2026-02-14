import React, { useEffect, useMemo, useState, useRef } from "react";

import {
  collection,
  query,
  where,
  onSnapshot,
  setDoc,
  doc,
  serverTimestamp,
  getDocs,
  collectionGroup,
} from "firebase/firestore";

import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { updateDoc } from "firebase/firestore";
import { ChevronDown } from "lucide-react";

const absenceReasons = [
  "On Leave",
  "Not Working Day",
  "Week Off",
  "Sick Leave",
  "Other",
];

const EmployeeAttendancePage = () => {
  const handleAdd = () => {
    setShowAddModal(true);
  };
  /* 🔹 Update Employee */
  const updateEmployee = async () => {
    if (!selectedEmployee) return;

    try {
      await updateDoc(doc(db, "InstituteTrainers", selectedEmployee.uid), {
        firstName: editData.firstName,
        lastName: editData.lastName,
        designation: editData.designation,
      });

      setShowEditModal(false);
      setSelectedEmployee(null);
    } catch (err) {
      console.log(err);
    }
  };

  /* 🔹 Add Employee */
  const addEmployee = async () => {
    if (!addData.firstName) return;

    try {
      const newRef = doc(collection(db, "InstituteTrainers"));

      await setDoc(newRef, {
        ...addData,
        instituteId: user.uid,
        createdAt: serverTimestamp(),
      });

      setShowAddModal(false);

      setAddData({
        firstName: "",
        lastName: "",
        designation: "",
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleEdit = () => {
    if (!selectedEmployee) {
      alert("Select an employee first");
      return;
    }

    setEditData({
      firstName: selectedEmployee.firstName || "",
      lastName: selectedEmployee.lastName || "",
      designation: selectedEmployee.designation || "",
    });

    setShowEditModal(true);
  };

  const { user } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");

  const [draftAttendance, setDraftAttendance] = useState({});

  const [search, setSearch] = useState("");
  const [editData, setEditData] = useState({
    firstName: "",
    lastName: "",
    designation: "",
  });
  const [addData, setAddData] = useState({
    firstName: "",
    lastName: "",
    designation: "",
  });

  /* 🔹 Load Employees */
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "InstituteTrainers"),
      where("instituteId", "==", user.uid),
    );

    return onSnapshot(q, (snap) => {
      setEmployees(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
    });
  }, [user]);

  /* 🔹 Load Attendance + AUTO PRESENT LOGIC */

  useEffect(() => {
    if (!user || !selectedDate) {
      setAttendance({});
      setDraftAttendance({});
      return;
    }

    // ✅ CLEAR instantly when date changes
    setAttendance({});
    setDraftAttendance({});

    const load = async () => {
      const map = {};

      /* ---------------------------
         1) Load manual admin attendance
      ---------------------------- */
      const q = query(
        collection(db, "employeeAttendance"),
        where("instituteId", "==", user.uid),
        where("date", "==", selectedDate),
      );

      const snap = await getDocs(q);
      snap.docs.forEach((d) => {
        map[d.data().employeeId] = d.data();
      });

      /* ---------------------------
         2) AUTO PRESENT FROM CHECKIN SYSTEM
         trainerAttendance collection
      ---------------------------- */
      const autoQ = query(
        collectionGroup(db, "trainerAttendance"),
        where("instituteId", "==", user.uid),
        where("date", "==", selectedDate),
        where("status", "==", "present"),
      );
      console.log("📅 Selected Date:", selectedDate);
      console.log("🏫 Institute ID:", user?.uid);

      const autoSnap = await getDocs(autoQ);

      autoSnap.docs.forEach((d) => {
        const data = d.data();

        // ✅ SAFE MERGE LOGIC
        if (!map[data.trainerId]) {
          map[data.trainerId] = {
            employeeId: data.trainerId,
            instituteId: user.uid,
            date: selectedDate,
            status: "present",
            reason: "",
            auto: true,
          };
        } else {
          // ✅ keep admin data (reason/status)
          map[data.trainerId] = {
            ...map[data.trainerId],
          };
        }
      });

      setAttendance(map);
      setDraftAttendance({ ...map });
    };

    load();
  }, [user, selectedDate]);

  /* 🔹 Filter by search */
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) =>
      `${emp.firstName} ${emp.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  }, [employees, search]);

  /* 🔹 Save Attendance */
  const saveAttendance = (emp, status, reason = "") => {
    if (!selectedDate) {
      alert("Please select date");
      return;
    }

    setDraftAttendance((prev) => ({
      ...prev,
      [emp.uid]: {
        employeeId: emp.uid,
        instituteId: user.uid,
        date: selectedDate,
        status,
        reason,
        markedBy: "admin",
      },
    }));
  };

  const handleSaveAll = async () => {
    if (!selectedDate) {
      alert("Select date");
      return;
    }

    for (const rec of Object.values(draftAttendance)) {
      if (rec.status === "absent" && !rec.reason) {
        alert("Please select reason for all absent employees");
        return;
      }
    }

    const promises = Object.values(draftAttendance).map((rec) => {
      const ref = doc(
        db,
        "institutes",
        user.uid,
        "trainerAttendance",
        `${rec.employeeId}_${selectedDate}`,
      );

      return setDoc(
        ref,
        {
          trainerId: rec.employeeId,
          instituteId: user.uid,
          date: selectedDate,
          month: selectedDate.slice(0, 7),
          status: rec.status,
          reason: rec.reason || "",
          markedBy: "admin",
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    });

    await Promise.all(promises);

    alert("Attendance saved successfully ✅");
  };

  const handleCancel = () => {
    setDraftAttendance({ ...attendance });
    // revert changes
  };

  const hasChanges =
    JSON.stringify(draftAttendance) !== JSON.stringify(attendance);

  return (
    /* ========================= UI UNCHANGED ========================= */
    <div className="p-6 bg-[#f3f4f6] min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Employee Attendance</h1>

        <div className="flex gap-4 items-center">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setAttendance({});
              setDraftAttendance({});
              setSelectedDate(e.target.value);
            }}
            className="border bg-orange-500 border-orange-400 rounded-md px-4 py-2"
          />
        </div>
      </div>
      <div className="mb-4 flex justify-between items-center">
        {/* left → search */}
        <input
          type="text"
          placeholder="Search here..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-orange-400 rounded-md px-4 py-2 w-80 focus:outline-none focus:ring-0 focus:border-orange-400"
        />

        {/* right → buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleAdd}
            className="bg-orange-500 text-white px-4 py-2 rounded-md"
          >
            + Add
          </button>

          <button
            onClick={handleEdit}
            className="border border-orange-500 text-orange-500 px-4 py-2 rounded-md"
          >
            Edit
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="border-2 border-orange-300 rounded-md overflow-hidden">
        {/* HEADER */}
        <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1.5fr] bg-black text-orange-500 font-semibold px-6 py-3">
          <div>Employee Name</div>
          <div>Designation</div>
          <div className="text-center">Present</div>
          <div className="text-center">Absent</div>
          <div>Reason</div>
        </div>

        {/* BODY */}
        {filteredEmployees.map((emp) => {
          const record = draftAttendance[emp.uid];

          return (
            <div
              key={emp.uid}
              onClick={() => setSelectedEmployee(emp)}
              onDoubleClick={() => setSelectedEmployee(null)}
              className={`grid grid-cols-[2fr_1.5fr_1fr_1fr_1.5fr] px-6 py-4 border-t items-center cursor-pointer
${
  selectedEmployee?.uid === emp.uid
    ? "bg-blue-50 border-l-4 border-blue-500 shadow-sm"
    : "hover:bg-gray-50"
}`}
            >
              <div>
                {emp.firstName} {emp.lastName}
              </div>
              <div>{emp.designation}</div>

              {/* Present */}
              <div className="flex justify-center">
                <input
                  className="w-5 h-5"
                  type="checkbox"
                  checked={record?.status === "present"}
                  onChange={() => saveAttendance(emp, "present")}
                />
              </div>

              {/* Absent */}
              <div className="flex justify-center">
                <input
                  className="w-5 h-5"
                  type="checkbox"
                  checked={record?.status === "absent"}
                  onChange={() => saveAttendance(emp, "absent")}
                />
              </div>

              {/* Reason */}
              <div>
                {record?.status === "absent" && (
                  <select
                    value={record?.reason || ""}
                    onChange={(e) =>
                      saveAttendance(emp, "absent", e.target.value)
                    }
                    className="border rounded px-2 py-1"
                  >
                    <option value="">Select</option>
                    {absenceReasons.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={handleCancel}
          className="border border-gray-400 px-5 py-2 rounded-md"
        >
          Cancel
        </button>

        <button
          onClick={handleSaveAll}
          disabled={!hasChanges}
          className={`px-5 py-2 rounded-md text-white ${
            hasChanges ? "bg-orange-500" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Save
        </button>
      </div>

      {/* MODALS UNCHANGED */}
      {/* ... */}
    </div>
  );
};

export default EmployeeAttendancePage;
