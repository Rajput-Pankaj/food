import { Link } from 'react-router-dom';
import {
  MdLocationOn,
  MdPerson,
  MdReceiptLong,
  MdStar,
  MdLocalShipping,
} from 'react-icons/md';
import { LuArrowRight, LuDrumstick, LuLeaf, LuUtensilsCrossed } from 'react-icons/lu';
import { ORDER_STATUS_LABELS } from '../../constants/roles';
import { ORDER_STATUS_COLORS } from '../../constants/customerDashboard';
import {
  isActiveOrderStatus,
  isPendingOrderStatus,
  normalizeOrderStatus,
} from '../../constants/orders';
import OrderTimeline from '../orders/OrderTimeline';
import { DIETARY_LABELS } from '../../constants/dietary';
import { getCustomerProfile } from '../../utils/customerStorage';

const quickActions = [
  {
    id: 'order',
    label: 'Browse Menu',
    hint: 'Discover 50+ dishes',
    icon: LuUtensilsCrossed,
    tab: null,
    href: '/menu',
    color: 'bg-green-50 text-green-700 border-green-100',
  },
  {
    id: 'orders',
    label: 'My Orders',
    hint: 'Track deliveries',
    icon: MdReceiptLong,
    tab: 'orders',
    color: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  {
    id: 'addresses',
    label: 'Addresses',
    hint: 'Saved locations',
    icon: MdLocationOn,
    tab: 'addresses',
    color: 'bg-violet-50 text-violet-700 border-violet-100',
  },
  {
    id: 'profile',
    label: 'Profile',
    hint: 'Diet & contact',
    icon: MdPerson,
    tab: 'profile',
    color: 'bg-amber-50 text-amber-800 border-amber-100',
  },
];

function StatCard({ label, value, icon, accent, onClick }) {
  const Component = onClick ? 'button' : 'div';
  const IconComponent = icon;
  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 text-left w-full ${
        onClick ? 'hover:border-green-200 hover:shadow-md transition-all' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs sm:text-sm text-gray-500">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
          <IconComponent className="w-5 h-5" />
        </span>
      </div>
    </Component>
  );
}

export default function OverviewPanel({ user, orders, addressCount, reviewCount, onNavigate }) {
  const profile = getCustomerProfile(user.id);
  const activeOrder = orders.find(
    (order) => isPendingOrderStatus(order.status) || isActiveOrderStatus(order.status)
  );
  const recentOrder = orders[0];
  const deliveredCount = orders.filter((order) => order.status === 'delivered').length;

  const dietaryLabel =
    profile.dietaryPreference && profile.dietaryPreference !== 'all'
      ? DIETARY_LABELS[profile.dietaryPreference]
      : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      {activeOrder && (
        <div className="rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <MdLocalShipping className="w-5 h-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-orange-900">Order in progress</p>
                <p className="text-xs text-orange-800/80 mt-0.5">
                  #{activeOrder.id.slice(0, 8).toUpperCase()} ·{' '}
                  {ORDER_STATUS_LABELS[normalizeOrderStatus(activeOrder.status)] ||
                    activeOrder.status}
                </p>
              </div>
            </div>
            <Link
              to={`/track-order/${activeOrder.id}`}
              className="inline-flex items-center gap-1 text-sm font-semibold text-orange-700 hover:text-orange-900"
            >
              Track live
              <LuArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="bg-white/70 rounded-xl p-3 border border-orange-100">
            <OrderTimeline order={activeOrder} variant="horizontal" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Orders"
          value={orders.length}
          icon={MdReceiptLong}
          accent="bg-blue-100 text-blue-600"
          onClick={() => onNavigate('orders')}
        />
        <StatCard
          label="Delivered"
          value={deliveredCount}
          icon={MdLocalShipping}
          accent="bg-green-100 text-green-600"
          onClick={() => onNavigate('orders')}
        />
        <StatCard
          label="Addresses"
          value={addressCount}
          icon={MdLocationOn}
          accent="bg-violet-100 text-violet-600"
          onClick={() => onNavigate('addresses')}
        />
        <StatCard
          label="Reviews"
          value={reviewCount}
          icon={MdStar}
          accent="bg-amber-100 text-amber-600"
          onClick={() => onNavigate('reviews')}
        />
      </div>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Quick actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {quickActions.map((action) => {
            const ActionIcon = action.icon;
            const content = (
              <>
                <span
                  className={`w-9 h-9 rounded-lg border flex items-center justify-center ${action.color}`}
                >
                  <ActionIcon className="w-4 h-4" />
                </span>
                <span className="mt-2 block text-sm font-semibold text-gray-800">{action.label}</span>
                <span className="text-[11px] text-gray-500">{action.hint}</span>
              </>
            );

            if (action.href) {
              return (
                <Link
                  key={action.id}
                  to={action.href}
                  className="p-3 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/40 transition-colors"
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={action.id}
                type="button"
                onClick={() => onNavigate(action.tab)}
                className="p-3 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/40 transition-colors text-left"
              >
                {content}
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-5">
        {recentOrder ? (
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Latest order</h2>
              <button
                type="button"
                onClick={() => onNavigate('orders')}
                className="text-sm text-green-600 hover:text-green-700 font-semibold"
              >
                View all
              </button>
            </div>
            <p className="font-semibold text-gray-800">
              #{recentOrder.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {new Date(recentOrder.createdAt).toLocaleString()}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-lg font-bold text-green-600">Rs.{recentOrder.total}/-</span>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  ORDER_STATUS_COLORS[recentOrder.status] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {ORDER_STATUS_LABELS[recentOrder.status] || recentOrder.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-3 line-clamp-2">
              {recentOrder.items.map((item) => `${item.food_name} ×${item.quantity}`).join(', ')}
            </p>
          </section>
        ) : (
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 text-center flex flex-col items-center justify-center">
            <p className="text-4xl mb-3">🍽️</p>
            <h2 className="text-base font-bold text-gray-800">No orders yet</h2>
            <p className="text-sm text-gray-500 mt-1 mb-4">Your first delicious meal is waiting.</p>
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700"
            >
              Browse Menu
              <LuArrowRight className="w-4 h-4" />
            </Link>
          </section>
        )}

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Your preferences</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4 py-2 border-b border-gray-100">
              <dt className="text-gray-500">Phone</dt>
              <dd className="font-medium text-gray-800 text-right">
                {profile.phone || 'Not set'}
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-2 border-b border-gray-100">
              <dt className="text-gray-500">Menu preference</dt>
              <dd className="font-medium text-gray-800 text-right inline-flex items-center gap-1">
                {dietaryLabel ? (
                  <>
                    {profile.dietaryPreference === 'veg' ? (
                      <LuLeaf className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <LuDrumstick className="w-3.5 h-3.5 text-red-600" />
                    )}
                    {dietaryLabel}
                  </>
                ) : (
                  'All items'
                )}
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-2">
              <dt className="text-gray-500">Member since</dt>
              <dd className="font-medium text-gray-800 text-right">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : 'FoodExpress member'}
              </dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className="mt-4 text-sm font-semibold text-green-600 hover:text-green-700"
          >
            Edit profile →
          </button>
        </section>
      </div>
    </div>
  );
}
