import React from "react";
import { useNavigate } from "react-router-dom";

const Dance = () => {
  const navigate = useNavigate();

  const categories = [
    {
      name: "Classical Dance",
      desc: "Traditional dance forms rooted in culture, grace, and expression.",
      image: "/images/classical-dance.jpeg",
    },
    {
      name: "Contemporary Dance",
      desc: "Expressive modern dance blending emotion, creativity, and movement.",
      image: "/images/contemporary-dance.jpeg",
    },
    {
      name: "Hip-Hop Dance",
      desc: "High-energy street dance styles with rhythm and attitude.",
      image: "/images/hip-hop-dance.jpeg",
    },
    {
      name: "Folk Dance",
      desc: "Cultural dances reflecting traditions and regional stories.",
      image: "/images/folk-dance.jpeg",
    },
    {
      name: "Western Dance",
      desc: "Popular dance styles including jazz, freestyle, and pop.",
      image: "/images/western-dance.jpeg",
    },
    {
      name: "Latin Dance",
      desc: "Vibrant partner dances full of passion and rhythm.",
      image: "/images/latin-dance.jpeg",
    },
    {
      name: "Fitness Dance",
      desc: "Dance-based workouts for fun, fitness, and flexibility.",
      image: "/images/fitness-dance.jpeg",
    },
    {
      name: "Creative & Kids Dance",
      desc: "Playful and creative dance programs designed for children.",
      image: "/images/creative-kids-dance.jpeg",
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
        <h1 className="text-4xl font-extrabold mb-2">Dance</h1>
        <p className="text-gray-600 mb-8">
          Discover diverse dance styles that inspire rhythm and expression
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

export default Dance;
