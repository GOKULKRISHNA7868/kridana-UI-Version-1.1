import React, { useEffect, useMemo, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { useRef } from "react";
import { ChevronDown } from "lucide-react";
import { setDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";

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

const FeesDetailsPage = () => {
  const instituteId = auth.currentUser?.uid;

  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const monthRef = useRef(null);

  const [addData, setAddData] = useState({
    firstName: "",
    lastName: "",
    sessions: "",
    fees: "",
  });

  const [editData, setEditData] = useState({
    firstName: "",
    lastName: "",
    sessions: "",
    fees: "",
  });
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (monthRef.current && !monthRef.current.contains(e.target)) {
        setShowMonthDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= FETCH STUDENTS ================= */
  useEffect(() => {
    if (!instituteId) return;

    const q = query(
      collection(db, "students"),
      where("instituteId", "==", instituteId),
    );

    return onSnapshot(q, (snap) => {
      setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [instituteId]);

  /* ================= FETCH FEES ================= */
  /* ================= FETCH FEES ================= */
  useEffect(() => {
    if (!instituteId) return;

    const q = query(
      collection(db, "studentFees"),
      where("instituteId", "==", instituteId),
    );

    return onSnapshot(q, (snap) => {
      setFees(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [instituteId]);

  /* ================= SEARCH FILTER ================= */
  const filteredStudents = useMemo(() => {
    return students.filter((s) =>
      `${s.firstName} ${s.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  }, [students, search]);

  const handleAdd = () => setShowAddModal(true);

  const handleEdit = () => {
    if (!selectedStudent) {
      alert("Select a student first");
      return;
    }

    setEditData({
      firstName: selectedStudent.firstName || "",
      lastName: selectedStudent.lastName || "",
      sessions: selectedStudent.sessions || "",
      fees: selectedStudent.fees || "",
    });

    setShowEditModal(true);
  };

  const addStudent = async () => {
    const newRef = doc(collection(db, "students"));

    await setDoc(newRef, {
      ...addData,
      instituteId,
      createdAt: serverTimestamp(),
    });

    setShowAddModal(false);
  };

  const updateStudent = async () => {
    await updateDoc(doc(db, "students", selectedStudent.id), editData);
    setShowEditModal(false);
  };

  /* ================= CALCULATIONS ================= */

  const totalStudents = students.length;

  const totalAmount = students.reduce((sum, s) => sum + Number(s.fees || 0), 0);

  const totalPaid = fees
    .filter((f) => f.status === "paid")
    .reduce((sum, f) => sum + Number(f.finalAmount || 0), 0);

  const totalPending = totalAmount - totalPaid;

  const getStudentFeeData = (student) => {
    const studentFee = Number(student.fees || 0);

    const paidFees = fees
      .filter((f) => f.studentId === student.id && f.status === "paid")
      .reduce((sum, f) => sum + Number(f.finalAmount || 0), 0);

    return {
      total: studentFee,
      paid: paidFees,
      pending: studentFee - paidFees,
    };
  };

  return (
    <div className="p-6 bg-[#f3f4f6] min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Fees Details</h1>

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
              className={`transition-transform ${showMonthDropdown ? "rotate-180" : ""}`}
            />
          </button>

          {showMonthDropdown && (
            <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-md">
              {MONTHS.map((m) => (
                <div
                  key={m.value}
                  onClick={() => {
                    setSelectedMonth(m.value);
                    setShowMonthDropdown(false);
                  }}
                  className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                >
                  {m.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <StatCard title="Total Fees Amount" value={`₹ ${totalAmount}`} />
        <StatCard title="Total Fees Pending" value={`₹ ${totalPending}`} />
        <StatCard title="Total Fees Paid" value={`₹ ${totalPaid}`} />
        <StatCard title="Total Students" value={totalStudents} />
      </div>

      {/* SEARCH + ADD EDIT */}
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search here..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-orange-400 rounded px-4 py-2 w-80 focus:outline-none focus:ring-0 focus:border-orange-400"
        />

        <div className="flex gap-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-orange-500 text-white px-4 py-2 rounded"
          >
            + Add
          </button>

          <button
            onClick={handleEdit}
            className="border border-orange-500 text-orange-500 px-4 py-2 rounded"
          >
            Edit
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-5 bg-black text-orange-500 px-6 py-3 font-semibold">
          <div>Students Name</div>
          <div>Sessions</div>
          <div>Total Amount</div>
          <div>Paid</div>
          <div>Pending</div>
        </div>

        {filteredStudents.map((student) => {
          const data = getStudentFeeData(student);

          return (
            <div
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className={`grid grid-cols-5 px-6 py-4 border-t items-center cursor-pointer
  ${selectedStudent?.id === student.id ? "bg-orange-50" : ""}`}
            >
              <div>
                {student.firstName} {student.lastName}
              </div>

              {/* ✅ THIS IS THE FIX */}
              <div>{student.sessions || "-"}</div>
              <div>₹ {data.total}</div>
              <div className="text-green-600 font-semibold">₹ {data.paid}</div>
              <div className="text-red-600 font-semibold">₹ {data.pending}</div>
            </div>
          );
        })}
      </div>

      {/* SAVE & CANCEL */}
      <div className="flex justify-end gap-6 mt-8">
        <button
          onClick={() => {
            setSelectedMonth("");
            setSearch("");
          }}
          className="text-lg font-medium text-black"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            alert("Saved Successfully ✅");
          }}
          className="bg-orange-500 text-white px-8 py-3 rounded-lg text-lg font-semibold"
        >
          Save
        </button>
      </div>
      {showAddModal && (
        <ModalForm
          title="Add Student"
          data={addData}
          setData={setAddData}
          onSave={addStudent}
          onClose={() => setShowAddModal(false)}
        />
      )}
      {showEditModal && (
        <ModalForm
          title="Edit Student"
          data={editData}
          setData={setEditData}
          onSave={updateStudent}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-black text-white p-4 rounded-lg">
    <h3 className="text-sm">{title}</h3>
    <p className="text-xl font-bold text-orange-500 mt-2">{value}</p>
  </div>
);
const ModalForm = ({ title, data, setData, onSave, onClose }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl w-96 space-y-4">
      <h2 className="font-semibold">{title}</h2>

      {Object.keys(data).map((k) => (
        <input
          key={k}
          className="border w-full p-2 rounded"
          placeholder={k}
          value={data[k]}
          onChange={(e) => setData({ ...data, [k]: e.target.value })}
        />
      ))}

      <div className="flex justify-end gap-3">
        <button onClick={onClose}>Cancel</button>
        <button
          onClick={onSave}
          className="bg-orange-500 text-white px-4 py-2 rounded"
        >
          Save
        </button>
      </div>
    </div>
  </div>
);

export default FeesDetailsPage;
