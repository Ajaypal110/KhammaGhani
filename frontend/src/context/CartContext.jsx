import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem("khamma_cart");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [restaurantId, setRestaurantId] = useState(() => {
    const saved = localStorage.getItem("khamma_cart_restaurant");
    return saved || null;
  });

  useEffect(() => {
    localStorage.setItem("khamma_cart", JSON.stringify(cartItems));
    if (restaurantId) {
      localStorage.setItem("khamma_cart_restaurant", restaurantId);
    } else {
      localStorage.removeItem("khamma_cart_restaurant");
    }
  }, [cartItems, restaurantId]);

  const addToCart = (item, resId) => {
    // Check if adding from a different restaurant
    if (restaurantId && restaurantId !== resId) {
      const confirmClear = window.confirm(
        "You have items from another restaurant in your cart. Do you want to clear the cart and add this item?"
      );
      if (!confirmClear) return;
      
      setCartItems([{ ...item, qty: 1 }]);
      setRestaurantId(resId);
      return;
    }

    setRestaurantId(resId);

    setCartItems((prev) => {
      const existing = prev.find((i) => i._id === item._id);
      if (existing) {
        return prev.map((i) =>
          i._id === item._id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i._id === itemId);
      if (existing.qty === 1) {
        const newCart = prev.filter((i) => i._id !== itemId);
        if (newCart.length === 0) setRestaurantId(null);
        return newCart;
      }
      return prev.map((i) =>
        i._id === itemId ? { ...i, qty: i.qty - 1 } : i
      );
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurantId(null);
  };

  return (
    <CartContext.Provider
      value={{ cartItems, restaurantId, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
