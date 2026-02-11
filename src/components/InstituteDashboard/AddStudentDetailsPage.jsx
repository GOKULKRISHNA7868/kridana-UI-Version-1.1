import React, { useState, useRef } from "react";
import {
  setDoc,
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import { db, secondaryAuth } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { User } from "lucide-react";

/* -------------------- STYLES -------------------- */
const inputClass =
  "h-11 px-3 border border-orange-400 rounded-md bg-white outline-none focus:border-2 focus:border-orange-500";

const DEFAULT_PASSWORD = "123456";

/* -------------------- COMPONENT -------------------- */
export default function AddTrainerDetailsPage() {
  const { user, institute } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  /* -------------------- REFS -------------------- */
  const profileInputRef = useRef(null);

  const aadharInputRef = useRef(null);

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
  const belts = [
    "White",
    "Yellow",
    "Orange",
    "Blue",
    "Brown",
    "Black",
    "Green",
  ];

  const [availableSubCategories, setAvailableSubCategories] = useState([]);
  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;

    setFormData((prev) => ({
      ...prev,
      category: selectedCategory,
      subCategory: "", // reset sub-category
    }));

    setAvailableSubCategories(subCategoryMap[selectedCategory] || []);
  };

  const [profilePreview, setProfilePreview] = useState(null);
  const handleProfileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  /* -------------------- FORM DATA -------------------- */
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    age: "",
    joiningDate: "",
    belt: "",
    category: "",
    subCategory: "",
    sessions: "",
    timings: "",
    phone: "",
    email: "",
    monthlyDate: "",
    address: "",
    aadharFiles: [],
  });

  /* -------------------- CLOUDINARY UPLOAD -------------------- */

  /* -------------------- UPLOAD HANDLERS -------------------- */

  const handleAadharUpload = (e) => {
    const newFiles = Array.from(e.target.files);

    setFormData((prev) => {
      const combined = [...prev.aadharFiles, ...newFiles];

      if (combined.length > 2) {
        alert("You can upload only up to 2 Aadhaar images");
        return prev;
      }

      return {
        ...prev,
        aadharFiles: combined,
      };
    });

    e.target.value = null;
  };

  /* -------------------- VALIDATION -------------------- */
  const validateStep = () => {
    // STEP 1 validation
    if (step === 1) {
      return Boolean(
        formData.firstName &&
        formData.lastName &&
        formData.dateOfBirth &&
        formData.age &&
        formData.joiningDate &&
        formData.belt &&
        formData.category &&
        formData.subCategory &&
        formData.sessions &&
        formData.timings &&
        formData.phone &&
        formData.email,
      );
    }

    // STEP 2 validation
    if (step === 2) {
      return Boolean(
        formData.monthlyDate &&
        formData.address &&
        formData.aadharFiles.length > 0,
      );
    }

    return true;
  };

  /* -------------------- NAV -------------------- */
  const handleNext = () => {
    if (!validateStep()) {
      alert("Please fill all required fields");
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step === 1) navigate(-1);
    else setStep(step - 1);
  };

  /* -------------------- SUBMIT -------------------- */

  // 🔐 Auto-generate trainer email (hidden from user)
  const autoEmailRef = useRef(`customer_${Date.now()}@kridana.com`);
  const autoEmail = autoEmailRef.current;

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      age: "",
      joiningDate: "",
      belt: "",
      category: "",
      subCategory: "",
      sessions: "",
      timings: "",
      phone: "",
      email: "",
      monthlyDate: "",
      address: "",
      aadharFiles: [],
    });

    setProfilePreview(null);
    setAvailableSubCategories([]);
    setStep(1);
  };

  const timeSlots = [
    { value: "09:00", label: "09:00 AM" },
    { value: "10:00", label: "10:00 AM" },
    { value: "11:00", label: "11:00 AM" },
    { value: "12:00", label: "12:00 PM" },
    { value: "13:00", label: "01:00 PM" },
    { value: "14:00", label: "02:00 PM" },
    { value: "15:00", label: "03:00 PM" },
    { value: "16:00", label: "04:00 PM" },
    { value: "17:00", label: "05:00 PM" },
    { value: "18:00", label: "06:00 PM" },
    { value: "19:00", label: "07:00 PM" },
    { value: "20:00", label: "08:00 PM" },
    { value: "21:00", label: "09:00 PM" },
    { value: "22:00", label: "10:00 PM" },
  ];

  const handleSubmit = async () => {
    // ✅ Validate all fields first
    if (!validateStep()) {
      alert("Please fill all required fields");
      return;
    }

    // ✅ Profile image mandatory
    if (!profilePreview) {
      alert("Please upload profile image");
      return;
    }

    try {
      // 🔒 Create auth user
      const cred = await createUserWithEmailAndPassword(
        secondaryAuth,
        autoEmail,
        DEFAULT_PASSWORD,
      );

      const customerUid = cred.user.uid;

      console.log("FORM DATA BEFORE SAVE", formData);

      // ✅ Save to InstituteCustomers collection
      const { aadharFiles, ...rest } = formData;

      await setDoc(doc(db, "students", customerUid), {
        ...rest,
        aadharFilesCount: aadharFiles.length, // optional
        profileImageUrl: profilePreview,
        customerUid,
        instituteId: user.uid,
        role: "customer",
        createdAt: serverTimestamp(),
      });

      // ✅ Add customer UID inside institute doc
      await updateDoc(doc(db, "institutes", user.uid), {
        customers: arrayUnion(customerUid),
      });

      alert("Customer created successfully");

      resetForm();
    } catch (err) {
      alert(err.message);
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="min-h-screen flex justify-center bg-white py-10">
      <div className="w-full max-w-5xl p-2">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          {/* PROFILE */}
          {/* LEFT : Upload Profile */}
          <div className="flex flex-col items-center mt-6">
            <div
              onClick={() => profileInputRef.current.click()}
              className="w-24 h-24 rounded-full bg-orange-200 flex items-center justify-center cursor-pointer overflow-hidden"
            >
              {profilePreview ? (
                <img
                  src={profilePreview}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-orange-600" />
              )}
            </div>

            {/* TEXT BELOW CIRCLE */}
            <span className="text-sm text-orange-500 font-medium mt-2">
              Upload Profile
            </span>

            <input
              type="file"
              ref={profileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleProfileUpload}
            />
          </div>

          {/* TITLE */}
          <div className="flex-1 flex flex-col items-center">
            <h2 className="text-3xl font-bold text-orange-500">
              Customer's Data
            </h2>
            <p className="mt-4">Step {step} to 2</p>

            <div className="flex gap-4 mt-4 w-[580px]">
              {[1, 2].map((s) => (
                <div
                  key={s}
                  className={`h-3 flex-1 rounded-full ${
                    step >= s ? "bg-orange-500" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
          <div />
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-x-10 gap-y-6">
            {/* Row 1 */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2">
                First Name<span className="text-red-500">*</span>
              </label>
              <input
                className={inputClass}
                value={formData.firstName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2">
                Last Name<span className="text-red-500">*</span>
              </label>
              <input
                className={inputClass}
                value={formData.lastName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                }
              />
            </div>

            {/* Row 2 */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2">
                Date Of Birth*
              </label>
              <input
                type="date"
                className={inputClass}
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    dateOfBirth: e.target.value,
                  }))
                }
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2">Age*</label>
              <select
                className={inputClass}
                value={formData.age}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, age: e.target.value }))
                }
              >
                <option value="">Select Age</option>
                <option>01 – 10 years Kids</option>
                <option>11 – 20 years Teenage</option>
                <option>21 – 45 years Adults</option>
                <option>45 – 60 years Middle Age</option>
                <option>61 – 100 years Senior Citizens</option>
              </select>
            </div>

            {/* Row 3 */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2">
                Joining Date*
              </label>
              <input
                type="date"
                className={inputClass}
                value={formData.joiningDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    joiningDate: e.target.value,
                  }))
                }
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2">Belt*</label>
              <select
                className={inputClass}
                value={formData.belt}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, belt: e.target.value }))
                }
              >
                <option value="">Select Belt</option>
                {belts.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Row 4 */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2">
                Select Category*
              </label>
              <select
                className={inputClass}
                value={formData.category}
                onChange={handleCategoryChange}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2">
                Select Sub-Category*
              </label>
              <select
                className={inputClass}
                value={formData.subCategory}
                disabled={!formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    subCategory: e.target.value,
                  }))
                }
              >
                <option value="">
                  {formData.category
                    ? "Select Sub Category"
                    : "Select Category First"}
                </option>
                {availableSubCategories.map((sub) => (
                  <option key={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Row 5 */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2">
                Select Sessions*
              </label>
              <select
                className={inputClass}
                value={formData.sessions}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, sessions: e.target.value }))
                }
              >
                <option value="">Sessions</option>
                <option>Morning</option>
                <option>Afternoon</option>
                <option>Evening</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2">
                Select Timings*
              </label>
              <select
                className={inputClass}
                value={formData.timings}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, timings: e.target.value }))
                }
              >
                <option value="">Select Time</option>

                {timeSlots.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Row 6 */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2">
                Contact Number*
              </label>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                className={inputClass}
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2">E-mail Id*</label>
              <input
                type="email"
                className={inputClass}
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-6">
            <div className="grid grid-cols-2 gap-x-10 gap-y-6">
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-2">
                  Monthly Payment Date*
                </label>
                <input
                  type="date"
                  className={inputClass}
                  value={formData.monthlyDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      monthlyDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-2">
                  Aadhaar Front & Back Photos
                  <span className="text-red-500">*</span>
                </label>

                <div className="relative w-full">
                  <input
                    readOnly
                    value={
                      formData.aadharFiles.length
                        ? `${formData.aadharFiles.length}/2 image(s) selected`
                        : ""
                    }
                    placeholder="Upload Aadhaar images"
                    className={`${inputClass} w-full pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() => aadharInputRef.current.click()}
                    className="absolute right-3 top-1/2 -translate-y-1/2
              w-8 h-8 rounded-full border border-orange-500
              text-orange-500 flex items-center justify-center bg-white"
                  >
                    +
                  </button>

                  <input
                    type="file"
                    ref={aadharInputRef}
                    multiple
                    accept="image/*"
                    onChange={handleAadharUpload}
                    className="hidden"
                  />
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  You can upload 1 or 2 images (maximum 2)
                </p>
              </div>

              <div className="col-span-2 flex flex-col">
                <label className="text-sm font-semibold mb-2">
                  Enter Address*
                </label>
                <textarea
                  rows={4}
                  className={`${inputClass} h-auto`}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-between items-center mt-12">
              <button
                type="button"
                onClick={handleBack}
                className="text-orange-500 font-medium"
              >
                Back
              </button>

              <div className="flex gap-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-orange-500 font-semibold"
                >
                  Add More
                </button>

                <button
                  onClick={handleSubmit}
                  className="bg-orange-500 px-10 py-3 rounded-md font-semibold text-white"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BUTTONS */}
        {step === 1 && (
          <div className="flex justify-end gap-6 mt-12">
            <button
              type="button"
              className="text-orange-500 font-medium"
              onClick={handleBack}
            >
              Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="bg-orange-500 px-8 py-2 rounded-md font-semibold text-white"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
