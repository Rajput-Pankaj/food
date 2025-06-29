import React, { useState } from 'react'
import Header from '../components/Header'
import Categories from '../Categories'
import Card from '../components/Card'
import CartModal from '../components/CartModal'
import Notification from '../components/Notification'
import Footer from '../components/Footer'
import { food_items } from '../food.js'
//import food from '../food'

function Home() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState({ message: '', isVisible: false });

  // Filter food items based on selected category and search query
  const filteredFoodItems = food_items.filter(item => {
    const matchesCategory = selectedCategory === 'All' || 
      item.food_category === selectedCategory;
    const matchesSearch = item.food_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
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
    <div className='bg-slate-200 min-h-screen flex flex-col'>
        <Header 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          cartItemCount={cartItemCount}
          onCartClick={() => setIsCartOpen(true)}
        />
        <div className='flex flex-wrap justify-center items-center gap-5 w-full p-5'>
          {Categories.map((item, index)=>(
            <div 
              key={index} 
              className={`w-[140px] h-[150px] bg-white flex flex-col items-center gap-3 p-5 justify-center text-[16px] font-semibold text-gray-600 rounded-lg shadow-xl hover:bg-green-200 cursor-pointer transition-all duration-200 ${
                selectedCategory === item.name ? 'bg-green-200 border-2 border-green-500' : ''
              }`}
              onClick={() => setSelectedCategory(item.name)}
            >
              {item.icon}
              <span className='text-center'>{item.name}</span>
            </div>
          ))}
        </div>
        <div className='flex flex-wrap justify-center items-start gap-6 p-5 flex-1'>
          {filteredFoodItems.length > 0 ? (
            filteredFoodItems.map((item)=>(
              <Card 
                key={item.id} 
                name={item.food_name} 
                image={item.food_image} 
                price={item.price} 
                type={item.food_type}
                onAddToCart={() => addToCart(item)}
              />
            ))
          ) : (
            <div className='text-center text-gray-500 text-xl mt-10'>
              No food items found for "{searchQuery}" in {selectedCategory} category
            </div>
          )}
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
  )
}
export default Home;
