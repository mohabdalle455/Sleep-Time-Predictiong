import React, { useState, useEffect } from "react";
import { Clock, Brain, Shield, TrendingUp, Users, Award, Github, Linkedin, Mail, ChevronRight } from "lucide-react";

const About = () => {
  const [visibleStats, setVisibleStats] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({ accuracy: 0, users: 0, support: 0, secure: 0 });

  const teamMembers = [
    {
      name: "Ahmed Abdullah Hussain",
      Number: "+252618068764",
      role: "Project Lead & AI Developer",
      bio: "Specializes in machine learning algorithms and AI model optimization.",
      image: "/src/assets/WhatsApp Image 2025-09-27 at 13.35.58_707318d9.jpg",
      socials: { github: "ahmed-abdilah", linkedin: "ahmed-abdilah-dev", email: "ahmed@sleeppredictor.com" }
    },
    {
      name: "Abdinajiib Hassan Mohamed",
      id: "+252617305684", 
      role: "Machine Learning Engineer",
      bio: "Expert in data science and predictive modeling for healthcare.",
      image: "/src/assets/WhatsApp Image 2025-09-27 at 13.34.12_409c7389.jpg",
      socials: { github: "najiib", linkedin: "najiib-ml", email: "najiib@sleeppredictor.com" }
    },
    {
      name: "Abddirahmaan Ibrahim khaliif",
      id: "+252614255228",
      role: "Frontend Developer",
      bio: "UI/UX designer passionate about intuitive user experiences.",
      image: "/src/assets/WhatsApp Image 2025-09-27 at 13.33.36_3e472839.jpg",
      socials: { github: "abdirahmaan-ibrahim", linkedin: "abdirahman-ibrahim-dev", email: "abdirahmaan@sleeppredictor.com" }
    },
    {
      name: "Ismail Yusuf Hassan",
      id: "+252617959678",
      role: "Backend Developer",
      bio: "Full-stack developer specializing in API design and databases.",
      image: "/src/assets/WhatsApp Image 2025-09-27 at 14.02.21_a8ee9e67.jpg",
      socials: { github: "ismail", linkedin: "ismail-yussuf-dev", email: "ismail@sleeppredictor.com" }
    }
  ];

  // Animated counter effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !visibleStats) {
          setVisibleStats(true);
          const targets = { accuracy: 95, users: 10000, support: 24, secure: 100 };
          const duration = 2000;
          const steps = 60;
          
          let currentStep = 0;
          const timer = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;
            
            setAnimatedStats({
              accuracy: Math.floor(targets.accuracy * progress),
              users: Math.floor(targets.users * progress),
              support: Math.floor(targets.support * progress),
              secure: Math.floor(targets.secure * progress)
            });
            
            if (currentStep >= steps) {
              setAnimatedStats(targets);
              clearInterval(timer);
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );

    const statsElement = document.getElementById('stats-section');
    if (statsElement) observer.observe(statsElement);

    return () => observer.disconnect();
  }, [visibleStats]);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 text-gray-900 dark:text-white transition-colors duration-300">
      {/* Hero Section - Modern Gradient */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 dark:from-neutral-800 dark:via-neutral-850 dark:to-neutral-900 transition-colors duration-300"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium mb-6">
              <Clock className="w-4 h-4 mr-2" />
              AI-Powered Sleep Optimization
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              About Sleep Time
              <span className="block bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                Predictor
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 dark:text-neutral-300 max-w-3xl mx-auto leading-relaxed">
              Revolutionizing sleep health through cutting-edge AI and personalized insights
            </p>
          </div>
        </div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </section>

      {/* Mission & Animated Stats Section */}
      <section className="py-16 lg:py-20 bg-gray-50 dark:bg-neutral-800/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium">
                Our Mission
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                Transforming Sleep Health Through
                <span className="text-blue-600 dark:text-blue-400"> Innovation</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                We believe quality sleep is fundamental to human wellbeing. Our mission is to democratize 
                access to personalized sleep insights through advanced AI technology.
              </p>
            </div>
            
            <div id="stats-section" className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-neutral-700 transition-colors duration-300">
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center group">
                  <div className="text-3xl lg:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2 transition-all duration-300 group-hover:scale-110">
                    {animatedStats.accuracy}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Prediction Accuracy</div>
                </div>
                <div className="text-center group">
                  <div className="text-3xl lg:text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2 transition-all duration-300 group-hover:scale-110">
                    {animatedStats.users >= 1000 ? `${Math.floor(animatedStats.users/1000)}K+` : animatedStats.users}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Users Helped</div>
                </div>
                <div className="text-center group">
                  <div className="text-3xl lg:text-4xl font-bold text-green-600 dark:text-green-400 mb-2 transition-all duration-300 group-hover:scale-110">
                    {animatedStats.support}/7
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Support Available</div>
                </div>
                <div className="text-center group">
                  <div className="text-3xl lg:text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2 transition-all duration-300 group-hover:scale-110">
                    {animatedStats.secure}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Data Security</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 dark:bg-neutral-800 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-xl font-bold text-center text-primary dark:text-primary mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: <Brain className="w-8 h-8 text-primary" />,
                title: "AI Analysis",
                description: "Advanced algorithms analyze your health data and lifestyle factors."
              },
              {
                icon: <Clock className="w-8 h-8 text-primary" />,
                title: "Real-time Prediction",
                description: "Get instant, personalized sleep time recommendations."
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-neutral-700 rounded-lg p-6 text-center shadow-md">
                <div className="flex justify-center mb-3">{item.icon}</div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto py-6 px-4">
        <h2 className="text-xl font-bold text-center text-primary dark:text-primary mb-4">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: <Shield className="w-6 h-6 text-primary" />,
              title: "Privacy First",
              description: "Your data is encrypted and never shared with third parties."
            },
            {
              icon: <TrendingUp className="w-6 h-6 text-primary" />,
              title: "Adaptive Learning",
              description: "AI continuously learns to provide accurate predictions."
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-3">
                {item.icon}
                <h3 className="text-base font-bold ml-2">{item.title}</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Enhanced Team Section with Hover Effects & Social Links */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-medium mb-4">
              Our Team
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Meet the Innovators
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Passionate developers dedicated to improving sleep health through technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-lg border border-gray-100 dark:border-neutral-700 hover:shadow-xl transition-all duration-300">
                <div className="relative mb-3">
                  <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-3 border-gray-100 dark:border-neutral-600 transition-colors duration-300">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCAzMkM0Ni40IDMyLjggNTIgMzguMDggNTIgNDQuOEM1MiA1MS41MiA0Ni40IDU2LjggNDAgNTYuOEMzMy42IDU2LjggMjggNTEuNTIgMjggNDQuOEMyOCAzOC4wOCAzMy42IDMyLjggNDAgMzJaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0yNCA2NEMyNCA1Ni4zMiAzMC4zMiA1MCA0MCA1MEg0MEM0Ny42OCA1MCA1NiA1Ni4zMiA1NiA2NFY3MkgyNFY2NFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cg==';
                      }}
                    />
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{member.name}</h3>
                  <div className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium">
                    {member.id}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;