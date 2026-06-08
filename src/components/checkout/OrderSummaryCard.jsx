import { MdLocalFireDepartment } from 'react-icons/md';
import { getCartCalories } from '../../constants/nutrition';

export default function OrderSummaryCard({
  cart,
  cartTotal,
  deliveryFee,
  orderTotal,
  freeDeliveryThreshold,
  orderType,
}) {
  const totalCalories = getCartCalories(cart);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 h-fit lg:sticky lg:top-24">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto custom-scrollbar">
        {cart.map((item) => (
          <div key={item.id} className="flex gap-3">
            <img
              src={item.food_image}
              alt={item.food_name}
              className="w-14 h-14 rounded-xl object-cover shrink-0 bg-gray-100"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 line-clamp-2">{item.food_name}</p>
              <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-bold text-gray-800 shrink-0">
              Rs.{item.price * item.quantity}/-
            </p>
          </div>
        ))}
      </div>

      {totalCalories > 0 && (
        <div className="flex justify-between text-sm text-orange-600 mb-3 pb-3 border-b border-gray-100">
          <span className="inline-flex items-center gap-1">
            <MdLocalFireDepartment className="w-4 h-4" />
            Total calories
          </span>
          <span className="font-semibold">{totalCalories} kcal</span>
        </div>
      )}

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span className="font-medium text-gray-800">Rs.{cartTotal}/-</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>{orderType === 'takeaway' ? 'Pickup' : 'Delivery fee'}</span>
          <span className="font-medium text-gray-800">
            {orderType === 'takeaway' ? 'FREE' : deliveryFee === 0 ? 'FREE' : `Rs.${deliveryFee}/-`}
          </span>
        </div>
        {orderType === 'delivery' && cartTotal < freeDeliveryThreshold && (
          <p className="text-xs text-green-600">
            Add Rs.{freeDeliveryThreshold - cartTotal} more for free delivery
          </p>
        )}
        <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-100">
          <span>Total</span>
          <span className="text-green-600">Rs.{orderTotal}/-</span>
        </div>
      </div>
    </div>
  );
}
