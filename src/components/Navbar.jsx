import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { User } from "lucide-react";

const serviceTypes = [
  { name: "Martial Arts", path: "/services/martial-arts" },
  { name: "Team Ball Sports", path: "/services/teamball" },
  { name: "Racket Sports", path: "/services/racketsports" },
  { name: "Fitness", path: "/services/fitness" },
  {
    name: "Target & Precision Sports",
    path: "/services/target-precision-sports",
  },
  { name: "Equestrian Sports", path: "/services/equestrian-sports" },
  {
    name: "Adventure & Outdoor Sports",
    path: "/services/adventure-outdoor-sports",
  },
  { name: "Ice Sports", path: "/services/ice-sports" },
  { name: "Wellness", path: "/services/wellness" },
  { name: "Dance", path: "/services/dance" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hasActivePlan, setHasActivePlan] = useState(false);

  const navigate = useNavigate();
  const servicesRef = useRef(null);
  const userDropdownRef = useRef(null);
  const [profileImage, setProfileImage] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  /* ================= FETCH USER ROLE & PLAN ================= */
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        setUserRole(null);
        setHasActivePlan(false);
        setProfileImage("");
        setAuthLoading(false);
        return;
      }

      const trainerSnap = await getDoc(doc(db, "trainers", currentUser.uid));

      if (trainerSnap.exists()) {
        setUserRole("trainer");
        setProfileImage(trainerSnap.data().profileImageUrl || "");
      } else {
        const instituteSnap = await getDoc(
          doc(db, "institutes", currentUser.uid),
        );

        if (instituteSnap.exists()) {
          setUserRole("institute");
          setProfileImage(instituteSnap.data().profileImageUrl || "");
        } else {
          setUserRole("user");
          setProfileImage("");

          /* ✅ NEW: CHECK InstituteTrainers Login */
          const instituteTrainerSnap = await getDoc(
            doc(db, "InstituteTrainers", currentUser.uid),
          );

          if (instituteTrainerSnap.exists()) {
            setProfileImage(instituteTrainerSnap.data().profileImageUrl || "");
          }

          /* ✅ NEW: CHECK Students Login */
          const studentSnap = await getDoc(
            doc(db, "students", currentUser.uid),
          );

          if (studentSnap.exists()) {
            setProfileImage(studentSnap.data().studentPhotoUrl || "");
          }
        }
      }

      const planSnap = await getDoc(doc(db, "plans", currentUser.uid));
      if (
        planSnap.exists() &&
        planSnap.data()?.currentPlan?.status === "active"
      ) {
        setHasActivePlan(true);
      } else {
        setHasActivePlan(false);
      }

      // ✅ Auth finished loading
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /* ================= USER DROPDOWN CLICK OUTSIDE ================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  /* ================= CLICK OUTSIDE HANDLER ================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (servicesRef.current && !servicesRef.current.contains(event.target)) {
        setServiceOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= DASHBOARD NAVIGATION ================= */
  const handleDashboardNavigation = () => {
    setDropdownOpen(false);

    // ✅ Always open dashboard from top
    window.scrollTo(0, 0);

    if (userRole === "user") {
      navigate("/user/dashboard");
      return;
    }

    if (
      (userRole === "trainer" || userRole === "institute") &&
      !hasActivePlan
    ) {
      navigate("/plans");
      return;
    }

    if (userRole === "institute") {
      navigate("/institutes/dashboard");
      return;
    }

    if (userRole === "trainer") {
      navigate("/trainers/dashboard");
      return;
    }
  };

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    try {
      await auth.signOut();

      setUserRole(null);
      setHasActivePlan(false);
      setDropdownOpen(false);
      setIsOpen(false);

      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="w-full bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <div className="flex items-center justify-between h-16">
          {/* LOGO */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <img
              src="/Kridana logo.png"
              alt="Kridana Logo"
              className="w-14 h-14 object-contain"
            />

            <span className="text-2xl font-extrabold text-orange-600 tracking-wide">
              Kridana
            </span>
          </div>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center space-x-8 text-gray-700">
            <NavLink to="/" className="hover:text-orange-600 transition">
              Home
            </NavLink>

            {/* SERVICES */}
            <div className="relative" ref={servicesRef}>
              <button
                onClick={() => setServiceOpen((prev) => !prev)}
                className="hover:text-orange-600 flex items-center gap-1 transition"
              >
                Categories
                <svg
                  className={`w-4 h-4 transition-transform ${serviceOpen ? "rotate-180" : ""
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

             {serviceOpen && (
  <div className="absolute top-12 left-0 w-72 bg-white shadow-lg rounded-2xl border border-gray-200 py-2 z-50">
                  {serviceTypes.map((service) => (
                    <NavLink
                      key={service.path}
                      to={service.path}
                      onClick={() => setServiceOpen(false)}
                     className="block px-6 py-3 text-[15px] text-gray-600 font-normal hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-all duration-150"
                    >
                      {service.name}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            <NavLink to="/shop" className="hover:text-orange-600 transition">
              Shop
            </NavLink>

            {/* USER ACTIONS (profile + new dropdown side by side) */}
            {/* PROFILE + ARROW DROPDOWN */}
{/* PROFILE + SMALL ARROW (tight like Categories) */}
{auth.currentUser && (
  <div className="relative" ref={userDropdownRef}>
    <div className="flex items-center">

      {/* PROFILE ICON (no click) */}
      {profileImage ? (
        <img
          src={profileImage}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover"
        />
      ) : (
        <User className="w-7 h-7 text-gray-700" />
      )}

      {/* SMALL ARROW BUTTON */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="ml-1 p-1 hover:text-orange-600 transition"
      >
        <svg
          className={`w-3.5 h-3.5 transition-transform ${
            dropdownOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </div>

    {dropdownOpen && (
      <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg rounded-lg border z-50">
        <button
          onClick={handleDashboardNavigation}
          className="block w-full text-left px-4 py-2 hover:bg-orange-50"
        >
          Dashboard
        </button>

        <button
          onClick={handleLogout}
          className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
        >
          Logout
        </button>
      </div>
    )}
  </div>
)}


            {/* SIGN UP BUTTON */}
            {!authLoading && !auth.currentUser && (
              <button
                onClick={() => navigate("/RoleSelection")}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full shadow-md transition"
              >
                Sign Up
              </button>
            )}
          </div>

          {/* MOBILE BUTTON */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700 text-2xl"
          >
            ☰
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg border-t px-6 py-5 space-y-4">
          <NavLink
            to="/"
            onClick={() => setIsOpen(false)}
            className="block font-medium hover:text-orange-600"
          >
            Home
          </NavLink>

          <NavLink
            to="/viewTrainers"
            onClick={() => setIsOpen(false)}
            className="block font-medium hover:text-orange-600"
          >
            Trainers
          </NavLink>

          <NavLink
            to="/shop"
            onClick={() => setIsOpen(false)}
            className="block font-medium hover:text-orange-600"
          >
            Shop
          </NavLink>

          {auth.currentUser && (
            <button
              onClick={() => {
                window.scrollTo(0, 0); // ✅ scroll top
                handleDashboardNavigation();
              }}
              className="block text-left w-full font-medium hover:text-orange-600"
            >
              Dashboard
            </button>
          )}

          {auth.currentUser && (
            <button
              onClick={handleLogout}
              className="block text-left w-full font-medium text-red-600"
            >
              Logout
            </button>
          )}

          {!authLoading && !auth.currentUser && (
            <button
              onClick={() => navigate("/RoleSelection")}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-full shadow-md transition"
            >
              Sign Up
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
