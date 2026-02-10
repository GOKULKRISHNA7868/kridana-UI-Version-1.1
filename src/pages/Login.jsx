import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = new URLSearchParams(location.search).get("role") || "user";

  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState({ emailPhone: "", password: "" });

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        formData.emailPhone,
        formData.password,
      );

      const user = cred.user;

      const trainerSnap = await getDoc(doc(db, "trainers", user.uid));
      const instituteSnap = await getDoc(doc(db, "institutes", user.uid));

      let actualRole = null;
      if (trainerSnap.exists()) actualRole = "trainer";
      if (instituteSnap.exists()) actualRole = "institute";
      if (!actualRole && role === "user") actualRole = "user";

      if (role !== "user" && actualRole !== role) {
        alert(`Role mismatch. Registered as ${actualRole}`);
        return;
      }

      // 🔐 PLAN CHECK (trainer / institute only)
      if (actualRole !== "user") {
        const planRef = doc(db, "plans", user.uid);
        const planSnap = await getDoc(planRef);

        if (!planSnap.exists()) {
          navigate("/plans");
          return;
        }

        const plan = planSnap.data();
        const now = Date.now();

        if (
          plan.currentPlan?.endDate?.toMillis() < now ||
          plan.currentPlan?.status === "expired"
        ) {
          navigate("/plans?expired=true");
          return;
        }
      }

      // ✅ FINAL REDIRECT
      if (actualRole === "trainer") navigate("/trainers/dashboard");
      else if (actualRole === "institute") navigate("/institutes/dashboard");
      else navigate("/landing");
    } catch (err) {
      console.error(err);

      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        alert("Wrong password. Please try again.");
      } else if (err.code === "auth/user-not-found") {
        alert("No account found with this email.");
      } else {
        alert("Login failed: " + err.message);
      }
    }
  };
  // ✅ Forgot Password Handler
  const handleForgotPassword = async () => {
    const email = prompt("Enter your registered email to reset password:");

    if (!email) {
      alert("Email is required!");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset link sent successfully to your email!");
    } catch (error) {
      console.error(error);

      if (error.code === "auth/user-not-found") {
        alert("No account found with this email.");
      } else if (error.code === "auth/invalid-email") {
        alert("Please enter a valid email address.");
      } else {
        alert("Error: " + error.message);
      }
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-6 ${darkMode ? "bg-gray-900" : "bg-white"}`}
    >
      <div className="absolute top-6 right-6">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-4 py-2 border border-orange-400 text-orange-500 rounded"
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-md p-8 rounded-xl shadow-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}
      >
        <h2 className="text-3xl font-bold mb-6 text-orange-500">
          {role === "trainer"
            ? "Trainer Sign In"
            : role === "institute"
              ? "Institute Sign In"
              : "Welcome Back"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email / Phone */}
          <div>
            <label className="block mb-2 text-orange-500 font-medium">
              E-mail / Phone Number*
            </label>
            <input
              type="text"
              name="emailPhone"
              placeholder="Enter your email or phone number"
              required
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-orange-300
      focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-2 text-orange-500 font-medium">
              Password*
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              required
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-orange-300
      focus:outline-none focus:border-orange-500"
            />
          </div>
          {/* Forgot Password */}
          <div className="text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-orange-500 hover:underline font-medium"
            >
              Forgot Password?
            </button>
          </div>

          <button className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition">
            Sign In
          </button>
        </form>
      </motion.div>
    </div>
  );
}
