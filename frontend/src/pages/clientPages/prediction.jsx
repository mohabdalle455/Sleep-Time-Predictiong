import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaClock, FaRobot, FaBed, FaSpinner } from "react-icons/fa";
import Markdown from "react-markdown";
import { API_URL, MODEL_API_URL } from "../../config/config.jsx";

const SleepPredictionForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [recommendationStatus, setRecommendationStatus] = useState('idle'); // idle, loading, success, error

  // Define validation constraints for each field

  const [formData, setFormData] = useState({
    workoutTime: '',
    readingTime: '',
    phoneTime: '',
    workHours: '',
    caffeineIntake: '',
    relaxationTime: '',
  });
  
  // Track validation errors for each field
  const [errors, setErrors] = useState({});
  
  // Define constraints for each input field
  const fieldConstraints = {
    workoutTime: { min: 0, label: 'Workout time', unit: 'hours' },
    readingTime: { min: 0, label: 'Reading time', unit: 'hours' },
    phoneTime: { min: 0, label: 'Phone time', unit: 'hours' },
    workHours: { min: 0, label: 'Work hours', unit: 'hours' },
    caffeineIntake: { min: 0, label: 'Caffeine intake', unit: 'mg' },
    relaxationTime: { min: 0, label: 'Relaxation time', unit: 'hours' }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    
    // Calculate total time with the new value
    const timeFields = ['workoutTime', 'readingTime', 'phoneTime', 'workHours', 'relaxationTime'];
    let totalTime = 0;
    
    timeFields.forEach(field => {
      if (field === name) {
        totalTime += parseFloat(value) || 0;
      } else {
        totalTime += parseFloat(newFormData[field]) || 0;
      }
    });
    
    // Check if total time exceeds 24 hours
    if (totalTime > 24) {
      const currentTotal = timeFields.reduce((sum, field) => {
        return sum + (parseFloat(formData[field]) || 0);
      }, 0);
      const maxAllowed = 24 - currentTotal + (parseFloat(formData[name]) || 0);
      
      setErrors(prev => ({
        ...prev,
        [name]: `Total daily time cannot exceed 24 hours. Maximum allowed for ${fieldConstraints[name].label} is ${maxAllowed.toFixed(1)} hours.`
      }));
      return; // Don't update the form data if it would exceed 24 hours
    }
    
    setFormData(newFormData);
    
    // Clear error for this field when user changes the value
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    
    // Perform real-time validation for the current field
    if (value !== '') {
      const numValue = parseFloat(value);
      const constraints = fieldConstraints[name];
      
      if (constraints && numValue < constraints.min) {
        setErrors(prev => ({
          ...prev,
          [name]: `${constraints.label} cannot be less than ${constraints.min} ${constraints.unit}`
        }));
      } else if (constraints && constraints.max && numValue > constraints.max) {
        setErrors(prev => ({
          ...prev,
          [name]: `${constraints.label} cannot exceed ${constraints.max} ${constraints.unit}`
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Check if any field is empty
    for (const key in formData) {
      if (formData[key] === "") {
        newErrors[key] = `Please enter a value for ${fieldConstraints[key].label}`;
      }
    }
    
    // Calculate total time for all time-related fields
    const timeFields = ['workoutTime', 'readingTime', 'phoneTime', 'workHours', 'relaxationTime'];
    let totalTime = 0;
    
    timeFields.forEach(field => {
      const value = parseFloat(formData[field]) || 0;
      totalTime += value;
    });
    
    // Check if total time exceeds 24 hours
    if (totalTime > 24) {
      newErrors.totalTime = `Total daily time (${totalTime.toFixed(1)} hours) cannot exceed 24 hours. Please reduce your time inputs.`;
    }
    
    // Validate numeric constraints for each field
    for (const key in fieldConstraints) {
      const value = parseFloat(formData[key]);
      const constraints = fieldConstraints[key];
      
      if (!isNaN(value)) {
        if (value < constraints.min) {
          newErrors[key] = `${constraints.label} cannot be less than ${constraints.min} ${constraints.unit}`;
        } else if (constraints.max && value > constraints.max) {
          newErrors[key] = `${constraints.label} cannot exceed ${constraints.max} ${constraints.unit}`;
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 ? null : newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setRecommendation(null);
    setRecommendationStatus('idle');

    const validationErrors = validateForm();
    if (validationErrors) {
      // Display the first error as a toast
      const firstError = Object.values(validationErrors)[0];
      toast.error(firstError);
      setLoading(false);
      return;
    }

    const features = [
      parseFloat(formData.workoutTime),
      parseFloat(formData.readingTime),
      parseFloat(formData.phoneTime),
      parseFloat(formData.workHours),
      parseFloat(formData.caffeineIntake),
      parseFloat(formData.relaxationTime),
    ];

    try {
      // First set the status to loading
      setRecommendationStatus('loading');
      
      // Make the prediction request
      const { data } = await axios.post(
        `${API_URL}/predict`,
        {
          model: 'linear_regression', // Always use the best model
          features,
        },
        { withCredentials: true }
      );

      // Set the prediction result
      setResult(data.prediction);
      
      // Check if recommendation was generated
      if (data.recommendation) {
        setRecommendation(data.recommendation);
        setRecommendationStatus('success');
        
        // Save the prediction if user is logged in AND recommendation was successful
        const token = localStorage.getItem("token");
        if (token) {
          try {
            // Convert form data to the format expected by the backend
            const predictionData = {
              workoutTime: parseFloat(formData.workoutTime),
              readingTime: parseFloat(formData.readingTime),
              phoneTime: parseFloat(formData.phoneTime),
              workHours: parseFloat(formData.workHours),
              caffeineIntake: parseFloat(formData.caffeineIntake),
              relaxationTime: parseFloat(formData.relaxationTime),
              prediction: data.prediction,
              model: data.model,
              accuracy: data.accuracy
            };
            
            await axios.post(
              `${API_URL}/recommendation`,
              predictionData,
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (saveError) {
            console.error("Failed to save prediction:", saveError);
            // Don't show error to user as the prediction and recommendation were successful
          }
        }
        
        // Only set loading to false when both prediction and recommendation are available
        setLoading(false);
      } else {
        setRecommendationStatus('error');
        // Keep loading true if we have prediction but no recommendation
        // This ensures the UI shows that we're still waiting for the complete result
        setLoading(false);
        toast.warning("Recommendation generation failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setRecommendationStatus('error');
      setLoading(false);
      toast.error("Prediction failed");
    }
    // Note: We don't use finally block to set loading=false anymore
    // Loading state is now controlled by both prediction and recommendation status
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 dark:from-neutral-800 dark:to-neutral-900 flex flex-col items-center justify-center px-4 py-12 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center text-indigo-700 dark:text-indigo-400 flex items-center justify-center gap-2 mb-4">
          <FaClock /> Sleep Time Predictor
        </h1>
        
        <div className="mb-6 p-3 bg-blue-50 dark:bg-gray-700 rounded-lg text-sm">
          <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>Guidelines for accurate predictions:</strong></p>
          <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-1">
            <li>Enter realistic values that reflect your daily habits</li>
            <li>All time-related fields should be in hours</li>
            <li>Caffeine intake is measured in mg (approximately 100mg per cup of coffee)</li>
            <li>For best results, enter values based on your typical day</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Total Time Display */}
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-800/20 rounded-lg border border-yellow-200 dark:border-yellow-600">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                📊 Daily Time Tracker
              </h3>
              <span className="text-lg font-bold text-yellow-800 dark:text-yellow-200">
                {(() => {
                  const timeFields = ['workoutTime', 'readingTime', 'phoneTime', 'workHours', 'relaxationTime'];
                  const total = timeFields.reduce((sum, field) => sum + (parseFloat(formData[field]) || 0), 0);
                  return `${total.toFixed(1)} / 24.0 hours`;
                })()}
              </span>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    (() => {
                      const timeFields = ['workoutTime', 'readingTime', 'phoneTime', 'workHours', 'relaxationTime'];
                      const total = timeFields.reduce((sum, field) => sum + (parseFloat(formData[field]) || 0), 0);
                      if (total > 24) return 'bg-red-500';
                      if (total > 20) return 'bg-yellow-500';
                      return 'bg-green-500';
                    })()
                  }`}
                  style={{
                    width: `${Math.min(100, (() => {
                      const timeFields = ['workoutTime', 'readingTime', 'phoneTime', 'workHours', 'relaxationTime'];
                      const total = timeFields.reduce((sum, field) => sum + (parseFloat(formData[field]) || 0), 0);
                      return (total / 24) * 100;
                    })())}%`
                  }}
                ></div>
              </div>
            </div>
            {(() => {
              const timeFields = ['workoutTime', 'readingTime', 'phoneTime', 'workHours', 'relaxationTime'];
              const total = timeFields.reduce((sum, field) => sum + (parseFloat(formData[field]) || 0), 0);
              if (total > 24) {
                return (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    ⚠️ Total exceeds 24 hours. Please reduce your time inputs.
                  </p>
                );
              }
              return null;
            })()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(fieldConstraints).map(([name, constraints]) => (
              <div key={name} className="flex flex-col">
                <label className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                  {constraints.label}
                </label>
                <div className="relative space-y-1">
                  <input
                    type="number"
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    required
                    step="0.1"
                    min={constraints.min}
                    {...(constraints.max && { max: constraints.max })}
                    className={`p-2 w-full rounded-md border ${errors[name] ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400`}
                  />
                  
                  {errors[name] && (
                    <div className="text-red-500 text-xs mt-1">{errors[name]}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🤖 Using Best Model: Linear Regression
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              We've selected the best performing model for you - Linear Regression, 
              which provides the highest accuracy for sleep time predictions.
            </p>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
          >
            {loading ? "Predicting Sleep Time & Generating Recommendation..." : "Predict Sleep Time"}
          </button>
        </form>

        {result && !loading && (
          <div className="mt-6 text-center bg-green-100 dark:bg-green-800 p-4 rounded-lg shadow-inner">
            <h2 className="text-xl font-bold text-green-700 dark:text-green-300 flex items-center justify-center gap-2">
              <FaBed /> Recommended Sleep Time
            </h2>
            <p className="text-lg mt-2 text-gray-800 dark:text-white font-medium">
              {result} hours
            </p>
          </div>
        )}

        {/* Recommendation Section */}
        {result && !loading && recommendationStatus !== 'idle' && (
          <div className="mt-4 text-center bg-blue-100 dark:bg-blue-800 p-4 rounded-lg shadow-inner">
            <h2 className="text-xl font-bold text-blue-700 dark:text-blue-300 flex items-center justify-center gap-2">
              <FaRobot /> Personalized Recommendation
            </h2>
            
            {loading && recommendationStatus === 'loading' && (
              <div className="flex flex-col items-center justify-center py-4">
                <FaSpinner className="animate-spin text-blue-500 text-2xl mb-2" />
                <p className="text-gray-600 dark:text-gray-300">Generating your personalized recommendation with Gemini AI...</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Please wait while both prediction and recommendation are being processed</p>
              </div>
            )}
            
            {!loading && recommendationStatus === 'error' && (
              <div className="text-center py-3">
                <p className="text-red-500 dark:text-red-400">Failed to generate recommendation.</p>
                <button 
                  onClick={() => {
                    setRecommendationStatus('loading');
                    setLoading(true); // Set loading to true when retrying
                    // Retry the prediction with the same data
                    const features = [
                      parseFloat(formData.workoutTime),
                      parseFloat(formData.readingTime),
                      parseFloat(formData.phoneTime),
                      parseFloat(formData.workHours),
                      parseFloat(formData.caffeineIntake),
                      parseFloat(formData.relaxationTime),
                    ];
                    
                    // Make the prediction request again
                    axios.post(
                      `${API_URL}/predict`,
                      {
                        model: 'linear_regression', // Always use the best model
                        features,
                      },
                      { withCredentials: true }
                    )
                    .then(response => {
                      const data = response.data;
                      // Set the prediction result again to ensure it's displayed
                      setResult(data.prediction);
                      
                      if (data.recommendation) {
                        setRecommendation(data.recommendation);
                        setRecommendationStatus('success');
                        
                        // Save the prediction if user is logged in AND recommendation was successful
                        const token = localStorage.getItem("token");
                        if (token) {
                          // Convert form data to the format expected by the backend
                          const predictionData = {
                            workoutTime: parseFloat(formData.workoutTime),
                            readingTime: parseFloat(formData.readingTime),
                            phoneTime: parseFloat(formData.phoneTime),
                            workHours: parseFloat(formData.workHours),
                            caffeineIntake: parseFloat(formData.caffeineIntake),
                            relaxationTime: parseFloat(formData.relaxationTime),
                            prediction: data.prediction,
                            model: data.model,
                            accuracy: data.accuracy
                          };
                          
                          axios.post(
                            `${API_URL}/recommendation`,
                            predictionData,
                            { headers: { Authorization: `Bearer ${token}` } }
                          ).catch(saveError => {
                            console.error("Failed to save prediction:", saveError);
                            // Don't show error to user as the prediction and recommendation were successful
                          });
                        }
                        
                        // Only set loading to false when both prediction and recommendation are available
                        setLoading(false);
                      } else {
                        setRecommendationStatus('error');
                        // Keep loading true if we have prediction but no recommendation
                        setLoading(false);
                        toast.warning("Recommendation generation failed again. Please try later.");
                      }
                    })
                    .catch(err => {
                      console.error(err);
                      setRecommendationStatus('error');
                      setLoading(false);
                      toast.error("Retry failed");
                    });
                  }}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  Retry
                </button>
              </div>
            )}
            
            {!loading && recommendationStatus === 'success' && recommendation && (
              <Markdown className="text-base mt-2 text-gray-800 dark:text-white whitespace-pre-line">
                {recommendation}
              </Markdown>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SleepPredictionForm;
