import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

const StudentPayment = () => {
  const [fees, setFees] = useState([]);
  const [selectedFee, setSelectedFee] = useState(null);
  const [paymentMode, setPaymentMode] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;

  /* ================= FETCH STUDENT FEES ================= */
  useEffect(() => {
    if (!user) return;

    const fetchFees = async () => {
      try {
        console.log("Fetching fees for student:", user.uid);

        const q = query(
          collection(db, "studentFees"),
          where("studentId", "==", user.uid)
        );
        const snap = await getDocs(q);
        const feeList = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        console.log("Fetched fees:", feeList);

        setFees(feeList);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching fees:", err);
      }
    };

    fetchFees();
  }, [user]);

  /* ================= SUBMIT PAYMENT ================= */
  const submitPayment = async () => {
    if (!paymentMode || !transactionId)
      return alert("Please enter payment details");

    try {
      console.log("Submitting payment for fee:", selectedFee.id);
      await updateDoc(doc(db, "studentFees", selectedFee.id), {
        paymentMode,
        transactionId,
        status: "processing",
        paymentRequestedAt: serverTimestamp(),
      });

      alert("Payment submitted successfully. Verification in progress.");
      setSelectedFee(null);
      // Refresh list
      const q = query(
        collection(db, "studentFees"),
        where("studentId", "==", user.uid)
      );
      const snap = await getDocs(q);
      setFees(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Error submitting payment:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">My Fee Payments</h1>

      {loading && <p>Loading fees...</p>}

      {/* FEE LIST */}
      <div className="grid md:grid-cols-2 gap-4">
        {fees.map((fee) => (
          <div
            key={fee.id}
            className="bg-gray-900 border border-gray-700 p-4 rounded"
          >
            <h3 className="text-lg font-semibold">
              {fee.month}/{fee.year} — {fee.receiptNo}
            </h3>
            <p>Amount: ₹{fee.finalAmount}</p>
            <p>
              Status: <span className="text-yellow-400">{fee.status}</span>
            </p>
            <p>Remarks: {fee.remarks || "None"}</p>
            <p>Payment Mode: {fee.paymentMode || "Not selected"}</p>

            {fee.status === "pending" && (
              <button
                onClick={() => setSelectedFee(fee)}
                className="mt-3 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
              >
                Pay Now
              </button>
            )}

            {fee.status === "processing" && (
              <p className="text-yellow-400 mt-2">
                ⏳ Payment verification in progress
              </p>
            )}

            {fee.status === "paid" && (
              <p className="text-green-400 mt-2">✅ Payment Successful</p>
            )}
          </div>
        ))}
      </div>

      {/* PAYMENT MODAL */}
      {selectedFee && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 w-full max-w-md p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">
              Pay ₹{selectedFee.finalAmount} — {selectedFee.receiptNo}
            </h2>

            <label className="block mb-2">Payment Mode</label>
            <select
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
            >
              <option value="">Select</option>
              <option>UPI</option>
              <option>Card</option>
              <option>Bank Transfer</option>
              <option>Other</option>
            </select>

            {paymentMode === "UPI" && (
              <p className="text-sm mt-2 text-gray-400">
                Pay to UPI ID: <b>school@upi</b>
              </p>
            )}

            {paymentMode === "Bank Transfer" && (
              <p className="text-sm mt-2 text-gray-400">
                A/C: 1234567890 <br />
                IFSC: ABCD0123456
              </p>
            )}

            <input
              type="text"
              placeholder="Transaction / Reference ID"
              className="w-full mt-3 p-2 bg-gray-800 border border-gray-700 rounded"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />

            <div className="flex gap-3 mt-5">
              <button
                onClick={submitPayment}
                className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded"
              >
                Submit Payment
              </button>

              <button
                onClick={() => setSelectedFee(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-3">
              ⚠️ Payment will be verified within 24 hours.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPayment;
