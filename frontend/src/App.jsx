import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OtpLogin from "./pages/OtpLogin";
import Auth from "./pages/Auth";
import RestaurantDetails from "./pages/RestaurantDetails";
import DishDetails from "./pages/DishDetails";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Refund from "./pages/Refund";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import AgentProtected from "./components/AgentProtected";
import RestaurantProtected from "./components/RestaurantProtected";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import RestaurantLogin from "./pages/RestaurantLogin";
import AgentLogin from "./pages/AgentLogin";

import AdminProtected from "./components/AdminProtected";
import AdminLayout from "./components/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminRestaurants from "./pages/admin/AdminRestaurants";
import AdminAgents from "./pages/admin/AdminAgents";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminMenu from "./pages/admin/AdminMenu";
import AdminRestaurantDetail from "./pages/admin/AdminRestaurantDetail";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminCoupons from "./pages/admin/AdminCoupons";


import Profile from "./pages/Profile";
import OrderTracking from "./pages/OrderTracking";
import Cart from "./pages/Cart";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function AppContent() {
  const location = useLocation();
  const hideNavbarPaths = ["/login", "/register", "/restaurant/login", "/otp-login", "/auth", "/restaurant/dashboard", "/agent/login", "/agent/dashboard"];
  const hideFooterPaths = ["/login", "/register", "/restaurant/login", "/otp-login", "/auth", "/restaurant/dashboard", "/agent/login", "/agent/dashboard"];
  
  const isAdminPath = location.pathname.startsWith("/admin");
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname) || isAdminPath;
  const shouldHideFooter = hideFooterPaths.includes(location.pathname) || isAdminPath;

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      <Routes>
        {/* ================= USER ROUTES ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/otp-login" element={<OtpLogin />} />

        {/* ================= RESTAURANT ROUTES ================= */}
        <Route path="/restaurant/login" element={<RestaurantLogin />} />

        <Route
          path="/restaurant/dashboard"
          element={
            <RestaurantProtected>
              <RestaurantDashboard />
            </RestaurantProtected>
          }
        />
        <Route path="/restaurant/:id" element={<RestaurantDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/track/:orderId" element={<OrderTracking />} />
        <Route path="/dish/:id" element={<DishDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/refund-policy" element={<Refund />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />

        <Route 
          path="/agent/dashboard" 
          element={
            <AgentProtected>
              <AgentDashboard />
            </AgentProtected>
          } 
        />

        {/* ================= ADMIN ROUTES ================= */}
        <Route 
          path="/admin/*" 
          element={
            <AdminProtected>
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminOverview />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="restaurants" element={<AdminRestaurants />} />
                  <Route path="restaurants/:id" element={<AdminRestaurantDetail />} />
                  <Route path="agents" element={<AdminAgents />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="menu" element={<AdminMenu />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="payments" element={<AdminPayments />} />
                  <Route path="bookings" element={<AdminBookings />} />
                  <Route path="coupons" element={<AdminCoupons />} />
                  <Route path="*" element={<AdminOverview />} />
                </Routes>
              </AdminLayout>
            </AdminProtected>
          } 
        />
      </Routes>
      <Analytics/>
      {!shouldHideFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
