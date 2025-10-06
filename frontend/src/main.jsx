import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
// Import axios config to apply interceptors globally
import './config/axiosConfig.js'

createRoot(document.getElementById('root')).render(
    <App />
)
