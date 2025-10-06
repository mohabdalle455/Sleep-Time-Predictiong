import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config/config.jsx";
import { useTheme } from "../../hooks/useTheme";
import ThemeToggle from "../../ThemeToggle";

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-colors duration-300">
            <div className="bg-white dark:bg-neutral-800 p-5 rounded-lg w-full max-w-md relative shadow-xl border border-gray-300 dark:border-neutral-700 transition-colors duration-300">
                <button onClick={onClose} className="absolute top-2 right-3 text-xl text-gray-400 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-400 transition-colors duration-300">×</button>
                {children}
            </div>
        </div>
    );
};

const Profile = () => {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [otp, setOtp] = useState("");
    const [tempUpdateData, setTempUpdateData] = useState({});
    const [message, setMessage] = useState("");
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const token = localStorage.getItem("token");

    useEffect(() => {
        axios
            .get(`${API_URL}/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                setUser(res.data);
                setFormData(res.data);
                setImageLoading(false);
                setImageError(false);
            })
            .catch((err) => {
                console.error("Error loading profile", err);
                setImageLoading(false);
                setImageError(true);
            });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert("Please select a valid image file.");
                return;
            }
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                alert("Image size should be less than 5MB.");
                return;
            }
            setFormData((prev) => ({ ...prev, profilePicture: file }));
        }
    };

    const handleSave = () => {
        if (formData.email !== user.email) {
            axios
                .post(`${API_URL}/profileUpdate/request-update-otp`, {
                    email: formData.email,
                    updates: {
                        username: formData.username,
                        phone: formData.phone,
                        profilePicture: formData.profilePicture?.name || "",
                    },
                })
                .then(() => {
                    setTempUpdateData(formData);
                    setIsEditing(false);
                    setIsVerifying(true);
                })
                .catch(() => alert("Failed to send OTP"));
        } else {
            updateProfile(formData);
        }
    };

    const handleOTPVerify = () => {
        axios
            .post(`${API_URL}/profileUpdate/verify-update-otp`, { otp }, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(() => {
                updateProfile(tempUpdateData);
                setIsVerifying(false);
            })
            .catch(() => setMessage("❌ OTP is incorrect or expired."));
    };

    const updateProfile = (data) => {
        const payload = new FormData();
        payload.append("username", data.username);
        payload.append("email", data.email);
        payload.append("phone", data.phone);
        if (data.profilePicture instanceof File) {
            payload.append("profilePicture", data.profilePicture);
        }

        axios
            .put(`${API_URL}/profileUpdate/update`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            })
            .then((response) => {
                // Refresh profile data after successful update
                setUser(response.data);
                setFormData(response.data);
                setIsEditing(false);
                setIsVerifying(false);
                setImageError(false);
                alert("✅ Profile updated successfully!");
            })
            .catch((err) => {
                console.error("Update failed", err);
                alert("❌ Profile update failed. Please try again.");
            });
    };

    // Helper function to get profile image URL
    const getProfileImageUrl = (profilePicture) => {
        if (!profilePicture) return null;
        if (profilePicture instanceof File) {
            return URL.createObjectURL(profilePicture);
        }
        return `http://localhost:5000/uploads/${profilePicture}`;
    };

    // Default avatar SVG
    const getDefaultAvatar = (size = 128) => {
        return `data:image/svg+xml;base64,${btoa(`
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="${size}" height="${size}" fill="${isDark ? '#374151' : '#F3F4F6'}"/>
                <path d="M${size/2} ${size*0.4}C${size*0.58} ${size*0.41} ${size*0.65} ${size*0.476} ${size*0.65} ${size*0.56}C${size*0.65} ${size*0.643} ${size*0.58} ${size*0.71} ${size/2} ${size*0.71}C${size*0.42} ${size*0.71} ${size*0.35} ${size*0.643} ${size*0.35} ${size*0.56}C${size*0.35} ${size*0.476} ${size*0.42} ${size*0.41} ${size/2} ${size*0.4}Z" fill="${isDark ? '#9CA3AF' : '#6B7280'}"/>
                <path d="M${size*0.3} ${size*0.8}C${size*0.3} ${size*0.703} ${size*0.378} ${size*0.625} ${size*0.475} ${size*0.625}H${size*0.525}C${size*0.622} ${size*0.625} ${size*0.7} ${size*0.703} ${size*0.7} ${size*0.8}V${size*0.9}H${size*0.3}V${size*0.8}Z" fill="${isDark ? '#9CA3AF' : '#6B7280'}"/>
            </svg>
        `)}`;
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const handleReset = () => navigate("/request-reset");
    const handleAdmin = () => navigate("/admin/admindash");

    if (!user) return (
        <div className="min-h-screen bg-gray-100 dark:bg-neutral-900 transition-colors duration-300 flex items-center justify-center">
            <div className="text-center py-10 text-gray-600 dark:text-gray-300">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                Loading...
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-neutral-900 transition-colors duration-300 py-4 px-4 text-gray-900 dark:text-white">
            {/* Theme Toggle */}
            <div className="absolute top-4 right-4">
                <ThemeToggle showForAll={true} />
            </div>
            
            <div className="w-full max-w-4xl mx-auto bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center md:items-start gap-6 transition-colors duration-300">
                <div className="flex-shrink-0 w-32 h-32 rounded-full overflow-hidden border-3 border-primary relative">
                    {imageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                    )}
                    <img
                        src={
                            getProfileImageUrl(formData.profilePicture) ||
                            getProfileImageUrl(user.profilePicture) ||
                            getDefaultAvatar(128)
                        }
                        alt="Profile"
                        className="w-full h-full object-cover transition-opacity duration-300"
                        onLoad={() => setImageLoading(false)}
                        onError={(e) => {
                            setImageError(true);
                            setImageLoading(false);
                            e.currentTarget.src = getDefaultAvatar(128);
                        }}
                        style={{ opacity: imageLoading ? 0 : 1 }}
                    />
                </div>

                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">{user.username}</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-1 text-base">{user.email}</p>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 text-base">+{user.phone}</p>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-5 py-2 bg-primary hover:bg-primary-600 text-white rounded-lg shadow-md transition-colors duration-300 font-medium text-sm"
                    >
                        Edit Profile
                    </button>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 max-w-4xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {user.role === "admin" && (
                        <button
                            onClick={handleAdmin}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium shadow-md transition-colors duration-300 text-sm"
                        >
                            Admin Panel
                        </button>
                    )}

                    <button
                        onClick={handleReset}
                        className="bg-amber-600 hover:bg-amber-700 text-white py-2.5 px-4 rounded-lg font-medium shadow-md transition-colors duration-300 text-sm"
                    >
                        Change Password
                    </button>

                    <button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-lg font-medium shadow-md transition-colors duration-300 text-sm"
                    >
                        Logout
                    </button>
                </div>
            </div>



            {/* Edit Modal */}
            <Modal isOpen={isEditing} onClose={() => setIsEditing(false)}>
                <h3 className="text-lg font-bold mb-4 text-primary">Edit Your Profile</h3>
                <div className="space-y-3">
                    {/* Profile Picture Preview */}
                    <div className="flex justify-center mb-3">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-primary relative">
                            <img 
                                src={
                                    getProfileImageUrl(formData.profilePicture) ||
                                    getProfileImageUrl(user.profilePicture) ||
                                    getDefaultAvatar(80)
                                }
                                alt="Profile Preview" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = getDefaultAvatar(80);
                                }}
                            />
                        </div>
                    </div>
                    
                    <input
                        type="text"
                        name="username"
                        placeholder="Full Name"
                        value={formData.username || ""}
                        onChange={handleChange}
                        className="w-full p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-black dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-300 text-sm"
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email || ""}
                        onChange={handleChange}
                        className="w-full p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-black dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-300 text-sm"
                    />
                    <input
                        type="text"
                        name="phone"
                        placeholder="Phone Number"
                        value={formData.phone || ""}
                        onChange={handleChange}
                        className="w-full p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-black dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-300 text-sm"
                    />
                    
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Profile Picture
                        </label>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/jpg"
                            onChange={handleFileChange}
                            className="w-full p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-black dark:text-white border border-gray-300 dark:border-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary file:text-white hover:file:bg-primary-600 transition-colors duration-300 text-sm"
                        />
                    </div>
                    
                    <button
                        onClick={handleSave}
                        className="w-full mt-3 bg-primary hover:bg-primary-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors duration-300 text-sm"
                    >
                        Save Changes
                    </button>
                </div>
            </Modal>

            {/* OTP Modal */}
            <Modal isOpen={isVerifying} onClose={() => setIsVerifying(false)}>
                <h3 className="text-lg font-bold mb-4 text-primary">Enter OTP to Confirm</h3>
                <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 text-black dark:text-white border border-gray-300 dark:border-gray-600 mb-3 focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-300 text-sm"
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                />
                {message && <p className="text-red-500 dark:text-red-400 text-sm mb-3">{message}</p>}
                <button
                    onClick={handleOTPVerify}
                    className="w-full bg-primary hover:bg-primary-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors duration-300 text-sm"
                >
                    Verify & Update
                </button>
            </Modal>
        </div>
    );
};

export default Profile;
