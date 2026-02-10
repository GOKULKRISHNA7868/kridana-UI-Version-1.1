import React from "react";
import { useNavigate } from "react-router-dom";

const TeamBallPage = () => {
  const navigate = useNavigate();
  const [selectedSubCategory, setSelectedSubCategory] = React.useState(null);
  const [showChoice, setShowChoice] = React.useState(false);

  const categories = [
    {
      name: "Football",
      desc: "Fast-paced team sport focused on strategy, stamina, and teamwork.",
      image: "/images/football.jpeg",
    },
    {
      name: "Hockey",
      desc: "High-speed sport requiring coordination, agility, and teamwork.",
      image: "/images/hockey.jpeg",
    },
    {
      name: "Basketball",
      desc: "Dynamic court sport emphasizing teamwork, skill, and agility.",
      image: "/images/basketball.jpeg",
    },
    {
      name: "Handball",
      desc: "Indoor team sport combining speed, strength, and tactics.",
      image: "/images/handball.jpeg",
    },
    {
      name: "Rugby",
      desc: "Physically demanding team sport built on strength and unity.",
      image: "/images/rugby.jpeg",
    },
    {
      name: "American Football",
      desc: "Strategic team sport focused on power, precision, and coordination.",
      image: "/images/american-football.jpeg",
    },
    {
      name: "Water Polo",
      desc: "Aquatic team sport blending endurance, skill, and teamwork.",
      image: "/images/water-polo.jpeg",
    },
    {
      name: "Lacrosse",
      desc: "Fast-paced field sport combining speed, strategy, and skill.",
      image: "/images/lacrosse.jpeg",
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
        <h1 className="text-4xl font-extrabold mb-2">Team Ball Sports</h1>
        <p className="text-gray-600 mb-8">
          Build teamwork, strategy, and resilience through team-based sports
        </p>

        {/* CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((item) => (
            <div
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
                    `/viewtrainers?category=TeamBall&subCategory=${encodeURIComponent(
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
                    `/viewinstitutes?category=TeamBall&subCategory=${encodeURIComponent(
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

export default TeamBallPage;
