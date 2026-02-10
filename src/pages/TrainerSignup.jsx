import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { User } from "lucide-react";

export default function TrainerSignup() {
  const navigate = useNavigate();
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

  // ✅ ADD THIS (Storage instance)
  const storage = getStorage();

  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);

  const profileInputRef = useRef(null);
  const certificateInputRef = useRef(null);
  const aadharInputRef = useRef(null);

  const [profilePreview, setProfilePreview] = useState(null);
  const [certifications, setCertifications] = useState([]);


  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    organization: "",
    designation: "",
    dob: "",
    category: "",
    subCategory: "",
    experience: "",

    trainerName: "",
    trainerType: "",
    locationName: "",
    latitude: "",
    longitude: "",
    yearsExperience: "",
    phoneNumber: "",
    email: "",

    instituteName: "",
    password: "",
    confirmPassword: "",

    bankName: "",
    accountName: "",
    accountNumber: "",
    ifscCode: "",
    pfDetails: "",
    upiDetails: "",

    aadharFiles: [],
  });
  const [availableSubCategories, setAvailableSubCategories] = useState([]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;

    setFormData((prev) => ({
      ...prev,
      category: selectedCategory,
      subCategory: "",
    }));

    setAvailableSubCategories(subCategoryMap[selectedCategory] || []);
  };

  const handleProfileUpload = (e) => {
    const file = e.target.files[0];
    if (file) setProfilePreview(URL.createObjectURL(file));
  };

  const handleCertificateUpload = (e) => {
    const newFiles = Array.from(e.target.files);

    setCertifications((prev) => {
      const combined = [...prev, ...newFiles];

      if (combined.length > 3) {
        alert("Maximum 3 certifications allowed");
        return prev;
      }

      return combined;
    });

    e.target.value = null; // allow re-select same file
  };


 const handleAadharUpload = (e) => {
  const newFiles = Array.from(e.target.files);

  setFormData((prev) => {
    const combined = [...prev.aadharFiles, ...newFiles];

    if (combined.length > 2) {
      alert("Maximum 2 Aadhaar images allowed");
      return prev;
    }

    return {
      ...prev,
      aadharFiles: combined,
    };
  });

  e.target.value = null;
};


  const validateStep = () => {
    if (step === 1) {
  if (
    !formData.firstName ||
    !formData.lastName ||
    !formData.organization ||
    !formData.designation ||
    !formData.dob ||
    !formData.category ||
    !formData.subCategory ||
    !formData.experience ||
    certifications.length === 0
  ) {
    alert("Please fill all fields and upload certification");
    return false;
  }
  return true;
}


    if (step === 2)
      return (
        formData.phoneNumber &&
        formData.email &&
        formData.password &&
        formData.confirmPassword
      );

if (step === 3) {
  const isValid =
    formData.bankName &&
    formData.accountName &&
    formData.accountNumber &&
    formData.ifscCode &&
    formData.pfDetails &&
    formData.aadharFiles.length > 0; // at least 1 image

  if (!isValid) {
    alert("All fields except UPI are mandatory. Please complete them and upload Aadhaar image(s).");
    return false;
  }

  return true;
}

  }
  
  const handleNext = () => {
    if (!validateStep()) {
      alert("Please fill all required fields");
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step === 1) navigate("/");
    else setStep(step - 1);
  };

const handleSubmit = async () => {
  // validate step 3 fields
  if (!validateStep()) return;

  // profile image mandatory
  if (!profilePreview) {
    alert("Please add the profile image");
    return;
  }

  try {
    const userCred = await createUserWithEmailAndPassword(
      auth,
      formData.email,
      formData.password
    );

    const { aadharFiles, ...safeFormData } = formData;

    await setDoc(doc(db, "trainers", userCred.user.uid), {
      role: "trainer",
      status: "pending",
      ...safeFormData,
      createdAt: serverTimestamp(),
    });

    navigate("/trainers/dashboard");
  } catch (err) {
    console.error(err);
    alert("Something went wrong. Try again.");
  }
};




  const inputClass =

    "h-11 px-3 border border-orange-400 rounded-md bg-white focus:bg-white outline-none focus:border-2 focus:border-orange-500";

  // ⬇️ return ( … UI continues here )


  return (
    <div className="min-h-screen flex justify-center bg-white py-10">

      <div className="w-full max-w-5xl rounded-md p-2 mt-1 mb-10">



        {/* HEADER WITH PROFILE + CONTENT BESIDE */}
        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">

          {/* LEFT : Upload Profile */}
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
            <span className="text-sm text-orange-500 font-medium mt-2">Upload Profile</span>

            <input
              type="file"
              ref={profileInputRef}
              className="hidden"
              onChange={handleProfileUpload}
            />
          </div>


          {/* CENTER : Title + Step + Bars */}
          <div className="flex-1 flex flex-col items-center">
            <h2 className="text-3xl font-bold text-orange-500 ">
              Trainer’s Registration
            </h2>

            <p className="text-md text-center mt-6">
              Step {step} to 3
            </p>

            {/* PROGRESS BARS */}
            <div className="flex gap-4 mt-4 w-[580px]">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-3 flex-1 rounded-full ${step >= s ? "bg-orange-500" : "bg-gray-300"
                    }`}
                />
              ))}
            </div>
          </div>

          {/* RIGHT : empty spacer (keeps center aligned) */}
          <div className="mt-8" />
        </div>


        {/* STEP 1 */}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-2">

            {[
              ["First Name*", "firstName"],
              ["Last Name*", "lastName"],
            ].map(([label, name]) => (
              <div key={name} className="flex flex-col gap-3 mb-1">
                <label className="text-sm font-semibold mb-0">{label}</label>
                <input name={name} onChange={handleChange} className={inputClass} />
              </div>
            ))}

            <div className="col-span-2 flex flex-col">
              <label className="text-sm font-semibold mb-2">
                Add Association / Organization Name*
              </label>
              <input
                name="organization"
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {[
              ["Designation*", "designation"],
              ["Date Of Birth*", "dob", "date"],

            ].map(([label, name, type = "text"]) => (
              <div key={name} className="flex flex-col">
                <label className="text-sm font-semibold mb-2">{label}</label>
                <input
                  type={type}
                  name={name}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            ))}
            {/* CATEGORY DROPDOWN */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2">
                Select Category*
              </label>

              <select
                value={formData.category}
                onChange={handleCategoryChange}
                className={inputClass}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* SUB CATEGORY DROPDOWN */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2">
                Select Sub – Category*
              </label>

              <select
                value={formData.subCategory}
                onChange={(e) =>
                  setFormData({ ...formData, subCategory: e.target.value })
                }
                disabled={!formData.category}
                className={inputClass}
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
              <label className="text-sm font-semibold mb-2">Experience*</label>
              <input
                name="experience"
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Upload Certification – SAME ROW */}
            <div className="flex flex-col relative">
              <label className="text-sm font-semibold mb-2">
                Upload Certification* / License Number
              </label>

              <input
                readOnly
                value={
                  certifications.length
                    ? `${certifications.length} file(s) selected`
                    : ""
                }
                placeholder="Upload certification or licence images"
                className={`${inputClass} pr-12`}
              />


              <button
                type="button"
                onClick={() => certificateInputRef.current.click()}

                className="absolute right-3 top-[34px]
             w-6 h-6
             rounded-full
             border border-orange-500
             text-orange-500
             flex items-center justify-center text-xs"
              >
                ↑
              </button>

              <input
                type="file"
                ref={certificateInputRef}
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleCertificateUpload}
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload certification or licence images (1–3 only)
              </p>

            </div>

          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="grid grid-cols-2 gap-x-5 gap-y-6 mt-8">

            {/* Phone Number */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2">
                Add Phone Number*
              </label>
              <input
                name="phoneNumber"
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2">
                Add E – Mail Id*
              </label>
              <input
                type="email"
                name="email"
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2">
                Create Password*
              </label>
              <input
                type="password"
                name="password"
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold mb-2">
                Re – Enter Password*
              </label>
              <input
                type="password"
                name="confirmPassword"
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Login link */}
            <div className="col-span-2 text-sm mt-2">
              Already Have an Account ?{" "}
              <span
                className="text-orange-500 cursor-pointer font-medium"
                onClick={() => navigate("/login")}
              >
                Login
              </span>
            </div>

          </div>
        )}
        {step === 3 && (
          <div className="mt-8">

            <p className="text-center text-red-500 font-medium mb-6">
              You can add your Bank Details
            </p>

            <div className="grid grid-cols-2 gap-x-5 gap-y-6">

              {/* Bank Name */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-2">
                  Bank Name*
                </label>
                <input
                  name="bankName"
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* Account Name */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-2">
                  Account Name*
                </label>
                <input
                  name="accountName"
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* Account Number */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-2">
                  Account Number*
                </label>
                <input
                  name="accountNumber"
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* IFSC Code */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-2">
                  IFSC Code*
                </label>
                <input
                  name="ifscCode"
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* PF Details */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-2">
                  PF Details (Provident Fund)*
                </label>
                <input
                  name="pfDetails"
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* UPI Details */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-2">
                  UPI Details (Optional)
                </label>
                <input
                  name="upiDetails"
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              {/* Aadhar Upload */}
{/* Aadhaar Upload */}
<div className="col-span-2 flex flex-col">
  <label className="text-sm font-semibold mb-2">
    Aadhaar Front & Back Photos*
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
      className={`${inputClass} w-full pr-14`}
    />

    <button
      type="button"
      onClick={() => aadharInputRef.current.click()}
      className="
        absolute right-3 top-1/2 -translate-y-1/2
        w-9 h-9
        rounded-full
        border-2 border-orange-500
        text-orange-500
        flex items-center justify-center
        bg-white
      "
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
          </div>
        )}

        <div className="h-24"></div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-6 mt-4">
          <button
            onClick={handleBack}
            className="text-orange-500 font-medium"
          >
            Back
          </button>

          {step < 3 && (
            <button
              onClick={handleNext}
              className="bg-orange-500 px-8 py-2 rounded-md font-semibold"
            >
              Next
            </button>
          )}

          {step === 3 && (
            <button
              onClick={handleSubmit}
              className="bg-orange-500 px-8 py-2 rounded-md font-semibold"
            >
              Save
            </button>
          )}
        </div>



      </div>
    </div>
  );
}