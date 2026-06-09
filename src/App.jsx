import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Menu from './pages/Menu';
import FoodDetail from './pages/FoodDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Setup from './pages/Setup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import RoleRoute from './components/RoleRoute';
import SetupGate from './components/SetupGate';
import ScrollToTop from './components/ScrollToTop';
import CartModal from './components/CartModal';
import Notification from './components/Notification';
import { useCart } from './context/CartContext';
import { ROLES } from './constants/roles';
import { Skeleton } from './components/Skeleton';

const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const CustomerDashboard = lazy(() => import('./pages/customer/CustomerDashboard'));
const OrderTracking = lazy(() => import('./pages/customer/OrderTracking'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminMenu = lazy(() => import('./pages/admin/AdminMenu'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminBlogs = lazy(() => import('./pages/admin/AdminBlogs'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminMedia = lazy(() => import('./pages/admin/AdminMedia'));
const AdminContacts = lazy(() => import('./pages/admin/AdminContacts'));
const AdminAudit = lazy(() => import('./pages/admin/AdminAudit'));
const AdminKitchen = lazy(() => import('./pages/admin/AdminKitchen'));
const AdminPromos = lazy(() => import('./pages/admin/AdminPromos'));

function PageLoader() {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 p-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>
  );
}

function Lazy({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function AppRoutes() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateCartQuantity,
    notification,
    dismissNotification,
  } = useCart();

  return (
  <SetupGate>
    <Routes>
      <Route path="/setup" element={<Setup />} />
      <Route path="/" element={<Home />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/food/:id" element={<FoodDetail />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/dashboard"
        element={
          <RoleRoute allowedRoles={[ROLES.CUSTOMER]}>
            <Lazy>
              <CustomerDashboard />
            </Lazy>
          </RoleRoute>
        }
      />

      <Route
        path="/checkout"
        element={
          <Lazy>
            <Checkout />
          </Lazy>
        }
      />
      <Route
        path="/order-success"
        element={
          <Lazy>
            <OrderSuccess />
          </Lazy>
        }
      />
      <Route
        path="/track-order/:orderId"
        element={
          <Lazy>
            <OrderTracking />
          </Lazy>
        }
      />

      <Route
        path="/admin"
        element={
          <RoleRoute allowedRoles={[ROLES.ADMIN]}>
            <Lazy>
              <AdminLayout />
            </Lazy>
          </RoleRoute>
        }
      >
        <Route index element={<Lazy><AdminDashboard /></Lazy>} />
        <Route path="orders" element={<Lazy><AdminOrders /></Lazy>} />
        <Route path="kitchen" element={<Lazy><AdminKitchen /></Lazy>} />
        <Route path="menu" element={<Lazy><AdminMenu /></Lazy>} />
        <Route path="reviews" element={<Lazy><AdminReviews /></Lazy>} />
        <Route path="blogs" element={<Lazy><AdminBlogs /></Lazy>} />
        <Route path="media" element={<Lazy><AdminMedia /></Lazy>} />
        <Route path="promos" element={<Lazy><AdminPromos /></Lazy>} />
        <Route path="contacts" element={<Lazy><AdminContacts /></Lazy>} />
        <Route path="audit" element={<Lazy><AdminAudit /></Lazy>} />
        <Route path="users" element={<Lazy><AdminUsers /></Lazy>} />
        <Route path="settings" element={<Lazy><AdminSettings /></Lazy>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>

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
      onClose={dismissNotification}
    />
  </SetupGate>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppRoutes />
    </Router>
  );
}

export default App;
