import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config/config";

const RequestReset = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/request-reset`, { email });
      setMessage({ text: res.data.msg, type: "success" });
      navigate("/verify-otp")
    } catch (err) {
      setMessage({
        text: err.response?.data?.msg || "Something went wrong",
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-900 dark:bg-neutral-900 transition-colors duration-300">
      <div className="w-full max-w-sm bg-[#111] dark:bg-neutral-800 text-white dark:text-white p-6 rounded-lg shadow-md border border-[#222] dark:border-gray-600">
        <h2 className=" font-semibold mb-1 text-center text-2xl">Request Password Reset</h2>
        <p className=" text-center text-gray-400 mb-5">
          Enter your email to receive a reset code.
        </p>

        {message.text && (
          <div className={`mb-4 ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="mb-1 block">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full bg-primary-900 dark:bg-neutral-700 border border-[#333] dark:border-gray-600 px-3 py-2 rounded-md placeholder-white dark:placeholder-gray-400 text-white dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="w-full py-2 bg-primary hover:bg-primary hover:text-white text-black rounded-md font-semibold hover:bg-white transition">
            Send OTP
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestReset;

