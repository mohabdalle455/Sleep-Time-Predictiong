// DashboardDescription.jsx (Updated for Sleep Time Prediction)
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import axios from "axios";
import { Moon, Sun } from "lucide-react";
import CorrelationImg from '../../assets/CorrelationMatrixHeatmap.png';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const DashboardDescription = () => {
    const [admin, setAdmin] = useState({});
    const [darkMode, setDarkMode] = useState(false);
    const [data, setData] = useState([]);
    const [selectedColumn, setSelectedColumn] = useState("workoutTime");

    const columns = ["workoutTime", "readingTime", "phoneTime", "workHours", "caffeineIntake", "relaxationTime", "prediction"];

    useEffect(() => {
        const storedTheme = localStorage.getItem("theme");
        if (storedTheme === "dark") {
            setDarkMode(true);
            document.documentElement.classList.add("dark");
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found");
            return;
        }
        
        axios.get("http://localhost:5000/api/predictions", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then((res) => setData(res.data))
            .catch((err) => console.error("Error fetching prediction data", err));
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;
        axios.get("http://localhost:5000/api/profile", {
            headers: { Authorization: `Bearer ${token}` },
        }).then((res) => setAdmin(res.data))
            .catch((err) => console.error("Error loading profile", err));
    }, []);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle("dark");
    };

    const getHistogram = (col, binCount = 10) => {
        const values = data.map((row) => parseFloat(row[col])).filter((v) => !isNaN(v));
        const min = Math.min(...values);
        const max = Math.max(...values);
        const step = (max - min) / binCount;
        const bins = new Array(binCount).fill(0);
        values.forEach(val => {
            const index = Math.min(Math.floor((val - min) / step), binCount - 1);
            bins[index]++;
        });
        return {
            labels: bins.map((_, i) => `${(min + i * step).toFixed(1)}–${(min + (i + 1) * step).toFixed(1)}`),
            values: bins,
        };
    };

    const renderChart = () => {
        const { labels, values } = getHistogram(selectedColumn);
        const colors = labels.map(() => `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`);

        return (
            <div className="overflow-x-auto" style={{ height: "500px" }}>
                <Bar
                    data={{
                        labels,
                        datasets: [{
                            label: `${selectedColumn} Distribution`,
                            data: values,
                            backgroundColor: colors,
                        }],
                    }}
                    options={{
                        responsive: true,
                        plugins: {
                            datalabels: {
                                display: true,
                                color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
                                anchor: 'end',
                                align: 'end',
                                font: {
                                    weight: 'bold',
                                    size: 20,
                                },
                                formatter: (value) => value,
                            },
                            legend: {
                                labels: {
                                    color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
                                    font: {
                                        weight: 'bold',
                                        size: 18,
                                    },
                                },
                            },
                            tooltip: {
                                color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
                            },
                        },
                        scales: {
                            x: {
                                ticks: {
                                    color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
                                    font: { size: 18 },
                                },
                            },
                            y: {
                                ticks: {
                                    color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
                                    font: { size: 18 },
                                },
                            },
                        },
                    }}
                />
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white md:ml-64 transition-colors duration-300 text-2xl">
            <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-neutral-800 shadow-md">
                <h1 className="text-2xl font-bold text-primary">Sleep Dataset Description</h1>
                <div className="flex items-center gap-4">
                    <button onClick={toggleDarkMode} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-neutral-700 dark:hover:bg-gray-600 transition" title="Toggle Theme">
                        {darkMode ? (
                            <Moon className="text-gray-800 dark:text-white w-6 h-6" />
                        ) : (
                            <Sun className="text-yellow-400 w-6 h-6" />
                        )}
                    </button>
                    <div className="flex items-center justify-between border border-primary rounded-full px-1 py-1 w-fit">
                        <div className=" text-left mr-4 ml-2">
                            <div className="text-sm font-bold">{admin.username?.split(" ")[0]}</div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-300">Admin</div>
                        </div>
                        <img
                            src={`http://localhost:5000/uploads/${admin.profilePicture || "default.png"}`}
                            alt="Admin"
                            className="w-10 h-10 rounded-full object-cover border"
                            onError={(e) => {
                                const isDark = document.documentElement.classList.contains('dark');
                                e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`
                                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect width="40" height="40" fill="${isDark ? '#374151' : '#F3F4F6'}"/>
                                        <path d="M20 16C23.3 16.4 26 19.04 26 22.4C26 25.76 23.3 28.4 20 28.4C16.7 28.4 14 25.76 14 22.4C14 19.04 16.7 16.4 20 16Z" fill="${isDark ? '#9CA3AF' : '#6B7280'}"/>
                                        <path d="M12 32C12 28.16 15.16 25 19 25H21C24.84 25 28 28.16 28 32V36H12V32Z" fill="${isDark ? '#9CA3AF' : '#6B7280'}"/>
                                    </svg>
                                `)}`;
                            }}
                        />
                    </div>
                </div>
            </header>

            <main className="bg-gradient-to-br from-neutral-100 to-white dark:from-neutral-900 dark:to-neutral-800 text-black dark:text-white p-6">
                <p className="mb-6 leading-relaxed">
                    This dataset, used for predicting sleep time, includes structured data with continuous variables like phone usage, caffeine intake, work hours, and relaxation time. It enables regression analysis and helps model the expected duration of sleep based on daily habits.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: "Total Predictions", value: data.length },
                        { label: "Features", value: 6 },
                        { label: "Target", value: 1 },
                        { label: "Prediction Field", value: "sleepTime" },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow text-center">
                            <p className="text-primary text-2xl font-bold">{stat.value}</p>
                            <p className="font-semibold text-neutral-700 dark:text-neutral-300">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow text-center">
                    <h2 className="text-3xl font-bold mb-4">Feature Distribution</h2>
                    <div className="flex mb-4">
                        <select
                            className={`border p-2 rounded w-full transition ${darkMode ? "bg-neutral-700 text-white border-neutral-600" : "bg-white text-black border-neutral-300"}`}
                            value={selectedColumn}
                            onChange={(e) => setSelectedColumn(e.target.value)}
                        >
                            {columns.map((col) => (
                                <option key={col} value={col}>{col}</option>
                            ))}
                        </select>
                    </div>
                    {renderChart()}
                </div>

                <div className="bg-white mt-3 dark:bg-neutral-800 rounded-lg p-4 shadow text-center">
                    <h2 className="text-3xl font-bold mb-4">Correlation Heatmap</h2>
                    <img src={CorrelationImg} alt="Correlation Heatmap" className="w-full rounded" />
                </div>
            </main>
        </div>
    );
};

export default DashboardDescription;
