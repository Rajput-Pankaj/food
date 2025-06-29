import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MdLocationOn, MdPhone, MdEmail, MdAccessTime } from "react-icons/md";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { LuSend } from "react-icons/lu";

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      alert('Thank you for your message! We will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setIsSubmitting(false);
    }, 2000);
  };

  const contactInfo = [
    {
      icon: <MdLocationOn className="w-6 h-6" />,
      title: "Our Location",
      details: "123 Food Street, Cuisine City, CC 12345, Foodland",
      link: "#"
    },
    {
      icon: <MdPhone className="w-6 h-6" />,
      title: "Phone Number",
      details: "+1 (555) 123-4567",
      link: "tel:+15551234567"
    },
    {
      icon: <MdEmail className="w-6 h-6" />,
      title: "Email Address",
      details: "info@foodexpress.com",
      link: "mailto:info@foodexpress.com"
    },
    {
      icon: <MdAccessTime className="w-6 h-6" />,
      title: "Working Hours",
      details: "24/7 Delivery Available",
      link: "#"
    }
  ];

  const faqItems = [
    {
      question: "What are your delivery areas?",
      answer: "We deliver to all areas within a 10-mile radius of our kitchen. Check your address during checkout to confirm delivery availability."
    },
    {
      question: "How long does delivery take?",
      answer: "Our standard delivery time is 30-45 minutes. We guarantee delivery within 60 minutes or your order is free!"
    },
    {
      question: "Do you offer catering services?",
      answer: "Yes! We provide catering for events, parties, and corporate functions. Contact us for custom menus and pricing."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, and digital wallets including PayPal, Apple Pay, and Google Pay."
    }
  ];

  return (
    <div className="bg-slate-200 min-h-screen flex flex-col">
      <Header 
        searchQuery="" 
        setSearchQuery={() => {}} 
        cartItemCount={0}
        onCartClick={() => {}}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            We'd love to hear from you! Get in touch with us for any questions, 
            feedback, or support you might need.
          </p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {contactInfo.map((info, index) => (
              <div key={index} className="bg-white rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-green-500 mb-4 flex justify-center">{info.icon}</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{info.title}</h3>
                <a 
                  href={info.link} 
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  {info.details}
                </a>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                      placeholder="What is this about?"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 resize-none"
                    placeholder="Tell us more about your inquiry..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <LuSend className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Map and Social */}
            <div className="space-y-8">
              {/* Map Placeholder */}
              <div className="bg-white rounded-lg p-8 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Find Us</h3>
                <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MdLocationOn className="w-12 h-12 mx-auto mb-2" />
                    <p>Interactive Map</p>
                    <p className="text-sm">123 Food Street, Cuisine City</p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-white rounded-lg p-8 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Follow Us</h3>
                <p className="text-gray-600 mb-6">Stay updated with our latest offers and news</p>
                <div className="flex space-x-4">
                  <a href="#" className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                    <FaFacebook className="w-6 h-6" />
                  </a>
                  <a href="#" className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-white hover:bg-blue-500 transition-colors">
                    <FaTwitter className="w-6 h-6" />
                  </a>
                  <a href="#" className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center text-white hover:bg-pink-700 transition-colors">
                    <FaInstagram className="w-6 h-6" />
                  </a>
                  <a href="#" className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center text-white hover:bg-blue-800 transition-colors">
                    <FaLinkedin className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">Find answers to common questions about our services</p>
          </div>
          <div className="space-y-6">
            {faqItems.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Contact; 