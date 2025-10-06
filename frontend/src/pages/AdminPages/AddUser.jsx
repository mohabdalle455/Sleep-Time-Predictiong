import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../config/config";
import ThemeToggle from "../../ThemeToggle";

export default function AddUserByAdmin() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "user",
    profilePicture: null,
  });

  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [admin, setAdmin] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Use API_BASE from config so it works across environments
    axios
      .get(`${API_BASE.replace(/\/$/, "")}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAdmin(res.data))
      .catch((err) => console.error("Error loading profile", err));
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((d) => !d);
    document.documentElement.classList.toggle("dark");
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "username") {
      // keep only letters and spaces (prevents non-letter chars)
      const filtered = value.replace(/[^A-Za-z\s]/g, "");
      setForm((prev) => ({ ...prev, username: filtered }));
      return;
    }

    if (name === "profilePicture") {
      setForm((prev) => ({ ...prev, profilePicture: files && files[0] ? files[0] : null }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () =>
    setForm({
      username: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "user",
      profilePicture: null,
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setSuccess(false);

    const { username, email, phone, password, confirmPassword } = form;

    // Basic required fields
    if (!username || !email || !phone || !password || !confirmPassword) {
      setMsg("Please fill in all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMsg("Please enter a valid email address.");
      return;
    }

    if (!/^61\d{7}$/.test(phone)) {
      setMsg("Phone number must be 9 digits and start with 61.");
      return;
    }

    // Password: minimum 6 characters
    if (password.length < 6) {
      setMsg("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();

      // Append each field. If profilePicture is present, append the file.
      data.append("username", username);
      data.append("email", email);
      data.append("phone", phone);
      data.append("password", password);
      data.append("role", form.role);
      if (form.profilePicture) data.append("profilePicture", form.profilePicture);

      const token = localStorage.getItem("token");

      const res = await axios.post(`${API_BASE.replace(/\/$/, "")}/auth/register`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          // NOTE: Do NOT set Content-Type when sending FormData in the browser; axios will handle it.
        },
      });

      if (res.status >= 200 && res.status < 300) {
        setSuccess(true);
        setMsg(res.data?.msg || "User added successfully!");
        resetForm();
      } else {
        setMsg(res.data?.msg || "Failed to add user.");
      }
    } catch (err) {
      console.error(err);
      const serverMsg = err?.response?.data?.msg || err?.message;
      setMsg(serverMsg || "Failed to add user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const uploadsBase = `http://localhost:5000/uploads`;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-800 text-black dark:text-white md:ml-64 text-base">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-neutral-900 shadow-md">
        <h1 className="text-2xl font-bold text-primary">Add New User</h1>

        <div className="flex items-center gap-4">
          <ThemeToggle showForAll={true} />

          <div className="flex items-center border border-primary rounded-full px-1 py-1">
            <div className="text-left mr-4 ml-2">
              <div className="text-sm font-bold">{admin?.username ? admin.username.split(" ")[0] : "Admin"}</div>
              <div className="text-xs text-gray-500 dark:text-gray-300">Admin</div>
            </div>

            <img
              src={`${uploadsBase}/${admin.profilePicture || "default.png"}`}
              alt="Admin"
              className="w-10 h-10 rounded-full object-cover border"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxNkMyMy4zIDEzIDI2IDEzIDI2IDIyQzI2IDI2IDIzLjMgMjggMjAgMjhDMTYuNyAyOCAxNCAyNiAxNCAyMkMxNCAxOSAxNi43IDE2IDIwIDE2WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTIgMzJDMTIgMjggMTUgMjUgMTkgMjVIMjFDMjUgMjUgMjggMjggMjggMzJWMzZIMTJWMzJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
              }}
            />
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto bg-white dark:bg-neutral-900 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-3xl font-bold text-center text-primary mb-6">Create New User</h2>

          {msg && (
            <div className={`p-4 rounded-lg text-center font-medium ${
              success 
                ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700" 
                : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700"
            }`}>
              {msg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Full Name *
              </label>
              <input
                name="username"
                type="text"
                placeholder="Enter full name"
                value={form.username}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:focus:border-primary transition-colors placeholder-gray-500 dark:placeholder-gray-400"
                autoComplete="name"
                aria-label="Full name"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email Address *
              </label>
              <input
                name="email"
                type="email"
                placeholder="Enter email address"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:focus:border-primary transition-colors placeholder-gray-500 dark:placeholder-gray-400"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Phone Number *
              </label>
              <input
                name="phone"
                type="text"
                placeholder="9 digits starting with 61"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:focus:border-primary transition-colors placeholder-gray-500 dark:placeholder-gray-400"
                autoComplete="tel"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                User Role *
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:focus:border-primary transition-colors"
                aria-label="Role"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Password *
              </label>
              <input
                name="password"
                type="password"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:focus:border-primary transition-colors placeholder-gray-500 dark:placeholder-gray-400"
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password *
              </label>
              <input
                name="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:focus:border-primary transition-colors placeholder-gray-500 dark:placeholder-gray-400"
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Profile Picture (Optional)
            </label>
            <div className="relative">
              <input
                name="profilePicture"
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="w-full p-3 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary dark:focus:border-primary transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-600"
                aria-label="Profile picture"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Adding User...</span>
              </div>
            ) : (
              "Create User"
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
