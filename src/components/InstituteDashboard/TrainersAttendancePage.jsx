import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  setDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { Pagination } from "./shared";

const today = new Date().toISOString().split("T")[0];

const TrainersAttendancePage = () => {
  const { user, institute } = useAuth();

  const [trainers, setTrainers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  // 🔢 Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const normalizeDate = (date) => {
    if (!date) return null;

    // Firestore Timestamp
    if (date.seconds) {
      return new Date(date.seconds * 1000).toISOString().split("T")[0];
    }

    // JS Date
    if (date instanceof Date) {
      return date.toISOString().split("T")[0];
    }

    // String
    return date.split("T")[0];
  };

  const isSameDate = (joinedDate, selectedDate) => {
    if (!selectedDate) return true; // no calendar filter
    const joined = normalizeDate(joinedDate);
    return joined === selectedDate;
  };


  /* 🔒 Load institute trainers */
  useEffect(() => {
    if (!user || !institute?.role || institute.role !== "institute") return;

    const q = query(
      collection(db, "InstituteTrainers"),
      where("instituteId", "==", user.uid)
    );

    return onSnapshot(q, (snap) => {
      setTrainers(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
    });
  }, [user, institute]);


  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedDate]);


  /* 📅 Load attendance for selected date */
  useEffect(() => {
    if (!user || !selectedDate) {
      setAttendance({});
      return;
    }

    const q = query(
      collection(db, "institutes", user.uid, "trainerAttendance"),
      where("date", "==", selectedDate)
    );

    return onSnapshot(q, (snap) => {
      const map = {};
      snap.docs.forEach((d) => {
        map[d.data().trainerId] = d.data().status === "present";
      });
      setAttendance(map);
    });
  }, [user, selectedDate, institute]);

  /* 🔍 Search */
  const filteredRows = useMemo(() => {
    return trainers.filter((t) => {
      const nameMatch = `${t.firstName} ${t.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const dateMatch = isSameDate(t.joinedDate || t.createdAt, selectedDate);

      return nameMatch && dateMatch;
    });
  }, [trainers, search, selectedDate]);

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRows.slice(startIndex, endIndex);
  }, [filteredRows, currentPage]);


  /* 🔐 Date validation */
  const canEditDate = (joinedDate) => {
    if (selectedDate > today) return false; // ❌ future
    if (joinedDate && selectedDate < joinedDate) return false; // ❌ before joining
    return true; // ✅ joining date INCLUDED
  };

  /* ✅ Save attendance */
  const markAttendance = async (trainer, value) => {
    if (!canEditDate(trainer.joinedDate)) return;

    // 🔹 Updated path: save under institute
    await setDoc(
      doc(
        db,
        "institutes",
        user.uid,
        "trainerAttendance",
        `${trainer.uid}_${selectedDate}`
      ),
      {
        trainerId: trainer.uid,
        instituteId: user.uid,
        date: selectedDate,
        month: selectedDate.slice(0, 7),
        status: value ? "present" : "absent",
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  return (
    <div className="h-full bg-white text-[#3F2A14] p-6 rounded-lg">
      {/* 🔍 Search */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center bg-gray-100 border border-gray-300 rounded-full px-4 py-2 w-full max-w-md">
          <span className="mr-2 text-lg text-[#A16207]">🔍</span>
          <input
            type="text"
            placeholder="Search trainers attendance by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm w-full 
text-[#3F2A14] placeholder-[#A16207]"
          />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-extrabold text-orange-500">
          Trainer’s Attendance
        </h1>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold"
        />
      </div>

      {/* Table */}
      <div className="bg-[#FED7AA] rounded-xl border border-white shadow-sm">

        <div className="grid grid-cols-4 gap-4 px-4 py-3 text-black font-semibold text-sm">
          <div>Trainers Name</div>
          <div>Category</div>
          <div>Present</div>
          <div>Absent</div>
        </div>

        <div className="bg-white text-black">
          {paginatedRows.length === 0 ? (
            /* ✅ EMPTY STATE */
            <div className="grid grid-cols-4 px-4 py-4 border-t text-center text-gray-500 font-medium">
              <div className="col-span-4">
                No Trainers assigned
              </div>
            </div>
          ) : (
            paginatedRows.map((trainer) => {
              const isPresent = attendance[trainer.uid] === true;
              const isAbsent = attendance[trainer.uid] === false;

              return (
                <div
                  key={trainer.uid}
                  className="grid grid-cols-4 gap-4 px-4 py-3 border-t border-gray-200 text-sm items-center"
                >
                  <div className="font-semibold">
                    {trainer.firstName} {trainer.lastName}
                  </div>

                  <div>{trainer.category || "-"}</div>

                  <div>
                    <button
                      onClick={() => {
                        if (!canEditDate(trainer.joinedDate)) return;
                        markAttendance(trainer, true);
                      }}
                      className={
                        "px-3 py-1 rounded-full text-xs font-semibold cursor-pointer " +
                        (isPresent
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-700")
                      }
                    >
                      Present
                    </button>
                  </div>

                  <div>
                    <button
                      onClick={() => {
                        if (!canEditDate(trainer.joinedDate)) return;
                        markAttendance(trainer, false);
                      }}
                      className={
                        "px-3 py-1 rounded-full text-xs font-semibold cursor-pointer " +
                        (isAbsent
                          ? "bg-red-500 text-white"
                          : "bg-gray-200 text-gray-700")
                      }
                    >
                      Absent
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

    </div>
  );
};

export default TrainersAttendancePage;