import { Link, useNavigate } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';
import { LuArrowRight, LuMinus, LuPlus, LuTrash2 } from 'react-icons/lu';
import { MdLocalFireDepartment } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { useStoreSettings } from '../hooks/useStoreSettings';
import { getCartCalories, getItemCalories } from '../constants/nutrition';
import { getDeliveryFee } from '../utils/settingsStorage';

function CartModal({ isOpen, onClose, cart, onRemoveItem, onUpdateQuantity }) {
  const navigate = useNavigate();
  const { isAuthenticated, isCustomer } = useAuth();
  const { settings } = useStoreSettings();

  if (!isOpen) return null;

  const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalCalories = getCartCalories(cart);
  const deliveryFee = getDeliveryFee(totalAmount, settings);
  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);

  const handleCheckout = () => {
    onClose();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    if (!isCustomer) {
      navigate('/admin');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping cart"
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-5 sm:px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
            {itemCount > 0 && (
              <p className="text-xs text-gray-500 mt-0.5">
                {itemCount} item{itemCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Close cart"
          >
            <IoClose size={22} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="text-center text-gray-500 py-12 px-6">
            <p className="text-4xl mb-3">🛒</p>
            <p className="text-lg font-semibold text-gray-700">Your cart is empty</p>
            <p className="text-sm mb-5 mt-1">Add some delicious food items!</p>
            <Link
              to="/menu"
              onClick={onClose}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-green-700"
            >
              Browse Menu
              <LuArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-3 custom-scrollbar">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100"
                >
                  <img
                    src={item.food_image}
                    alt={item.food_name}
                    className="w-16 h-16 object-cover rounded-xl shrink-0 bg-white"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">
                      {item.food_name}
                    </h3>
                    <p className="text-green-600 font-bold text-sm mt-0.5">
                      Rs.{item.price * item.quantity}/-
                    </p>
                    {getItemCalories(item, item.quantity) && (
                      <p className="text-xs text-orange-600 inline-flex items-center gap-1 mt-0.5">
                        <MdLocalFireDepartment className="w-3.5 h-3.5" />
                        {getItemCalories(item, item.quantity)} kcal
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 bg-white rounded-full border border-gray-200 p-0.5">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-green-700 hover:bg-green-50"
                        aria-label="Decrease quantity"
                      >
                        <LuMinus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-green-700 hover:bg-green-50"
                        aria-label="Increase quantity"
                      >
                        <LuPlus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      aria-label="Remove item"
                    >
                      <LuTrash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 px-5 sm:px-6 py-4 bg-white rounded-b-3xl sm:rounded-b-2xl space-y-3">
              {totalCalories > 0 && (
                <div className="flex justify-between text-sm text-orange-600">
                  <span className="inline-flex items-center gap-1">
                    <MdLocalFireDepartment className="w-4 h-4" />
                    Calories
                  </span>
                  <span className="font-semibold">{totalCalories} kcal</span>
                </div>
              )}

              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">Rs.{totalAmount}/-</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Est. delivery</span>
                <span className="font-medium">
                  {deliveryFee === 0 ? 'FREE' : `Rs.${deliveryFee}/-`}
                </span>
              </div>
              {totalAmount < settings.freeDeliveryThreshold && (
                <p className="text-xs text-green-600">
                  Add Rs.{settings.freeDeliveryThreshold - totalAmount} more for free delivery
                </p>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-base font-bold text-gray-900">Estimated total</span>
                <span className="text-xl font-bold text-green-600">
                  Rs.{totalAmount + deliveryFee}/-
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                {isAuthenticated && !isCustomer ? 'Go to Admin Panel' : 'Proceed to Checkout'}
                <LuArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full text-sm text-gray-500 hover:text-green-600 font-medium"
              >
                Continue shopping
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CartModal;
