import React from "react";
import { useNavigate } from "react-router-dom";

const Fitness = () => {
  const navigate = useNavigate();
  const [selectedSubCategory, setSelectedSubCategory] = React.useState(null);
  const [showChoice, setShowChoice] = React.useState(false);

  const categories = [
    {
      name: "Strength / Muscular Fitness",
      desc: "Build muscle power, strength, and overall physical resilience.",
      image: "/images/strength-muscular.jpeg",
    },
    {
      name: "Muscular Endurance",
      desc: "Improve stamina and the ability to sustain physical effort.",
      image: "/images/muscular-endurance.jpeg",
    },
    {
      name: "Flexibility Fitness",
      desc: "Enhance mobility, posture, and range of motion.",
      image: "/images/flexibility.jpeg",
    },
    {
      name: "Balance & Stability",
      desc: "Develop control, coordination, and injury prevention.",
      image: "/images/balance-stability.jpeg",
    },
    {
      name: "Skill / Performance Fitness",
      desc: "Train agility, speed, and performance-based fitness skills.",
      image: "/images/skill-performance.jpeg",
    },
  ];

  return (
    <div className="font-sans bg-gray-50 text-gray-800">
      <section className="max-w-7xl mx-auto px-6 py-12">
        {/* BACK */}
        <button
          onClick={() => navigate("/categories")}
          className="text-orange-500 text-lg flex items-center gap-2 mb-6 font-medium"
        >
          ← Back to categories
        </button>

        {/* HEADER */}
        <h1 className="text-4xl font-extrabold mb-2">Fitness</h1>
        <p className="text-gray-600 mb-8">
          Improve strength, endurance, flexibility, and overall performance
        </p>

        {/* CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((item) => (
            <div
              key={item.name}
              onClick={() => {
                setSelectedSubCategory(item.name);
                setShowChoice(true);
              }}
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
      {/* ================= POPUP ================= */}
      {showChoice && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm text-center">
            <h3 className="text-xl font-bold mb-4">
              View {selectedSubCategory} as
            </h3>

            <div className="flex gap-4 justify-center">
              {/* Trainers */}
              <button
                onClick={() => {
                  navigate(
                    `/viewtrainers?category=Fitness&subCategory=${encodeURIComponent(
                      selectedSubCategory,
                    )}`,
                  );
                  setShowChoice(false);
                }}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg"
              >
                Trainers
              </button>

              {/* Institutes */}
              <button
                onClick={() => {
                  navigate(
                    `/viewinstitutes?category=Fitness&subCategory=${encodeURIComponent(
                      selectedSubCategory,
                    )}`,
                  );
                  setShowChoice(false);
                }}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg"
              >
                Institutes
              </button>
            </div>

            <button
              onClick={() => setShowChoice(false)}
              className="mt-4 text-sm text-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fitness;
