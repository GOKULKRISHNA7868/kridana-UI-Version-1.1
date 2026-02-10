// src/pages/RoleSelection.js
import RoleCard from "../components/RoleCard";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function RoleSelection() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null); // Stores clicked role

  const handleRoleClick = (role) => {
    setSelectedRole(role); // Show modal with this role
  };

  const handleCloseModal = () => {
    setSelectedRole(null);
  };

  const getSignupPath = (role) => {
    switch (role) {
      case "user":
        return "/signup";
      case "trainer":
        return "/trainer-signup";
      case "institute":
        return "/institute-signup";
      default:
        return "/signup";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold mb-2 text-center">
        Welcome To <span className="text-orange-500">Kridana</span>
      </h1>

      <p className="text-gray-300 mb-10 text-xl text-center">
        Your Profile. Your Experience.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl">
        <RoleCard
          title="User"
          points={[
            "View available training sessions, book slots, and track schedule updates.",
            "Purchase gym merchandise, supplements, and training equipment conveniently.",
            "Access instructional and workout videos for guided training anytime.",
            "Connect with trainers for personalized guidance, feedback, and improvement tips.",
          ]}
          onClick={() => handleRoleClick("user")}
        />

        <RoleCard
          title="Trainer / Therapist"
          points={[
            "Manage member details, progress, and communication.",
            "Update and maintain trainer profiles with achievements and specialties.",
            "Track member attendance and manage payment records effortlessly.",
            "Promote services, merchandise, and partner offers within the app.",
          ]}
          onClick={() => handleRoleClick("trainer")}
        />

        <RoleCard 
          title="Institute / Clinic / Sports Center / Play School"
          points={[
            "Manage member details, progress, and communication.",
            "Update and maintain trainer profiles with achievements and specialties.",
            "Track member attendance and manage payment records effortlessly.",
            "Promote services, merchandise, and partner offers within the app.",
          ]}
          onClick={() => handleRoleClick("institute")}
        />
      </div>

      {/* Role Choice Modal */}
      {selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl max-w-sm w-full text-center text-black">
            <h2 className="text-2xl font-bold mb-6">{selectedRole}</h2>
            <p className="mb-6">Do you want to Sign Up or Sign In?</p>
            <div className="flex justify-around">
              <button
                onClick={() => {
                  navigate(getSignupPath(selectedRole));
                  handleCloseModal();
                }}
                className="bg-orange-500 px-6 py-2 rounded-md text-white font-semibold hover:bg-orange-600 transition"
              >
                Sign Up
              </button>
              <button
                onClick={() => {
                  navigate(`/login?role=${selectedRole}`);
                  handleCloseModal();
                }}
                className="bg-gray-700 px-6 py-2 rounded-md text-white font-semibold hover:bg-gray-800 transition"
              >
                Sign In
              </button>
            </div>
            <button
              onClick={handleCloseModal}
              className="mt-4 text-sm text-red-500 hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
