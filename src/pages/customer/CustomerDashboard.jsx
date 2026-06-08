import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import CustomerDashboardLayout from '../../components/customer/CustomerDashboardLayout';
import OverviewPanel from '../../components/customer/OverviewPanel';
import ProfileSection from '../../components/customer/ProfileSection';
import AddressesSection from '../../components/customer/AddressesSection';
import OrdersSection from '../../components/customer/OrdersSection';
import ReviewsSection from '../../components/customer/ReviewsSection';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../hooks/useOrders';
import { isActiveOrderStatus, isPendingOrderStatus } from '../../constants/orders';
import { useCustomerCounts } from '../../hooks/useCustomerCounts';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { VALID_CUSTOMER_TABS } from '../../constants/customerDashboard';

export default function CustomerDashboard() {
  useDocumentTitle('My Dashboard');
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    tabFromUrl && VALID_CUSTOMER_TABS.has(tabFromUrl) ? tabFromUrl : 'overview'
  );

  useEffect(() => {
    if (tabFromUrl && VALID_CUSTOMER_TABS.has(tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl, activeTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'overview') {
      setSearchParams({});
    } else {
      setSearchParams({ tab: tabId });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { orders } = useOrders(user.id);
  const { addresses: addressCount, reviews: reviewCount } = useCustomerCounts(user.id);

  const badges = useMemo(() => {
    const activeOrders = orders.filter(
      (order) => isPendingOrderStatus(order.status) || isActiveOrderStatus(order.status)
    ).length;
    return {
      orders: activeOrders,
    };
  }, [orders]);

  const renderPanel = () => {
    switch (activeTab) {
      case 'orders':
        return <OrdersSection userId={user.id} orders={orders} />;
      case 'profile':
        return <ProfileSection />;
      case 'addresses':
        return <AddressesSection userId={user.id} />;
      case 'reviews':
        return <ReviewsSection userId={user.id} />;
      default:
        return (
          <OverviewPanel
            user={user}
            orders={orders}
            addressCount={addressCount}
            reviewCount={reviewCount}
            onNavigate={handleTabChange}
          />
        );
    }
  };

  return (
    <PageLayout mainClassName="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-5 sm:py-8">
      <CustomerDashboardLayout
        user={user}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        badges={badges}
      >
        {renderPanel()}
      </CustomerDashboardLayout>
    </PageLayout>
  );
}
