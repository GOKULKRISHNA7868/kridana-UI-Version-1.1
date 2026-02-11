import React, { useEffect, useMemo, useState, useRef } from "react";

import {
  collection,
  query,
  where,
  onSnapshot,
  setDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { updateDoc } from "firebase/firestore";
import { ChevronDown } from "lucide-react";

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

  const [selectedMonth, setSelectedMonth] = useState("");

  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const monthRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (monthRef.current && !monthRef.current.contains(e.target)) {
        setShowMonthDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* 🔹 Load Attendance by Month */
  useEffect(() => {
    if (!user || !selectedMonth) return;

    const q = query(
      collection(db, "employeeAttendance"),
      where("instituteId", "==", user.uid),

      where("month", "==", selectedMonth),
    );

    return onSnapshot(q, (snap) => {
      const map = {};
      snap.docs.forEach((d) => {
        map[d.data().employeeId] = d.data();
      });
      setAttendance(map);
    });
  }, [user, selectedMonth]);

  /* 🔹 Filter by search */
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) =>
      `${emp.firstName} ${emp.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  }, [employees, search]);

  /* 🔹 Save Attendance */
  const saveAttendance = async (emp, status, reason = "") => {
    if (!selectedMonth) return;

    await setDoc(
      doc(db, "employeeAttendance", `${emp.uid}_${selectedMonth}`),
      {
        employeeId: emp.uid,

        instituteId: user.uid,
        month: selectedMonth,
        status,
        reason,
        createdAt: serverTimestamp(),
      },
      { merge: true },
    );
  };

  return (
    <div className="p-6 bg-[#f3f4f6] min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Employee Attendance</h1>

        <div className="flex gap-4 items-center">
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
          const record = attendance[emp.uid];

          return (
            <div
              key={emp.uid}
              onClick={() => setSelectedEmployee(emp)}
              className={`grid grid-cols-[2fr_1.5fr_1fr_1fr_1.5fr] px-6 py-4 border-t items-center cursor-pointer
  ${selectedEmployee?.uid === emp.uid ? "bg-orange-50" : ""}`}
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
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 space-y-4">
            <h2 className="text-lg font-semibold">Add Employee</h2>

            <input
              className="border w-full p-2 rounded"
              placeholder="First Name"
              value={addData.firstName}
              onChange={(e) =>
                setAddData({ ...addData, firstName: e.target.value })
              }
            />

            <input
              className="border w-full p-2 rounded"
              placeholder="Last Name"
              value={addData.lastName}
              onChange={(e) =>
                setAddData({ ...addData, lastName: e.target.value })
              }
            />

            <input
              className="border w-full p-2 rounded"
              placeholder="Designation"
              value={addData.designation}
              onChange={(e) =>
                setAddData({ ...addData, designation: e.target.value })
              }
            />

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)}>Cancel</button>

              <button
                onClick={addEmployee}
                className="bg-orange-500 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 space-y-4">
            <h2 className="text-lg font-semibold">
              Edit {selectedEmployee.firstName}
            </h2>

            <input
              className="border w-full p-2 rounded"
              placeholder="First Name"
              value={editData.firstName}
              onChange={(e) =>
                setEditData({ ...editData, firstName: e.target.value })
              }
            />

            <input
              className="border w-full p-2 rounded"
              placeholder="Last Name"
              value={editData.lastName}
              onChange={(e) =>
                setEditData({ ...editData, lastName: e.target.value })
              }
            />

            <input
              className="border w-full p-2 rounded"
              placeholder="Designation"
              value={editData.designation}
              onChange={(e) =>
                setEditData({ ...editData, designation: e.target.value })
              }
            />

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowEditModal(false)}>Cancel</button>

              <button
                onClick={updateEmployee}
                className="bg-orange-500 text-white px-4 py-2 rounded"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendancePage;
