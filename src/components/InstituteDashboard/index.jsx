// src/components/InstituteDashboard/InstituteDashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import TermsAndConditions from "../../pages/Terms";
import PrivacyPolicy from "../../pages/Privacy";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import PerformanceReports from "./PerformanceReports";
import InstituteDataPage from "./InstituteDataPage";
import StudentsAttendancePage from "./StudentsAttendancePage";
import TrainersAttendancePage from "./TrainersAttendancePage";
import FeesDetailsPage from "./FeesDetailsPage";
import SalaryDetailsPage from "./SalaryDetailsPage";
import AddTrainerDetailsPage from "./AddTrainerDetailsPage";
import AddStudentDetailsPage from "./AddStudentDetailsPage";
import PaymentsPage from "./PaymentsPage";
import Editprofile from "./Editprofile";
import Timetable from "./Timetable";
import SellSportsMaterial from "./SellSportsMaterial";
import UploadProductDetails from "./UploadProductDetails";
import Orders from "./Orders";
import DemoClasses from "./DemoClasses";
import InstituteBookedDemos from "./InstituteBookedDemos";
import Reelsdata from "./Reelsdata";
import MyAccountPage from "./MyAccountPage";
const sidebarItems = [
  "Home",
  "Edit Profile",
  "Students Attendance",
  "Trainer’s Attendance",
  "Fees Details",
  "Time table",
  "Update Demo Classes",
  "Booked Demos",
  "Salary Details",
  "Management Details",
  "Add Customer Details",
  "Performance Reports",
  "Anyalitics",
  //"Orders",
  //"Sell Sports Material",
  //"Upload Product Details",
  "Inbox",
  //"Shop",
  "My Account",
  "Reports",
  "Payment Details",
  "Terms & Conditions",
  "Privacy Policy",
];

// 🎯 Dynamic role labels based on organization type
const roleLabels = {
  Institute: { students: "Students", trainers: "Trainers" },
  "Play School": { students: "Kids", trainers: "Teachers" },
  Clinic: { students: "Patients", trainers: "Therapists" },
  "Sports Center": { students: "Players", trainers: "Coaches" },
};

const InstituteDashboard = () => {
  const [activeMenu, setActiveMenu] = useState("Home");
  const { institute, user } = useAuth();
  const idleTimer = useRef(null);
  const mainContentRef = useRef(null);
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [trainers, setTrainers] = useState([]);

  const [dataType, setDataType] = useState("students");

  // 🔑 Determine labels from organization type
  const orgType = institute?.organizationType || "Institute";
  const labels = roleLabels[orgType] || roleLabels["Institute"];

  /* =============================
     📂 FETCH STUDENTS & TRAINERS
  ============================= */

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [activeMenu]);

  useEffect(() => {
    if (!user?.uid) return;

    const studentsQuery = query(
      collection(db, "students"),
      where("instituteId", "==", user.uid),
    );

    const unsubStudents = onSnapshot(studentsQuery, (snap) => {
      const data = snap.docs.map((doc) => ({
        uid: doc.id,
        firstName: doc.data().firstName || "",
        lastName: doc.data().lastName || "",
        phone: doc.data().phone || "",
        batch: doc.data().batch || doc.data().category || "",
        createdAt: doc.data().createdAt
          ? doc.data().createdAt.toDate().toISOString().split("T")[0]
          : null,
      }));

      setStudents(data);
    });

    const trainersQuery = query(
      collection(db, "InstituteTrainers"),
      where("instituteId", "==", user.uid),
    );

    const unsubTrainers = onSnapshot(trainersQuery, (snap) => {
      const data = snap.docs.map((doc) => ({
        trainerUid: doc.id,
        firstName: doc.data().firstName || "",
        lastName: doc.data().lastName || "",
        category: doc.data().category || "",
        phone: doc.data().phone || "",
        createdAt: doc.data().createdAt
          ? doc.data().createdAt.toDate().toISOString().split("T")[0]
          : null,
      }));

      setTrainers(data);
    });

    return () => {
      unsubStudents();
      unsubTrainers();
    };
  }, [user]);

  /* =============================
     📂 RENDER MAIN CONTENT
  ============================= */
  const renderMainContent = () => {
    switch (activeMenu) {
      case "Home":
        return (
          <InstituteDataPage
            students={students}
            trainers={trainers}
            studentLabel={labels.students}
            trainerLabel={labels.trainers}
            setDataType={setDataType}
            setActiveMenu={setActiveMenu}
            onDeleteStudent={(uid) =>
              setStudents((prev) => prev.filter((s) => s.uid !== uid))
            }
            onDeleteTrainer={(trainerUid) =>
              setTrainers((prev) =>
                prev.filter((t) => t.trainerUid !== trainerUid),
              )
            }
          />
        );

      case "Edit Profile":
        return <Editprofile />;
      case "Time table":
        return <Timetable />;
      case "Students Attendance":
        return <StudentsAttendancePage />;
      case "Trainer’s Attendance":
        return <TrainersAttendancePage />;
      case "Fees Details":
        return <FeesDetailsPage />;
      case "Salary Details":
        return <SalaryDetailsPage />;
      case "Management Details":
        return <AddTrainerDetailsPage />;
      case "Add Customer Details":
        return <AddStudentDetailsPage />;
      case "Payment Details":
        return <PaymentsPage />;
      case "Sell Sports Material":
        return <SellSportsMaterial setActiveMenu={setActiveMenu} />;
      case "Upload Product Details":
        return <UploadProductDetails />;
      case "Orders":
        return <Orders />;
      case "Update Demo Classes":
        return <DemoClasses />;
      case "Booked Demos":
        return <InstituteBookedDemos />;
      case "Terms & Conditions":
        return <TermsAndConditions />;
      case "Privacy Policy":
        return <PrivacyPolicy />;
      case "Performance Reports":
        return <PerformanceReports />;
      case "Anyalitics":
        return <Reelsdata />;
      case "My Account":
        return <MyAccountPage setActiveMenu={setActiveMenu} />;

      default:
        return (
          <div className="text-black">
            <h1 className="text-4xl font-extrabold mb-4">{activeMenu}</h1>
            <p className="text-lg max-w-xl">
              This section will be connected to data later.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex bg-white text-[#3F2A14] overflow-hidden">
      <aside className="w-72 bg-[#FFF7ED] flex flex-col border-r border-orange-200 h-full overflow-y-auto overflow-x-hidden">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-orange-800">
          <div className="w-10 h-10 rounded-full bg-orange-700" />
          <span className="text-xl font-extrabold">
            {institute?.instituteName || "Institute"}
          </span>
        </div>
        <div className="flex-1 bg-[#FFF7EC] text-[#5D3A09] text-lg overflow-y-auto overflow-x-hidden">
          {sidebarItems.map((item) => {
            let displayItem = item;

            if (item === "Students Attendance")
              displayItem = `${labels.students} Attendance`;

            if (item === "Trainer’s Attendance")
              displayItem = `${labels.trainers} Attendance`;

            if (item === "Fees Details" && orgType === "Clinic")
              displayItem = "Treatment Fees";

            return (
              <button
                key={item}
                type="button"
                onClick={(e) => {
                  e.preventDefault();

                  if (item === "Shop") {
                    navigate("/shop");
                    return;
                  }

                  setActiveMenu(item);
                }}
                className={`w-full text-left px-4 py-3 border-b border-orange-200 transition-all ${
                  item === activeMenu
                    ? "bg-[#F97316] text-white font-semibold rounded-md mx-2"
                    : "hover:bg-[#FED7AA]"
                }`}
              >
                {displayItem}
              </button>
            );
          })}
        </div>
      </aside>

      <main
        ref={mainContentRef}
        className="flex-1 bg-white px-10 py-8 overflow-y-auto h-full"
      >
        {/* 🔝 TOP HEADER (ONLY FOR HOME) */}

        {renderMainContent()}
      </main>
    </div>
  );
};

export default InstituteDashboard;
