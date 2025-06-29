import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MdFastfood, MdDeliveryDining, MdRestaurant, MdStar } from "react-icons/md";
import { FaUsers, FaAward, FaHeart } from "react-icons/fa";
import { LuClock, LuMapPin, LuPhone } from "react-icons/lu";

function About() {
  const stats = [
    { icon: <FaUsers className="w-8 h-8" />, number: "10K+", label: "Happy Customers" },
    { icon: <MdDeliveryDining className="w-8 h-8" />, number: "50K+", label: "Deliveries Made" },
    { icon: <MdRestaurant className="w-8 h-8" />, number: "100+", label: "Menu Items" },
    { icon: <FaAward className="w-8 h-8" />, number: "5+", label: "Years Experience" }
  ];

  const values = [
    {
      icon: <FaHeart className="w-8 h-8" />,
      title: "Quality First",
      description: "We never compromise on the quality of our ingredients and preparation methods."
    },
    {
      icon: <LuClock className="w-8 h-8" />,
      title: "Fast Delivery",
      description: "Your food arrives fresh and hot within 30 minutes of ordering."
    },
    {
      icon: <MdStar className="w-8 h-8" />,
      title: "Customer Satisfaction",
      description: "Your satisfaction is our top priority. We go above and beyond to exceed expectations."
    }
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      description: "Passionate about bringing authentic flavors to your doorstep."
    },
    {
      name: "Michael Chen",
      role: "Head Chef",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      description: "Award-winning chef with 15+ years of culinary experience."
    },
    {
      name: "Emily Rodriguez",
      role: "Operations Manager",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      description: "Ensuring smooth operations and exceptional customer service."
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
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <MdFastfood className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4">About FoodExpress</h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            We're passionate about delivering delicious, fresh food right to your doorstep. 
            Our journey began with a simple mission: to make great food accessible to everyone.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-green-500 mb-4 flex justify-center">{stat.icon}</div>
                <div className="text-3xl font-bold text-gray-800 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                At FoodExpress, we believe that great food has the power to bring people together 
                and create memorable experiences. Our mission is to deliver not just meals, but 
                moments of joy and satisfaction to every customer.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                We source the finest ingredients, work with skilled chefs, and maintain the highest 
                standards of food safety and quality. Every dish is prepared with care and delivered 
                with speed to ensure you get the best dining experience at home.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <MdFastfood className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Fresh & Authentic</h3>
                  <p className="text-gray-600">Every dish tells a story of tradition and taste</p>
                </div>
              </div>
            </div>
            <div className="bg-green-500 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Why Choose Us?</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Fresh ingredients sourced daily from local suppliers</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Experienced chefs with international culinary backgrounds</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Fast delivery within 30 minutes guaranteed</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>24/7 customer support for your convenience</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These core values guide everything we do, from kitchen to delivery
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-6 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-green-500 mb-4 flex justify-center">{value.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The passionate people behind FoodExpress who make it all possible
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-lg p-6 text-center shadow-lg">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-800 mb-1">{member.name}</h3>
                <p className="text-green-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="bg-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience Great Food?</h2>
          <p className="text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust FoodExpress for their daily meals
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Order Now
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors">
              Contact Us
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default About; 