import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE } from "../config/config";

const VerifyOtpAccount = () => {
    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState({ text: "", type: "" });
    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const navigate = useNavigate();
    const email = localStorage.getItem("userEmail");
    
    useEffect(() => {
        if (!email) {
            setMessage({ text: "No email found for verification. Please register again.", type: "error" });
        }
    }, [email]);
    
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else if (countdown === 0 && resendDisabled) {
            setResendDisabled(false);
        }
        return () => clearTimeout(timer);
    }, [countdown, resendDisabled]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setMessage({ text: "No email found for verification. Please register again.", type: "error" });
            return;
        }

        if (!/^[0-9]{6}$/.test(otp)) {
            setMessage({ text: "OTP must be a 6-digit number.", type: "error" });
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ text: data.message || "Verification successful!", type: "success" });
                // Clear the email from localStorage after successful verification
                setTimeout(() => {
                    localStorage.removeItem("userEmail");
                    navigate("/login");
                }, 1500);
            } else {
                setMessage({ text: data.message || "Invalid OTP", type: "error" });
            }
        } catch (err) {
            setMessage({ text: "Server error during verification", type: "error" });
        }
    };
    
    const handleResendOTP = async () => {
        if (!email) {
            setMessage({ text: "No email found. Please register again.", type: "error" });
            return;
        }
        
        setResendDisabled(true);
        setCountdown(60); // 60 seconds cooldown
        setMessage({ text: "Sending new OTP...", type: "info" });
        
        try {
            const res = await fetch(`${API_BASE}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, resendOTP: true }),
            });
            
            const data = await res.json();
            
            if (res.ok) {
                setMessage({ text: "New OTP sent to your email!", type: "success" });
            } else {
                setMessage({ text: data.message || "Failed to resend OTP", type: "error" });
                setResendDisabled(false);
                setCountdown(0);
            }
        } catch (err) {
            setMessage({ text: "Server error while resending OTP", type: "error" });
            setResendDisabled(false);
            setCountdown(0);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary-900 dark:bg-neutral-900 black px-4 transition-colors duration-300">
            <div className="w-full max-w-sm bg-[#111] dark:bg-neutral-800 rounded-xl p-6 shadow-lg space-y-6 text-white dark:text-white">
                <div>
                    <h2 className="text-2xl font-bold text-center">Verify Your Account</h2>
                    <p className="text-sm text-gray-400 text-center mt-1">
                        Enter the 6-digit OTP sent to your email.
                    </p>
                    {email && (
                        <p className="text-sm text-center text-primary mt-2">
                            {email}
                        </p>
                    )}
                </div>

                {message.text && (
                    <p
                        className={`text-sm text-center font-medium ${message.type === "success" ? "text-green-400" : 
                                    message.type === "info" ? "text-blue-400" : "text-red-400"}`}
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
                        maxLength={6}
                        className="w-full px-3 py-2 bg-primary-900 dark:bg-neutral-700 black border border-gray-700 dark:border-gray-600 text-white dark:text-white rounded-md placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary-600 text-white font-semibold py-2 rounded-md transition"
                    >
                        Verify OTP
                    </button>
                </form>
                
                <div className="flex flex-col items-center space-y-2">
                    <button
                        onClick={handleResendOTP}
                        disabled={resendDisabled}
                        className={`text-sm ${resendDisabled ? 'text-gray-500 cursor-not-allowed' : 'text-primary hover:underline'}`}
                    >
                        {resendDisabled ? `Resend OTP in ${countdown}s` : "Didn't receive OTP? Resend"}
                    </button>
                    
                    <Link to="/register" className="text-sm text-primary hover:underline">
                        Return to Registration
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VerifyOtpAccount;
