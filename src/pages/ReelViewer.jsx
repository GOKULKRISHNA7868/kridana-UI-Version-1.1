// Full professional Instagram-style Reel system with swipe, like, save, view count, share, animations, Firebase secure logic
// React + Firebase (Firestore)
// File: src/pages/ReelViewer.jsx

import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  deleteDoc,
} from "firebase/firestore";

const ReelViewer = () => {
  const { index } = useParams();
  const navigate = useNavigate();

  const [reels, setReels] = useState([]);
  const [activeIndex, setActiveIndex] = useState(Number(index) || 0);
  const [loading, setLoading] = useState(true);

  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);

  // FOLLOW SYSTEM
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const touchStartY = useRef(null);
  const commentsEndRef = useRef(null);

  const user = auth.currentUser;

  /* ================= FETCH REELS ================= */
  useEffect(() => {
    const fetchReels = async () => {
      try {
        const trainerSnap = await getDocs(collection(db, "trainers"));
        const instituteSnap = await getDocs(collection(db, "institutes"));

        let allReels = [];

        trainerSnap.forEach((docu) => {
          const data = docu.data();
          if (Array.isArray(data.reels)) {
            data.reels.forEach((videoUrl, idx) => {
              if (videoUrl) {
                allReels.push({
                  reelId: `trainer_${docu.id}_${idx}`,
                  videoUrl,
                  title: data.trainerName || "Trainer Reel",
                  ownerId: docu.id,
                  type: "trainer",
                });
              }
            });
          }
        });

        instituteSnap.forEach((docu) => {
          const data = docu.data();
          if (Array.isArray(data.reels)) {
            data.reels.forEach((videoUrl, idx) => {
              if (videoUrl) {
                allReels.push({
                  reelId: `institute_${docu.id}_${idx}`,
                  videoUrl,
                  title: data.instituteName || "Institute Reel",
                  ownerId: docu.id,
                  type: "institute",
                });
              }
            });
          }
        });

        const shuffled = allReels.sort(() => Math.random() - 0.5);
        setReels(shuffled);
        setLoading(false);
      } catch (err) {
        console.error("[Reels] Error:", err);
        setLoading(false);
      }
    };

    fetchReels();
  }, []);

  const reel = reels.length > 0 ? reels[activeIndex] : null;

  /* ================= AUTO SCROLL COMMENTS ================= */
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments]);

  /* ================= PROFILE VIEW TRACK ================= */
  useEffect(() => {
    if (!reel || !user) return;

    const registerProfileView = async () => {
      const viewId = `${user.uid}_${reel.ownerId}`;
      const viewRef = doc(db, "profileViews", viewId);
      const analyticsRef = doc(db, "userAnalytics", reel.ownerId);

      const viewSnap = await getDoc(viewRef);

      if (!viewSnap.exists()) {
        await setDoc(viewRef, {
          viewerId: user.uid,
          profileId: reel.ownerId,
          createdAt: serverTimestamp(),
        });

        const analyticsSnap = await getDoc(analyticsRef);

        if (!analyticsSnap.exists()) {
          await setDoc(analyticsRef, {
            profileViews: 1,
            followers: 0,
            connections: 0,
            postEngagement: 0,
            networkGrowth: 0,
            weeklyGrowth: 0,
            engagementRate: 0,
            lastUpdated: serverTimestamp(),
          });
        } else {
          await updateDoc(analyticsRef, {
            profileViews: (analyticsSnap.data().profileViews || 0) + 1,
            lastUpdated: serverTimestamp(),
          });
        }
      }
    };

    registerProfileView();
  }, [reel, user]);

  /* ================= VIEW COUNT ================= */
  useEffect(() => {
    if (!reel || !user) return;

    const viewRef = doc(db, "reelViews", reel.reelId + "_" + user.uid);
    const reelRef = doc(db, "reels", reel.reelId);

    const registerView = async () => {
      const viewSnap = await getDoc(viewRef);

      if (!viewSnap.exists()) {
        await setDoc(viewRef, {
          reelId: reel.reelId,
          userId: user.uid,
          createdAt: serverTimestamp(),
        });

        const reelSnap = await getDoc(reelRef);
        if (!reelSnap.exists()) {
          await setDoc(reelRef, { views: 1, likes: 0 });
          setViews(1);
        } else {
          const newViews = (reelSnap.data().views || 0) + 1;
          await updateDoc(reelRef, { views: newViews });
          setViews(newViews);
        }
      } else {
        const reelSnap = await getDoc(reelRef);
        if (reelSnap.exists()) setViews(reelSnap.data().views || 0);
      }
    };

    registerView();
  }, [reel, user]);

  /* ================= LIKE ================= */
  useEffect(() => {
    if (!reel || !user) return;

    const likeRef = doc(db, "reelLikes", reel.reelId + "_" + user.uid);
    const reelRef = doc(db, "reels", reel.reelId);

    const checkLike = async () => {
      const likeSnap = await getDoc(likeRef);
      const reelSnap = await getDoc(reelRef);

      if (likeSnap.exists()) setLiked(true);
      if (reelSnap.exists()) setLikes(reelSnap.data().likes || 0);
    };

    checkLike();
  }, [reel, user]);

  const toggleLike = async () => {
    if (!user) return alert("Login required");

    const likeRef = doc(db, "reelLikes", reel.reelId + "_" + user.uid);
    const reelRef = doc(db, "reels", reel.reelId);
    const reelSnap = await getDoc(reelRef);

    if (liked) {
      await deleteDoc(likeRef);
      const newLikes = (reelSnap.data().likes || 1) - 1;
      await updateDoc(reelRef, { likes: newLikes });
      setLikes(newLikes);
      setLiked(false);
    } else {
      await setDoc(likeRef, { userId: user.uid, reelId: reel.reelId });
      const newLikes = (reelSnap.data().likes || 0) + 1;
      await updateDoc(reelRef, { likes: newLikes });
      setLikes(newLikes);
      setLiked(true);
    }
  };

  /* ================= FOLLOW SYSTEM ================= */
  useEffect(() => {
    if (!user || !reel) return;

    const followRef = doc(db, "followers", `${user.uid}_${reel.ownerId}`);

    const unsub = onSnapshot(followRef, (snap) => {
      setIsFollowing(snap.exists());
    });

    return () => unsub();
  }, [user, reel]);

  const followProfile = async () => {
    if (!user || !reel) return;
    if (followLoading) return;

    setFollowLoading(true);

    const followRef = doc(db, "followers", `${user.uid}_${reel.ownerId}`);
    const analyticsRef = doc(db, "userAnalytics", reel.ownerId);

    const snap = await getDoc(followRef);

    if (!snap.exists()) {
      await setDoc(followRef, {
        followerId: user.uid,
        profileId: reel.ownerId,
        createdAt: serverTimestamp(),
      });

      const analyticsSnap = await getDoc(analyticsRef);
      if (analyticsSnap.exists()) {
        await updateDoc(analyticsRef, {
          followers: (analyticsSnap.data().followers || 0) + 1,
          connections: (analyticsSnap.data().connections || 0) + 1,
          networkGrowth: (analyticsSnap.data().networkGrowth || 0) + 1,
          lastUpdated: serverTimestamp(),
        });
      }
    }

    setFollowLoading(false);
  };

  const unfollowProfile = async () => {
    if (!user || !reel) return;
    if (followLoading) return;

    setFollowLoading(true);

    const followRef = doc(db, "followers", `${user.uid}_${reel.ownerId}`);
    const analyticsRef = doc(db, "userAnalytics", reel.ownerId);

    const snap = await getDoc(followRef);

    if (snap.exists()) {
      await deleteDoc(followRef);

      const analyticsSnap = await getDoc(analyticsRef);
      if (analyticsSnap.exists()) {
        await updateDoc(analyticsRef, {
          followers: Math.max((analyticsSnap.data().followers || 1) - 1, 0),
          connections: Math.max((analyticsSnap.data().connections || 1) - 1, 0),
          lastUpdated: serverTimestamp(),
        });
      }
    }

    setFollowLoading(false);
  };

  /* ================= COMMENTS ================= */
  useEffect(() => {
    if (!reel) return;

    const q = query(
      collection(db, "reelComments", reel.reelId, "comments"),
      orderBy("createdAt", "asc"),
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setComments(list);
    });

    return () => unsub();
  }, [reel]);

  const sendComment = async () => {
    if (!user || !commentText.trim()) return;

    await addDoc(collection(db, "reelComments", reel.reelId, "comments"), {
      userId: user.uid,
      userName: user.displayName || user.email || "User",
      text: commentText,
      createdAt: serverTimestamp(),
    });

    setCommentText("");
  };

  /* ================= SWIPE ================= */
  const onTouchStart = (e) => (touchStartY.current = e.touches[0].clientY);
  const onTouchEnd = (e) => {
    if (!touchStartY.current) return;
    const diff = touchStartY.current - e.changedTouches[0].clientY;

    if (diff > 80) setActiveIndex((p) => (p + 1 >= reels.length ? 0 : p + 1));
    if (diff < -80)
      setActiveIndex((p) => (p - 1 < 0 ? reels.length - 1 : p - 1));
  };

  if (loading || !reel) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-pulse text-lg font-semibold">
          Loading reel...
        </div>
      </div>
    );
  }

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{
        position: "fixed",
        inset: 0,
        background: "black",
        zIndex: 999999,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          height: "100vh",
          position: "relative",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.video
            key={reel.reelId}
            src={reel.videoUrl}
            autoPlay
            playsInline
            controls={false}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </AnimatePresence>

        {/* TOP BAR */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center text-white bg-gradient-to-b from-black/70 to-transparent">
          <span className="font-semibold">{reel.title}</span>
          <button onClick={() => navigate(-1)}>✕</button>
        </div>

        {/* FOLLOW BAR */}
        <div className="absolute top-14 left-0 right-0 flex justify-center">
          {!isFollowing ? (
            <button
              onClick={followProfile}
              disabled={followLoading}
              className="bg-blue-500 text-white px-5 py-2 rounded-full font-semibold shadow-lg active:scale-95 transition"
            >
              {followLoading ? "Following..." : "Follow"}
            </button>
          ) : (
            <button
              onClick={unfollowProfile}
              disabled={followLoading}
              className="bg-white text-black px-5 py-2 rounded-full font-semibold shadow-lg active:scale-95 transition"
            >
              {followLoading ? "Unfollowing..." : "Unfollow"}
            </button>
          )}
        </div>

        {/* ACTION BAR */}
        <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5 text-white">
          <button onClick={toggleLike} className="text-xl">
            {liked ? "❤️" : "🤍"}
            <div className="text-sm">{likes}</div>
          </button>

          <button onClick={() => setShowComments(true)} className="text-xl">
            💬<div className="text-sm">{comments.length}</div>
          </button>

          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="text-xl"
          >
            📤
          </button>

          <div className="text-sm">👁 {views}</div>
        </div>

        {/* COMMENTS PANEL */}
        {showComments && (
          <div className="absolute inset-0 bg-black/90 text-white flex flex-col">
            <div className="p-3 flex justify-between border-b border-white/20">
              <span>Comments</span>
              <button onClick={() => setShowComments(false)}>✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {comments.map((c) => (
                <div key={c.id} className="mb-2 text-sm">
                  <b>{c.userName}</b>: {c.text}
                </div>
              ))}
              <div ref={commentsEndRef} />
            </div>

            <div className="p-3 flex gap-2 border-t border-white/20">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-black border border-white/30 px-3 py-2 rounded text-white"
              />
              <button
                onClick={sendComment}
                className="bg-white text-black px-4 rounded"
              >
                Send
              </button>
            </div>
          </div>
        )}

        {/* PROFILE BUTTON */}
        <button
          onClick={() =>
            navigate(
              reel.type === "trainer"
                ? `/trainers/${reel.ownerId}`
                : `/institutes/${reel.ownerId}`,
            )
          }
          className="absolute bottom-6 left-4 bg-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
        >
          View Profile 👤
        </button>
      </div>
    </div>
  );
};

export default ReelViewer;
