import { createContext, useContext, useState, useEffect } from "react";
import ConfirmModal from "../components/ConfirmModal";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem("khamma_cart");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [restaurantId, setRestaurantId] = useState(() => {
    const savedResId = localStorage.getItem("khamma_cart_restaurant");
    // Heal corrupted state if it somehow became [object Object]
    if (savedResId && savedResId !== "[object Object]") return savedResId;

    // Backup: recover from items if top-level ID is missing
    const savedCart = localStorage.getItem("khamma_cart");
    if (savedCart) {
      try {
        const items = JSON.parse(savedCart);
        if (items.length > 0) {
          const firstItem = items[0];
          const rId = firstItem.restaurant?._id || firstItem.restaurant;
          if (rId && typeof rId === 'string' && rId !== "[object Object]") return rId;
        }
      } catch (e) {}
    }
    return null;
  });

  const [pendingCartClear, setPendingCartClear] = useState(null); // Stores { item, resId, variant, qty, selectedAddOns, spiceLevel, instructions }

  useEffect(() => {
    localStorage.setItem("khamma_cart", JSON.stringify(cartItems));
    if (restaurantId) {
      localStorage.setItem("khamma_cart_restaurant", restaurantId);
    } else {
      localStorage.removeItem("khamma_cart_restaurant");
    }
  }, [cartItems, restaurantId]);

  const addToCart = (item, resId, variant = null, qty = 1, selectedAddOns = [], spiceLevel = "None", instructions = "") => {
    const normalizedResId = resId?._id || resId;
    
    // Check if adding from a different restaurant
    if (restaurantId && restaurantId !== normalizedResId) {
      setPendingCartClear({ item, resId: normalizedResId, variant, qty, selectedAddOns, spiceLevel, instructions });
      return;
    }

    setRestaurantId(normalizedResId);

    setCartItems((prev) => {
      // Find matching item by ID, variant, and customizations
      const existing = prev.find((i) => 
        i._id === item._id && 
        (variant ? i.variant?.name === variant.name : !i.variant) &&
        JSON.stringify(i.selectedAddOns || []) === JSON.stringify(selectedAddOns) &&
        i.spiceLevel === spiceLevel &&
        i.instructions === instructions
      );
      
      if (existing) {
        return prev.map((i) =>
          (i._id === item._id && 
           (variant ? i.variant?.name === variant.name : !i.variant) &&
           JSON.stringify(i.selectedAddOns || []) === JSON.stringify(selectedAddOns) &&
           i.spiceLevel === spiceLevel &&
           i.instructions === instructions)
            ? { ...i, qty: i.qty + qty } 
            : i
        );
      }
      return [...prev, { ...item, variant, qty, selectedAddOns, spiceLevel, instructions }];
    });
  };

  const removeFromCart = (itemId, variant = null, selectedAddOns = [], spiceLevel = "None", instructions = "") => {
    setCartItems((prev) => {
      const existing = prev.find((i) => 
        i._id === itemId && 
        (variant ? i.variant?.name === variant.name : !i.variant) &&
        JSON.stringify(i.selectedAddOns || []) === JSON.stringify(selectedAddOns) &&
        i.spiceLevel === spiceLevel &&
        i.instructions === instructions
      );
      
      if (!existing) return prev;

      if (existing.qty === 1) {
        const newCart = prev.filter((i) => 
          !(i._id === itemId && 
            (variant ? i.variant?.name === variant.name : !i.variant) &&
            JSON.stringify(i.selectedAddOns || []) === JSON.stringify(selectedAddOns) &&
            i.spiceLevel === spiceLevel &&
            i.instructions === instructions)
        );
        if (newCart.length === 0) setRestaurantId(null);
        return newCart;
      }
      return prev.map((i) =>
        (i._id === itemId && 
         (variant ? i.variant?.name === variant.name : !i.variant) &&
         JSON.stringify(i.selectedAddOns || []) === JSON.stringify(selectedAddOns) &&
         i.spiceLevel === spiceLevel &&
         i.instructions === instructions) 
          ? { ...i, qty: i.qty - 1 } 
          : i
      );
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurantId(null);
  };

  const confirmClearAndAdd = () => {
    if (pendingCartClear) {
      const { item, resId, variant, qty, selectedAddOns, spiceLevel, instructions } = pendingCartClear;
      setCartItems([{ ...item, variant, qty, selectedAddOns, spiceLevel, instructions }]);
      setRestaurantId(resId);
      setPendingCartClear(null);
    }
  };

  const cancelClearCart = () => {
    setPendingCartClear(null);
  };

  return (
    <CartContext.Provider
      value={{ cartItems, restaurantId, addToCart, removeFromCart, clearCart }}
    >
      {children}
      {pendingCartClear && (
        <ConfirmModal
          title="Clear Cart?"
          message="You have items from another restaurant in your cart. Do you want to clear the cart and add this item?"
          confirmText="Clear Cart & Add"
          cancelText="Cancel"
          onConfirm={confirmClearAndAdd}
          onCancel={cancelClearCart}
        />
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
