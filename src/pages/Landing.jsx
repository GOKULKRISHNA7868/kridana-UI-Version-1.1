import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

/* ================= DISTANCE ================= */
const getDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

/* ================= SERVICES ================= */
const services = [
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
  "Play School",
];

const serviceImages = {
  "Martial Arts": "/images/martial-arts.jpg",
  "Team Ball Sports": "/images/team-ball-sports.jpg",
  "Racket Sports": "/images/racket-sports.jpg",
  Fitness: "/images/fitness.jpg",
  "Target & Precision Sports": "/images/target-precision-sports.jpg",
  "Equestrian Sports": "/images/equestrian-sports.jpg",
  "Adventure & Outdoor Sports": "/images/adventure-outdoor-sports.jpg",
  "Ice Sports": "/images/ice-sports.jpg",
  Wellness: "/images/wellness.jpg",
  Dance: "/images/dance.jpg",
  "Play School": "/images/play-school.jpg",
};

const serviceRoutes = {
  "Martial Arts": "/services/martial-arts",
  "Team Ball Sports": "/services/teamball",
  "Racket Sports": "/services/racketsports",
  Fitness: "/services/fitness",
  "Target & Precision Sports": "/services/target-precision-sports",
  "Equestrian Sports": "/services/equestrian-sports",
  "Adventure & Outdoor Sports": "/services/adventure-outdoor-sports",
  "Ice Sports": "/services/ice-sports",
  Wellness: "/services/wellness",
  Dance: "/services/dance",
  "Play School": "/services/play-school",
};

const Landing = () => {
  const navigate = useNavigate();
  const sliderRef = useRef(null);

  const [user, setUser] = useState(null);
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  const [topTrainers, setTopTrainers] = useState([]);
  const [topInstitutes, setTopInstitutes] = useState([]);
  const [allTrainers, setAllTrainers] = useState([]);
  const [allInstitutes, setAllInstitutes] = useState([]);

  const [mode, setMode] = useState("top");
  const [userLocation, setUserLocation] = useState(null);

  /* ================= ✅ REELS STATES ADDED ================= */
  const [reels, setReels] = useState([]);
  const [showReelViewer, setShowReelViewer] = useState(false);
  const [activeReelIndex, setActiveReelIndex] = useState(0);

  /* ================= LOCATION ================= */
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => setUserLocation(null),
    );
  }, []);

  /* ================= AUTH ================= */
  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      const trainerSnap = await getDocs(collection(db, "trainers"));
      const instituteSnap = await getDocs(collection(db, "institutes"));

      const trainers = trainerSnap.docs.map((d) => ({
        id: d.id,
        rating: d.data().rating || 0,
        ...d.data(),
      }));

      const institutes = instituteSnap.docs.map((d) => ({
        id: d.id,
        rating: d.data().rating || 0,
        ...d.data(),
      }));

      trainers.sort((a, b) => b.rating - a.rating);
      institutes.sort((a, b) => b.rating - a.rating);

      setAllTrainers(trainers);
      setAllInstitutes(institutes);

      setTopTrainers(trainers.slice(0, 6));
      setTopInstitutes(institutes.slice(0, 6));
    };

    fetchData();
  }, []);

  /* ================= ✅ FETCH REELS ================= */
  /* ================= ✅ FETCH REELS FROM TRAINERS + INSTITUTES ================= */
  useEffect(() => {
    const fetchReels = async () => {
      const trainerSnap = await getDocs(collection(db, "trainers"));
      const instituteSnap = await getDocs(collection(db, "institutes"));

      let allReels = [];

      // ✅ Get reels from trainers
      trainerSnap.docs.forEach((doc) => {
        const data = doc.data();

        if (data.reels && Array.isArray(data.reels)) {
          data.reels.forEach((video) => {
            allReels.push({
              videoUrl: video,
              title: data.trainerName || "Trainer Reel",
              ownerId: doc.id,
              type: "trainer",
            });
          });
        }
      });

      // ✅ Get reels from institutes
      instituteSnap.docs.forEach((doc) => {
        const data = doc.data();

        if (data.reels && Array.isArray(data.reels)) {
          data.reels.forEach((video) => {
            allReels.push({
              videoUrl: video,
              title: data.instituteName || "Institute Reel",
              ownerId: doc.id,
              type: "institute",
            });
          });
        }
      });

      // ✅ Shuffle randomly like Instagram
      allReels = allReels.sort(() => Math.random() - 0.5);

      // ✅ Show only 3–5 reels
      setReels(allReels.slice(0, 5));
    };

    fetchReels();
  }, []);

  /* ================= MODE HANDLER ================= */
  useEffect(() => {
    if (mode === "top") {
      setTopTrainers(allTrainers.slice(0, 4));
      setTopInstitutes(allInstitutes.slice(0, 6));
    }

    if (mode === "nearby" && userLocation) {
      const byDistance = (list) =>
        list
          .filter((i) => i.latitude && i.longitude)
          .map((i) => ({
            ...i,
            distance: getDistance(
              userLocation.lat,
              userLocation.lng,
              parseFloat(i.latitude),
              parseFloat(i.longitude),
            ),
          }))
          .sort((a, b) => a.distance - b.distance);

      setTopTrainers(byDistance(allTrainers).slice(0, 4));
      setTopInstitutes(byDistance(allInstitutes).slice(0, 6));
    }
  }, [mode, userLocation, allTrainers, allInstitutes]);

  /* ================= SERVICES SLIDER ================= */
  const handleScrollLeft = () =>
    sliderRef.current.scrollBy({ left: -350, behavior: "smooth" });
  const handleScrollRight = () =>
    sliderRef.current.scrollBy({ left: 350, behavior: "smooth" });
  return (
    <div className="w-full font-sans">
      {/* ================= HERO ================= */}
      <section className="bg-gray-50 px-6 md:px-16 py-16 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden">
        <div className="max-w-lg">
          <h1 className="text-4xl font-bold text-orange-600 mb-4">
            Rise. Play. Conquer
          </h1>
          <p className="text-gray-700 mb-6">
            Turn your passion into power with expert coaching and guided sports
            training
          </p>
        </div>

        {/* HERO IMAGE SCROLL */}
        <div className="relative w-full md:w-[420px] h-[480px] flex gap-6 overflow-hidden">
          <motion.div
            className="flex flex-col gap-4"
            animate={{ y: [0, -420, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          >
            {[...services.slice(0, 5), ...services.slice(0, 5)].map((s, i) => (
              <img
                key={i}
                src={serviceImages[s]}
                className="w-36 h-36 rounded-2xl object-cover shadow-lg"
              />
            ))}
          </motion.div>

          <motion.div
            className="flex flex-col gap-4"
            animate={{ y: [-420, 0, -420] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          >
            {[...services.slice(5), ...services.slice(5)].map((s, i) => (
              <img
                key={i}
                src={serviceImages[s]}
                className="w-36 h-36 rounded-2xl object-cover shadow-lg"
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <section className="py-16 px-6 md:px-16 bg-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold">Services</h2>
          <div className="flex gap-3">
            <button
              onClick={handleScrollLeft}
              className="w-10 h-10 border rounded-full hover:bg-gray-200 hover:text-blue-600 transition-colors duration-200"
            >
              ←
            </button>
            <button
              onClick={handleScrollRight}
              className="w-10 h-10 border rounded-full hover:bg-gray-200 hover:text-blue-600 transition-colors duration-200"
            >
              →
            </button>
          </div>
        </div>

        <div
          ref={sliderRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide"
        >
          {services.map((service) => (
            <motion.div
              key={service}
              whileHover={{ scale: 1.06 }}
              onClick={() => navigate(serviceRoutes[service])}
              className="min-w-[280px] h-[360px] bg-black rounded-[40px] p-6 flex flex-col justify-between cursor-pointer"
            >
              <div className="flex justify-center">
                <div className="w-48 h-48 bg-orange-500 rounded-2xl overflow-hidden">
                  <img
                    src={serviceImages[service]}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <h3 className="text-xl text-center font-semibold text-orange-500">
                {service}
              </h3>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= TOGGLE ================= */}
      <div className="flex justify-center gap-4 my-6">
        <button
          onClick={() => setMode("top")}
          className={`px-4 py-2 rounded ${
            mode === "top" ? "bg-orange-500 text-white" : "bg-gray-200"
          }`}
        >
          Top Rated
        </button>
        <button
          onClick={() => setMode("nearby")}
          className={`px-4 py-2 rounded ${
            mode === "nearby" ? "bg-orange-500 text-white" : "bg-gray-200"
          }`}
        >
          Near Me
        </button>
      </div>

      {/* ================= TOP TRAINERS ================= */}

      <section className="py-12 px-6 md:px-16 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold">Top Trainers</h2>

          {/* ✅ View More */}
          <button
            onClick={() => {
              navigate("/trainers");
              window.scrollTo(0, 0); // ✅ Scroll to top
            }}
            className="text-orange-500 font-semibold hover:underline"
          >
            View More →
          </button>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {topTrainers.map((t) => (
            <motion.div
              key={t.id}
              onClick={() => {
                if (!user) {
                  setShowAuthPopup(true);
                } else {
                  navigate(`/trainers/${t.id}`);
                  window.scrollTo(0, 0); // ✅ Scroll top
                }
              }}
              className="bg-white p-4 rounded-2xl shadow-lg flex gap-4 cursor-pointer"
            >
              <img
                src={t.profileImageUrl || "/images/default-avatar.png"}
                className="w-20 h-20 rounded-xl object-cover"
                alt="Trainer"
              />

              <div>
                <h3 className="font-bold">
                  {t.firstName} {t.lastName}
                </h3>
                <p className="text-xs text-gray-500">{t.city || t.area}</p>⭐{" "}
                {t.rating}
                {t.distance && (
                  <p className="text-xs">{t.distance.toFixed(1)} km away</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= TOP INSTITUTES ================= */}
      {/* ================= TOP INSTITUTES ================= */}
      <section className="py-12 px-6 md:px-16 bg-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold">Top Institutes</h2>

          {/* ✅ View More */}
          <button
            onClick={() => {
              navigate("/institutes");
              window.scrollTo(0, 0); // ✅ Scroll to top
            }}
            className="text-orange-500 font-semibold hover:underline"
          >
            View More →
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {topInstitutes.map((i) => (
            <motion.div
              key={i.id}
              onClick={() => {
                if (!user) {
                  setShowAuthPopup(true);
                } else {
                  navigate(`/institutes/${i.id}`);
                  window.scrollTo(0, 0);
                }
              }}
              className="bg-white p-4 rounded-2xl shadow-lg flex gap-4 cursor-pointer"
            >
              <img
                src={i.profileImageUrl || "/images/default-institute.png"}
                className="w-20 h-20 rounded-xl object-cover"
                alt="Institute"
              />

              <div>
                <h3 className="font-bold">{i.instituteName}</h3>
                <p className="text-xs text-gray-500">{i.city}</p>⭐ {i.rating}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= AUTH POPUP ================= */}
      {showAuthPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80 text-center">
            <h2 className="font-semibold mb-2">Login Required</h2>
            <button
              onClick={() => setShowAuthPopup(false)}
              className="text-sm text-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* ================= ✅ REELS SECTION ================= */}
      {/* ================================================= */}

      {/* ================= FULLSCREEN REEL VIEWER ================= */}
      <section className="py-14 px-6 md:px-16 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold">
            Trending Reels & Training Videos 🎥
          </h2>
        </div>

        <div className="flex gap-6 overflow-x-auto scrollbar-hide">
          {reels.slice(0, 3).map((r, index) => (
            <motion.div
              key={r.id}
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                navigate("/reels", {
                  state: {
                    clickedReel: r,
                  },
                });
              }}
              className="min-w-[230px] h-[420px] rounded-3xl overflow-hidden shadow-xl cursor-pointer bg-black relative"
            >
              <video
                src={r.videoUrl}
                className="w-full h-full object-cover"
                muted
              />

              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white font-semibold text-sm">
                  {r.title || "Training Reel"}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing;
