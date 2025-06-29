import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MdDateRange, MdPerson, MdCategory, MdSearch } from "react-icons/md";
import { LuArrowRight } from "react-icons/lu";

function Blog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Recipes', 'Food Tips', 'Restaurant News', 'Healthy Eating'];

  const blogPosts = [
    {
      id: 1,
      title: "10 Quick and Healthy Breakfast Ideas for Busy Mornings",
      excerpt: "Start your day right with these nutritious and delicious breakfast options that take less than 15 minutes to prepare...",
      content: "Breakfast is often called the most important meal of the day, and for good reason. It provides the fuel your body needs to start the day and can help improve concentration and performance. Here are 10 quick and healthy breakfast ideas that are perfect for busy mornings...",
      author: "Chef Sarah Johnson",
      date: "March 15, 2024",
      category: "Recipes",
      image: "https://images.unsplash.com/photo-1494859802809-d069c3b71a8a?w=400&h=250&fit=crop",
      readTime: "5 min read"
    },
    {
      id: 2,
      title: "The Ultimate Guide to Perfect Pizza Dough",
      excerpt: "Learn the secrets to making restaurant-quality pizza dough at home with our step-by-step guide...",
      content: "Making pizza dough from scratch might seem intimidating, but with the right technique and ingredients, you can create a perfect crust that rivals your favorite pizzeria. The key is in the kneading, resting time, and temperature control...",
      author: "Chef Michael Chen",
      date: "March 12, 2024",
      category: "Recipes",
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=250&fit=crop",
      readTime: "8 min read"
    },
    {
      id: 3,
      title: "Sustainable Food Practices: How We're Going Green",
      excerpt: "Discover how FoodExpress is implementing eco-friendly practices to reduce our environmental impact...",
      content: "At FoodExpress, we're committed to sustainability and reducing our environmental footprint. From sourcing local ingredients to using biodegradable packaging, we're taking steps to make our food delivery service more eco-friendly...",
      author: "Emily Rodriguez",
      date: "March 10, 2024",
      category: "Restaurant News",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=250&fit=crop",
      readTime: "6 min read"
    },
    {
      id: 4,
      title: "5 Essential Cooking Tips Every Home Chef Should Know",
      excerpt: "Master these fundamental cooking techniques to elevate your culinary skills and create restaurant-worthy dishes...",
      content: "Whether you're a beginner in the kitchen or an experienced cook, these essential tips will help you improve your cooking skills and create better-tasting dishes. From proper knife techniques to seasoning secrets...",
      author: "Chef Sarah Johnson",
      date: "March 8, 2024",
      category: "Food Tips",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=250&fit=crop",
      readTime: "7 min read"
    },
    {
      id: 5,
      title: "The Benefits of Mediterranean Diet: A Complete Guide",
      excerpt: "Explore the health benefits and delicious recipes of the Mediterranean diet, ranked as one of the healthiest eating patterns...",
      content: "The Mediterranean diet is not just a diet—it's a lifestyle that emphasizes fresh, whole foods, healthy fats, and moderate portions. Research has shown that following this eating pattern can reduce the risk of heart disease...",
      author: "Dr. Lisa Martinez",
      date: "March 5, 2024",
      category: "Healthy Eating",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=250&fit=crop",
      readTime: "10 min read"
    },
    {
      id: 6,
      title: "New Menu Items: Spring Edition 2024",
      excerpt: "Introducing our latest seasonal menu featuring fresh spring ingredients and innovative flavor combinations...",
      content: "Spring is here, and we're excited to introduce our new seasonal menu! We've created dishes that celebrate the fresh flavors of spring, using locally sourced ingredients and creative culinary techniques...",
      author: "Chef Michael Chen",
      date: "March 3, 2024",
      category: "Restaurant News",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=250&fit=crop",
      readTime: "4 min read"
    }
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-slate-200 min-h-screen flex flex-col">
      <Header 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        cartItemCount={0}
        onCartClick={() => {}}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Food Blog</h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            Discover delicious recipes, cooking tips, and food stories from our expert chefs and food enthusiasts
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                    selectedCategory === category
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
              <MdSearch className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Blog Posts */}
      <div className="flex-1 py-12">
        <div className="max-w-7xl mx-auto px-4">
          {filteredPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <article key={post.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <MdCategory className="w-4 h-4" />
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <MdDateRange className="w-4 h-4" />
                        {post.date}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MdPerson className="w-4 h-4" />
                        {post.author}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{post.readTime}</span>
                        <button className="text-green-600 hover:text-green-700 transition-colors">
                          <LuArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No articles found</h3>
              <p className="text-gray-500">
                No articles found for "{searchQuery}" in {selectedCategory} category
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="bg-green-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-green-100 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter to get the latest recipes, cooking tips, and food stories delivered to your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 bg-white text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
            />
            <button className="bg-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Blog; 