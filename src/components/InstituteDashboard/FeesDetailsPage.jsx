import React, { useEffect, useState } from "react";
import { db, auth } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

const InstituteFees = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feeHistory, setFeeHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [feeData, setFeeData] = useState({
    month: "",
    year: new Date().getFullYear(),
    baseFee: "",
    discount: "",
    extra: "",
    dueDate: "",
    paymentMode: "Cash",
    remarks: "",
  });

  const instituteId = auth.currentUser?.uid;

  /* ================= FETCH STUDENTS ================= */
  useEffect(() => {
    if (!instituteId) return;

    const fetchStudents = async () => {
      const q = query(
        collection(db, "students"),
        where("instituteId", "==", instituteId)
      );
      const snap = await getDocs(q);
      setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };

    fetchStudents();
  }, [instituteId]);

  /* ================= FETCH FEES (NO INDEX ERROR) ================= */
  const fetchFeeHistory = async (studentId) => {
    const q = query(
      collection(db, "studentFees"),
      where("studentId", "==", studentId)
    );

    const snap = await getDocs(q);

    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Sort locally instead of Firestore index
    data.sort((a, b) =>
      `${b.year}${b.month}`.localeCompare(`${a.year}${a.month}`)
    );

    setFeeHistory(data);
  };

  /* ================= RECEIPT NUMBER ================= */
  const generateReceiptNo = () => {
    const date = new Date();
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `REC-${y}${m}-${rand}`;
  };

  /* ================= GENERATE FEE ================= */
  const generateFee = async () => {
    if (!selectedStudent) return alert("Select student");
    if (!feeData.month || !feeData.baseFee)
      return alert("Month & Base Fee required");

    const exists = feeHistory.find(
      (f) => f.month === feeData.month && f.year === feeData.year
    );
    if (exists) return alert("Fee already generated for this month");

    const total =
      Number(feeData.baseFee || 0) -
      Number(feeData.discount || 0) +
      Number(feeData.extra || 0);

    await addDoc(collection(db, "studentFees"), {
      studentId: selectedStudent.id,
      studentName: `${selectedStudent.firstName} ${
        selectedStudent.lastName || ""
      }`,
      instituteId,
      month: feeData.month,
      year: feeData.year,
      baseFee: Number(feeData.baseFee),
      discount: Number(feeData.discount),
      extraCharges: Number(feeData.extra),
      finalAmount: total,
      paymentMode: feeData.paymentMode,
      receiptNo: generateReceiptNo(),
      remarks: feeData.remarks,
      dueDate: feeData.dueDate,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    alert("Fee generated successfully");
    fetchFeeHistory(selectedStudent.id);
  };

  /* ================= UPDATE STATUS ================= */
  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "studentFees", id), {
      status,
      paidAt: status === "paid" ? serverTimestamp() : null,
    });
    fetchFeeHistory(selectedStudent.id);
  };

  /* ================= DELETE ================= */
  const deleteFee = async (id) => {
    if (!window.confirm("Delete this fee record?")) return;
    await deleteDoc(doc(db, "studentFees", id));
    fetchFeeHistory(selectedStudent.id);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto text-gray-100">
      <h1 className="text-2xl text-orange-500 font-bold  mb-6">Institute Fee Management</h1>

      {/* STUDENTS */}
      <div className="grid md:grid-cols-2 gap-4">
        {students.map((s) => (
          <div
            key={s.id}
            onClick={() => {
              setSelectedStudent(s);
              fetchFeeHistory(s.id);
            }}
            className="bg-gray-100 border  p-4 rounded cursor-pointer hover:bg-orange-200"
          >
            <h3 className="font-semibold text-black">
              {s.firstName} {s.lastName}
            </h3>
            <p className="text-sm text-black">Category: {s.category}</p>
            <p className="text-sm text-black">Fee: ₹{s.studentFee}</p>
          </div>
        ))}
      </div>

      {/* FEE FORM */}
      {selectedStudent && (
        <div className="mt-8 bg-gray-100 p-6 rounded border ">
          <h2 className="text-xl text-black font-semibold mb-4">
            Fee Details — {selectedStudent.firstName}
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="month"
              className="input"
              onChange={(e) =>
                setFeeData({
                  ...feeData,
                  month: e.target.value.split("-")[1],
                  year: e.target.value.split("-")[0],
                })
              }
            />

            <input
              className="input"
              placeholder="Base Fee"
              type="number"
              onChange={(e) =>
                setFeeData({ ...feeData, baseFee: e.target.value })
              }
            />

            <input
              className="input"
              placeholder="Discount"
              type="number"
              onChange={(e) =>
                setFeeData({ ...feeData, discount: e.target.value })
              }
            />

            <input
              className="input"
              placeholder="Extra Charges"
              type="number"
              onChange={(e) =>
                setFeeData({ ...feeData, extra: e.target.value })
              }
            />

            <select
              className="input"
              onChange={(e) =>
                setFeeData({ ...feeData, paymentMode: e.target.value })
              }
            >
              <option>Cash</option>
              <option>UPI</option>
              <option>Card</option>
              <option>Bank Transfer</option>
              <option>Other</option>
            </select>

            <input
              className="input"
              placeholder="Remarks"
              onChange={(e) =>
                setFeeData({ ...feeData, remarks: e.target.value })
              }
            />
          </div>

          <button
            onClick={generateFee}
            className="mt-4 bg-green-500 px-6 py-2 rounded"
          >
            Generate Fee
          </button>

          {/* HISTORY */}
          <h3 className="mt-8 text-black font-semibold">Fee History</h3>
          <div className="overflow-x-auto mt-3">
            <table className="w-full border text-sm">
             <thead className="bg-orange-300 text-black-400">
  <tr>
    <th className="px-3 py-2 text-left">Month</th>
    <th className="px-3 py-2 text-left">Amount</th>
    <th className="px-3 py-2 text-left">Status</th>
    <th className="px-3 py-2 text-left">Mode</th>
    <th className="px-3 py-2 text-left">Receipt</th>
    <th className="px-3 py-2 text-left">Action</th>
  </tr>
</thead>

              <tbody>
                {feeHistory.map((f) => (
                  <tr
  key={f.id}
  className="border-t border-orange-200 text-[#3F2A14]"
>

                    <td className="px-3 py-2">
                      {f.month}/{f.year}
                    </td>
                    <td className="px-3 py-2">₹{f.finalAmount}</td>
                    <td
  className={
    "px-3 py-2 " +
    (f.status === "paid"
      ? "text-green-600 font-semibold"
      : "text-yellow-600 font-semibold")
  }
>
  {f.status}
</td>
                    <td className="px-3 py-2">{f.paymentMode}</td>
                    <td className="px-3 py-2">{f.receiptNo}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
  <div className="flex gap-4">
    <button
      onClick={() => updateStatus(f.id, "paid")}
      className="text-green-600 font-semibold hover:underline"
    >
      Approve
    </button>

    <button
      onClick={() => deleteFee(f.id)}
      className="text-red-600 font-semibold hover:underline"
    >
      Delete
    </button>
  </div>
</td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstituteFees;