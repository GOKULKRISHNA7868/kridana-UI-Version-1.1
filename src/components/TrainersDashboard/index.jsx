import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { doc, deleteDoc } from "firebase/firestore";
import TrainersTable from "./TrainersTable";
import StudentsAttendancePage from "./StudentsAttendancePage";
import FeesDetailsPage from "./FeesDetailsPage";
import AddStudentDetailsPage from "./AddStudentDetailsPage";
import PaymentsPage from "./PaymentsPage";
import { Pagination } from "./shared";
import Editprofile from "./Editprofile";
import MyStudents from "./MyStudents";
import DemoClasses from "./DemoClasses";
import InstituteBookedDemos from "./InstituteBookedDemos";
import TermsAndConditions from "../../pages/Terms";
import PrivacyPolicy from "../../pages/Privacy";
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";

/* =============================
   🔥 NEW ROLE STATE
============================= */
const TrainersDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("Home");
  const [view, setView] = useState("trainersData");
  const [trainers, setTrainers] = useState([]);
  const [trainerType, setTrainerType] = useState("Trainer"); // NEW
  const { institute } = useAuth();


  const studentLabel = trainerType === "Therapist" ? "Patients" : "Students";
  const trainerLabel = trainerType === "Therapist" ? "Therapist" : "Trainer";

  const sidebarItems = [
    "Home",
    `My${studentLabel}`,
    "Editprofile",
    `${studentLabel} Attendance`,
    "Demo Classes",
    "Booked Demos",
    "Fees Details",
    `Add ${studentLabel} Details`,
    "Inbox",
    "Shop",
    "Reports",
    "Payment Details",
    "Terms & Conditions",
    "Privacy Policy",
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");


  /* =============================
     🔥 FETCH TRAINER TYPE
  ============================= */
  useEffect(() => {
    const fetchTrainerType = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const q = query(
          collection(db, "trainers"),
          where("__name__", "==", user.uid),
        );

        const snap = await getDocs(q);
        if (!snap.empty) {
          const data = snap.docs[0].data();
          setTrainerType(data.trainerType || "Trainer");
        }
      } catch (err) {
        console.error("Error fetching trainer type:", err);
      }
    };

    fetchTrainerType();
  }, []);

  /* =============================
   🔥 FETCH STUDENTS
============================= */
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(
          collection(db, "trainerstudents"),
          where("trainerUID", "==", user.uid),
        );

        const snap = await getDocs(q);

        const studentsData = snap.docs.map((doc) => ({
          id: doc.id,
          name: `${doc.data().firstName || ""} ${doc.data().lastName || ""}`,
          batch: doc.data().category || "N/A",
          phone: doc.data().phoneNumber || "N/A",
          createdAt: doc.data().createdAt || null,
        }));

        setTrainers(studentsData);
      } catch (error) {
        console.error("Error fetching trainer students:", error);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
  setCurrentPage(1);
}, [search, selectedDate]);


  const isSameDay = (firestoreDate, selectedDate) => {
  if (!selectedDate) return true;
  if (!firestoreDate) return false;

  let d1;

  if (firestoreDate.seconds) {
    d1 = new Date(firestoreDate.seconds * 1000);
  } else if (firestoreDate instanceof Date) {
    d1 = firestoreDate;
  } else {
    return false;
  }

  const d2 = new Date(selectedDate);

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};


const filteredTrainers = useMemo(() => {
  return trainers.filter((t) => {
    const matchesSearch = t.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesDate = isSameDay(t.createdAt, selectedDate);

    return matchesSearch && matchesDate;
  });
}, [trainers, search, selectedDate]);


  const totalPages = Math.ceil(filteredTrainers.length / itemsPerPage);

  const paginatedTrainers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTrainers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTrainers, currentPage]);


  const handleMenuClick = (item) => {
    setActiveMenu(item);
    if (item === "Home") return setView("trainersData");
    if (item === `My${studentLabel}`) return setView("MyStudents");
    if (item === `${studentLabel} Attendance`)
      return setView("studentsAttendance");
    if (item === "Fees Details") return setView("feesDetails");
    if (item === `Add ${studentLabel} Details`) return setView("addStudent");
    if (item === "Payment Details") return setView("paymentDetails");
    if (item === "Editprofile") return setView("Editprofile");
    if (item === "Demo Classes") return setView("demoClasses");
    if (item === "Booked Demos") return setView("bookedDemos");
    if (item === "Terms & Conditions") return setView("terms");
    if (item === "Privacy Policy") return setView("privacy");
    if (item === "Shop") return navigate("/shop");

    setView("notConnected");
  };

  const handleDeleteStudent = async (id) => {
  try {
    await deleteDoc(doc(db, "trainerstudents", id));
    setTrainers((prev) => prev.filter((t) => t.id !== id));
  } catch (err) {
    console.error("Error deleting student:", err);
  }
};


  const renderMainContent = () => {
    if (view === "MyStudents") return <MyStudents />;
    if (view === "Editprofile") return <Editprofile />;
    if (view === "studentsAttendance") return <StudentsAttendancePage />;
    if (view === "feesDetails") return <FeesDetailsPage />;
    if (view === "addStudent") return <AddStudentDetailsPage />;
    if (view === "paymentDetails") return <PaymentsPage />;
    if (view === "demoClasses") return <DemoClasses />;
    if (view === "bookedDemos") return <InstituteBookedDemos />;
    if (view === "terms") return <TermsAndConditions />;
    if (view === "privacy") return <PrivacyPolicy />;

    if (view === "notConnected") {
      return (
        <div className="flex items-center justify-center h-full text-center">
          <div>
            <h1 className="text-3xl font-bold text-orange-500 mb-3">
              🚧 Page Not Connected
            </h1>
            <p className="text-gray-500">
              This section is not implemented yet.
            </p>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="flex items-center mb-4 w-full">
  <div className="flex items-center bg-gray-100 border border-gray-300 rounded-full px-5 py-2 w-full max-w-md">
    <span className="mr-2 text-lg text-[#7C4A1D]">🔍</span>
    <input
      type="text"
      placeholder={`Search ${trainerLabel.toLowerCase()} by name...`}
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="bg-transparent outline-none text-sm w-full text-[#5D3A09]"
    />
  </div>
<div className="flex items-center gap-2 ml-auto">
  {/* Calendar */}
  <input
    type="date"
    value={selectedDate}
    onChange={(e) => setSelectedDate(e.target.value)}
    className="border bg-orange-500 text-white rounded-full px-4 py-2 text-sm"
  />

  {/* Add Button */}
  <button
    onClick={() => setView("addStudent")}
    className="flex items-center gap-2 bg-orange-500 text-white px-6 py-2 rounded-full font-semibold"
  >
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4v16m8-8H4"
      />
    </svg>
    Add
  </button>
</div>

</div>

        <h1 className="text-3xl font-extrabold text-orange-500 mb-4">
          {trainerLabel}s Data
        </h1>

        <TrainersTable
  rows={paginatedTrainers}
  onDelete={handleDeleteStudent}
/>
         <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </>
    );
  };

  return (
    <div className="min-h-screen flex bg-white text-[#5D3A09]">
        <aside className="w-72 bg-[#FFF7ED] flex flex-col border-r border-orange-200 h-screen overflow-y-auto overflow-x-hidden">
  <div className="flex items-center gap-3 px-4 py-4 border-b border-orange-800 flex-shrink-0">
    <div className="w-10 h-10 rounded-full bg-orange-700" />
   <span className="text-xl font-extrabold">
  {institute?.instituteName || "Institute"}
</span>

  </div>

  <div className="flex-1 bg-[#FFF7EC] text-[#5D3A09] text-lg">
    {sidebarItems.map((item) => (
      <button
        key={item}
        type="button"
        onClick={() => handleMenuClick(item)}
        className={`w-full text-left px-4 py-3 border-b border-orange-200 transition-all break-words ${
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


      <main className="flex-1 bg-white px-10 py-8 overflow-y-auto h-screen">
        {renderMainContent()}
      </main>
    </div>
  );
};

export default TrainersDashboard;