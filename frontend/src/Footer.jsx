import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { isUserLoggedIn } from "./authUtils";

const Footer = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const location = useLocation();
    
    useEffect(() => {
        setIsLoggedIn(isUserLoggedIn());
        
        // Listen for changes in localStorage
        const handleStorageChange = () => {
            setIsLoggedIn(isUserLoggedIn());
        };
        
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const loggedInLinks = [
        { name: "Home", path: "/" },
        { name: "Prediction", path: "/prediction" },
        { name: "History", path: "/history" },
        { name: "Profile", path: "/profile" }
    ];

    const publicLinks = [
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
        { name: "Contact", path: "/contact" }
    ];

    const footerLinks = isLoggedIn ? loggedInLinks : publicLinks;
    return (
        <footer className="bg-gradient-to-r from-blue-600 to-purple-700 dark:from-gray-800 dark:to-gray-900 text-white py-10 text-xl transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Logo + About */}
                <div>
                    <h2 className="font-semibold text-white mb-4">Sleep Time Prediction</h2>
                    <p className="text-gray-200 dark:text-gray-300">
                        Building modern and smart solutions for your digital needs.
                    </p>
                </div>

                {/* Links */}
                <div>
                    <h3 className="font-semibold text-white mb-3">Quick Links</h3>
                    <ul className="space-y-2">
                        {footerLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <li key={link.name}>
                                    <Link 
                                        to={link.path} 
                                        className={`text-gray-200 dark:text-gray-300 hover:text-yellow-400 transition-colors duration-200 ${
                                            isActive ? "text-yellow-400 font-semibold" : ""
                                        }`}
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Contact Info */}
                <div>
                    <h3 className="font-semibold text-white mb-3">Contact</h3>
                    <ul className="space-y-2 text-gray-200 dark:text-gray-300">
                        <li>Email: abdirahmaanibraahim33@gmail.com</li>
                        <li>Phone: +252-61-425-5228</li>
                    </ul>
                </div>

            </div>

            {/* Bottom Note */}
            <div className="mt-8 border-t border-gray-400 dark:border-gray-600 pt-4 text-center text-gray-200 dark:text-gray-300">
                &copy; {new Date().getFullYear()} Sleep Time prediction. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
