import React from "react";
import { useNavigate } from "react-router-dom";

const Equestrian = () => {
  const navigate = useNavigate();

  const categories = [
    {
      name: "Dressage",
      desc: "Elegant riding discipline focused on precision, balance, and harmony.",
      image: "/images/dressage.jpeg",
    },
    {
      name: "Show Jumping",
      desc: "Fast-paced equestrian sport testing agility, speed, and accuracy.",
      image: "/images/show-jumping.jpeg",
    },
    {
      name: "Eventing",
      desc: "A challenging combination of dressage, cross-country, and jumping.",
      image: "/images/eventing.jpeg",
    },
    {
      name: "Cross Country",
      desc: "Outdoor riding across natural obstacles and varied terrain.",
      image: "/images/cross-country.jpeg",
    },
    {
      name: "Endurance Riding",
      desc: "Long-distance riding that tests stamina, patience, and trust.",
      image: "/images/endurance-riding.jpeg",
    },
    {
      name: "Polo",
      desc: "High-speed team sport combining horsemanship and strategy.",
      image: "/images/polo.jpeg",
    },
    {
      name: "Horse Racing",
      desc: "Competitive sport focused on speed, control, and rider skill.",
      image: "/images/horse-racing.jpeg",
    },
    {
      name: "Para-Equestrian",
      desc: "Inclusive equestrian disciplines designed for riders with disabilities.",
      image: "/images/para-equestrian.jpeg",
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
        <h1 className="text-4xl font-extrabold mb-2">Equestrian Sports</h1>
        <p className="text-gray-600 mb-8">
          Explore world-class horse riding disciplines and equestrian training
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

export default Equestrian;
