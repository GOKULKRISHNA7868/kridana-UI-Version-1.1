// src/pages/AddStudentDetailsPage.jsx
import React, { useState } from "react";
import {
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, secondaryAuth } from "../../firebase";
import { useAuth } from "../../context/AuthContext";

const DEFAULT_PASSWORD = "123456";

const inputClass =
  "w-full bg-white placeholder:text-gray-400 border border-[#FED7AA] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-400";
const selectClass =
  "w-full bg-white placeholder:text-gray-400 border border-[#FED7AA] rounded-md px-3 py-2 text-sm " +
  "focus:outline-none focus:ring-1 focus:ring-orange-400 " +
  "appearance-none cursor-pointer bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23FB923C' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")] " +
  "bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25rem]";


const AddStudentDetailsPage = () => {
  const { user, institute } = useAuth();

  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    fatherName: "",
    dob: "",
    category: "",
    subCategory: "",
    days: "",
    timings: "",
    branch: "",
    slotNumber: "",
    fees: "",
    joiningDate: "",
    phone: "",
    email: "",
  });

  const categories = [
    "Martial Arts",
    "Team Ball Sports",
    "Racket Sports",
    "Fitness",
    "Target & Precision Sports",
    "Equestrian Sports",
    "Adventure & Outdoor Sports",
    "Ice Sports",
    "Wellness",
    "Dance",
  ];

  const subCategoryMap = {
    "Martial Arts": [
      "Karate",
      "Taekwondo",
      "Boxing",
      "Wrestling",
      "Fencing",
      "Kendo",
    ],
    "Team Ball Sports": [
      "Football",
      "Hockey",
      "Basketball",
      "Handball",
      "Rugby",
      "American Football",
      "Water Polo",
      "Lacrosse",
    ],
    "Racket Sports": [
      "Tennis",
      "Badminton",
      "Pickleball",
      "Soft Tennis",
      "Padel Tennis",
      "Speedminton",
    ],
    Fitness: [
      "Strength / Muscular Fitness",
      "Muscular Endurance",
      "Flexibility Fitness",
      "Balance & Stability",
      "Skill / Performance Fitness",
    ],
    "Target & Precision Sports": [
      "Archery",
      "Shooting",
      "Darts",
      "Bowling",
      "Golf",
      "Billiards",
      "Bocce",
      "Lawn",
    ],
    "Equestrian Sports": [
      "Dressage",
      "Show Jumping",
      "Eventing",
      "Cross Country",
      "Endurance Riding",
      "Polo",
      "Horse Racing",
      "Para-Equestrian",
    ],
    "Adventure & Outdoor Sports": [
      "Rock Climbing",
      "Trekking",
      "Camping",
      "Kayaking",
      "Paragliding",
      "Surfing",
      "Mountain Biking",
      "Ziplining",
    ],
    "Ice Sports": [
      "Ice Skating",
      "Figure Skating",
      "Ice Hockey",
      "Speed Skating",
      "Short Track Skating",
      "Ice Dancing",
      "Curling",
      "Synchronized Skating",
    ],
    Wellness: [
      "Physical Wellness",
      "Mental Wellness",
      "Social Wellness",
      "Emotional Wellness",
      "Spiritual Wellness",
      "Lifestyle Wellness",
    ],
    Dance: [
      "Classical Dance",
      "Contemporary Dance",
      "Hip-Hop Dance",
      "Folk Dance",
      "Western Dance",
      "Latin Dance",
      "Fitness Dance",
      "Creative & Kids Dance",
    ],
  };
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const timeSlots = [
    { value: "09:00", label: "09:00 AM" },
    { value: "10:00", label: "10:00 AM" },
    { value: "11:00", label: "11:00 AM" },
    { value: "12:00", label: "12:00 PM" },
    { value: "13:00", label: "13:00 PM" },
    { value: "14:00", label: "14:00 PM" },
    { value: "15:00", label: "15:00 PM" },
    { value: "16:00", label: "16:00 PM" },
    { value: "17:00", label: "17:00 PM" },
    { value: "18:00", label: "18:00 PM" },
    { value: "19:00", label: "19:00 PM" },
    { value: "20:00", label: "20:00 PM" },
    { value: "21:00", label: "21:00 PM" },
    { value: "22:00", label: "22:00 PM" },
  ];


  const subCategories = subCategoryMap[formData.category] || [];


  /* ---------------- CLOUDINARY UPLOAD ---------------- */
  const uploadPhoto = async (file) => {
    setUploading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "kridana_upload");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/daiyvial8/image/upload",
      {
        method: "POST",
        body: data,
      }
    );

    const result = await res.json();
    setUploading(false);
    return result.secure_url;
  };


  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadPhoto(file);
    setPhotoUrl(url);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "category") {
      setFormData({
        ...formData,
        category: value,
        subCategory: "", // reset sub-category
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || institute?.role !== "institute") {
      alert("Unauthorized");
      return;
    }
    const emptyField = Object.entries(formData).find(
      ([, value]) => !value || value.toString().trim() === ""
    );

   if (emptyField) {
  alert("Please fill all required fields");
  return;
}

if (!photoUrl) {
  alert("Please upload photo before saving");
  return;
}



    try {
      const cred = await createUserWithEmailAndPassword(
        secondaryAuth,
        formData.email,
        DEFAULT_PASSWORD
      );

      const studentUid = cred.user.uid;

      await setDoc(doc(db, "students", studentUid), {
        ...formData,
        studentPhotoUrl: photoUrl,
        uid: studentUid,
        role: "student",
        instituteId: user.uid,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "institutes", user.uid), {
        students: arrayUnion(studentUid),
      });

      alert("Student added successfully");
    } catch (err) {
      alert(err.message);
    }
  };

  const isFormValid = Object.values({
    ...formData,
    photoUrl,
  }).every((value) => value && value.toString().trim() !== "");


  return (
    <div className="min-h-screen bg-[#ffffff] p-8">
      <h1 className="text-4xl font-bold text-orange-500 mb-6">
        Add Student Details
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto">
        {/* ---------- CARD 1 : BASIC DETAILS ---------- */}
        <div className="bg-[#FDF2E9] rounded-xl p-6 grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="md:col-span-2 md:row-span-2 flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-white rounded-full overflow-hidden mb-2">
              {photoUrl && (
                <img
                  src={photoUrl}
                  alt="student"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <label className="text-sm cursor-pointer bg-orange-400 px-3 py-1 rounded text-white">
              Upload Profile <span className="text-lg leading-none">↑</span>
              <input type="file" hidden onChange={handlePhotoChange} />
            </label>
          </div>

          <div className="md:col-span-2 flex flex-col gap-1">
            <label className="text-black font-medium">First Name<span className="text-red-500">*</span></label>
            <input
              name="firstName"
              placeholder="Enter your first name"
              className={inputClass}
              onChange={handleChange}
              required
            />
          </div>

          <div className="md:col-span-2 flex flex-col gap-1">
            <label className="text-black font-medium">Last Name<span className="text-red-500">*</span></label>
            <input
              name="lastName"
              placeholder="Enter your last name"
              className={inputClass}
              onChange={handleChange}
              required
            />
          </div>
          <div className="md:col-span-2 flex flex-col gap-1">
            <label className="text-black font-medium">Father’s Name<span className="text-red-500">*</span></label>
            <input
              name="fatherName"
              placeholder="Enter your father's name"
              className={inputClass}
              onChange={handleChange}
              required
            />
          </div>

          <div className="md:col-span-2 flex flex-col gap-1">
            <label className="text-black font-medium">Date Of Birth<span className="text-red-500">*</span></label>
            <input
              type="date"
              name="dob"
              className={inputClass}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* ---------- CARD 2 : ADD INFORMATION ---------- */}
        <div className="bg-[#FDF2E9] rounded-xl p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-black">
            Add Information
          </h2>
          <hr className="border-orange-300 w-full opacity-70" />
          <div className="h-2"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


            <div className="flex flex-col gap-1">
              <label className="text-black font-medium">
                Select Category<span className="text-red-500">*</span>
              </label>

              {/* wrapper must be relative */}
              <div className="relative">
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className={`${selectClass} pr-10`}
                >
                  <option value="">Select Categories</option>

                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                {/* dropdown arrow */}
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-orange-300 text-sm">
                  ▼
                </span>
              </div>
            </div>


            <div className="flex flex-col gap-1">
              <label className="text-black font-medium">
                Select Sub-Category<span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <select
                  name="subCategory"
                  required
                  value={formData.subCategory}
                  onChange={handleChange}
                  disabled={!formData.category}
                  className={`${selectClass} pr-10 ${!formData.category ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                >
                  <option value="">
                    {formData.category ? "Select Sub-Category" : "Select Category First"}
                  </option>

                  {subCategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-orange-300 text-sm">
                  ▼
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-black font-medium">
                Select Day<span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <select
                  name="days"
                  required
                  value={formData.days}
                  onChange={handleChange}
                  className={`${selectClass} pr-10`}
                >
                  <option value="">Select Day</option>

                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-orange-300 text-sm">
                  ▼
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-black font-medium">
                Select Timings<span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <select
                  name="timings"
                  required
                  value={formData.timings}
                  onChange={handleChange}
                  className={`${selectClass} pr-10`}
                >
                  <option value="">Select Time</option>

                  {timeSlots.map((time) => (
                    <option key={time.value} value={time.value}>
                      {time.label}
                    </option>
                  ))}
                </select>

                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-orange-300 text-sm">
                  ▼
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-black font-medium">Institute Branch<span className="text-red-500">*</span></label>
              <input
                required
                name="branch"
                className={inputClass}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-black font-medium">Slot Number<span className="text-red-500">*</span></label>
              <input
                required
                name="slotNumber"
                className={inputClass}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-black font-medium">Student Fees<span className="text-red-500">*</span></label>
              <input
                required
                name="fees"
                className={inputClass}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-black font-medium">Joining Date<span className="text-red-500">*</span></label>
              <input
                required
                type="date"
                name="joiningDate"
                className={inputClass}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* ---------- CARD 3 : CONTACT DETAILS ---------- */}
        <div className="bg-[#FDF2E9] rounded-xl p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-black">
            Additional Information
          </h2>
          <hr className="border-orange-300 w-full opacity-70" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="flex flex-col gap-1">
              <label className="text-black font-medium">Phone Number<span className="text-red-500">*</span></label>
              <input
                required
                name="phone"
                placeholder="Enter your Phone number"
                className={inputClass}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-black font-medium">E-Mail Address<span className="text-red-500">*</span></label>
              <input
                required
                name="email"
                placeholder="Enter your email"
                className={inputClass}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <button

          className={`px-8 py-3 rounded-lg font-semibold text-white
    ${uploading || !isFormValid
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-orange-500 hover:bg-orange-600"}
  `}
        >
          Save Student
        </button>

      </form>
    </div>
  );
};

export default AddStudentDetailsPage;
