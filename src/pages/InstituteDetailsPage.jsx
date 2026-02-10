import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  UserCheck,
  Calendar,
  Award,
  Building2,
} from "lucide-react";
import { motion } from "framer-motion";
import { getAuth } from "firebase/auth";

export default function InstituteDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inst, setInst] = useState(null);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "institutes", id));
      if (snap.exists())
        setInst({
          id: snap.id,
          ...snap.data(),

          // ✅ Media Arrays
          images: snap.data().images || [],
          videos: snap.data().videos || [],
          reels: snap.data().reels || [],
        });
    };
    load();
  }, [id]);

  const handleRating = async (star) => {
    const user = auth.currentUser;
    if (!user || !inst) return;

    const ratings = inst.ratingsByUser || {};

    // 🚫 BLOCK multiple reviews
    if (ratings[user.uid] !== undefined) {
      alert("You have already submitted your review.");
      return;
    }

    const count = inst.ratingCount || 0;
    const avg = inst.rating || 0;

    const newAvg = (avg * count + star) / (count + 1);

    await updateDoc(doc(db, "institutes", id), {
      rating: newAvg,
      ratingCount: count + 1,
      [`ratingsByUser.${user.uid}`]: star,
    });

    // 🔄 Update UI
    setInst((prev) => ({
      ...prev,
      rating: newAvg,
      ratingCount: count + 1,
      ratingsByUser: {
        ...ratings,
        [user.uid]: star,
      },
    }));
  };

  if (!inst) return null;

  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    inst.address,
  )}&output=embed`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-white px-5 md:px-24 py-10"
    >
      {/* 🔙 Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#ff7a00] font-semibold mb-6 hover:gap-3 transition-all"
      >
        <ArrowLeft size={20} /> Back to Institutes
      </button>

      {/* 🏫 HEADER */}

      <div className="flex flex-col lg:flex-row gap-10 items-start mb-14 bg-white rounded-3xl shadow-xl border border-orange-100 p-8">
        {/* 👤 PROFILE IMAGE */}
        <div className="flex flex-col items-center text-center lg:text-left">
          <img
            src={
              inst.profileImageUrl ||
              "https://via.placeholder.com/200?text=Trainer"
            }
            alt="Trainer Profile"
            className="w-44 h-44 rounded-full object-cover border-4 border-orange-400 shadow-lg"
          />

          <h1 className="text-3xl lg:text-4xl font-extrabold text-[#ff7a00] mt-5">
            {inst.instituteName}
          </h1>

          <p className="flex items-center justify-center lg:justify-start gap-2 text-gray-500 mt-3 text-sm">
            <MapPin size={18} className="text-orange-500" />
            {inst.address}, {inst.city}, {inst.state}
          </p>

          {/* ⭐ Rating */}
          <div className="flex gap-1 my-4 items-center justify-center lg:justify-start">
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                onClick={() => handleRating(s)}
                className={`text-3xl cursor-pointer transition duration-200 ${
                  inst.ratingsByUser?.[auth.currentUser?.uid] >= s
                    ? "text-yellow-400 scale-110 drop-shadow-md"
                    : "text-gray-300 hover:text-yellow-300"
                }`}
              >
                ⭐
              </span>
            ))}
          </div>

          <p className="font-semibold text-gray-700 text-sm">
            Average Rating:{" "}
            <span className="text-orange-600 font-bold">
              {inst.rating ? inst.rating.toFixed(1) : "No ratings"}
            </span>{" "}
            {inst.ratingCount ? (
              <span className="text-gray-500">
                ({inst.ratingCount} reviews)
              </span>
            ) : (
              ""
            )}
          </p>

          {/* 📞 CONTACT BUTTONS */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-6">
            <a
              href={`tel:${inst.phoneNumber}`}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#ff7a00] text-white font-semibold shadow-md hover:shadow-lg hover:scale-105 transition"
            >
              <Phone size={18} /> Call
            </a>

            <button
              onClick={() => navigate(`/book-demo/${inst.id}`)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-green-600 text-white font-semibold shadow-md hover:shadow-lg hover:scale-105 transition"
            >
              📅 Book Demo Class
            </button>

            <a
              href={`mailto:${inst.email}`}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-[#ff7a00] text-[#ff7a00] font-semibold hover:bg-[#ff7a00] hover:text-white shadow-sm hover:shadow-lg transition"
            >
              <Mail size={18} /> Email
            </a>
          </div>
        </div>

        {/* 🗺️ MAP */}
        <div className="w-full lg:w-[55%] h-[320px] rounded-3xl overflow-hidden border border-orange-200 shadow-md">
          <iframe
            title="Institute Location"
            src={mapSrc}
            className="w-full h-full"
            loading="lazy"
          />
        </div>
      </div>

      {/* 📘 DETAILS */}
      <div className="grid md:grid-cols-2 gap-10 mt-12">
        <Section icon={Building2} title="About Institute">
          {inst.aboutUs || inst.description}
        </Section>

        <Section icon={Award} title="Achievements">
          {inst.achievements || "—"}
        </Section>

        <Section icon={Calendar} title="Founded">
          {inst.yearFounded}
        </Section>

        <Section icon={Users} title="Students">
          {inst.studentsCount}
        </Section>

        <Section icon={UserCheck} title="Trainers">
          {inst.trainersCount}
        </Section>

        <Section title="Facilities">{inst.facilities}</Section>
      </div>

      {/* 🧩 CATEGORIES */}
      <div className="mt-14">
        <h2 className="text-3xl font-bold text-[#ff7a00] mb-6">
          Categories & Sub Categories
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(inst.categories || {}).map(([cat, subs]) => (
            <div
              key={cat}
              className="border rounded-2xl p-5 shadow-sm hover:shadow-md transition"
            >
              <h3 className="font-bold text-lg mb-2">{cat}</h3>
              <ul className="list-disc ml-5 text-gray-700">
                {subs.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      {/* 📸 MEDIA GALLERY */}
      {(inst.images?.length > 0 ||
        inst.videos?.length > 0 ||
        inst.reels?.length > 0) && (
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-[#ff7a00] mb-6">
            Institute Media Gallery
          </h2>

          {/* ✅ Images */}
          {inst.images?.length > 0 && (
            <div className="mb-10">
              <h3 className="text-xl font-semibold mb-3">📷 Photos</h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {inst.images.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt="Institute"
                    className="w-full h-40 object-cover rounded-xl border shadow-sm hover:scale-105 transition"
                  />
                ))}
              </div>
            </div>
          )}

          {/* ✅ Videos */}
          {inst.videos?.length > 0 && (
            <div className="mb-10">
              <h3 className="text-xl font-semibold mb-3">🎥 Videos</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {inst.videos.map((url, idx) => (
                  <video
                    key={idx}
                    src={url}
                    controls
                    className="w-full h-56 rounded-xl border shadow-sm"
                  />
                ))}
              </div>
            </div>
          )}

          {/* ✅ Reels */}
          {inst.reels?.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-3">📱 Reels</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {inst.reels.map((url, idx) => (
                  <video
                    key={idx}
                    src={url}
                    controls
                    className="w-full h-56 rounded-xl border shadow-sm"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

/* 🔹 Reusable Section */
const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-gray-50 p-6 rounded-2xl">
    <h2 className="flex items-center gap-2 text-xl font-bold text-[#ff7a00] mb-2">
      {Icon && <Icon size={20} />} {title}
    </h2>
    <p className="text-gray-700 leading-relaxed">{children}</p>
  </div>
);
