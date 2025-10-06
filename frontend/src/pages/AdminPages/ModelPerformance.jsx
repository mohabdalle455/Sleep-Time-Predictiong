import { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Radar } from "react-chartjs-2";
import { Moon, Sun } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement,
  RadialLinearScale,
  Filler,
  Tooltip, 
  Legend,
  ChartDataLabels
);

const ModelPerformance = () => {
  const [admin, setAdmin] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [metrics, setMetrics] = useState({
    accuracy: 0.92,
    precision: 0.89,
    recall: 0.94,
    f1Score: 0.91,
    confusionMatrix: {
      truePositive: 150,
      falsePositive: 18,
      trueNegative: 180,
      falseNegative: 10
    }
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios.get("http://localhost:5000/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => setAdmin(res.data))
      .catch((err) => console.error("Error loading profile", err));
  }, []);

  // In a real application, you would fetch the model metrics from the backend
  // useEffect(() => {
  //   axios.get("http://localhost:5000/api/model-performance")
  //     .then((res) => setMetrics(res.data))
  //     .catch((err) => console.error("Error fetching model performance:", err));
  // }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const barChartData = {
    labels: ["Accuracy", "Precision", "Recall", "F1 Score"],
    datasets: [{
      label: "Model Performance Metrics",
      data: [metrics.accuracy, metrics.precision, metrics.recall, metrics.f1Score],
      backgroundColor: ["#6366f1", "#10b981", "#f59e0b", "#ef4444"],
      borderWidth: 1,
    }],
  };

  const radarChartData = {
    labels: ["Accuracy", "Precision", "Recall", "F1 Score", "Specificity"],
    datasets: [{
      label: "Model Performance",
      data: [
        metrics.accuracy, 
        metrics.precision, 
        metrics.recall, 
        metrics.f1Score,
        metrics.confusionMatrix.trueNegative / (metrics.confusionMatrix.trueNegative + metrics.confusionMatrix.falsePositive)
      ],
      backgroundColor: "rgba(99, 102, 241, 0.2)",
      borderColor: "#6366f1",
      borderWidth: 2,
      pointBackgroundColor: "#6366f1",
      pointBorderColor: "#fff",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: "#6366f1",
    }],
  };

  const confusionMatrixData = {
    labels: ["True Positive", "False Positive", "True Negative", "False Negative"],
    datasets: [{
      label: "Confusion Matrix",
      data: [
        metrics.confusionMatrix.truePositive,
        metrics.confusionMatrix.falsePositive,
        metrics.confusionMatrix.trueNegative,
        metrics.confusionMatrix.falseNegative
      ],
      backgroundColor: ["#10b981", "#f59e0b", "#6366f1", "#ef4444"],
      borderWidth: 1,
    }],
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white md:ml-64 transition-colors duration-300 text-2xl">
      <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-neutral-800 shadow-md">
        <h1 className="text-2xl font-bold text-primary">Model Performance Metrics</h1>
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
        {/* Performance Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Accuracy", value: (metrics.accuracy * 100).toFixed(1) + "%", color: "bg-indigo-500" },
            { label: "Precision", value: (metrics.precision * 100).toFixed(1) + "%", color: "bg-emerald-500" },
            { label: "Recall", value: (metrics.recall * 100).toFixed(1) + "%", color: "bg-amber-500" },
            { label: "F1 Score", value: (metrics.f1Score * 100).toFixed(1) + "%", color: "bg-red-500" }
          ].map((metric, idx) => (
            <div key={idx} className="bg-white dark:bg-neutral-800 shadow rounded-lg p-4 text-center hover:scale-[1.02] transition-transform duration-300">
              <div className={`w-10 h-10 mx-auto mb-1 rounded-full ${metric.color} flex items-center justify-center text-white`}>
                {metric.value.slice(0, 2)}
              </div>
              <p className="text-gray-400">{metric.label}</p>
              <h3 className="font-bold text-primary dark:text-primary">{metric.value}</h3>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Bar Chart */}
          <div className="bg-white dark:bg-neutral-800 shadow rounded p-4">
            <h3 className="font-semibold mb-4 text-center">Performance Metrics</h3>
            <Bar
              data={barChartData}
              options={{
                responsive: true,
                plugins: {
                  datalabels: {
                    display: true,
                    color: darkMode ? '#000' : '#fff',
                    anchor: 'end',
                    align: 'end',
                    font: { weight: 'bold', size: 16 },
                    formatter: (value) => (value * 100).toFixed(1) + '%',
                  },
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.dataset.label}: ${(context.raw * 100).toFixed(1)}%`,
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 1,
                    ticks: {
                      color: darkMode ? "#fff" : "#000",
                      callback: (value) => (value * 100) + '%',
                    },
                  },
                  x: {
                    ticks: {
                      color: darkMode ? "#fff" : "#000",
                    },
                  },
                },
              }}
            />
          </div>

          {/* Radar Chart */}
          <div className="bg-white dark:bg-neutral-800 shadow rounded p-4">
            <h3 className="font-semibold mb-4 text-center">Performance Radar</h3>
            <Radar
              data={radarChartData}
              options={{
                responsive: true,
                plugins: {
                  datalabels: {
                    display: false,
                  },
                  legend: {
                    labels: {
                      color: darkMode ? "#fff" : "#000",
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.dataset.label}: ${(context.raw * 100).toFixed(1)}%`,
                    },
                  },
                },
                scales: {
                  r: {
                    angleLines: {
                      color: darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
                    },
                    grid: {
                      color: darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
                    },
                    pointLabels: {
                      color: darkMode ? "#fff" : "#000",
                      font: {
                        size: 14,
                      },
                    },
                    ticks: {
                      backdropColor: "transparent",
                      color: darkMode ? "#fff" : "#000",
                      callback: (value) => (value * 100) + '%',
                    },
                    suggestedMin: 0,
                    suggestedMax: 1,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Confusion Matrix */}
        <div className="bg-white dark:bg-neutral-800 shadow rounded p-4 mb-6">
          <h3 className="font-semibold mb-4 text-center">Confusion Matrix</h3>
          <Bar
            data={confusionMatrixData}
            options={{
              responsive: true,
              plugins: {
                datalabels: {
                  display: true,
                  color: '#fff',
                  font: { weight: 'bold', size: 16 },
                },
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    color: darkMode ? "#fff" : "#000",
                  },
                },
                x: {
                  ticks: {
                    color: darkMode ? "#fff" : "#000",
                  },
                },
              },
            }}
          />
        </div>

        {/* Explanation Section */}
        <div className="bg-white dark:bg-neutral-800 shadow rounded p-6">
          <h3 className="font-semibold mb-4">Understanding Model Performance Metrics</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-primary">Accuracy</h4>
              <p className="text-base">The proportion of correct predictions (both true positives and true negatives) among the total number of cases examined.</p>
            </div>
            
            <div>
              <h4 className="font-medium text-primary">Precision</h4>
              <p className="text-base">The proportion of true positive predictions among all positive predictions. High precision indicates a low false positive rate.</p>
            </div>
            
            <div>
              <h4 className="font-medium text-primary">Recall (Sensitivity)</h4>
              <p className="text-base">The proportion of true positive predictions among all actual positives. High recall indicates a low false negative rate.</p>
            </div>
            
            <div>
              <h4 className="font-medium text-primary">F1 Score</h4>
              <p className="text-base">The harmonic mean of precision and recall, providing a balance between the two metrics.</p>
            </div>
            
            <div>
              <h4 className="font-medium text-primary">Confusion Matrix</h4>
              <p className="text-base">A breakdown of prediction results:</p>
              <ul className="list-disc pl-6 text-base">
                <li><span className="font-medium">True Positive:</span> Correctly predicted as positive (Risk)</li>
                <li><span className="font-medium">False Positive:</span> Incorrectly predicted as positive</li>
                <li><span className="font-medium">True Negative:</span> Correctly predicted as negative (No Risk)</li>
                <li><span className="font-medium">False Negative:</span> Incorrectly predicted as negative</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ModelPerformance;