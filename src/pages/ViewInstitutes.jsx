// src/pages/ViewInstitutes.jsx
import React, { useEffect, useState, useMemo } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";

export default function ViewInstitutes() {
  const navigate = useNavigate();
  const location = useLocation();

  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // Track logged-in user

  // Read query param for category
  const searchParams = new URLSearchParams(location.search);
  const defaultCategory = searchParams.get("category") || "";

  const [category, setCategory] = useState(defaultCategory);
  const defaultSubCategory = searchParams.get("subCategory") || "";
  const [subCategory, setSubCategory] = useState(defaultSubCategory);

  const [city, setCity] = useState("");
  const [minRating, setMinRating] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser); // keep tracking user (optional use later)

      const snap = await getDocs(collection(db, "institutes"));
      setInstitutes(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          profileImageUrl: d.data().profileImageUrl || "",
          images: d.data().images || [],
          videos: d.data().videos || [],
          reels: d.data().reels || [],
        })),
      );

      setLoading(false);
    });

    return () => unsub();
  }, []);

  const filteredInstitutes = useMemo(() => {
    return institutes.filter((i) => {
      if (category && !i.categories?.[category]) return false;

      if (subCategory && !i.categories?.[category]?.includes(subCategory))
        return false;

      if (city && i.city !== city) return false;

      if (minRating && (i.rating || 0) < Number(minRating)) return false;

      return true;
    });
  }, [institutes, category, subCategory, city, minRating]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading Institutes...
      </div>
    );

  if (false && !user)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <p className="text-2xl font-semibold text-[#ff7a00] mb-4">
          ⚠️ Please login to see institutes
        </p>
        <p className="text-gray-600 mb-6">
          You need to be logged in to view institute profiles.
        </p>
        <button
          onClick={() => navigate("/RoleSelection")}
          className="bg-[#ff7a00] text-white px-6 py-3 rounded-xl text-lg font-medium"
        >
          Go to Login
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-white px-6 md:px-16 py-12">
      <h1 className="text-4xl font-bold text-[#ff7a00] mb-8">Institutes</h1>

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-[repeat(4,minmax(180px,1fr))] gap-3 mb-8">
        {/* Category */}
        <select
          className="border h-[42px] px-3 rounded-md text-sm bg-white"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setSubCategory("");
          }}
        >
          <option value="">All Categories</option>
          {institutes
            .flatMap((i) =>
              i.categories && typeof i.categories === "object"
                ? Object.keys(i.categories)
                : [],
            )
            .filter((v, i, a) => a.indexOf(v) === i)
            .map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
        </select>

        {/* Subcategory */}
        <select
          className="border h-[42px] px-3 rounded-md text-sm bg-white"
          value={subCategory}
          onChange={(e) => setSubCategory(e.target.value)}
        >
          <option value="">All Subcategories</option>
          {category &&
            [
              ...new Set(
                institutes.flatMap((i) => i.categories?.[category] || []),
              ),
            ].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
        </select>

        {/* City */}
        <select
          className="border h-[42px] px-3 rounded-md text-sm bg-white"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          <option value="">All Cities</option>
          {[...new Set(institutes.map((i) => i.city))].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Min Rating */}
        <select
          className="border h-[42px] px-3 rounded-md text-sm bg-white"
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
        >
          <option value="">Any Rating</option>
          <option value="3">3★+</option>
          <option value="4">4★+</option>
        </select>
      </div>

      {/* LIST */}
      {filteredInstitutes.length === 0 ? (
        <p className="text-center text-gray-500 text-xl mt-12">
          No institutes found for the selected filters.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-20">
          {filteredInstitutes.map((inst) => (
            <div
              key={inst.id}
              onClick={() => navigate(`/institutes/${inst.id}`)}
              className="bg-white rounded-[18px] shadow-lg border cursor-pointer hover:scale-[1.02] transition-transform"
            >
              {/* PROFILE IMAGE */}
              <div className="h-[160px] rounded-t-[18px] overflow-hidden">
                {inst.profileImageUrl ? (
                  <img
                    src={inst.profileImageUrl}
                    alt={inst.instituteName}
                    className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>

              <div className="p-4 text-center">
                <h2 className="text-xl sm:text-2xl font-bold truncate">
                  {inst.instituteName}
                </h2>
                <p className="text-gray-500 text-sm sm:text-base">
                  {inst.city}, {inst.state}
                </p>
                <p className="font-semibold mt-1 text-sm sm:text-base">
                  ⭐ {inst.rating ? inst.rating.toFixed(1) : "No ratings"}
                </p>
                <p className="mt-1 text-gray-600 text-xs sm:text-sm">
                  Categories:{" "}
                  {inst.categories
                    ? Object.keys(inst.categories).join(", ")
                    : "N/A"}
                </p>
                <button
                  className="mt-3 w-full bg-[#ff7a00] text-white py-2 rounded-lg text-sm"
                  onClick={() => navigate(`/institutes/${inst.id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
