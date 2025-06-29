import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Card from '../components/Card';
import CartModal from '../components/CartModal';
import Notification from '../components/Notification';
import { food_items } from '../food.js';
import { MdSort, MdFilterList, MdGridOn, MdViewList } from "react-icons/md";

function Menu() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState({ message: '', isVisible: false });

  // Get unique categories
  const categories = ['All', ...new Set(food_items.map(item => item.food_category))];

  // Filter and sort food items
  const filteredAndSortedItems = food_items
    .filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.food_category === selectedCategory;
      const matchesSearch = item.food_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.food_name.localeCompare(b.food_name);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'type':
          return a.food_type.localeCompare(b.food_type);
        default:
          return 0;
      }
    });

  // Show notification
  const showNotification = (message) => {
    setNotification({ message, isVisible: true });
    setTimeout(() => {
      setNotification({ message: '', isVisible: false });
    }, 3000);
  };

  // Add item to cart
  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        showNotification(`${item.food_name} quantity updated in cart!`);
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        showNotification(`${item.food_name} added to cart!`);
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    const item = cart.find(cartItem => cartItem.id === itemId);
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    if (item) {
      showNotification(`${item.food_name} removed from cart!`);
    }
  };

  // Update item quantity in cart
  const updateCartQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Calculate total cart items
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="bg-slate-200 min-h-screen flex flex-col">
      <Header 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        cartItemCount={cartItemCount}
        onCartClick={() => setIsCartOpen(true)}
      />

      {/* Page Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Our Menu</h1>
          <p className="text-green-100 text-lg">Discover our delicious selection of fresh and authentic dishes</p>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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

            {/* Sort and View Controls */}
            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <MdSort className="w-5 h-5 text-gray-600" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="type">Sort by Type</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors duration-300 ${
                    viewMode === 'grid' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <MdGridOn className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors duration-300 ${
                    viewMode === 'list' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <MdViewList className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {filteredAndSortedItems.length > 0 ? (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {filteredAndSortedItems.map((item) => (
                <Card 
                  key={item.id} 
                  name={item.food_name} 
                  image={item.food_image} 
                  price={item.price} 
                  type={item.food_type}
                  onAddToCart={() => addToCart(item)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No items found</h3>
              <p className="text-gray-500">
                No food items found for "{searchQuery}" in {selectedCategory} category
              </p>
            </div>
          )}
        </div>
      </div>

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onRemoveItem={removeFromCart}
        onUpdateQuantity={updateCartQuantity}
      />

      <Notification
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification({ message: '', isVisible: false })}
      />

      <Footer />
    </div>
  );
}

export default Menu; 