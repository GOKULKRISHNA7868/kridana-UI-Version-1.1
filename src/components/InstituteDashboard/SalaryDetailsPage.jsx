import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";

const GenerateTrainerPayslip = () => {
  const { user } = useAuth();

  const [month, setMonth] = useState("");
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainerId, setSelectedTrainerId] = useState("");
  const [trainerData, setTrainerData] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [salary, setSalary] = useState(null);

  /* ================= FETCH TRAINERS ================= */
  useEffect(() => {
    if (!month || !user) return;

    const fetchData = async () => {
      const trainerSnap = await getDocs(
        query(
          collection(db, "InstituteTrainers"),
          where("instituteId", "==", user.uid),
        ),
      );

      const payslipSnap = await getDocs(
        collection(db, "institutes", user.uid, "payslips"),
      );

      const generated = payslipSnap.docs
        .filter((d) => d.id.endsWith(month))
        .map((d) => d.data().trainerId);

      const available = trainerSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((t) => !generated.includes(t.id));

      setTrainers(available);
    };

    fetchData();
  }, [month, user]);

  /* ================= FETCH TRAINER DETAILS ================= */
  const handleTrainerSelect = async (trainerId) => {
    setSelectedTrainerId(trainerId);

    const trainerSnap = await getDoc(doc(db, "InstituteTrainers", trainerId));
    const trainer = trainerSnap.data();

    const attSnap = await getDocs(
      query(
        collection(db, "institutes", user.uid, "trainerAttendance"),
        where("trainerId", "==", trainerId),
        where("month", "==", month),
      ),
    );

    const presentDays = attSnap.docs.filter(
      (d) => d.data().status === "present",
    ).length;
    const scheduledDays = 26;
    const lopDays = scheduledDays - presentDays;

    const monthlySalary = Number(trainer.monthlySalary || 0);
    const perDaySalary = monthlySalary / scheduledDays;
    const payableSalary = perDaySalary * presentDays;

    const basic = payableSalary * 0.4;
    const hra = payableSalary * 0.2;
    const allowance = payableSalary * 0.4;
    const pf = 1600;
    const professionalTax = 200;
    const gross = basic + hra + allowance;
    const net = gross - (pf + professionalTax);

    setTrainerData(trainer);
    setAttendance({ presentDays, lopDays, scheduledDays });
    setSalary({ basic, hra, allowance, pf, professionalTax, gross, net });
  };

  /* ================= EDITABLE SALARY ================= */
  const updateSalary = (field, value) => {
    const updated = { ...salary, [field]: Number(value) };
    const gross = updated.basic + updated.hra + updated.allowance;
    const net = gross - (updated.pf + updated.professionalTax);
    setSalary({ ...updated, gross, net });
  };

  /* ================= GENERATE HTML PAYSLIP ================= */
  const generatePayslipHTML = () => {
    if (!trainerData || !salary || !attendance) return "";

    return `
<div class="relative bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden">
  <div class="absolute inset-0 z-0 pointer-events-none opacity-5" style="background-image: url('/logo.jpg'); background-repeat: repeat; background-size: 100px; transform: rotate(-45deg); transform-origin: center center;"></div>
  <div class="relative z-10">
    <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <img src="/logo.jpg" alt="Logo" class="h-12 w-auto rounded"/>
          <div>
            <h1 class="text-xl font-bold">INSTITUTE PAYSLIP</h1>
            <p class="text-sm opacity-90">Month: ${month}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-100 dark:bg-gray-700 border-b-2 border-gray-300 dark:border-gray-600 text-center py-3">
      <h2 class="text-lg font-bold text-gray-800 dark:text-white">Payslip For ${month}</h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 border-b-2 border-gray-300 dark:border-gray-600">
      <div class="border-r-2 border-gray-300 dark:border-gray-600">
        <div class="grid grid-cols-2 border-b border-gray-200 dark:border-gray-600">
          <div class="bg-blue-50 dark:bg-blue-900 font-semibold p-3 border-r border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white">Trainer ID</div>
          <div class="p-3 text-gray-800 dark:text-white">${trainerData.trainerId}</div>
        </div>
        <div class="grid grid-cols-2 border-b border-gray-200 dark:border-gray-600">
          <div class="bg-blue-50 dark:bg-blue-900 font-semibold p-3 border-r border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white">Name</div>
          <div class="p-3 text-gray-800 dark:text-white">${trainerData.firstName} ${trainerData.lastName || ""}</div>
        </div>
        <div class="grid grid-cols-2 border-b border-gray-200 dark:border-gray-600">
          <div class="bg-blue-50 dark:bg-blue-900 font-semibold p-3 border-r border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white">Category</div>
          <div class="p-3 text-gray-800 dark:text-white">${trainerData.category || "-"}</div>
        </div>
        <div class="grid grid-cols-2 border-b border-gray-200 dark:border-gray-600">
          <div class="bg-blue-50 dark:bg-blue-900 font-semibold p-3 border-r border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white">Bank</div>
          <div class="p-3 text-gray-800 dark:text-white">${trainerData.bankName || "-"}</div>
        </div>
        <div class="grid grid-cols-2 border-b border-gray-200 dark:border-gray-600">
          <div class="bg-blue-50 dark:bg-blue-900 font-semibold p-3 border-r border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white">Account No.</div>
          <div class="p-3 text-gray-800 dark:text-white">${trainerData.accountNumber || "-"}</div>
        </div>
        <div class="grid grid-cols-2 border-b border-gray-200 dark:border-gray-600">
          <div class="bg-blue-50 dark:bg-blue-900 font-semibold p-3 border-r border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white">IFSC</div>
          <div class="p-3 text-gray-800 dark:text-white">${trainerData.ifscCode || "-"}</div>
        </div>
        <div class="grid grid-cols-2 border-b border-gray-200 dark:border-gray-600">
          <div class="bg-blue-50 dark:bg-blue-900 font-semibold p-3 border-r border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white">PF No.</div>
          <div class="p-3 text-gray-800 dark:text-white">${trainerData.pfNumber || "-"}</div>
        </div>
      </div>

      <div>
        <div class="grid grid-cols-2 border-b border-gray-200 dark:border-gray-600">
          <div class="bg-blue-50 dark:bg-blue-900 font-semibold p-3 border-r border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white">Present Days</div>
          <div class="p-3 text-gray-800 dark:text-white">${attendance.presentDays}</div>
        </div>
        <div class="grid grid-cols-2 border-b border-gray-200 dark:border-gray-600">
          <div class="bg-blue-50 dark:bg-blue-900 font-semibold p-3 border-r border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white">LOP Days</div>
          <div class="p-3 text-gray-800 dark:text-white">${attendance.lopDays}</div>
        </div>
        <div class="grid grid-cols-2 border-b border-gray-200 dark:border-gray-600">
          <div class="bg-blue-50 dark:bg-blue-900 font-semibold p-3 border-r border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white">Scheduled Days</div>
          <div class="p-3 text-gray-800 dark:text-white">${attendance.scheduledDays}</div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 mt-4">
      <div class="border-r-2 border-gray-300 dark:border-gray-600">
        <div class="bg-green-100 dark:bg-green-900 border-b-2 border-gray-300 dark:border-gray-600 p-3 text-center font-bold">Earnings</div>
        <div class="divide-y divide-gray-200 dark:divide-gray-600">
          <div class="grid grid-cols-2 p-3 text-gray-800 dark:text-white"><div>BASIC</div><div class="text-right font-semibold">₹${salary.basic.toFixed(2)}</div></div>
          <div class="grid grid-cols-2 p-3 text-gray-800 dark:text-white"><div>HRA</div><div class="text-right font-semibold">₹${salary.hra.toFixed(2)}</div></div>
          <div class="grid grid-cols-2 p-3 text-gray-800 dark:text-white"><div>ALLOWANCE</div><div class="text-right font-semibold">₹${salary.allowance.toFixed(2)}</div></div>
          <div class="grid grid-cols-2 p-3 bg-green-50 dark:bg-green-900 font-bold text-gray-800 dark:text-white"><div>GROSS EARNING</div><div class="text-right text-green-700 dark:text-green-300">₹${salary.gross.toFixed(2)}</div></div>
        </div>
      </div>

      <div>
        <div class="bg-red-100 dark:bg-red-900 border-b-2 border-gray-300 dark:border-gray-600 p-3 text-center font-bold">Deductions</div>
        <div class="divide-y divide-gray-200 dark:divide-gray-600">
          <div class="grid grid-cols-2 p-3 text-gray-800 dark:text-white"><div>PF</div><div class="text-right font-semibold">₹${salary.pf.toFixed(2)}</div></div>
          <div class="grid grid-cols-2 p-3 text-gray-800 dark:text-white"><div>Professional Tax</div><div class="text-right font-semibold">₹${salary.professionalTax.toFixed(2)}</div></div>
          <div class="grid grid-cols-2 p-3 bg-red-50 dark:bg-red-900 font-bold text-gray-800 dark:text-white"><div>GROSS DEDUCTIONS</div><div class="text-right text-red-700 dark:text-red-300">₹${(salary.pf + salary.professionalTax).toFixed(2)}</div></div>
        </div>
      </div>
    </div>

    <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 text-center text-2xl font-bold mt-4">
      NET PAY ₹${salary.net.toFixed(2)}
    </div>

    <div class="bg-gray-50 dark:bg-gray-700 p-4 text-center">
      <p class="text-sm italic text-gray-600 dark:text-gray-300">** This is a computer generated payslip and does not require signature and stamp.</p>
    </div>
  </div>
</div>
`;
  };

  /* ================= SAVE PAYSLIP ================= */
  /* ================= SAVE PAYSLIP ================= */
  const generatePayslip = async () => {
    const id = `${selectedTrainerId}_${month}`;
    const payslipHTML = generatePayslipHTML();

    const payload = {
      trainerId: selectedTrainerId,
      instituteId: user.uid,
      month,
      attendance,
      salary,
      trainerDetails: {
        trainerId: trainerData.trainerId || "",
        name: `${trainerData.firstName} ${trainerData.lastName || ""}`,
        category: trainerData.category || "",
        email: trainerData.email || "",
        phone: trainerData.phone || "",
        joinedDate: trainerData.joinedDate || "",
        bankName: trainerData.bankName || "",
        accountNumber: trainerData.accountNumber || "",
        ifscCode: trainerData.ifscCode || "",
        pfNumber: trainerData.pfNumber || "",
      },
      payslipHTML,
      generatedBy: user.uid,
      generatedAt: serverTimestamp(),
    };

    /* 🔹 EXISTING SAVE (UNCHANGED) */
    await setDoc(doc(db, "institutes", user.uid, "payslips", id), payload);

    /* 🔹 NEW SAVE – SEPARATE COLLECTION */
    await setDoc(doc(db, "PAYSLIPS", selectedTrainerId, "months", id), payload);

    alert("Payslip Generated Successfully");

    setTrainers((prev) => prev.filter((t) => t.id !== selectedTrainerId));
    setTrainerData(null);
    setSalary(null);
    setAttendance(null);
    setSelectedTrainerId("");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-orange-500">
          Generate Trainer Payslip
        </h1>

        <label className="block font-semibold text-[#fb923c] mb-1">Select Month</label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border p-2 w-full mb-4"
        />

        <label className="block font-semibold text-[#fb923c] mb-1">Select Trainer</label>
        <select
          value={selectedTrainerId}
          onChange={(e) => handleTrainerSelect(e.target.value)}
          className="border p-2 w-full mb-6"
        >
          <option value="">-- Select Trainer --</option>
          {trainers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.firstName}
            </option>
          ))}
        </select>

        {trainerData && salary && (
          <div className="border rounded-lg p-6 bg-gray-50">
            <h2 className="text-xl font-bold mb-4">
              Payslip Preview (Editable)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="font-medium">Basic</label>
                <input
                  type="number"
                  value={salary.basic}
                  onChange={(e) => updateSalary("basic", e.target.value)}
                  className="border w-full p-1"
                />
              </div>
              <div>
                <label className="font-medium">HRA</label>
                <input
                  type="number"
                  value={salary.hra}
                  onChange={(e) => updateSalary("hra", e.target.value)}
                  className="border w-full p-1"
                />
              </div>
              <div>
                <label className="font-medium">Allowance</label>
                <input
                  type="number"
                  value={salary.allowance}
                  onChange={(e) => updateSalary("allowance", e.target.value)}
                  className="border w-full p-1"
                />
              </div>
              <div>
                <label className="font-medium">PF</label>
                <input
                  type="number"
                  value={salary.pf}
                  onChange={(e) => updateSalary("pf", e.target.value)}
                  className="border w-full p-1"
                />
              </div>
              <div>
                <label className="font-medium">Professional Tax</label>
                <input
                  type="number"
                  value={salary.professionalTax}
                  onChange={(e) =>
                    updateSalary("professionalTax", e.target.value)
                  }
                  className="border w-full p-1"
                />
              </div>
            </div>

            <div className="mt-4 font-bold text-lg">
              Net Pay: ₹{salary.net.toFixed(2)}
            </div>

            <button
              onClick={generatePayslip}
              className="mt-6 bg-green-600 text-white px-6 py-3 rounded w-full"
            >
              Generate & Save Payslip
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateTrainerPayslip;
