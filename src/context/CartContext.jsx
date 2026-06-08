import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getJson, setJson, storageKeys } from '../utils/storage';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState({ message: '', isVisible: false });
  const notificationTimer = useRef(null);

  useEffect(() => {
    setCart(getJson(storageKeys.CART_KEY, []));
  }, []);

  useEffect(() => {
    setJson(storageKeys.CART_KEY, cart);
  }, [cart]);

  useEffect(() => {
    return () => {
      if (notificationTimer.current) {
        clearTimeout(notificationTimer.current);
      }
    };
  }, []);

  const showNotification = useCallback((message) => {
    if (notificationTimer.current) {
      clearTimeout(notificationTimer.current);
    }
    setNotification({ message, isVisible: true });
    notificationTimer.current = setTimeout(() => {
      setNotification({ message: '', isVisible: false });
    }, 3000);
  }, []);

  const addToCart = useCallback(
    (item) => {
      setCart((prevCart) => {
        const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
        if (existingItem) {
          showNotification(`${item.food_name} quantity updated in cart!`);
          return prevCart.map((cartItem) =>
            cartItem.id === item.id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          );
        }
        showNotification(`${item.food_name} added to cart!`);
        return [...prevCart, { ...item, quantity: 1 }];
      });
    },
    [showNotification]
  );

  const removeFromCart = useCallback(
    (itemId) => {
      setCart((prevCart) => {
        const item = prevCart.find((cartItem) => cartItem.id === itemId);
        if (item) {
          showNotification(`${item.food_name} removed from cart!`);
        }
        return prevCart.filter((cartItem) => cartItem.id !== itemId);
      });
    },
    [showNotification]
  );

  const updateCartQuantity = useCallback(
    (itemId, newQuantity) => {
      if (newQuantity <= 0) {
        removeFromCart(itemId);
        return;
      }
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const addItemsToCart = useCallback(
    (items) => {
      if (!items?.length) return;

      setCart((prevCart) => {
        let nextCart = [...prevCart];

        for (const item of items) {
          const existingItem = nextCart.find((cartItem) => cartItem.id === item.id);
          if (existingItem) {
            nextCart = nextCart.map((cartItem) =>
              cartItem.id === item.id
                ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                : cartItem
            );
          } else {
            nextCart.push({ ...item });
          }
        }

        return nextCart;
      });

      showNotification(
        items.length === 1
          ? `${items[0].food_name} added to cart!`
          : `${items.length} items added to cart!`
      );
    },
    [showNotification]
  );

  const cartItemCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart]
  );

  const cartTotal = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart]
  );

  const dismissNotification = useCallback(() => {
    if (notificationTimer.current) {
      clearTimeout(notificationTimer.current);
    }
    setNotification({ message: '', isVisible: false });
  }, []);

  const value = useMemo(
    () => ({
      cart,
      isCartOpen,
      setIsCartOpen,
      notification,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      addItemsToCart,
      cartItemCount,
      cartTotal,
      dismissNotification,
    }),
    [
      cart,
      isCartOpen,
      notification,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      addItemsToCart,
      cartItemCount,
      cartTotal,
      dismissNotification,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
