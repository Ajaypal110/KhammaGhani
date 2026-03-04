import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

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



import RestaurantLogin from "./pages/RestaurantLogin";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import RestaurantProtected from "./components/RestaurantProtected";

import AgentLogin from "./pages/AgentLogin";
import AgentDashboard from "./pages/AgentDashboard";
import AgentProtected from "./components/AgentProtected";

import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function AppContent() {
  const location = useLocation();
  const hideNavbarPaths = ["/login", "/register", "/restaurant/login", "/otp-login", "/auth", "/restaurant/dashboard", "/agent/login", "/agent/dashboard"];
  const hideFooterPaths = ["/login", "/register", "/restaurant/login", "/otp-login", "/auth", "/restaurant/dashboard", "/agent/login", "/agent/dashboard"];
  const shouldHideNavbar = hideNavbarPaths.includes(location.pathname);
  const shouldHideFooter = hideFooterPaths.includes(location.pathname);

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
        <Route path="/dish/:id" element={<DishDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/refund-policy" element={<Refund />} />

        {/* ================= AGENT ROUTES ================= */}
        <Route path="/agent/login" element={<AgentLogin />} />
        <Route 
          path="/agent/dashboard" 
          element={
            <AgentProtected>
              <AgentDashboard />
            </AgentProtected>
          } 
        />
      </Routes>
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
