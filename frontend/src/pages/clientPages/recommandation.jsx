import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Markdown from 'react-markdown';
import { API_URL } from "../../config/config.jsx";

const Recommendation = () => {
  const { id } = useParams();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const res = await fetch(`${API_URL}/recommendation/${id}`);
        if (!res.ok) throw new Error("Failed to fetch prediction");
        const data = await res.json();
        setPrediction(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPrediction();
  }, [id]);

  if (loading) return <div className="text-center mt-20 text-gray-600 dark:text-gray-300">Loading...</div>;
  if (error) return <div className="text-center text-red-600 mt-20">{error}</div>;
  if (!prediction) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 py-10 px-4 text-2xl">
      <div className="max-w-8xl mx-auto">
        <h2 className="text-5xl font-bold text-primary dark:text-primary mb-6 text-center">
          Prediction Result
        </h2>

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 space-y-4 border border-gray-200 dark:border-gray-700">
          <p>
            <strong>Your Risk Level:</strong>{" "}
            <span className={`font-bold ${prediction.prediction === 1 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
              {prediction.prediction === 1 ? "Risk" : "No Risk"}
            </span>
          </p>
          <p><strong>Model Name :</strong> {prediction.model}</p>
          <p><strong>Accurency Of model :</strong> {prediction.accuracy}</p>
          <p><strong>Heart Rate:</strong> {prediction.heartRate} bpm</p>
          <p><strong>Blood Glucose:</strong> {prediction.glucose} mg/dL</p>
          <p><strong>Diastolic BP:</strong> {prediction.diaBP} mmHg</p>

          <div>
            <h5 className="text-5xl font-semibold mb-2">AI Health Recommendation</h5>
            <div className="leading-relaxed  p-4 bg-gray-100 dark:bg-gray-700 rounded-md border dark:border-gray-600">
              <Markdown>{prediction.recommendation}</Markdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendation;
