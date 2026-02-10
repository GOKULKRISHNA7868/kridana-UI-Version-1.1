// src/pages/ViewTrainers.jsx
import React, { useEffect, useState, useMemo } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";

/* 🌍 Distance Formula */
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function ViewTrainers() {
  const navigate = useNavigate();
  const location = useLocation();

  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  /* 📍 User location */
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");

  /* 🔹 Filters */
  const searchParams = new URLSearchParams(location.search);
  const defaultCategory = searchParams.get("category") || "";
  const [category, setCategory] = useState(defaultCategory);
  const defaultSubCategory = searchParams.get("subCategory") || "";
  const [subCategory, setSubCategory] = useState(defaultSubCategory);

  const [city, setCity] = useState("");
  const [minRating, setMinRating] = useState("");

  /* 🔐 Fetch trainers */
  onAuthStateChanged(auth, async (user) => {
    // 🔥 ALLOW PUBLIC VIEW
    const snap = await getDocs(collection(db, "trainers"));

    setTrainers(
      snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        profileImageUrl: d.data().profileImageUrl || "",
      })),
    );

    setLoading(false);
  });

  /* 📍 Get Current Location */
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
      },
      () => alert("Location access denied"),
    );
  };

  /* 🔹 Filtered & Sorted Trainers */
  const filteredTrainers = useMemo(() => {
    return trainers
      .filter((t) => {
        if (!t.categories) return false;

        // Match main category OR subcategory
        const matchesCategory = category
          ? Object.keys(t.categories).includes(category) ||
            Object.values(t.categories).some((subs) => subs.includes(category))
          : true;

        const matchesSubCategory = subCategory
          ? Object.values(t.categories).some((subs) =>
              subs.includes(subCategory),
            )
          : true;

        if (!matchesCategory || !matchesSubCategory) return false;
        if (city && t.city !== city) return false;
        if (minRating && (t.rating || 0) < Number(minRating)) return false;

        return true;
      })

      .map((t) => {
        const lat = userLat ?? Number(manualLat);
        const lng = userLng ?? Number(manualLng);
        if (!lat || !lng || !t.latitude || !t.longitude) return t;
        return {
          ...t,
          distance: getDistanceKm(
            lat,
            lng,
            Number(t.latitude),
            Number(t.longitude),
          ),
        };
      })
      .sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));
  }, [
    trainers,
    category,
    subCategory,
    city,
    minRating,
    userLat,
    userLng,
    manualLat,
    manualLng,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
        Loading Trainers...
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white px-6 md:px-16 py-12">
      <h1 className="text-4xl font-bold text-[#ff7a00] mb-8">Trainers</h1>

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-[repeat(5,minmax(180px,1fr))] gap-3 mb-8">
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
          {[
            ...new Set(
              trainers.flatMap((t) =>
                t.categories ? Object.keys(t.categories) : [],
              ),
            ),
          ].map((c) => (
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
                trainers.flatMap((t) => t.categories?.[category] || []),
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
          {[...new Set(trainers.map((t) => t.city))].map((c) => (
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

        {/* Location */}
        <div className="flex gap-2">
          <button
            onClick={getCurrentLocation}
            className="bg-[#ff7a00] text-white h-[40px] px-4 rounded-md text-sm"
          >
            📍 Current Location
          </button>
          <input
            type="number"
            placeholder="Lat"
            value={manualLat}
            onChange={(e) => setManualLat(e.target.value)}
            className="border h-[40px] px-2 rounded-md w-[70px] text-sm"
          />
          <input
            type="number"
            placeholder="Lng"
            value={manualLng}
            onChange={(e) => setManualLng(e.target.value)}
            className="border h-[40px] px-2 rounded-md w-[70px] text-sm"
          />
        </div>
      </div>

      {/* TRAINER LIST */}
      {filteredTrainers.length === 0 ? (
        <p className="text-center text-gray-500 text-xl mt-12">
          No trainers found for the selected filters.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-20">
          {filteredTrainers.map((t) => (
            <div
              key={t.id}
              onClick={() => navigate(`/trainers/${t.id}`)}
              className="bg-white rounded-[18px] shadow-lg border cursor-pointer hover:scale-[1.02] transition-transform"
            >
              {/* PROFILE IMAGE */}
              <div className="h-[160px] rounded-t-[18px] overflow-hidden">
                {t.profileImageUrl ? (
                  <img
                    src={t.profileImageUrl}
                    alt={t.trainerName || `${t.firstName} ${t.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>

              <div className="p-4 text-center">
                <h2 className="text-lg font-bold">
                  {t.trainerName || `${t.firstName} ${t.lastName}`}
                </h2>
                <p className="text-gray-500">
                  {t.city}, {t.state}
                </p>
                {t.distance !== undefined && (
                  <p className="font-semibold text-sm mt-1">
                    📏 {t.distance.toFixed(2)} km away
                  </p>
                )}
                <p className="text-sm font-semibold mt-1">
                  ⭐ {t.rating ? t.rating.toFixed(1) : "No ratings"}{" "}
                  {t.ratingCount ? `(${t.ratingCount})` : ""}
                </p>
                <button className="mt-3 w-full bg-[#ff7a00] text-white py-2 rounded-lg text-sm">
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
