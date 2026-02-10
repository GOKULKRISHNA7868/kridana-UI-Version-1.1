// src/components/InstituteDashboard/InstituteDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";

import CheckinCheckout from "./CheckinCheckout";
import Studenttimetables from "./Student timetables";
import TrainersTimetables from "./TrainersTimetables";
import FeesDetailsPage from "./FeesDetailsPage";
import TakeAttendance from "./TakeAttendance";
import Myattendance from "./Myattendance";
import TrainerStudentAttendance from "./TrainerStudentAttendance";
import TrainerStudentsFee from "./TrainerStudentsFee";
import MyOders from "./MyOders";
import BookedDemo from "./BookedDemo";
import Payslips from "./Payslips";

/* =============================
   SIDEBAR ITEMS
============================= */
const studentSidebarItems = [
  "Booked Demos",
  "Student Timetables",
  "My Attendance",
  "Fees Details",
  "MyOders",
  "Log Out",
];

const trainerSidebarItems = [
  "CheckinCheckout",
  "Trainer's Timetables",
  "My Attendance",
  "Payslips",
  "Take Attendance",
  "Log Out",
];

const trainerStudentSidebarItems = [
  "TrainerStudentAttendance",
  "TrainerStudentsFee",
  "Log Out",
];

// ✅ for OTHER USERS
const otherUserSidebarItems = ["Booked Demos", "MyOders", "Log Out"];

const WelcomeDashboard = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h1 className="text-3xl font-bold text-orange-700 mb-4">
        Welcome to your Dashboard 👋
      </h1>
      <p className="text-lg text-gray-600">
        Use the menu on the left to get started.
      </p>
    </div>
  );
};

const UserDashboard = () => {
  const [activeMenu, setActiveMenu] = useState("WELCOME");
  const { user } = useAuth();
  const navigate = useNavigate();
  const idleTimer = useRef(null);

  const [role, setRole] = useState(null);

  // ✅ NEW: Role Loading Fix (Avoid Flash)
  const [roleLoading, setRoleLoading] = useState(true);

  const [students, setStudents] = useState([]);
  const [trainers, setTrainers] = useState([]);

  /* =============================
     ⏱ AUTO LOGOUT (5 MIN)
  ============================= */
  useEffect(() => {
    const resetTimer = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(handleLogout, 5 * 60 * 1000);
    };

    ["mousemove", "keydown", "click", "scroll"].forEach((e) =>
      window.addEventListener(e, resetTimer),
    );
    resetTimer();

    return () => {
      ["mousemove", "keydown", "click", "scroll"].forEach((e) =>
        window.removeEventListener(e, resetTimer),
      );
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  /* =============================
     🚪 LOGOUT
  ============================= */
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/", { replace: true });
  };

  /* =============================
     🔑 ROLE DETECTION
  ============================= */
  useEffect(() => {
    if (!user?.uid) return;

    const detectRole = async () => {
      setRoleLoading(true); // ✅ Start Loading

      const studentSnap = await getDoc(doc(db, "students", user.uid));
      if (studentSnap.exists()) {
        setRole("student");
        setRoleLoading(false);
        return;
      }

      const trainerSnap = await getDoc(doc(db, "InstituteTrainers", user.uid));
      if (trainerSnap.exists()) {
        setRole("trainer");
        setRoleLoading(false);
        return;
      }

      const trainerStudentSnap = await getDoc(
        doc(db, "trainerstudents", user.uid),
      );
      if (trainerStudentSnap.exists()) {
        setRole("trainerstudent");
        setRoleLoading(false);
        return;
      }

      // ✅ other users
      setRole("other");
      setRoleLoading(false);
    };

    detectRole();
  }, [user]);

  /* =============================
     📂 FETCH DATA (UNCHANGED)
  ============================= */
  useEffect(() => {
    if (!user?.uid) return;

    const studentsQuery = query(
      collection(db, "students"),
      where("instituteId", "==", user.uid),
    );

    const unsubStudents = onSnapshot(studentsQuery, (snap) => {
      setStudents(
        snap.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        })),
      );
    });

    const trainersQuery = query(
      collection(db, "InstituteTrainers"),
      where("instituteId", "==", user.uid),
    );

    const unsubTrainers = onSnapshot(trainersQuery, (snap) => {
      setTrainers(
        snap.docs.map((doc) => ({
          trainerUid: doc.id,
          ...doc.data(),
        })),
      );
    });

    return () => {
      unsubStudents();
      unsubTrainers();
    };
  }, [user]);

  /* =============================
     📂 MAIN CONTENT
  ============================= */
  const renderMainContent = () => {
    switch (activeMenu) {
      case "WELCOME":
        return <WelcomeDashboard />;
      case "Student Timetables":
        return <Studenttimetables />;
      case "Trainer's Timetables":
        return <TrainersTimetables />;
      case "Fees Details":
        return <FeesDetailsPage />;
      case "Take Attendance":
        return <TakeAttendance />;
      case "My Attendance":
        return <Myattendance />;
      case "TrainerStudentAttendance":
        return <TrainerStudentAttendance />;
      case "TrainerStudentsFee":
        return <TrainerStudentsFee />;
      case "CheckinCheckout":
        return <CheckinCheckout />;
      case "MyOders":
        return <MyOders />;
      case "Booked Demos":
        return <BookedDemo />;
      case "Payslips":
        return <Payslips />;
      default:
        return null;
    }
  };

  /* =============================
     🧭 SIDEBAR BASED ON ROLE
  ============================= */
  const sidebarItems =
    role === "student"
      ? studentSidebarItems
      : role === "trainer"
        ? trainerSidebarItems
        : role === "trainerstudent"
          ? trainerStudentSidebarItems
          : otherUserSidebarItems;

  /* =============================
     ✅ LOADING SCREEN (NO FLASH)
  ============================= */
  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-semibold text-orange-700">
            Loading Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white text-[#5D3A09]">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-[#FFF7ED] flex flex-col border-r border-orange-200">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-orange-800 before:content-none">
          <div className="w-10 h-10 rounded-full bg-orange-700" />
          <span className="text-xl font-extrabold">
            {role === "other" ? "User Dashboard" : "Institute Dashboard"}
          </span>
        </div>

        <div className="flex-1 bg-[#FFF7EC] text-[#5D3A09] text-lg overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                if (item === "Log Out") return handleLogout();
                setActiveMenu(item);
              }}
              className={`w-full text-left px-4 py-3 border-b border-orange-200 transition-all ${
                item === activeMenu
                  ? "bg-[#F97316] text-white font-semibold rounded-md mx-2"
                  : "hover:bg-[#FED7AA]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-white px-4 md:px-10 py-8 overflow-y-auto">
        {renderMainContent()}
      </main>
    </div>
  );
};

export default UserDashboard;
