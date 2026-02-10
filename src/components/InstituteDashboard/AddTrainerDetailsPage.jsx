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
  const certificateInputRef = useRef(null);
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
  designation: "",
  dateOfBirth: "",
  category: "",
  subCategory: "",
  experience: "",

  phone: "",

  monthlySalary: "",
  lpa: "",

  bankName: "",
  accountName: "",
  ifscCode: "",
  accountNumber: "",
  pfDetails: "",
  upiDetails: "",

  certificates: [],
  aadharFiles: [],
});


  /* -------------------- CLOUDINARY UPLOAD -------------------- */


  /* -------------------- UPLOAD HANDLERS -------------------- */


  const handleCertificateChange = (e) => {
  const newFiles = Array.from(e.target.files);

  setFormData((prev) => {
    const combined = [...prev.certificates, ...newFiles];

    if (combined.length > 3) {
      alert("Maximum 3 certifications allowed");
      return prev;
    }

    return {
      ...prev,
      certificates: combined,
    };
  });

  e.target.value = null; // allow reselect
};


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
    if (step === 1) {
  return (
    formData.firstName &&
    formData.lastName &&
    formData.designation &&
    formData.dateOfBirth &&
    formData.category &&
    formData.subCategory &&
    formData.experience &&
    formData.certificates.length > 0
  );
}


if (step === 2) {
  if (
    !formData.bankName ||
    !formData.accountName ||
    !formData.accountNumber ||
    !formData.ifscCode ||
    !formData.pfDetails
  ) {
    alert("Please fill all mandatory bank details");
    return false;
  }

  if (formData.aadharFiles.length === 0) {
    alert("Please upload Aadhaar image(s)");
    return false;
  }

  return true;
}
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
  const autoEmail = `trainer_${Date.now()}@kridana.com`;
const resetForm = () => {
  setFormData({
    firstName: "",
    lastName: "",
    designation: "",
    dateOfBirth: "",
    category: "",
    subCategory: "",
    experience: "",
    phone: "",
    monthlySalary: "",
    lpa: "",
    bankName: "",
    accountName: "",
    ifscCode: "",
    accountNumber: "",
    pfDetails: "",
    upiDetails: "",
    certificates: [],
    aadharFiles: [],
  });

  setProfilePreview(null);
  setAvailableSubCategories([]);
  setStep(1);
};


  const handleSubmit = async () => {
 if (!profilePreview) {
  alert("Please upload profile image");
  return;
}

    // 🔒 REQUIRED FOR AUTH


    try {
      const cred = await createUserWithEmailAndPassword(
        secondaryAuth,
        autoEmail,
        DEFAULT_PASSWORD
      );


      const trainerUid = cred.user.uid;
      console.log("FORM DATA BEFORE SAVE", formData);

// ✅ Upload certificates to Cloudinary (same logic as InstituteSignup)
const safeData = {
  ...formData,
certificates: formData.certificates.map(f => f.name),
aadharFiles: formData.aadharFiles.map(f => f.name),

  profileImageUrl: profilePreview || "",
};


      await setDoc(doc(db, "InstituteTrainers", trainerUid), {
        ...safeData,
        trainerUid,
        instituteId: user.uid,
        role: "trainer",
        createdAt: serverTimestamp(),
      });


      await updateDoc(doc(db, "institutes", user.uid), {
        trainers: arrayUnion(trainerUid),
      });

      alert("Trainer created successfully");
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
              Employee Registration
            </h2>
            <p className="mt-4">Step {step} to 2</p>


            <div className="flex gap-4 mt-4 w-[580px]">
              {[1, 2].map((s) => (
                <div
                  key={s}
                  className={`h-3 flex-1 rounded-full ${step >= s ? "bg-orange-500" : "bg-gray-300"
                    }`}
                />
              ))}
            </div>
          </div>
          <div />
        </div>

        {/* STEP 1 */}
        {/* STEP 1 */}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-x-10 gap-y-6">

            {/* Full Name */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2">
                First Name<span className="text-red-500">*</span>
              </label>
              <input
                className={inputClass}
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
            </div>

            {/* Last Name */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2">
                Last Name<span className="text-red-500">*</span>
              </label>
              <input
                className={inputClass}
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </div>

            {/* Designation */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2">
                Designation<span className="text-red-500">*</span>
              </label>
              <input
                className={inputClass}
                value={formData.designation}
                onChange={(e) =>
                  setFormData({ ...formData, designation: e.target.value })
                }
              />
            </div>

            {/* Date of Birth */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2">
                Date Of Birth<span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className={inputClass}
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
              />
            </div>

            {/* Select Category */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2">
                Select Category<span className="text-red-500">*</span>
              </label>
              <select
  className={inputClass}
  value={formData.category}
  onChange={handleCategoryChange}
>
  <option value="">Select Category</option>
  {categories.map((cat) => (
    <option key={cat} value={cat}>
      {cat}
    </option>
  ))}
</select>

            </div>

            {/* Select Sub Category */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2">
                Select Sub – Category<span className="text-red-500">*</span>
              </label>
             <select
  className={inputClass}
  value={formData.subCategory}
  disabled={!formData.category}
  onChange={(e) =>
    setFormData({ ...formData, subCategory: e.target.value })
  }
>
  <option value="">
    {formData.category
      ? "Select Sub Category"
      : "Select Category First"}
  </option>

  {availableSubCategories.map((sub) => (
    <option key={sub} value={sub}>
      {sub}
    </option>
  ))}
</select>

            </div>

            {/* Experience */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2">
                Experience<span className="text-red-500">*</span>
              </label>
              <input
                className={inputClass}
                value={formData.experience}
                onChange={(e) =>
                  setFormData({ ...formData, experience: e.target.value })
                }
              />
            </div>

            {/* Upload Certification */}
            <div className="flex flex-col relative">
              <label className="text-sm font-semibold mb-2">
                Upload Certification<span className="text-red-500">*</span> / License Number
              </label>

              <input
  readOnly
  value={
    formData.certificates.length
      ? `${formData.certificates.length}/3 file(s) selected`
      : ""
  }
  placeholder="Upload certification images"
  className={`${inputClass} pr-12`}
/>


              <button
                type="button"
                onClick={() => certificateInputRef.current.click()}
                className="absolute right-3 top-[36px] w-8 h-8 rounded-full
                   border-2 border-orange-500 text-orange-500
                   flex items-center justify-center"
              >
                ↑
              </button>

              <input
                type="file"
                multiple
                ref={certificateInputRef}
                className="hidden"
                onChange={handleCertificateChange}

              />
            </div>

          </div>
        )}


        {step === 2 && (
          <div className="mt-6">

            <p className="text-center text-red-500 font-medium mb-8">
              You can add your Bank Details
            </p>

            <div className="grid grid-cols-2 gap-x-10 gap-y-6">

              {/* Bank Name */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-2">
                  Bank Name<span className="text-red-500">*</span>
                </label>
                <input
                  className={inputClass}
                  value={formData.bankName}
                  onChange={(e) =>
                    setFormData({ ...formData, bankName: e.target.value })
                  }
                />
              </div>

              {/* Account Name */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-2">
                  Account Name<span className="text-red-500">*</span>
                </label>
                <input
                  className={inputClass}
                  value={formData.accountName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, accountName: e.target.value })
                  }
                />
              </div>

              {/* Account Number */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-2">
                  Account Number<span className="text-red-500">*</span>
                </label>
                <input
                  className={inputClass}
                  value={formData.accountNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, accountNumber: e.target.value })
                  }
                />
              </div>

              {/* IFSC */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-2">
                  IFSC Code<span className="text-red-500">*</span>
                </label>
                <input
                  className={inputClass}
                  value={formData.ifscCode}
                  onChange={(e) =>
                    setFormData({ ...formData, ifscCode: e.target.value })
                  }
                />
              </div>

              {/* PF */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-2">
                  PF Details (Provident Fund)<span className="text-red-500">*</span>
                </label>
                <input
                  className={inputClass}
                  value={formData.pfDetails || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, pfDetails: e.target.value })
                  }
                />
              </div>

              {/* UPI */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-2">
                  UPI Details (Optional)
                </label>
                <input
                  className={inputClass}
                  value={formData.upiDetails || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, upiDetails: e.target.value })
                  }
                />
              </div>

              {/* AADHAR */}
{/* Aadhaar Upload */}
<div className="col-span-2 flex flex-col">
  <label className="text-sm font-semibold mb-2">
    Aadhaar Front & Back Photos<span className="text-red-500">*</span>
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