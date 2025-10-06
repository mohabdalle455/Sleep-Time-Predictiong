// import React from "react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { isUserLoggedIn } from "../../authUtils";
import bgImage from "../../assets/sleep.png";
import card1 from "../../assets/card  (1).png";
import card2 from "../../assets/card  (2).png";
import card3 from "../../assets/card  (3).png";
import card4 from "../../assets/card  (4).png";
import bpLow from "../../assets/good sleep.jpg";
import bpNormal from "../../assets/normal sleep.jpg";
import bpHigh from "../../assets/bad sleep.jpg";


const WelcomePage = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
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
    return (
        <div className="min-h-screen bg-white text-gray-900 dark:bg-neutral-900 dark:text-white transition-colors duration-300 text-xl">
            {/* Hero Section */}
            <div
                className="flex flex-col items-center justify-center text-center text-white h-[92vh] bg-cover bg-center"
                style={{
                    backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${bgImage})`,
                }}
            >
                <h1 className="text-6xl font-extrabold mb-3">Welcome to the Sleep Time Predictor</h1>
                <h5 className="text-2xl mb-6">Personalized Sleep Time Prediction & Recommendations</h5>
                <div className="space-x-4">
                    {!isLoggedIn ? (
                        <>
                            j<Link to="/login">
                                <button className="bg-white hover:text-primary text-black font-semibold px-6 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-100 transition">
                                    Login
                                </button>
                            </Link>
                            <Link to="/register">
                                <button className="bg-primary hover:bg-primary hover:text-black text-white font-semibold px-6 py-2 rounded transition">
                                    Register
                                </button>
                            </Link>
                        </>
                    ) : (
                        <Link to="/Prediction">
                            <button className="bg-primary hover:bg-primary hover:text-black text-white font-semibold px-6 py-2 rounded transition">
                                Predict
                            </button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Features Section */}
            <section className="max-w-7xl mx-auto py-16 px-4 text-center">
                <h2 className="text-5xl font-bold text-primary dark:text-primary mb-12">Key Features</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { img: card4, title: "Real-Time Prediction", desc: "Get instant results using your vitals input." },
                        { img: card3, title: "Health Insights", desc: "Recommendations tailored to your Sleep level." },
                        { img: card2, title: "Progress Tracking", desc: "Track your prediction history and improvements." },
                        { img: card1, title: "Secure & Private", desc: "Your health data is safe and encrypted." }
                    ].map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-600 hover:shadow-lg transition overflow-hidden"
                        >
                            <div className="w-full h-60">
                                <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-5 text-center">
                                <h4 className=" font-bold mb-2">{item.title}</h4>
                                <p className=" text-gray-600 dark:text-gray-300">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* BP Categories Section */}
            <section className="max-w-7xl mx-auto py-10 px-4 text-center">
                <h2 className="text-5xl font-bold text-primary dark:text-primary mb-12">Sleep Time Categories</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {[
                        {
                            img: bpLow,
                            title: "Good Sleep Time",
                            desc: "Good sleep time 7-9 hours of sleep per night Prioritize a consistent sleep schedule, a relaxing bedtime routine, and a comfortable sleep environment.",
                            badgeColor: "bg-red-500",
                            badgeText: "text-white"
                        },
                        {
                            img: bpNormal,
                            title: "Normal Sleep Time",
                            desc: "Good sleep time 6-10 hours of sleep per night Prioritize a consistent sleep schedule, a relaxing bedtime routine, and a comfortable sleep environment.",
                            badgeColor: "bg-green-500",
                            badgeText: "text-white"
                        },
                        {
                            img: bpHigh,
                            title: "Poor Sleep Time",
                            desc: "Good sleep time 6 hours of sleep per night Prioritize a consistent sleep schedule, a relaxing bedtime routine, and a comfortable sleep environment.",
                            badgeColor: "bg-yellow-300",
                            badgeText: "text-black"
                        }
                    ].map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-white dark:bg-neutral-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-600 hover:shadow-lg transition overflow-hidden"
                        >
                            <div className="w-full h-64">
                                <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-5 text-center flex flex-col items-center">
                                <h4 className="font-bold mb-2">{item.title}</h4>
                                <p className=" text-gray-600 dark:text-gray-300 whitespace-pre-line mb-4">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default WelcomePage;

