// Import necessary libraries and components
import axios from "axios";
import { useEffect, useState } from "react";
import { Users, BarChart3 } from "lucide-react";
import ThemeToggle from "../../ThemeToggle";



const AdminDashboard = () => {
  const [userCount, setUserCount] = useState(0);
  const [predictions, setPredictions] = useState(0);
  const [admin, setAdmin] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios.get("http://localhost:5000/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setAdmin(res.data))
      .catch((err) => console.error("Error loading profile", err));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get("http://localhost:5000/api/total-users");
        setUserCount(userRes.data.total);

        const predictionRes = await axios.get("http://localhost:5000/api/total-predictions");
        setPredictions(predictionRes.data.t_prediction);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchData();
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };



  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-900 text-black dark:text-white md:ml-64 transition-colors duration-300 text-2xl">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-neutral-800 shadow-md">
        <h1 className=" font-bold text-primary">Dashboard</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="flex items-center justify-between border border-primary rounded-full px-1 py-1 w-fit">
            <div className="text-left mr-4 ml-2">
              <div className="text-sm font-bold">{admin.username?.split(" ")[0]}</div>
              <div className="text-xs text-gray-500 dark:text-gray-300">Admin</div>
            </div>
            <img
              src={`http://localhost:5000/uploads/${admin.profilePicture || "default.png"}`}
              alt="Admin"
              className="w-10 h-10 rounded-full object-cover border"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxNkMyMy4zIDEzIDI2IDEzIDI2IDIyQzI2IDI2IDIzLjMgMjggMjAgMjhDMTYuNyAyOCAxNCAyNiAxNCAyMkMxNCAxOSAxNi43IDE2IDIwIDE2WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTIgMzJDMTIgMjggMTUgMjUgMTkgMjVIMjFDMjUgMjUgMjggMjggMjggMzJWMzZIMTJWMzJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
              }}
            />
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[{
            label: "Total Users", value: userCount, Icon: Users
          }, {
            label: "Total Predictions", value: predictions, Icon: BarChart3
          }].map(({ label, value, Icon }, idx) => (
            <div key={idx} className="bg-white dark:bg-neutral-800 shadow rounded-lg p-4 text-center hover:scale-[1.02] transition-transform duration-300">
              <Icon className="w-10 h-10 mx-auto mb-1 text-primary" />
              <p className="text-gray-400">{label}</p>
              <h3 className=" font-bold text-primary dark:text-primary">{value}</h3>
            </div>
          ))}
        </div>

        {/* Welcome Message or Additional Content */}
        <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6 text-center">
          <h2 className="text-3xl font-bold text-primary mb-4">Welcome to Sleep Time Prediction Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Monitor and manage your sleep prediction system. View user statistics and system performance metrics.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
