import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Here you would typically send the data to your backend
      // The form data will be sent to: abdirahmaanibraahim33@gmail.com
      console.log("Form submitted:", formData);
      console.log("Email will be sent to: abdirahmaanibraahim33@gmail.com");
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Thank you for your message! We'll get back to you within 24 hours.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Sorry, there was an error sending your message. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-neutral-900 dark:text-white transition-colors duration-300">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-extrabold mb-2">Contact Us</h1>
          <p className="text-base max-w-3xl mx-auto leading-relaxed">
            Have questions about your sleep predictions? Need technical support? 
            We're here to help you get the most out of your sleep health journey.
          </p>
        </div>
      </div>

      {/* Contact Information & Form Section */}
      <section className="max-w-7xl mx-auto py-2 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <div className="space-y-6">
              {[
                {
                  icon: <Mail className="w-6 h-6 text-primary" />,
                  title: "Email Support",
                  content: "abdirahmaanibraahim33@gmail.com",
                  subtitle: "We typically respond within 24 hours"
                },
                {
                  icon: <Phone className="w-6 h-6 text-primary" />,
                  title: "Phone Support",
                  content: "+252-61-425-5228",
                  subtitle: "Monday - Friday, 9 AM - 6 PM EST"
                },
                {
                  icon: <MapPin className="w-6 h-6 text-primary" />,
                  title: "Office Location",
                  content: "123 Sleep Health Avenue, Wellness City, WC 12345",
                  subtitle: "Visit us for in-person consultations"
                },
                {
                  icon: <Clock className="w-6 h-6 text-primary" />,
                  title: "Business Hours",
                  content: "Monday - Friday: 9:00 AM - 6:00 PM EST",
                  subtitle: "Weekend support available via email"
                }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                  <div className="flex-shrink-0 mt-1">{item.icon}</div>
                  <div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-gray-800 dark:text-gray-200">{item.content}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-primary dark:text-primary mb-4">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-neutral-800 rounded-xl p-8">
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
                    placeholder="What can we help you with?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-neutral-700 text-gray-900 dark:text-white resize-none"
                    placeholder="Please describe your question or concern in detail..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                  <span>Send Message</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 dark:bg-neutral-800 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-primary dark:text-primary mb-4">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                question: "How accurate are the sleep time predictions?",
                answer: "Our AI model achieves 95% accuracy by analyzing multiple factors including your health metrics, lifestyle, and historical sleep patterns."
              },
              {
                question: "Is my health data secure and private?",
                answer: "Absolutely. We use bank-level encryption and never share your personal health information with third parties. Your privacy is our top priority."
              },
              {
                question: "How often should I use the prediction system?",
                answer: "For best results, we recommend using the system daily. The more data points you provide, the more accurate your predictions become."
              },
              {
                question: "Can I export my sleep history data?",
                answer: "Yes, you can export your complete sleep history and prediction data from your profile settings in CSV or PDF format."
              },
              {
                question: "What if the predictions don't seem accurate?",
                answer: "The system learns from your feedback. Please rate your sleep quality after each night to help improve future predictions."
              },
              {
                question: "Do you offer technical support?",
                answer: "Yes, we provide 24/7 technical support via email and phone during business hours. Our team is here to help with any issues."
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white dark:bg-neutral-700 rounded-xl p-6 shadow-md">
                <h3 className="text-lg font-semibold mb-3 flex items-start">
                  <MessageSquare className="w-5 h-5 text-primary mr-2 mt-1 flex-shrink-0" />
                  {item.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 ml-7">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;