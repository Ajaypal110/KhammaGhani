import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OtpLogin from "./pages/OtpLogin";
import Auth from "./pages/Auth";
import RestaurantDetails from "./pages/RestaurantDetails";
import DishDetails from "./pages/DishDetails";



import RestaurantLogin from "./pages/RestaurantLogin";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import RestaurantProtected from "./components/RestaurantProtected";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Navbar />
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
      </Routes>
      <Footer />
    </BrowserRouter>
    </CartProvider>
  );
}

export default App;
