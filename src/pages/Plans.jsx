import React, { useState } from "react";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Plans() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState("monthly");

  const startFreeTrial = async () => {
    const user = auth.currentUser;
    if (!user) return;

    // 🔍 Detect role securely
    const trainerSnap = await getDoc(doc(db, "trainers", user.uid));
    const instituteSnap = await getDoc(doc(db, "institutes", user.uid));

    let role = null;
    if (trainerSnap.exists()) role = "trainer";
    if (instituteSnap.exists()) role = "institute";

    const planRef = doc(db, "plans", user.uid);
    const snap = await getDoc(planRef);

    if (snap.exists() && snap.data().freeTrialUsed) {
      alert("❌ Free Trial already used");
      return;
    }

    const startDate = Timestamp.now();
    const endDate = Timestamp.fromDate(
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    );

    await setDoc(planRef, {
      role,
      freeTrialUsed: true,
      currentPlan: {
        planType: "FREE",
        startDate,
        endDate,
        status: "active",
      },
      history: [
        {
          planType: "FREE",
          startDate,
          endDate,
        },
      ],
      createdAt: serverTimestamp(),
    });

    alert("✅ Free Trial Activated");

    // ✅ DIRECT DASHBOARD NAVIGATION (NO BACK)
    if (role === "trainer") {
      navigate("/trainers/dashboard", { replace: true });
    } else if (role === "institute") {
      navigate("/institutes/dashboard", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-16">
      <h1 className="text-3xl font-bold mb-2">Get Started</h1>
      <p className="text-gray-500 mb-6">
        Start for free, pick a plan later. Ready to be part of the future
      </p>

      {/* Toggle */}
      <div className="flex border rounded-full mb-10 overflow-hidden">
        <button
          onClick={() => setBilling("monthly")}
          className={`px-6 py-2 ${
            billing === "monthly" ? "bg-orange-500 text-black" : "bg-white"
          }`}
        >
          Monthly Plan
        </button>
        <button
          onClick={() => setBilling("annual")}
          className={`px-6 py-2 ${
            billing === "annual" ? "bg-orange-500 text-black" : "bg-white"
          }`}
        >
          Annual Plan
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full px-6">
        {/* FREE */}
        <div className="bg-gray-900 text-white rounded-xl p-8 relative">
          <h2 className="text-xl font-bold mb-2">₹ 0/-</h2>
          <p className="text-lime-400 font-semibold mb-4">FREE (1 Month)</p>

          <ul className="space-y-2 text-sm">
            <li>✔ Trainer & Institutes</li>
            <li>✔ Attendance Tracking</li>
            <li>✔ Fees Payment Tracking</li>
            <li>✔ Reports Generator</li>
          </ul>

          <button
            onClick={startFreeTrial}
            className="mt-6 w-full bg-lime-400 text-black py-2 rounded font-semibold"
          >
            Subscribe
          </button>
        </div>

        {/* TRAINER */}
        <div className="bg-gray-900 text-white rounded-xl p-8 relative">
          <span className="absolute top-3 right-3 bg-lime-400 text-black text-xs px-2 py-1 rounded">
            20% OFF
          </span>

          <h2 className="text-xl font-bold mb-2">
            {billing === "monthly" ? "₹ 499/-" : "₹ 4,790 / Year"}
          </h2>
          <p className="text-lime-400 font-semibold mb-4">Trainer’s Plan</p>

          <ul className="space-y-2 text-sm">
            <li>✔ Attendance Tracking</li>
            <li>✔ Fees Payment Tracking</li>
            <li>✔ Reports Generator</li>
            <li>✔ 01 Free Ad Per Year</li>
          </ul>

          <button
            disabled
            className="mt-6 w-full bg-gray-600 py-2 rounded cursor-not-allowed"
          >
            Subscribe
          </button>
        </div>

        {/* INSTITUTE */}
        <div className="bg-gray-900 text-white rounded-xl p-8 relative">
          <span className="absolute top-3 right-3 bg-lime-400 text-black text-xs px-2 py-1 rounded">
            20% OFF
          </span>

          <h2 className="text-xl font-bold mb-2">
            {billing === "monthly" ? "₹ 999/-" : "₹ 9,590 / Year"}
          </h2>
          <p className="text-lime-400 font-semibold mb-4">Institutes Plan</p>

          <ul className="space-y-2 text-sm">
            <li>✔ Trainers Management Attendance</li>
            <li>✔ Institute Workforce Attendance</li>
            <li>✔ Salary Tracking</li>
            <li>✔ Reports</li>
            <li>✔ 03 Ads Free Per Year</li>
          </ul>

          <button
            disabled
            className="mt-6 w-full bg-gray-600 py-2 rounded cursor-not-allowed"
          >
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
}
