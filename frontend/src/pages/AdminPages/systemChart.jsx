import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Moon, Sun } from "lucide-react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels'; 

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

export default function SystemChart() {
    const [charts, setCharts] = useState([]);
    const [admin, setAdmin] = useState({});
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const storedAdmin = JSON.parse(localStorage.getItem("admin"));
        if (storedAdmin) setAdmin(storedAdmin);
        fetchChartData();
    }, []);

    const fetchChartData = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No token found");
                return;
            }
            
            const res = await axios.get("http://localhost:5000/api/predictions/stats", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data;
            console.log("Fetched prediction stats:", data);

            const preparedCharts = [
                {
                    title: "Total Predictions",
                    labels: ["Total Predictions"],
                    values: [data.total],
                    colors: ["#6366F1"]
                },
                {
                    title: "Average Input Times (hours)",
                    labels: ["Workout", "Reading", "Phone", "Work", "Caffeine", "Relaxation"],
                    values: [
                        data.avgWorkoutTime,
                        data.avgReadingTime,
                        data.avgPhoneTime,
                        data.avgWorkHours,
                        data.avgCaffeineIntake,
                        data.avgRelaxationTime
                    ],
                    colors: ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#22C55E"]
                },
                {
                    title: "Average Sleep Time (Predicted)",
                    labels: ["Sleep Time"],
                    values: [data.avgSleepTime],
                    colors: ["#14B8A6"]
                }
            ];

            setCharts(preparedCharts);
        } catch (err) {
            console.error("Error fetching prediction stats:", err);
            // Set default empty data as fallback
            setCharts([
                {
                    title: "Total Predictions",
                    labels: ["Total Predictions"],
                    values: [0],
                    colors: ["#6366F1"]
                },
                {
                    title: "Average Input Times (hours)",
                    labels: ["Workout", "Reading", "Phone", "Work", "Caffeine", "Relaxation"],
                    values: [0, 0, 0, 0, 0, 0],
                    colors: ["#6366F1", "#8B5CF6", "#EC4899", "#F43F5E", "#F59E0B", "#10B981"]
                },
                {
                    title: "Average Predicted Sleep Time",
                    labels: ["Average Sleep Time"],
                    values: [0],
                    colors: ["#3B82F6"]
                }
            ]);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        axios
            .get("http://localhost:5000/api/profile", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => setAdmin(res.data))
            .catch((err) => console.error("Error loading profile", err));
    }, []);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle("dark");
    };

    if (!charts.length) return <main className="ml-64 p-6">Loading Charts...</main>;

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-neutral-800 text-black dark:text-white md:ml-64 text-2xl">
            <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-neutral-800 shadow-md">
                <h1 className="font-bold text-primary">Sleep System Chart</h1>
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
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxNkMyMy4zIDEzIDI2IDEzIDI2IDIyQzI2IDI2IDIzLjMgMjggMjAgMjhDMTYuNyAyOCAxNCAyNiAxNCAyMkMxNCAxOSAxNi43IDE2IDIwIDE2WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTIgMzJDMTIgMjggMTUgMjUgMTkgMjVIMjFDMjUgMjUgMjggMjggMjggMzJWMzZIMTJWMzJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
                            }}
                        />
                    </div>
                </div>
            </header>

            <main className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {charts.slice(0, 2).map((chart, index) => (
                        <section
                            key={index}
                            className="bg-white dark:bg-neutral-800 p-6 mb-6 rounded-xl shadow-md"
                        >
                            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                                {chart.title}
                            </h2>
                            <div className="h-80">
                                <Bar
                                    data={{
                                        labels: chart.labels,
                                        datasets: [
                                            {
                                                label: chart.title,
                                                data: chart.values,
                                                backgroundColor: chart.colors,
                                            borderRadius: 6,
                                            borderWidth: 1,
                                            borderColor: chart.colors,
                                            },
                                        ],
                                    }}
                                options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    datalabels: {
                                        display: true,
                                        color: darkMode ? '#fff' : '#000',
                                        anchor: 'end',
                                        align: 'end',
                                        font: {
                                            weight: 'bold',
                                            size: 14
                                        },
                                        formatter: (value) => value > 0 ? Number(value).toFixed(1) : '',
                                    },
                                    legend: {
                                        labels: {
                                            color: darkMode ? "#fff" : "#000",
                                            font: {
                                                weight: "bold",
                                                size: 14,
                                            },
                                        },
                                        position: 'top',
                                    },
                                    tooltip: {
                                        backgroundColor: darkMode ? "rgba(50, 50, 50, 0.8)" : "rgba(255, 255, 255, 0.8)",
                                        bodyColor: darkMode ? "#fff" : "#000",
                                        titleColor: darkMode ? "#fff" : "#000",
                                        borderColor: darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)",
                                        borderWidth: 1,
                                        padding: 10,
                                        cornerRadius: 6,
                                        displayColors: true,
                                        usePointStyle: true,
                                        callbacks: {
                                            label: (context) => `Value: ${Number(context.raw).toFixed(2)}`
                                        }
                                    },
                                },
                                scales: {
                                    x: {
                                        grid: {
                                            color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                                        },
                                        ticks: {
                                            color: darkMode ? '#fff' : '#000',
                                            font: {
                                                size: 12,
                                            },
                                            maxRotation: 45,
                                            minRotation: 45
                                        },
                                    },
                                    y: {
                                        grid: {
                                            color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                                        },
                                        ticks: {
                                            color: darkMode ? '#fff' : '#000',
                                            font: {
                                                size: 12,
                                            },
                                            callback: (value) => Number(value).toFixed(1)
                                        },
                                        beginAtZero: true,
                                    },
                                },
                            }}
                        />
                    </div>
                </section>
                ))}
                </div>
                
                {charts.length > 2 && (
                    <section
                        className="bg-white dark:bg-neutral-800 p-6 mb-6 rounded-xl shadow-md"
                    >
                        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                            {charts[2].title}
                        </h2>
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                This chart shows the average predicted sleep time for users based on their activity data.
                            </p>
                        </div>
                        <div className="h-96">
                            <Bar
                                data={{
                                    labels: charts[2].labels,
                                    datasets: [
                                        {
                                            label: charts[2].title,
                                            data: charts[2].values,
                                            backgroundColor: charts[2].colors,
                                            borderRadius: 6,
                                            borderWidth: 1,
                                            borderColor: charts[2].colors,
                                        },
                                    ],
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        datalabels: {
                                            display: true,
                                            color: darkMode ? '#fff' : '#000',
                                            anchor: 'end',
                                            align: 'end',
                                            font: {
                                                weight: 'bold',
                                                size: 14
                                            },
                                            formatter: (value) => value > 0 ? Number(value).toFixed(1) : '',
                                        },
                                        legend: {
                                            labels: {
                                                color: darkMode ? "#fff" : "#000",
                                                font: {
                                                    weight: "bold",
                                                    size: 14,
                                                },
                                            },
                                            position: 'top',
                                        },
                                        tooltip: {
                                            backgroundColor: darkMode ? "rgba(50, 50, 50, 0.8)" : "rgba(255, 255, 255, 0.8)",
                                            bodyColor: darkMode ? "#fff" : "#000",
                                            titleColor: darkMode ? "#fff" : "#000",
                                            callbacks: {
                                                label: (context) => `Value: ${Number(context.raw).toFixed(2)}`
                                            }
                                        },
                                    },
                                    scales: {
                                        x: {
                                            grid: {
                                                color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                                            },
                                            ticks: {
                                                color: darkMode ? '#fff' : '#000',
                                                font: {
                                                    size: 12,
                                                },
                                                maxRotation: 45,
                                                minRotation: 45
                                            },
                                        },
                                        y: {
                                            grid: {
                                                color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                                            },
                                            ticks: {
                                                color: darkMode ? '#fff' : '#000',
                                                font: {
                                                    size: 12,
                                                },
                                                callback: (value) => Number(value).toFixed(1)
                                            },
                                            beginAtZero: true,
                                        },
                                    },
                                }}
                            />
                        </div>
                    </section>
                )}
            </main>

        </div>
    );
}
