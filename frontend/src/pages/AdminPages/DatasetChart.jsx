import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Moon, Sun } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ChartDataLabels);

const DatasetVisualizer = () => {
  const [data, setData] = useState([]);
  const [admin, setAdmin] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState("workoutTime");
  const [showChart, setShowChart] = useState(true);

  const numericColumns = [
    "workoutTime", "readingTime", "phoneTime",
    "workHours", "caffeineIntake", "relaxationTime"
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }
    
    axios.get("http://localhost:5000/api/predictions/all", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        setData(res.data);
        console.log("Fetched prediction data:", res.data);
      })
      .catch((err) => {
        console.error("Error fetching predictions:", err);
        // Set empty data array as fallback
        setData([]);
      });
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

  const bins = {
    workoutTime: [0, 1, 2, 3, 4, 5, 6],
    readingTime: [0, 1, 2, 3, 4, 5, 6],
    phoneTime: [0, 2, 4, 6, 8, 10, 12],
    workHours: [0, 4, 8, 10, 12, 14, 16],
    caffeineIntake: [0, 1, 2, 3, 4, 5],
    relaxationTime: [0, 1, 2, 3, 4, 5]
  };

  const getHistogram = (col) => {
    if (!data || data.length === 0) {
      console.warn("No data available for histogram");
      return { labels: [], values: [] };
    }
    
    const columnData = data.map((row) => parseFloat(row[col])).filter((v) => !isNaN(v));
    console.log(`Column data for ${col}:`, columnData);
    
    const binCounts = new Array(bins[col].length - 1).fill(0);

    columnData.forEach((value) => {
      for (let i = 0; i < bins[col].length - 1; i++) {
        if (value >= bins[col][i] && value < bins[col][i + 1]) {
          binCounts[i]++;
          break;
        }
        // Handle the case where value is equal to the maximum bin value
        if (i === bins[col].length - 2 && value === bins[col][i + 1]) {
          binCounts[i]++;
        }
      }
    });

    const labels = bins[col].slice(0, -1).map((bin, index) => `${bin} - ${bins[col][index + 1]}`);
    return { labels, values: binCounts };
  };

  const renderBarChart = (labels, values, label) => {
    // Generate a consistent color palette based on the feature name
    const baseHue = selectedFeature === "workoutTime" ? 200 : 
                   selectedFeature === "readingTime" ? 120 : 
                   selectedFeature === "phoneTime" ? 300 : 
                   selectedFeature === "workHours" ? 40 : 
                   selectedFeature === "caffeineIntake" ? 0 : 170;
    
    const colors = labels.map((_, index) => 
      `hsl(${baseHue + index * 10}, 70%, ${darkMode ? 50 : 60}%)`
    );

    return (
      <Bar
        data={{
          labels,
          datasets: [{
            label,
            data: values,
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 1,
            borderRadius: 4,
          }],
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
              font: { weight: 'bold', size: 14 },
              formatter: (value) => value > 0 ? value : '',
            },
            legend: {
              labels: {
                color: darkMode ? "#fff" : "#000",
                font: { weight: "bold", size: 14 },
              },
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
                label: (context) => `Count: ${context.raw}`
              }
            },
          },
          scales: {
            x: {
              grid: {
                color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
              },
              ticks: {
                color: darkMode ? "#fff" : "#000",
                font: { size: 12 },
              },
            },
            y: {
              grid: {
                color: darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
              },
              ticks: {
                color: darkMode ? "#fff" : "#000",
                font: { size: 12 },
                stepSize: 1,
              },
              beginAtZero: true,
            },
          },
        }}
      />
    );
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white md:ml-64 transition-colors duration-300 text-2xl">
      <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-neutral-800 shadow-md">
        <h1 className="text-2xl font-bold text-primary">Sleep Dataset Visualizer</h1>
        <div className="flex items-center gap-4">
          <button onClick={toggleDarkMode}
            className="p-2 rounded-full bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 transition"
            title="Toggle Theme">
            {darkMode ? (<Sun className="text-yellow-400 w-6 h-6" />) : (<Moon className="text-neutral-800 dark:text-white w-6 h-6" />)}
          </button>
          <div className="flex items-center justify-between border border-primary rounded-full px-1 py-1 w-fit">
            <div className="text-left mr-4 ml-2">
              <div className="text-sm font-bold">{admin.username?.split(" ")[0]}</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-300">Admin</div>
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
        <section className="bg-white dark:bg-neutral-900 border border-primary dark:border-neutral-700 rounded-lg shadow-md p-6 mb-10">
          <h2 className="font-semibold text-primary dark:text-white mb-4">Sleep Feature Distribution</h2>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <select
              value={selectedFeature}
              onChange={(e) => {
                setSelectedFeature(e.target.value);
                setShowChart(true);
              }}
              className="p-2 border border-neutral-300 dark:border-neutral-600 rounded-md w-full md:w-2/3 bg-white dark:bg-neutral-800 text-black dark:text-white"
            >
              {numericColumns.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              This chart shows the distribution of {selectedFeature} values across all sleep predictions. 
              Each bar represents the count of records within a specific range.
            </p>
          </div>
          
          <div className="h-96">
            {showChart && selectedFeature && (() => {
              const { labels, values } = getHistogram(selectedFeature);
              return labels.length > 0 ? 
                renderBarChart(labels, values, `${selectedFeature} Distribution`) : 
                <div className="flex items-center justify-center h-full text-gray-500">No data available for this feature</div>;
            })()}
          </div>
        </section>
      </main>
    </div>
  );
};

export default DatasetVisualizer;
