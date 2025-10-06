import React from 'react';
import axios from 'axios';
import { API_URL } from '../config/config.jsx';

const AuthTest = () => {
  // Function to test the unauthorized redirect
  const testUnauthorizedRedirect = async () => {
    try {
      // Attempt to make a request that will result in a 401 error
      await axios.get(`${API_URL}/admin-only-endpoint`, {
        headers: { Authorization: 'Bearer invalid-token' }
      });
      // If the request succeeds (which it shouldn't), show an alert
      alert('Request succeeded unexpectedly');
    } catch (error) {
      // The interceptor should handle the redirect before this code runs
      console.log('Error caught in component:', error);
      alert('If you see this alert, the global interceptor did not redirect you');
    }
  };

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4">Auth Interceptor Test</h2>
      <p className="mb-4">Click the button below to test the unauthorized redirect functionality.</p>
      <p className="mb-4 text-sm text-gray-600">
        This will simulate an unauthorized API request. If the interceptor works correctly, 
        you should be redirected to the login page automatically.
      </p>
      <button
        onClick={testUnauthorizedRedirect}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Test Unauthorized Redirect
      </button>
    </div>
  );
};

export default AuthTest;