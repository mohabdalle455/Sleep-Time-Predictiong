// // src/auth/Login.jsx
// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { API_BASE } from "../config/config";

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [message, setMessage] = useState({ text: "", type: "" });

//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setMessage({ text: "", type: "" });

//     try {
//       const res = await fetch(`${API_BASE}/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         const { token, user } = data;
//         localStorage.setItem("token", token);
//         localStorage.setItem("role", user.role);
//         localStorage.setItem("userEmail", user.email);
//         localStorage.setItem("userId", user.id); 

//         setMessage({ text: "Login successful!", type: "success" });

//         setTimeout(() => {
//           navigate(user.role === "admin" ? "/admin/admindash" : "/");
//         }, 1500);
//       } else {
//         if (res.status === 403) {
//           setMessage({
//             text: "Your account is inactive. Please contact the administrator.",
//             type: "error",
//           });
//         } else if (res.status === 401) {
//           setMessage({
//             text: "Please verify your email before logging in.",
//             type: "error",
//           });
//         } else {
//           setMessage({ text: data.msg || "Login failed", type: "error" });
//         }
//       }
//     } catch (err) {
//       setMessage({ text: "Server error", type: "error" });
//     }
//   };


//   return (
//     <div className="min-h-screen flex items-center justify-center bg-primary-900 text-2xl">
//       <div className="w-full max-w-sm bg-[#111] rounded-xl p-6 shadow-lg space-y-6 text-white">
//         <div>
//           <h1 className="text-2xl font-bold text-center">Login to your account</h1>
//           <p className="text-sm text-gray-400 text-center mt-1">
//             Enter your email and password below.
//           </p>
//         </div>

//         <form onSubmit={handleLogin} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium mb-1">Email</label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               className="w-full px-3 py-2 rounded-md bg-primary-900 border border-gray-700 placeholder-black text-white focus:outline-none focus:ring-2 focus:ring-primary"
//               placeholder="you@example.com"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1">Password</label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               className="w-full px-3 py-2 rounded-md bg-primary-900 border border-gray-700 placeholder-black text-white focus:outline-none focus:ring-2 focus:ring-primary"
//               placeholder="••••••••"
//             />
//             <p className="text-right text-sm text-gray-400">
//               Forgot password?{" "}
//               <Link to="/request-reset" className="text-primary hover:underline">
//                 Reset here
//               </Link>
//             </p>
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-primary hover:bg-primary-600 text-white font-semibold py-2 rounded-md transition"
//           >
//             Login
//           </button>
//         </form>

//         {message.text && (
//           <p
//             className={`text-sm text-center font-medium ${message.type === "success" ? "text-green-400" : "text-red-400"
//               }`}
//           >
//             {message.text}
//           </p>
//         )}


//         <p className="text-center text-sm text-gray-400">
//           Don't have an account?{" "}
//           <Link to="/register" className="text-primary hover:underline">
//             Register
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Login;



// Login.jsx with Gmail OTP verification before login
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE } from "../config/config";
import ThemeToggle from "../ThemeToggle";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("login"); // 'login' | 'verify'
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch(`http://localhost:5000/api/login-otp/login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: "OTP sent to your email.", type: "success" });
        localStorage.setItem("pendingEmail", email);
        localStorage.setItem("pendingPassword", password);
        setStep("verify");
      } else {
        setMessage({ text: data.msg || "Login failed", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Server error", type: "error" });
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const email = localStorage.getItem("pendingEmail");
    const password = localStorage.getItem("pendingPassword");

    try {
      const res = await fetch(`http://localhost:5000/api/login-otp/verify-login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        const { token, user } = data;
        localStorage.setItem("token", token);
        localStorage.setItem("role", user.role);
        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("userId", user.id);

        setMessage({ text: "Login successful!", type: "success" });
        localStorage.removeItem("pendingEmail");
        localStorage.removeItem("pendingPassword");

        // Redirect admin users directly to dashboard, others to home
        if (user.role === "admin") {
          navigate("/admin/admindash");
        } else {
          setTimeout(() => {
            navigate("/");
          }, 1500);
        }
      } else {
        setMessage({ text: data.msg || "Invalid OTP", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Server error", type: "error" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-900 dark:bg-neutral-900 text-2xl transition-colors duration-300">
      {/* Theme Toggle in top-right corner */}
      <div className="absolute top-4 right-4">
        <ThemeToggle showForAll={true} />
      </div>
      
      <div className="w-full max-w-sm bg-[#111] dark:bg-neutral-800 rounded-xl p-6 shadow-lg space-y-6 text-white dark:text-white">
        <div>
          <h1 className="text-2xl font-bold text-center">Login to your account</h1>
          <p className="text-sm text-gray-400 text-center mt-1">
            {step === "login" ? "Enter your email and password below." : "Enter the OTP sent to your email."}
          </p>
        </div>

        {step === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-md bg-primary-900 dark:bg-neutral-700 border border-gray-700 dark:border-gray-600 placeholder-black dark:placeholder-gray-400 text-white dark:text-white"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-md bg-primary-900 border border-gray-700 placeholder-black text-white"
                placeholder="••••••••"
              />
              <p className="text-right text-sm text-gray-400">
                Forgot password? <Link to="/request-reset" className="text-primary hover:underline">Reset here</Link>
              </p>
            </div>
            <button type="submit" className="w-full bg-primary hover:bg-primary-600 text-white py-2 rounded-md transition">Login</button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">OTP Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-md bg-primary-900 dark:bg-neutral-700 border border-gray-700 dark:border-gray-600 placeholder-black dark:placeholder-gray-400 text-white dark:text-white"
                placeholder="Enter OTP"
              />
            </div>
            <button type="submit" className="w-full bg-primary hover:bg-primary-600 text-white py-2 rounded-md transition">Verify OTP</button>
          </form>
        )}

        {message.text && (
          <p className={`text-sm text-center font-medium ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
            {message.text}
          </p>
        )}

        {/* {step === "login" && (
          <p className="text-center text-sm text-gray-400">
            Don't have an account? <Link to="/register" className="text-primary hover:underline">Register</Link>
          </p>
        )} */}
      </div>
    </div>
  );
};

export default Login;