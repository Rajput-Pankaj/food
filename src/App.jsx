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
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import OrderTracking from './pages/customer/OrderTracking';

import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminMenu from './pages/admin/AdminMenu';
import AdminReviews from './pages/admin/AdminReviews';
import AdminBlogs from './pages/admin/AdminBlogs';
import AdminSettings from './pages/admin/AdminSettings';

import RoleRoute from './components/RoleRoute';
import ScrollToTop from './components/ScrollToTop';
import CartModal from './components/CartModal';
import Notification from './components/Notification';
import { useCart } from './context/CartContext';
import { ROLES } from './constants/roles';

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
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/food/:id" element={<FoodDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={
            <RoleRoute allowedRoles={[ROLES.CUSTOMER]}>
              <CustomerDashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <RoleRoute allowedRoles={[ROLES.CUSTOMER]}>
              <Checkout />
            </RoleRoute>
          }
        />
        <Route
          path="/order-success"
          element={
            <RoleRoute allowedRoles={[ROLES.CUSTOMER]}>
              <OrderSuccess />
            </RoleRoute>
          }
        />
        <Route
          path="/track-order/:orderId"
          element={
            <RoleRoute allowedRoles={[ROLES.CUSTOMER]}>
              <OrderTracking />
            </RoleRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminLayout />
            </RoleRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="menu" element={<AdminMenu />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="blogs" element={<AdminBlogs />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="settings" element={<AdminSettings />} />
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
    </>
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
