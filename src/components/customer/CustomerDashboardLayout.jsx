import { Link } from 'react-router-dom';
import { LuUtensilsCrossed } from 'react-icons/lu';
import { CUSTOMER_DASHBOARD_TABS } from '../../constants/customerDashboard';
import { getFirstName } from '../../utils/userDisplay';

function DashboardTabButton({ tab, isActive, badge, onClick, compact = false }) {
  const TabIcon = tab.icon;

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`relative inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap shrink-0 transition-colors ${
          isActive
            ? 'bg-green-600 text-white shadow-sm'
            : 'bg-white text-gray-700 border border-gray-200 hover:border-green-200 hover:text-green-700'
        }`}
        aria-current={isActive ? 'page' : undefined}
      >
        <TabIcon className="w-4 h-4" />
        {tab.shortLabel}
        {badge > 0 && (
          <span className="min-w-[1rem] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {badge}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
        isActive
          ? 'bg-green-50 border border-green-200 text-green-800'
          : 'hover:bg-gray-50 text-gray-700 border border-transparent'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      <span
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
          isActive ? 'bg-green-600 text-white' : 'bg-gray-100 text-green-600'
        }`}
      >
        <TabIcon className="w-5 h-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-sm font-semibold">{tab.label}</span>
          {badge > 0 && (
            <span className="text-[10px] font-bold bg-green-600 text-white px-1.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </span>
        <span className="block text-xs text-gray-500 mt-0.5 leading-snug">{tab.description}</span>
      </span>
    </button>
  );
}

export default function CustomerDashboardLayout({
  user,
  activeTab,
  onTabChange,
  badges = {},
  children,
}) {
  const firstName = getFirstName(user?.name);

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Welcome back, {firstName}</p>
        </div>
        <Link
          to="/menu"
          className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors shrink-0"
        >
          <LuUtensilsCrossed className="w-4 h-4" />
          Order Food
        </Link>
      </div>

      <nav
        className="lg:hidden flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Dashboard navigation"
      >
        {CUSTOMER_DASHBOARD_TABS.map((tab) => (
          <DashboardTabButton
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            badge={badges[tab.id]}
            onClick={() => onTabChange(tab.id)}
            compact
          />
        ))}
      </nav>

      <div className="flex flex-col lg:flex-row gap-5 sm:gap-6">
        <aside className="hidden lg:block w-64 shrink-0">
          <nav
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 space-y-1 sticky top-24"
            aria-label="Dashboard navigation"
          >
            {CUSTOMER_DASHBOARD_TABS.map((tab) => (
              <DashboardTabButton
                key={tab.id}
                tab={tab}
                isActive={activeTab === tab.id}
                badge={badges[tab.id]}
                onClick={() => onTabChange(tab.id)}
              />
            ))}
          </nav>
        </aside>

        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
