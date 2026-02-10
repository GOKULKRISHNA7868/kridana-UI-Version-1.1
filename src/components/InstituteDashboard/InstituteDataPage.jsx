// src/components/InstituteDashboard/InstituteDataPage.jsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import { doc, updateDoc, deleteDoc  } from "firebase/firestore";
import { db } from "../../firebase";
import { Pagination } from "./shared";


const InstituteDataPage = ({
  students,
  trainers,
  setDataType,
  setActiveMenu,        // ✅ ADD THIS LINE
  onDeleteStudent,
  onDeleteTrainer,

}) => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [activeType, setActiveType] = useState("students");
   const dropdownRef = useRef(null);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  // 🔢 Pagination state
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 10;

  const handleSelect = (type) => {
  setActiveType(type);
  setDataType(type);     // ✅ THIS IS THE KEY FIX
  setOpenDropdown(false);
};


  useEffect(() => {
  setCurrentPage(1);
}, [search, activeType, selectedDate]);


  // Safe filtered students
  const filteredStudents = useMemo(() => {
  return students.filter((s) => {
    if (!s) return false;

    const fullName = `${s.firstName || ""} ${s.lastName || ""}`
      .toLowerCase()
      .trim();

    const matchesSearch = fullName.includes(search.toLowerCase());
   const matchesDate = !selectedDate || s.createdAt === selectedDate;
    return matchesSearch && matchesDate;
  });
}, [students, search, selectedDate]);


  // Safe filtered trainers
  const filteredTrainers = useMemo(() => {
  return trainers.filter((t) => {
    if (!t) return false;

    const fullName = `${t.firstName || ""} ${t.lastName || ""}`
      .toLowerCase()
      .trim();

    const matchesSearch = fullName.includes(search.toLowerCase());
    const matchesDate = !selectedDate || t.createdAt === selectedDate;
    return matchesSearch && matchesDate;
  });
}, [trainers, search, selectedDate]);


  // 📄 Pagination logic
const activeRows =
  activeType === "students" ? filteredStudents : filteredTrainers;

const totalPages = Math.ceil(activeRows.length / itemsPerPage);

const paginatedRows = useMemo(() => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  return activeRows.slice(startIndex, startIndex + itemsPerPage);
}, [activeRows, currentPage]);


/* =============================
   CLICK OUTSIDE TO CLOSE DROPDOWN
============================= */
useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target)
    ) {
      // 👇 close dropdown here
      setOpenDropdown(false); // or setDropdownOpen(false) depending on your dropdown
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  return (
    <div className="h-full text-white">
      {/* Search + icons */}
      <div className="flex items-center justify-between mb-4">
       <div className="flex items-center bg-gray-100 border border-gray-300 rounded-full px-5 py-2 w-full max-w-md">
  <span className="mr-2 text-lg text-[#7C4A1D]">🔍</span>
  <input
    type="text"
    placeholder="Search by name..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="bg-transparent outline-none text-sm w-full 
               text-[#5D3A09] placeholder:text-[#A16207]"
  />
</div>
<div className="flex items-center gap-4">
  {/* 📅 Calendar */}
  <input
    type="date"
    value={selectedDate}
    onChange={(e) => setSelectedDate(e.target.value)}
    className="border border-gray-300 bg-orange-500 rounded-full px-4 py-2 text-sm text-[#ffffff]
               focus:outline-none focus:ring-2 focus:ring-orange-400"
  />

  {/* ➕ Add Button */}
  <button
  onClick={() =>
    setActiveMenu(
      activeType === "students"
        ? "Add Student Details"
        : "Add Trainer Details"
    )
  }
  className="flex items-center gap-2 bg-orange-500 text-white px-6 py-2 rounded-full font-semibold"
>
  <svg
    className="w-4 h-4 text-white"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
  Add
</button>

</div>

      </div>

      {/* Title + dropdown + date + add */}
      <div className="flex items-center justify-between mb-4 relative">
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown((v) => !v)}
            className="flex items-center gap-1 text-3xl font-extrabold text-orange-500"
          >
            Institute Data
            <span className="text-xl ">{openDropdown ? "▲" : "▼"}</span>
          </button>

          {openDropdown && (
            <div className="absolute mt-2 w-56 bg-gray-100 text-black rounded-md shadow-lg z-10">
              <button
                type="button"
                onClick={() => handleSelect("students")}
                className={
                  "block w-full text-left px-4 py-3 hover:bg-orange-200 " +
                  (activeType === "students" ? "font-semibold" : "")
                }
              >
                Students Data
              </button>
              <button
                type="button"
                onClick={() => handleSelect("trainers")}
                className={
                  "block w-full text-left px-4 py-3 hover:bg-orange-200 " +
                  (activeType === "trainers" ? "font-semibold" : "")
                }
              >
                Trainer’s Data
              </button>
            </div>
          )}
        </div>

       
      </div>

      {activeType === "students" ? (
  <InstituteStudentsTable
    rows={paginatedRows}
    onDelete={onDeleteStudent}
  />
) : (
  <InstituteTrainersTable
    rows={paginatedRows}
    onDelete={onDeleteTrainer}
  />
)}
{totalPages > 1 && (
  <div className="flex justify-end mt-4">
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
    />
  </div>
)}

    </div>
  );
};

/* -------- shared row actions (delete + edit/save) -------- */
const TableActions = ({ onDelete, onEditToggle, isEditing }) => (
  <div className="flex items-center gap-3 text-orange-500 text-lg">
    <button title="Delete" onClick={onDelete}>
      🗑️
    </button>
    <button title="Edit / Save" onClick={onEditToggle}>
      {isEditing ? "✅" : "✏️"}
    </button>
  </div>
);

/* -------- Students table -------- */
const InstituteStudentsTable = ({ rows, onDelete }) => {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ name: "", batch: "", phone: "" });
  const [localRows, setLocalRows] = useState(rows);

  useEffect(() => setLocalRows(rows), [rows]);

  const startEdit = (row) => {
    setEditingId(row.uid);
    const name = `${row.firstName || ""} ${row.lastName || ""}`.trim();
    setDraft({ name, batch: row.batch || "", phone: row.phone || "" });
  };

  const saveOrStartEdit = async (row) => {
    if (editingId === row.uid) {
      const [firstName, lastName] = draft.name.split(" ");
      const studentRef = doc(db, "students", row.uid);

      try {
        await updateDoc(studentRef, {
          firstName: firstName || "",
          lastName: lastName || "",
          batch: draft.batch,
          phone: draft.phone,
        });
      } catch (err) {
        console.error("Error updating student:", err);
      }

      setLocalRows((prev) =>
        prev.map((r) =>
          r.uid === row.uid
            ? {
                ...r,
                firstName: firstName || "",
                lastName: lastName || "",
                batch: draft.batch,
                phone: draft.phone,
              }
            : r
        )
      );
      setEditingId(null);
    } else startEdit(row);
  };

  const handleChange = (field, value) =>
    setDraft((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow border border-orange-200">
      <div className="grid grid-cols-4 gap-4 px-4 py-3 
  bg-[#FFD9B3] text-black font-semibold text-sm rounded-t-sm">
        <div className="flex items-center gap-2">
          <span>Students Name</span>
        </div>
        <div>Category</div>
        <div>Phn.No</div>
        <div>Action</div>
      </div>

      <div className="bg-white text-black">

  {localRows.length === 0 ? (
    /* 🔹 EMPTY MESSAGE */
    <div className="grid grid-cols-4 px-4 py-6 border-t border-orange-200">
      <div className="col-span-4 text-center text-gray-500 font-medium text-sm">
        No students assigned
      </div>
    </div>
  ) : (

    localRows.map((row) => {

          const isEditing = editingId === row.uid;
          const name = `${row.firstName || ""} ${row.lastName || ""}`.trim();
          return (
            <div
              key={row.uid}
              className="grid grid-cols-4 gap-4 px-4 py-3 border-t border-gray-200 text-sm items-center"
            >
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-[#d6e4ff] border border-[#97b2ff]" />
                {isEditing ? (
                  <input
                    value={draft.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="border px-2 py-1 rounded text-xs w-full"
                  />
                ) : (
                  <span>{name}</span>
                )}
              </div>
              <div>
                {isEditing ? (
                  <input
                    value={draft.batch}
                    onChange={(e) => handleChange("batch", e.target.value)}
                    className="border px-2 py-1 rounded text-xs w-full"
                  />
                ) : (
                  row.batch
                )}
              </div>
              <div>
                {isEditing ? (
                  <input
                    value={draft.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="border px-2 py-1 rounded text-xs w-full"
                  />
                ) : (
                  row.phone
                )}
              </div>
              <TableActions
  onDelete={async () => {
    try {
      await deleteDoc(doc(db, "students", row.uid));
      onDelete(row.uid); // update UI after firebase delete
    } catch (err) {
      console.error("Error deleting student:", err);
    }
  }}
  onEditToggle={() => saveOrStartEdit(row)}
  isEditing={isEditing}
/>

            </div>
          );
})
      )}

      </div>
    </div>
  );
};

/* -------- Trainers table -------- */
const InstituteTrainersTable = ({ rows, onDelete }) => {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ name: "", category: "", phone: "" });
  const [localRows, setLocalRows] = useState(rows);

  useEffect(() => setLocalRows(rows), [rows]);

  const startEdit = (row) => {
    setEditingId(row.trainerUid);
    const name = `${row.firstName || ""} ${row.lastName || ""}`.trim();
    setDraft({ name, category: row.category || "", phone: row.phone || "" });
  };

  const saveOrStartEdit = async (row) => {
    if (editingId === row.trainerUid) {
      const [firstName, lastName] = draft.name.split(" ");
      const trainerRef = doc(db, "InstituteTrainers", row.trainerUid);

      try {
        await updateDoc(trainerRef, {
          firstName: firstName || "",
          lastName: lastName || "",
          category: draft.category,
          phone: draft.phone,
        });
      } catch (err) {
        console.error("Error updating trainer:", err);
      }

      setLocalRows((prev) =>
        prev.map((r) =>
          r.trainerUid === row.trainerUid
            ? {
                ...r,
                firstName: firstName || "",
                lastName: lastName || "",
                category: draft.category,
                phone: draft.phone,
              }
            : r
        )
      );
      setEditingId(null);
    } else startEdit(row);
  };

  const handleChange = (field, value) =>
    setDraft((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow border border-orange-200">
      <div className="grid grid-cols-4 gap-4 px-4 py-3 
  bg-[#FFD9B3] text-black font-semibold text-sm rounded-t-sm">
        <div className="flex items-center gap-2">
          <span>Trainers Name</span>
        </div>
        <div>Category</div>
        <div>Phn.No</div>
        <div>Action</div>
      </div>

      <div className="bg-white text-black">

  {localRows.length === 0 ? (
    /* 🔹 EMPTY MESSAGE */
    <div className="grid grid-cols-4 px-4 py-6 border-t border-orange-200">
      <div className="col-span-4 text-center text-gray-500 font-medium text-sm">
        No trainers assigned
      </div>
    </div>
  ) : (

    localRows.map((row) => {
          const isEditing = editingId === row.trainerUid;
          const name = `${row.firstName || ""} ${row.lastName || ""}`.trim();
          return (
            <div
              key={row.trainerUid}
              className="grid grid-cols-4 gap-4 px-4 py-3 border-t border-gray-200 text-sm items-center"
            >
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-[#d6e4ff] border border-[#97b2ff]" />
                {isEditing ? (
                  <input
                    value={draft.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="border px-2 py-1 rounded text-xs w-full"
                  />
                ) : (
                  <span>{name}</span>
                )}
              </div>
              <div>
                {isEditing ? (
                  <input
                    value={draft.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="border px-2 py-1 rounded text-xs w-full"
                  />
                ) : (
                  row.category
                )}
              </div>
              <div>
                {isEditing ? (
                  <input
                    value={draft.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="border px-2 py-1 rounded text-xs w-full"
                  />
                ) : (
                  row.phone
                )}
              </div>
              <TableActions
                onDelete={async () => {
  try {
    await deleteDoc(doc(db, "InstituteTrainers", row.trainerUid));
    onDelete(row.trainerUid);
  } catch (err) {
    console.error("Error deleting trainer:", err);
  }
}}

                onEditToggle={() => saveOrStartEdit(row)}
                isEditing={isEditing}
              />
            </div>
          );
})
      )}
      </div>
    </div>
  );
};

export default InstituteDataPage;