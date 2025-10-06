// AdminSystemReport.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Sun, Moon, BarChart2, UserPlus, Users, Eye } from "lucide-react";

const AdminSystemReport = () => {
    const [overview, setOverview] = useState({});
    const [dailyReport, setDailyReport] = useState([]);
    const [monthlyReport, setMonthlyReport] = useState([]);
    const [filteredMonthlyReport, setFilteredMonthlyReport] = useState([]);
    const [admin, setAdmin] = useState({});
    const [darkMode, setDarkMode] = useState(false);

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterColumn, setFilterColumn] = useState("");
    const [filterValue, setFilterValue] = useState("");

    const [dailyPage, setDailyPage] = useState(1);
    const [monthlyPage, setMonthlyPage] = useState(1);
    const rowsPerPage = 10;
    const [showChart, setShowChart] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const months = Array.from({ length: 12 }, (_, i) =>
        new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(0, i))
    );

   const createRanges = (ranges) =>
  ranges.map(([min, max]) => ({
    label: max === Infinity ? `${min}+` : `${min}-${max}`,
    min,
    max,
  }));

// Define appropriate ranges for your sleep prediction features
const workoutTimeRanges = createRanges([[0, 1], [1, 2], [2, 3], [3, 4], [4, Infinity]]);
const readingTimeRanges = createRanges([[0, 1], [1, 2], [2, 3], [3, 4], [4, Infinity]]);
const phoneTimeRanges = createRanges([[0, 1], [1, 2], [2, 3], [3, 4], [4, Infinity]]);
const workHoursRanges = createRanges([[0, 4], [4, 6], [6, 8], [8, 10], [10, Infinity]]);
const caffeineIntakeRanges = createRanges([[0, 50], [50, 100], [100, 200], [200, 500], [500, Infinity]]);
const relaxationTimeRanges = createRanges([[0, 1], [1, 2], [2, 3], [3, 4], [4, Infinity]]);
const sleepTimeRanges = createRanges([[0, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, Infinity]]);

const getRangeLabel = (value, ranges) => {
  const range = ranges.find((r) => value >= r.min && value < r.max);
  return range ? range.label : value;
};

const rangeMap = {
  workoutTime: workoutTimeRanges,
  readingTime: readingTimeRanges,
  phoneTime: phoneTimeRanges,
  workHours: workHoursRanges,
  caffeineIntake: caffeineIntakeRanges,
  relaxationTime: relaxationTimeRanges,
  prediction: sleepTimeRanges,
};

const getSleepQualityLabel = (predictionHours) => {
  const hours = parseFloat(predictionHours);
  if (hours >= 7 && hours <= 9) {
    return 'Good Sleep';
  } else if ((hours >= 6 && hours < 7) || (hours > 9 && hours <= 10)) {
    return 'Normal Sleep';
  } else {
    return 'Poor Sleep';
  }
};

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [overviewRes, dailyRes, monthlyRes] = await Promise.all([
                    axios.get("http://localhost:5000/api/report/overview"),
                    axios.get("http://localhost:5000/api/report/predictions/daily"),
                    axios.get("http://localhost:5000/api/report/predictions/monthly"),
                ]);

                setOverview(overviewRes.data);
                setDailyReport(dailyRes.data);
                setMonthlyReport(monthlyRes.data);
            } catch (error) {
                console.error("Error loading report data:", error);
            }
        };

        fetchData();
    }, []);

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
        const filtered = monthlyReport.filter((item) => {
            const created = new Date(item.createdAt);
            const matchesMonth = created.getMonth() + 1 === Number(selectedMonth);
            const matchesSearch = item.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase());

            let matchesFilter = true;
            if (filterColumn && filterValue !== "") {
                const selectedRanges = rangeMap[filterColumn];
                if (selectedRanges) {
                    const selected = selectedRanges.find(r => r.label === filterValue);
                    if (selected) {
                        matchesFilter = item[filterColumn] >= selected.min && item[filterColumn] < selected.max;
                    }
                } else {
                    matchesFilter = String(item[filterColumn]) === filterValue;
                }
            }

            return matchesMonth && matchesSearch && matchesFilter;
        });

        setFilteredMonthlyReport(filtered);
    }, [monthlyReport, selectedMonth, searchTerm, filterColumn, filterValue]);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle("dark");
    };

    const paginatedDaily = dailyReport.slice((dailyPage - 1) * rowsPerPage, dailyPage * rowsPerPage);
    const paginatedMonthly = filteredMonthlyReport.slice((monthlyPage - 1) * rowsPerPage, monthlyPage * rowsPerPage);

    const handleShowChart = (item) => {
        setSelectedItem(item);
        setShowChart(true);
    };

    const handleCloseChart = () => {
        setShowChart(false);
        setSelectedItem(null);
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-neutral-900 text-black dark:text-white md:ml-64 transition-colors duration-300 text-2xl">
            <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-neutral-800 shadow-md">
                <h1 className="text-2xl font-bold text-primary">Report</h1>
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-neutral-700 dark:hover:bg-gray-600 transition"
                        title="Toggle Theme"
                    >
                        {darkMode ? (
                            <Sun className="text-yellow-400 w-6 h-6" />
                        ) : (
                            <Moon className="text-gray-800 dark:text-white w-6 h-6" />
                        )}
                    </button>
                    <div className="flex items-center justify-between border border-primary rounded-full px-1 py-1 w-fit">
                        <div className=" text-left mr-4 ml-2">
                             <div className="text-sm font-bold">{admin.username?.split(" ")[0]}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-300">Admin</div>
                        </div>
                        <img
                            src={`http://localhost:5000/uploads/${admin.profilePicture || "default.png"}`}
                            alt="Admin"
                            className="w-10 h-10 rounded-full object-cover border"
                            onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxNkMyMy4zIDEzIDI2IDEzIDI2IDIyQzI2IDI2IDIzLjMgMjggMjAgyOEMxNi43IDI4IDE0IDI2IDE0IDIyQzE0IDE5IDE2LjcgMTYgMjAIDE2WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTIgMzJDMTIgMjggMTUgMjUgMTkgMjVIMjFDMjUgMjUgMjggMjggMjggMzJWMzZIMTJWMzJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
                            }}
                        />
                    </div>
                </div>
            </header>

            <main className="p-6 space-y-7">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-blue-600 text-white p-4 rounded-lg shadow flex items-center justify-between">
                        <div>
                            <h3 className=" font-medium">Daily Predictions</h3>
                            <p className="text-2xl font-bold">{overview.dailyPredictions}</p>
                        </div>
                        <BarChart2 className="w-8 h-8" />
                    </div>
                    <div className="bg-blue-600 text-white p-4 rounded-lg shadow flex items-center justify-between">
                        <div>
                            <h3 className=" font-medium">Monthly Predictions</h3>
                            <p className="text-2xl font-bold">{overview.monthlyPredictions}</p>
                        </div>
                        <BarChart2 className="w-8 h-8" />
                    </div>
                    <div className="bg-green-700 text-white p-4 rounded-lg shadow flex items-center justify-between">
                        <div>
                            <h3 className=" font-medium">Daily Users</h3>
                            <p className="text-2xl font-bold">{overview.dailyUsers}</p>
                        </div>
                        <UserPlus className="w-8 h-8" />
                    </div>
                    <div className="bg-green-700 text-white p-4 rounded-lg shadow flex items-center justify-between">
                        <div>
                            <h3 className=" font-medium">Monthly Users</h3>
                            <p className="text-2xl font-bold">{overview.monthlyUsers}</p>
                        </div>
                        <Users className="w-8 h-8" />
                    </div>
                </div>

                {/* Daily Report Table */}
                <section className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Daily Predictions</h2>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Total: {dailyReport.length} predictions
                        </div>
                    </div>
                    <table className="w-full text-left ">
                        <thead>
                            <tr className="bg-gray-200 dark:bg-neutral-800">
                                <th className="py-2 px-4">#</th>
                                <th className="py-2 px-4">User</th>
                                <th className="py-2 px-4">Prediction</th>
                                <th className="py-2 px-4">Quality</th>
                                <th className="py-2 px-4">Date</th>
                                <th className="py-2 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedDaily.map((item, index) => (
                                <tr key={index} className="border-b dark:border-neutral-700">
                                    <td className="py-2 px-4">{(dailyPage - 1) * rowsPerPage + index + 1}</td>
                                    <td className="py-2 px-4">{item.userId?.username || '-'}</td>
                                    <td className="py-2 px-4">{item.prediction} hours</td>
                                    <td className="py-2 px-4">{getSleepQualityLabel(item.prediction)}</td>
                                    <td className="py-2 px-4">{new Date(item.createdAt).toLocaleDateString()}</td>
                                    <td className="py-2 px-4">
                                        <button 
                                            onClick={() => handleShowChart(item)}
                                            className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                            title="View Chart"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex justify-end items-center gap-4 mt-3">
                        <button onClick={() => setDailyPage(p => Math.max(p - 1, 1))} disabled={dailyPage === 1} className="px-3 py-1 border rounded">Previous</button>
                        <span>Page {dailyPage}</span>
                        <button onClick={() => setDailyPage(p => p + 1)} disabled={dailyPage * rowsPerPage >= dailyReport.length} className="px-3 py-1 border rounded">Next</button>
                    </div>
                </section>

                <div className="overflow-x-auto">
                    <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Monthly Prediction Report</h2>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="text"
                                placeholder="Search by user..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="p-2 rounded border border-gray-300 dark:bg-neutral-700 dark:text-white"
                            />
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                className="p-2 rounded border border-gray-300 dark:bg-neutral-700 dark:text-white"
                            >
                                {months.map((month, index) => (
                                    <option key={index + 1} value={index + 1}>{month}</option>
                                ))}
                            </select>
                            <select
                                value={filterColumn}
                                onChange={(e) => {
                                    setFilterColumn(e.target.value);
                                    setFilterValue("");
                                }}
                                className="p-2 rounded border border-gray-300 dark:bg-neutral-700 dark:text-white"
                            >
                                <option value="">Select Column</option>
                                {Object.keys(rangeMap).map((key) => (
                                    <option key={key} value={key}>{key}</option>
                                ))}
                            </select>
                            {filterColumn && rangeMap[filterColumn] && (
                                <select
                                    value={filterValue}
                                    onChange={(e) => setFilterValue(e.target.value)}
                                    className="p-2 rounded border border-gray-300 dark:bg-neutral-700 dark:text-white"
                                >
                                    <option value="">Select Value</option>
                                    {rangeMap[filterColumn].map((range) => (
                                        <option key={range.label} value={range.label}>{range.label}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left ">
                            <thead>
                                <tr className="bg-gray-200 dark:bg-neutral-800">
                                    <th className="py-2 px-4">#</th>
                                    <th className="py-2 px-4">User</th>
                                    {filterColumn && filterColumn !== "prediction" && (
                                        <th className="py-2 px-4 capitalize">{filterColumn}</th>
                                    )}
                                    <th className="py-2 px-4">Prediction</th>
                                    <th className="py-2 px-4">Quality</th>
                                    <th className="py-2 px-4">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedMonthly.map((item, index) => (
                                    <tr key={index} className="border-b dark:border-neutral-700">
                                        <td className="py-2 px-4">{(monthlyPage - 1) * rowsPerPage + index + 1}</td>
                                        <td className="py-2 px-4">{item.userId?.username || '-'}</td>
                                        {filterColumn && filterColumn !== "prediction" && (
                                            <td className="py-2 px-4">
                                                {item[filterColumn]}
                                            </td>
                                        )}
                                        <td className="py-2 px-4">{item.prediction} hours</td>
                                        <td className="py-2 px-4">{getSleepQualityLabel(item.prediction)}</td>
                                        <td className="py-2 px-4">{new Date(item.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="flex justify-end items-center gap-4 mt-3">
                            <button onClick={() => setMonthlyPage(p => Math.max(p - 1, 1))} disabled={monthlyPage === 1} className="px-3 py-1 border rounded">Previous</button>
                            <span>Page {monthlyPage}</span>
                            <button onClick={() => setMonthlyPage(p => p + 1)} disabled={monthlyPage * rowsPerPage >= filteredMonthlyReport.length} className="px-3 py-1 border rounded">Next</button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Chart Modal */}
            {showChart && selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                Prediction Details - {selectedItem.userId?.username || 'Unknown User'}
                            </h3>
                            <button 
                                onClick={handleCloseChart}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div className="bg-gray-50 dark:bg-neutral-700 p-3 rounded">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">Workout Time:</span>
                                    <span className="ml-2 text-gray-900 dark:text-white">{selectedItem.workoutTime || 'N/A'} hours</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-neutral-700 p-3 rounded">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">Reading Time:</span>
                                    <span className="ml-2 text-gray-900 dark:text-white">{selectedItem.readingTime || 'N/A'} hours</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-neutral-700 p-3 rounded">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">Phone Time:</span>
                                    <span className="ml-2 text-gray-900 dark:text-white">{selectedItem.phoneTime || 'N/A'} hours</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-neutral-700 p-3 rounded">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">Work Hours:</span>
                                    <span className="ml-2 text-gray-900 dark:text-white">{selectedItem.workHours || 'N/A'} hours</span>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="bg-gray-50 dark:bg-neutral-700 p-3 rounded">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">Caffeine Intake:</span>
                                    <span className="ml-2 text-gray-900 dark:text-white">{selectedItem.caffeineIntake || 'N/A'} mg</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-neutral-700 p-3 rounded">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">Relaxation Time:</span>
                                    <span className="ml-2 text-gray-900 dark:text-white">{selectedItem.relaxationTime || 'N/A'} hours</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-neutral-700 p-3 rounded">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">Prediction Result:</span>
                                    <span className="ml-2 text-gray-900 dark:text-white font-bold">
                                        {selectedItem.prediction} hours ({getSleepQualityLabel(selectedItem.prediction)})
                                    </span>
                                </div>
                                <div className="bg-gray-50 dark:bg-neutral-700 p-3 rounded">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300">Date:</span>
                                    <span className="ml-2 text-gray-900 dark:text-white">
                                        {new Date(selectedItem.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-6 flex justify-end">
                            <button 
                                onClick={handleCloseChart}
                                className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSystemReport;