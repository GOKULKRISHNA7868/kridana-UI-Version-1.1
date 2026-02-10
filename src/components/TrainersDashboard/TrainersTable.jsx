import React, { useState, useEffect } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";


const TrainersTable = ({ rows, onDelete }) => {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ name: "", batch: "", phone: "" });
  const [localRows, setLocalRows] = useState(rows);

  useEffect(() => {
    setLocalRows(rows);
  }, [rows]);

  const startEdit = (row) => {
    setEditingId(row.id);
    setDraft({
      name: row.name,
      batch: row.batch,
      phone: row.phone,
    });
  };

 const saveOrStartEdit = async (row) => {
  if (editingId === row.id) {
    const studentRef = doc(db, "trainerstudents", row.id);

    try {
     const [firstName, lastName = ""] = draft.name.split(" ");

await updateDoc(studentRef, {
  firstName,
  lastName,
  category: draft.batch,
  phoneNumber: draft.phone,
});

    } catch (err) {
      console.error("Error updating student:", err);
    }

    setLocalRows((prev) =>
  prev.map((r) =>
    r.id === row.id
      ? {
          ...r,
          name: draft.name,
          batch: draft.batch,
          phone: draft.phone,
        }
      : r
  )
);


    setEditingId(null);
  } else {
    startEdit(row);
  }
};


  const handleChange = (field, value) =>
    setDraft((prev) => ({ ...prev, [field]: value }));

  return (
   <div className="overflow-x-auto bg-white rounded-lg shadow">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-4 py-3 bg-[#f9c199] text-black font-semibold text-sm items-center">

        <div className="flex items-center gap-2">
          
          <span>Trainers Name</span>
        </div>
        <div>Batch.No</div>
        <div>Phn.No</div>
        <div>Action</div>
      </div>
<div className="bg-white text-black">
  {localRows.length === 0 ? (
    /* NO DATA FOUND STATE */
    <div className="grid grid-cols-[2fr_1fr_1fr_1fr] px-4 py-6 border-t border-orange-200 text-sm">
      <div className="col-span-4 text-center text-gray-500 font-medium">
        No students assigned
      </div>
    </div>
  ) : (
    /* DATA ROWS */
    localRows.map((row) => {
      const isEditing = editingId === row.id;
      return (
        <div
          key={row.id}
          className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-4 py-3 border-b border-gray-200 text-sm items-center hover:bg-gray-100">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#d6e4ff] border border-[#97b2ff]" />
            {isEditing ? (
              <input
                value={draft.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="border px-2 py-1 rounded text-xs w-full"
              />
            ) : (
              <span>{row.name}</span>
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

          <div className="flex items-center justify-start gap-3 text-orange-500 text-lg">
            <button title="Delete" onClick={() => onDelete(row.id)}>
              🗑️
            </button>
            <button
              title="Edit / Save"
              onClick={() => saveOrStartEdit(row)}
            >
              {isEditing ? "✅" : "✏️"}
            </button>
          </div>
        </div>
      );
    })
  )}
</div>

    </div>
  );
};

export default TrainersTable;