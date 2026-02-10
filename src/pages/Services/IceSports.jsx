import React from "react";
import { useNavigate } from "react-router-dom";

const IceSports = () => {
  const navigate = useNavigate();

  const categories = [
    {
      name: "Ice Skating",
      desc: "Learn balance, control, and graceful movement on ice.",
      image: "/images/ice-skating.jpeg",
    },
    {
      name: "Figure Skating",
      desc: "Combine athletic skill with artistic expression on ice.",
      image: "/images/figure-skating.jpeg",
    },
    {
      name: "Ice Hockey",
      desc: "Fast-paced team sport focused on strength, speed, and strategy.",
      image: "/images/ice-hockey.jpeg",
    },
    {
      name: "Speed Skating",
      desc: "Develop explosive speed and endurance on ice tracks.",
      image: "/images/speed-skating.jpeg",
    },
    {
      name: "Short Track Skating",
      desc: "High-speed racing with quick turns and tactical precision.",
      image: "/images/short-track-skating.jpeg",
    },
    {
      name: "Ice Dancing",
      desc: "Express rhythm and teamwork through choreographed ice routines.",
      image: "/images/ice-dancing.jpeg",
    },
    {
      name: "Curling",
      desc: "Strategic ice sport requiring precision, balance, and teamwork.",
      image: "/images/curling.jpeg",
    },
    {
      name: "Synchronized Skating",
      desc: "Team-based skating emphasizing coordination and harmony.",
      image: "/images/synchronized-skating.jpeg",
    },
  ];

  return (
    <div className="font-sans bg-gray-50 text-gray-800">
      <section className="max-w-7xl mx-auto px-6 py-12">
        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="text-orange-500 text-lg flex items-center gap-2 mb-6 font-medium"
        >
          ← Back to categories
        </button>

        {/* HEADER */}
        <h1 className="text-4xl font-extrabold mb-2">Ice Sports</h1>
        <p className="text-gray-600 mb-8">
          Explore high-performance and artistic sports on ice
        </p>

        {/* CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((item) => (
            <div
              key={item.name}
              onClick={() =>
                navigate(
                  `/viewTrainers?category=${encodeURIComponent(item.name)}`
                )
              }
              className="bg-white rounded-2xl border border-orange-200 overflow-hidden cursor-pointer
                         transition-all duration-300
                         hover:-translate-y-1
                         hover:shadow-[0_10px_30px_rgba(249,115,22,0.35)]"
            >
              {/* IMAGE */}
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-48 object-cover"
              />

              {/* CONTENT */}
              <div className="p-5">
                <h3 className="text-orange-600 font-bold text-lg mb-2">
                  {item.name}
                </h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default IceSports;
