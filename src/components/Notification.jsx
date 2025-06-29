import React from 'react';
import { IoCheckmarkCircle } from "react-icons/io5";

function Notification({ message, isVisible, onClose }) {
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-slide-in">
      <IoCheckmarkCircle size={20} />
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-white hover:text-gray-200"
      >
        ×
      </button>
    </div>
  );
}

export default Notification; 