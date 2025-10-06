import React, { useState, useEffect } from "react";
import { API_BASE } from "../config/config";
import { useNavigate, Link } from "react-router-dom";
import ThemeToggle from "../ThemeToggle";

const Register = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        username: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "user", // hidden default
        profilePicture: null,
    });
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

    // Cleanup function for object URLs
    useEffect(() => {
        return () => {
            if (imagePreviewUrl) {
                URL.revokeObjectURL(imagePreviewUrl);
            }
        };
    }, [imagePreviewUrl]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        // Only allow letters and spaces in username
        if (name === "username") {
            const onlyLetters = /^[A-Za-z\s]*$/;
            if (!onlyLetters.test(value)) return;
        }

        // Handle file uploads
        if (name === "profilePicture" && files && files[0]) {
            const file = files[0];
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setMsg("Please select a valid image file.");
                return;
            }
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setMsg("Image size should be less than 5MB.");
                return;
            }
            // Cleanup previous URL
            if (imagePreviewUrl) {
                URL.revokeObjectURL(imagePreviewUrl);
            }
            // Create new preview URL
            const previewUrl = URL.createObjectURL(file);
            setImagePreviewUrl(previewUrl);
            setForm((prev) => ({ ...prev, [name]: file }));
        } else {
            setForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg("");

        const { username, email, phone, password, confirmPassword, role } = form;

        if (!username || !email || !phone || !password || !confirmPassword) {
            setMsg("Please fill in all required fields.");
            return;
        }

        if (!/^[A-Za-z\s]+$/.test(username)) {
            setMsg("Username must contain letters and spaces only.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setMsg("Please enter a valid email address.");
            return;
        }

        if (!/^\d{7,15}$/.test(phone)) {
            setMsg("Phone number must be 7–15 digits only.");
            return;
        }

        if (password.length < 6) {
            setMsg("Password must be at least 6 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setMsg("Passwords do not match.");
            return;
        }

        if (!["user", "admin"].includes(role)) {
            setMsg("Invalid role selected.");
            return;
        }

        setLoading(true);
        const data = new FormData();
        
        // Append text fields
        data.append('username', form.username);
        data.append('email', form.email);
        data.append('phone', form.phone);
        data.append('password', form.password);
        data.append('role', form.role);
        
        // Append file if exists
        if (form.profilePicture instanceof File) {
            data.append('profilePicture', form.profilePicture);
        }

        try {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: "POST",
                body: data,
            });
            const result = await res.json();
            setMsg(result.msg || "Registration successful!");
            if (res.ok) {
                localStorage.setItem("userEmail", form.email);
                navigate("/OTPVerify");
            }
        } catch {
            setMsg("Failed to register. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary-900 dark:bg-neutral-900 black px-4 text-2xl transition-colors duration-300">
            {/* Theme Toggle in top-right corner */}
            <div className="absolute top-4 right-4">
                <ThemeToggle showForAll={true} />
            </div>
            
            <div className="w-full max-w-2xl bg-[#111] dark:bg-neutral-800 rounded-xl p-6 shadow-lg space-y-4 text-white dark:text-white">
                <h2 className="text-2xl font-bold text-center">Create Account</h2>

                {msg && (
                    <p className="text-center text-sm text-red-400 font-medium">{msg}</p>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        name="username"
                        type="text"
                        placeholder="Full Name"
                        value={form.username}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 bg-primary-900 dark:bg-neutral-700 black border border-gray-700 dark:border-gray-600 text-white dark:text-white rounded-md placeholder-black dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                    />

                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 bg-primary-900 dark:bg-neutral-700 black border border-gray-700 dark:border-gray-600 text-white dark:text-white rounded-md placeholder-black dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                    />

                    <input
                        name="phone"
                        type="text"
                        placeholder="Phone Number"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 bg-primary-900 dark:bg-neutral-700 black border border-gray-700 dark:border-gray-600 text-white dark:text-white rounded-md placeholder-black dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                    />

                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 bg-primary-900 dark:bg-neutral-700 black border border-gray-700 dark:border-gray-600 text-white dark:text-white rounded-md placeholder-black dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                    />

                    <input
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm Password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 bg-primary-900 dark:bg-neutral-700 black border border-gray-700 dark:border-gray-600 text-white dark:text-white rounded-md placeholder-black dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                    />

                    {/* Hidden role input */}
                    <input type="hidden" name="role" value={form.role} />

                    {/* Profile Picture Upload with Preview */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-white dark:text-white">Profile Picture (Optional)</label>
                        {imagePreviewUrl && (
                            <div className="flex justify-center mb-2">
                                <img 
                                    src={imagePreviewUrl} 
                                    alt="Preview" 
                                    className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                                />
                            </div>
                        )}
                        <input
                            name="profilePicture"
                            type="file"
                            accept="image/jpeg,image/png,image/jpg"
                            onChange={handleChange}
                            className="w-full p-2 bg-primary-900 dark:bg-neutral-700 border border-gray-700 dark:border-gray-600 text-white dark:text-white rounded-md file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-600"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-600 text-white font-semibold py-2 rounded-md transition"
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-400">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
