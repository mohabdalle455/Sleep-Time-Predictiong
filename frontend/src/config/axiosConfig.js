import axios from 'axios';
import { API_URL } from './config.jsx';
import { toast } from 'react-toastify';

// Create an axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Define the response interceptor function
const responseInterceptor = (response) => {
  // Any status code within the range of 2xx causes this function to trigger
  return response;
};

const errorInterceptor = (error) => {
  // Any status codes outside the range of 2xx cause this function to trigger
  if (error.response && (error.response.status === 401 || error.response.status === 403)) {
    // If the error is due to unauthorized or forbidden access
    console.log('Unauthorized access detected, redirecting to login');
    
    // Show toast notification
    toast.error('Session expired or unauthorized access. Redirecting to login...', {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    
    // Clear any authentication tokens
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    
    // Slight delay before redirect to allow toast to be seen
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  }
  
  return Promise.reject(error);
};

// Add the interceptor to the instance
axiosInstance.interceptors.response.use(responseInterceptor, errorInterceptor);

// Also add the same interceptor to the global axios
axios.interceptors.response.use(responseInterceptor, errorInterceptor);

export default axiosInstance;