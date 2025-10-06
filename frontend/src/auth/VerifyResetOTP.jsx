import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config/config";

const VerifyResetOtp = () => {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();
  const email = localStorage.getItem("userEmail");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage({ text: "No email found. Please request again.", type: "error" });
      return;
    }

    if (!/^[0-9]{6}$/.test(otp)) {
      setMessage({ text: "OTP must be a 6-digit number.", type: "error" });
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/verifyResetOTP`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("verifiedEmail", email);
        setMessage({ text: data.message || "OTP verified successfully!", type: "success" });
        navigate("/reset-password")
      } else {
        setMessage({ text: data.message || "Invalid OTP", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Server error during verification", type: "error" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-900 dark:bg-neutral-900 px-4 transition-colors duration-300">
      <div className="w-full max-w-sm bg-[#111] dark:bg-neutral-800 rounded-xl p-6 shadow-lg space-y-6 text-white dark:text-white">
        <div>
          <h2 className="text-2xl font-bold text-center">Verify Reset OTP</h2>
          <p className="text-sm text-gray-400 text-center mt-1">
            Enter the OTP code sent to your email for password reset.
          </p>
        </div>

        {message.text && (
          <p
            className={`text-sm text-center font-medium ${message.type === "success" ? "text-green-400" : "text-red-400"
              }`}
          >
            {message.text}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="w-full px-3 py-2 bg-black dark:bg-neutral-700 border border-gray-700 dark:border-gray-600 text-white dark:text-white rounded-md placeholder-gray-500 dark:placeholder-gray-400 "
          />
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-600 text-white font-semibold py-2 rounded-md transition"
          >
            Verify OTP
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyResetOtp;
