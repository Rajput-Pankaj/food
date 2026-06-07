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

  // ✅ UPDATED handleSubmit (merged)
  const handleSubmit = (e) => {
    e.preventDefault();

    // validation
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill all required fields ❌");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      alert("Message sent successfully ✅");

      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });

      setIsSubmitting(false);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: <MdLocationOn className="w-6 h-6" />,
      title: "Our Location",
      details: "123 Food Street, Kanpur  City, Foodland",
      link: "https://www.google.com/maps/dir//Good+Food+Restaurant,+11,+W-2,+Juhi+Kalan,+Damodar+Nagar,+Kanpur,+Uttar+Pradesh+208027/@26.6364954,80.9318324,15z/data=!4m8!4m7!1m0!1m5!1m1!1s0x399c47b7cd158bc5:0x4eba4d74c7aeae75!2m2!1d80.3066651!2d26.4270233?entry=ttu&g_ep=EgoyMDI2MDQxNC4wIKXMDSoASAFQAw%3D%3D"
    },
    {
      icon: <MdPhone className="w-6 h-6" />,
      title: "Phone Number",
      details: "+91 8429168953",
      link: "tel:+91 8429168953"
    },
    {
      icon: <MdEmail className="w-6 h-6" />,
      title: "Email Address",
      details: "pankajkumarrajput1116@gmail.com",
      link: "mailto:pankajkumarrajput1116@gmail.com"
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
      answer: "We deliver to all areas within a 10-mile radius of our kitchen."
    },
    {
      question: "How long does delivery take?",
      answer: "Our standard delivery time is 30-45 minutes."
    },
    {
      question: "Do you offer catering services?",
      answer: "Yes! We provide catering for events and parties."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept cards and digital wallets."
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

      {/* Hero */}
      <div className="bg-green-600 text-white py-16 text-center">
        <h1 className="text-5xl font-bold">Contact Us</h1>
        <p className="text-xl mt-4">
          We'd love to hear from you!
        </p>
      </div>

      {/* Info */}
      <div className="py-10 px-4 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {contactInfo.map((info, i) => (
          <div key={i} className="bg-white p-6 rounded shadow text-center">
            <div className="text-green-500 mb-2">{info.icon}</div>
            <h3 className="font-bold">{info.title}</h3>
            <p>{info.details}</p>
          </div>
        ))}
      </div>

      {/* FORM */}
      <div className="grid lg:grid-cols-2 gap-10 px-6 pb-16">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-bold mb-4">Send us a Message</h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Full Name"
              className="w-full p-2 border rounded"
            />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              className="w-full p-2 border rounded"
            />

            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Phone"
              className="w-full p-2 border rounded"
            />

            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="Subject"
              className="w-full p-2 border rounded"
            />

            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Message"
              className="w-full p-2 border rounded"
            ></textarea>

            <button
              type="submit"
              className="bg-green-500 text-white w-full py-2 rounded"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>

          </form>
        </div>

        {/* Right side */}
        <div className="bg-white p-6 rounded shadow text-center">
          <MdLocationOn className="mx-auto text-4xl text-gray-400" />
          <p>Map Section</p>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white p-10">
        <h2 className="text-3xl font-bold text-center mb-6">
          Frequently Asked Questions
        </h2>

        {faqItems.map((faq, i) => (
          <div key={i} className="mb-4">
            <h4 className="font-bold">{faq.question}</h4>
            <p>{faq.answer}</p>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
}

export default Contact;