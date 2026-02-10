// src/pages/InstituteSignup.js

import { useNavigate } from "react-router-dom";
import { Trash2, Edit2 } from "lucide-react"; // npm install lucide-react
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Building2 } from "lucide-react";
import { auth, db } from "../firebase";
import React, { useState, useRef } from "react";

export default function InstituteSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1, 2, or 3
  const role = "institute";
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [showFetchScreen, setShowFetchScreen] = useState(false);
  const certificateInputRef = useRef(null);
  const aadhaarInputRef = useRef(null);


const inputClass =
"h-11 px-3 border border-orange-400 rounded-md bg-white focus:bg-white outline-none focus:border-2 focus:border-orange-500";

  // ✅ Agreement state (NEW)
  // ✅ Loading state (NEW)
  const [loading, setLoading] = useState(false);

  const [agreed, setAgreed] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1
    instituteName: "",
    organizationType: "",
    founderName: "",
    designation: "",
    certifications: [],
    category: "",
    subCategory: "",
    yearFounded: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Step 2
    zipCode: "",
    city: "",
    state: "",
    building: "",
    street: "",
    landmark: "",
    district: "",
    country: "",
    latitude: "",
  longitude: "",
  locationFetched: false,
    // Step 3
   // Step 3
bankName: "",
accountName: "",
accountNumber: "",
ifscCode: "",
pfDetails: "",
upiDetails: "",
aadhaarFiles: [],


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
const handleCertificateChange = (e) => {
  const newFiles = Array.from(e.target.files);

  setFormData((prev) => {
    const combined = [...prev.certifications, ...newFiles];

    if (combined.length > 3) {
      alert("Maximum 3 certifications allowed");
      return prev;
    }

    return {
      ...prev,
      certifications: combined,
    };
  });

  e.target.value = null; // allow re-select same file
};

const handleAadhaarChange = (e) => {
  const newFiles = Array.from(e.target.files);

  setFormData((prev) => {
    const combined = [...prev.aadhaarFiles, ...newFiles];

    if (combined.length > 2) {
      alert("You can upload only up to 2 Aadhaar images");
      return prev; // ❌ don't update
    }

    return {
      ...prev,
      aadhaarFiles: combined, // ✅ append properly
    };
  });

  e.target.value = null;
};



  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;

    setFormData((prev) => ({
      ...prev,
      category: selectedCategory,
      subCategory: "", // reset when category changes
    }));
  };
  const handleSubCategoryChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      subCategory: e.target.value,
    }));
  };


const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value,     // ⭐ REQUIRED
    locationFetched: false,
  }));
};


  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target.result);
      };
      reader.readAsDataURL(file);
      setProfileImageFile(file);
    }
  };

  // Validation for each step
  const validateStep = () => {
    if (step === 1) {
      if (!profileImageFile) {
        alert("Please upload institute logo");
        return false;
      }
      if (
        !formData.instituteName ||
        !formData.founderName ||
        !formData.designation ||
        !formData.yearFounded ||
        !formData.category ||
        !formData.subCategory ||
        !formData.phoneNumber ||
        !formData.email
      ) {
        alert("Please fill all fields in Step 1");
        return false;
      }
      if (!formData.password || !formData.confirmPassword) {
        alert("Please enter password");
        return false;
      }

      if (formData.password.length < 6) {
        alert("Password must be at least 6 characters");
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match");
        return false;
      }

      if (!formData.certifications || formData.certifications.length === 0) {
        alert("Please upload at least one certification or licence");
        return false;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        alert("Please enter a valid email");
        return false;
      }

      return true;
    }


    if (step === 2) {
  // if location was auto fetched → skip validation
  if (formData.locationFetched) return true;

  if (
    !formData.building ||
    !formData.street ||
    !formData.city ||
    !formData.district ||
    !formData.state ||
    !formData.country ||
    !formData.zipCode
  ) {
    alert("Fill address OR use Fetch Location");
    return false;
  }

  return true;
}


    if (step === 3) {
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

  if (!formData.aadhaarFiles || formData.aadhaarFiles.length === 0) {
  alert("Please upload Aadhaar image(s)");
  return false;
}

  return true;
}

  };

  const handleNext = () => {
    if (!validateStep()) return;

    // require agreement before leaving step 1
    if (step === 1 && !agreed) {
      alert("Please agree to policies to continue");
      return;
    }

    setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };
  // ✅ Upload Profile Image to Cloudinary
  const uploadProfileToCloudinary = async (file) => {
    const formData = new FormData();

    formData.append("file", file);

    // ✅ Your Unsigned Preset
    formData.append("upload_preset", "kridana_upload");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/daiyvial8/image/upload",
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await res.json();

      if (!data.secure_url) {
        throw new Error("Cloudinary upload failed");
      }

      return data.secure_url;
    } catch (err) {
      console.error("Cloudinary Upload Error:", err);
      alert("Image upload failed!");
      return "";
    }
  };
  const uploadCertificatesToCloudinary = async (files) => {
    const urls = [];

    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", "kridana_upload");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/daiyvial8/image/upload",
        {
          method: "POST",
          body: fd,
        }
      );

      const data = await res.json();
      urls.push(data.secure_url);
    }

    return urls;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    if (!agreed) {
      alert("Please agree to Kridhana policies to continue");
      return;
    }

    // ✅ Start loading
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );

      const uid = userCredential.user.uid;

      let profileImageUrl = "";

      if (profileImageFile) {
        profileImageUrl = await uploadProfileToCloudinary(profileImageFile);
      }
      let certificateUrls = [];

      if (formData.certifications?.length) {
        certificateUrls = await uploadCertificatesToCloudinary(
          formData.certifications
        );
      }


      await setDoc(doc(db, "institutes", uid), {
        role: "institute",
        status: "pending",

        // Step 1
        instituteName: formData.instituteName,
        organizationType: formData.organizationType,
        founderName: formData.founderName,
        designation: formData.designation,
        yearFounded: formData.yearFounded,
        category: formData.category,
        subCategory: formData.subCategory,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        certifications: certificateUrls,

        // Step 2
        building: formData.building,
        street: formData.street,
        landmark: formData.landmark || "",
        city: formData.city,
        district: formData.district,
        state: formData.state,
        country: formData.country,
        zipCode: formData.zipCode,

        // Step 3
        bankDetails: formData.bankDetails || "",
        upiDetails: formData.upiDetails || "",

        // Profile Image
        profileImageUrl,

        // Agreements
        agreements: {
          termsAndConditions: true,
          privacyPolicy: true,
          paymentPolicy: true,
          merchantPolicy: true,
          agreedAt: serverTimestamp(),
        },

        createdAt: serverTimestamp(),
      });

      alert("Institute registered successfully!");
      navigate("/login?role=institute");
    } catch (error) {
      console.error(error);

      if (error.code === "auth/email-already-in-use") {
        alert("This email is already registered. Please login instead.");
        navigate("/login?role=institute");
      } else if (error.code === "auth/invalid-email") {
        alert("Invalid email address.");
      } else if (error.code === "auth/weak-password") {
        alert("Password should be at least 6 characters.");
      } else {
        alert("Something went wrong: " + error.message);
      }
    } finally {
      // ✅ Stop loading (always)
      setLoading(false);
    }
  };

  // Progress bar width
  const progressPercentage = (step / 3) * 100;

const handleFetchLocation = async () => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  setFetchingLocation(true);

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
        );

        const data = await response.json();
        const address = data.address || {};

        setFormData((prev) => ({
          ...prev,
          building: address.house_number || "",
          street: address.road || "",
          landmark: address.suburb || "",

          city: address.village || address.town || address.city || "",
          district: address.state_district || "",
          state: address.state || "",
          country: address.country || "",
          zipCode: address.postcode || "",

          latitude: latitude.toString(),
          longitude: longitude.toString(),

          locationFetched: true,
        }));


        // ❌ DO NOT move step automatically
        // setStep(3)  ← removed
      } catch {
        alert("Failed to fetch location");
      }

      setFetchingLocation(false);
    },
    () => {
      alert("Permission denied");
      setFetchingLocation(false);
    },
    {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 0,
    }
  );
};

  return (
   <div className="min-h-screen flex justify-center bg-white py-10">
  <div className="w-full max-w-5xl rounded-md p-2 mt-1 mb-10">

        {/* Header */}
{/* HEADER WITH PROFILE + TITLE + PROGRESS */}
<div className="flex items-center justify-between mb-10">

  {/* LEFT : Upload Logo Circle */}
  <div className="flex flex-col items-center mt-6">
    <div
      onClick={() => document.getElementById("logoUpload").click()}
      className="w-24 h-24 rounded-full bg-orange-200 flex items-center justify-center cursor-pointer overflow-hidden"
    >
      {profileImage ? (
        <img src={profileImage} className="w-full h-full object-cover" />
      ) : (
        <Building2 className="w-10 h-10 text-orange-600" />

      )}
    </div>

    <span className="text-sm text-orange-500 font-medium mt-2">Upload Logo</span>

    <input
      id="logoUpload"
      type="file"
      accept="image/*"
      onChange={handleProfileImageChange}
      className="hidden"
    />
  </div>

  {/* CENTER : Title + Step + Bars */}
  <div className="flex-1 flex flex-col items-center">
    <h2 className="text-3xl font-bold text-orange-500">
      Institute’s Registration
    </h2>

    <p className="text-md mt-6">Step {step} to 3</p>

    <div className="flex gap-4 mt-4 w-[580px]">
      {[1,2,3].map((s)=>(
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


        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="animate-fade-in space-y-6">



              {/* Fields */}
              <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-2">


                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-2"
                >Institute Name*</label>
                  <input
                    type="text"
                    name="instituteName"
                    value={formData.instituteName}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-2">Founder Name*</label>
                  <input
                    type="text"
                    name="founderName"
                    value={formData.founderName}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-2">Designation*</label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-2">Year Founded*</label>
                  <input
                    type="number"
                    name="yearFounded"
                    value={formData.yearFounded}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

<div className="md:col-span-2 flex flex-col">
  <label className="text-sm font-semibold mb-2">
    Certifications & Licence*
  </label>

  <div className="relative w-full">
    <input
      readOnly
      value={
        formData.certifications.length
          ? `${formData.certifications.length} file(s) selected`
          : ""
      }
      placeholder="Upload certification or licence images"
      className={`${inputClass} w-full pr-12`}
    />

    {/* icon INSIDE box */}
   <button
  type="button"
  onClick={() => certificateInputRef.current.click()}
  className="
    absolute right-3 top-1/2 -translate-y-1/2
    w-8 h-8
    rounded-full
    border border-orange-500
    text-orange-500
    flex items-center justify-center
    text-sm
    bg-white
  "
>
  ↑
</button>


    <input
      id="certUpload"
      type="file"
      ref={certificateInputRef}
      multiple
      accept="image/*"
      onChange={handleCertificateChange}
      className="hidden"
    />
  </div>

  <p className="text-xs text-gray-500 mt-1">
    Upload certification or licence images (1–3 only)
  </p>
</div>


                {/* Category + Sub Category – SAME ROW */}
                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-2">Category*</label>
                  <select
                    name="category"
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

                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-2">Sub Category*</label>
                  <select
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleSubCategoryChange}
                    disabled={!formData.category}
                    className={inputClass}
                  >
                    <option value="">Select Sub Category</option>

                    {formData.category &&
                      subCategoryMap[formData.category]?.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                  </select>

                </div>


                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-2">Phone Number*</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-2">Email*</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                {/* Password */}
                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-2">Create Password*</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-2">Re-Enter Password*</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>


              </div>
            </div>
          )}

{/* ===== STEP 2 FETCH PAGE (FULL PAGE NOT MODAL) ===== */}
{step === 2 && showFetchScreen && (
  <div className="animate-fade-in space-y-8">

    {/* Inputs layout EXACT like your image */}
    <div className="space-y-6">

      <div className="flex flex-col">
        <label className="text-sm font-semibold mb-2">Location Name*</label>
        <input
          type="text"
          value={`${formData.building} ${formData.street} ${formData.city}`}
          readOnly
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-2">

        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-2">Latitude*</label>
          <input
            type="text"
            value={formData.latitude || ""}
            readOnly
            className={inputClass}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-2">Longitude*</label>
          <input
            type="text"
            value={formData.longitude || ""}
            readOnly
            className={inputClass}
          />
        </div>
      </div>
    </div>


    {/* Buttons */}
    <div className="flex justify-between pt-8">
      <button
        type="button"
        onClick={() => setShowFetchScreen(false)}
        className="text-orange-500 font-semibold text-lg"
      >
        Back
      </button>

      <button
        type="button"
        onClick={handleFetchLocation}
        className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600"
      >
        {fetchingLocation ? "Fetching..." : "Fetch Location"}
      </button>
    </div>

  </div>
)}


          {/* STEP 2 */}
          {step === 2 && !showFetchScreen && (
            <div className="animate-fade-in space-y-6">
             <div className="flex justify-between items-center">
  <h3 className="text-xl font-bold text-gray-900">
    Add Address
  </h3>

<button
  type="button"
  onClick={() => setShowFetchScreen(true)}
  className="bg-orange-500 text-orange px-4 py-2 rounded-lg text-sm hover:bg-orange-600"
>
  {fetchingLocation ? "Fetching..." : "Fetch Current Location"}
</button>
</div>
              <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-2">

                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-2">
                    Building / Flat / Door Number *
                  </label>
                  <input
                    type="text"
                    name="building"
                    value={formData.building}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-2">
                    Street / Area / Locality *
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-2">
                    Landmark (optional)
                  </label>
                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-2">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-2">
                    District *
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                   className={inputClass}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-semibold mb-2">
                    PIN / ZIP Code *
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

              </div>
            </div>

          )}
          {/* STEP 3 */}
{step === 3 && (
  <div className="animate-fade-in space-y-6">

    <p className="text-red-500 text-center font-medium">
      You can add your Institute’s Bank Details
    </p>

    <div className="grid grid-cols-2 gap-x-12 gap-y-6">

      {/* Bank Name */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold mb-2">Bank Name*</label>
        <input
          type="text"
          name="bankName"
          value={formData.bankName}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      {/* Account Name */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold mb-2">Account Name*</label>
        <input
          type="text"
          name="accountName"
          value={formData.accountName}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      {/* Account Number */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold mb-2">Account Number*</label>
        <input
          type="text"
          name="accountNumber"
          value={formData.accountNumber}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      {/* IFSC */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold mb-2">IFSC Code*</label>
        <input
          type="text"
          name="ifscCode"
          value={formData.ifscCode}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      {/* PF */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold mb-2">
          PF Details (Provident Fund)*
        </label>
        <input
          type="text"
          name="pfDetails"
          value={formData.pfDetails}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      {/* UPI */}
      <div className="flex flex-col">
        <label className="text-sm font-semibold mb-2">
          UPI Details (Optional)
        </label>
        <input
          type="text"
          name="upiDetails"
          value={formData.upiDetails}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      {/* Aadhaar Upload */}
      <div className="col-span-2 flex flex-col">
        <label className="text-sm font-semibold mb-2">
          Aadhaar Front & Back Photos*
        </label>

        <div className="relative w-full">
          <input
            readOnly
           value={
  formData.aadhaarFiles.length
    ? `${formData.aadhaarFiles.length}/2 image(s) selected`
    : ""
}

            placeholder="Upload Aadhaar images"
            
            className={`${inputClass} w-full pr-12`}
          />
        
          <button
            type="button"
            onClick={() => aadhaarInputRef.current.click()}
            className="absolute right-3 top-1/2 -translate-y-1/2
              w-8 h-8 rounded-full border border-orange-500
              text-orange-500 flex items-center justify-center bg-white"
          >
            +
          </button>

          <input
            type="file"
            ref={aadhaarInputRef}
            multiple
            accept="image/*"
            onChange={handleAadhaarChange}
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


          {/* ✅ AGREEMENT SECTION */}
          <div className="flex items-start gap-2 text-sm text-gray-700 mt-4">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1"
            />
            <p>
              I agree to the{" "}
              <span
                onClick={() => navigate("/terms")}
                className="text-blue-600 underline cursor-pointer"
              >
                Terms & Conditions
              </span>
              ,{" "}
              <span
                onClick={() => navigate("/privacy")}
                className="text-blue-600 underline cursor-pointer"
              >
                Privacy Policy
              </span>
              ,{" "}
              <span
                onClick={() => navigate("/paymentpolicy")}
                className="text-blue-600 underline cursor-pointer"
              >
                Payment & Merchant Policy
              </span>
              .
            </p>
          </div>

          {/* Navigation Buttons */}
{/* Navigation Buttons */}
<div className="flex justify-end gap-6 mt-4">

  {step > 1 && (
    <button
      type="button"
      onClick={handlePrev}
      className="text-orange-500 font-medium"
    >
      Back
    </button>
  )}

  {step < 3 && (
    <button
      type="button"
      onClick={handleNext}
      className="bg-orange-500 text-white px-8 py-2 rounded-md font-semibold hover:bg-orange-600"
    >
      Next
    </button>
  )}

  {step === 3 && (
    <button
      type="submit"
      disabled={!agreed || loading}
      className="bg-orange-500 text-white px-8 py-2 rounded-md font-semibold hover:bg-orange-600 disabled:opacity-50"
    >
      {loading ? "Registering..." : "Save"}
    </button>
  )}
</div>

        </form>

     


      </div>

      {/* Animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
