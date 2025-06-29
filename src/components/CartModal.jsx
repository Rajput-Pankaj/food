import React from 'react';
import { IoClose } from "react-icons/io5";
import { LuTrash2 } from "react-icons/lu";

function CartModal({ isOpen, onClose, cart, onRemoveItem, onUpdateQuantity }) {
  if (!isOpen) return null;

  const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Your Cart</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <IoClose size={24} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="text-lg">Your cart is empty</p>
            <p className="text-sm">Add some delicious food items!</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={item.food_image}
                    alt={item.food_name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.food_name}</h3>
                    <p className="text-green-600 font-bold">Rs.{item.price}/-</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                    >
                      +
                    </button>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="ml-2 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <LuTrash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold">Total:</span>
                <span className="text-xl font-bold text-green-600">Rs.{totalAmount}/-</span>
              </div>
              <button className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors">
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CartModal; 