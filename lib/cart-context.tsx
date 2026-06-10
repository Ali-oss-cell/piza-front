"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AddToCartToast } from "@/components/features/add-to-cart-toast";
import { readCartFromStorage, writeCartToStorage } from "@/lib/cart-storage";
import type { AddToCartPayload, CartItem, DeliveryMode } from "@/types/menu";

interface CartContextValue {
  items: CartItem[];
  deliveryMode: DeliveryMode;
  deliveryFee: number;
  cartCount: number;
  isCartReady: boolean;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  setDeliveryMode: (mode: DeliveryMode) => void;
  addToCart: (payload: AddToCartPayload) => void;
  incrementItem: (id: string) => void;
  decrementItem: (id: string) => void;
  removeItem: (id: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function buildCartLineId(payload: AddToCartPayload): string {
  const toppingKey = payload.toppings?.length ? payload.toppings.slice().sort().join("+") : "";
  const removedKey = payload.removedIngredients?.length
    ? payload.removedIngredients.slice().sort().join("+")
    : "";
  const parts = [payload.item.id, payload.size, payload.crust, toppingKey, removedKey].filter(
    Boolean
  );
  return parts.join("-");
}

function buildCartDescription(payload: AddToCartPayload): string {
  const details: string[] = [payload.item.description];

  if (payload.crust) {
    details.push(`Crust: ${payload.crust}`);
  }

  if (payload.toppings?.length) {
    details.push(`Extras: ${payload.toppings.join(", ")}`);
  }

  if (payload.removedIngredients?.length) {
    details.push(`No: ${payload.removedIngredients.join(", ")}`);
  }

  return details.join(" · ");
}

export function CartProvider({
  children,
  deliveryFee = 5,
}: {
  children: ReactNode;
  deliveryFee?: number;
}): React.ReactElement {
  const [items, setItems] = useState<CartItem[]>([]);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("delivery");
  const [isCartReady, setIsCartReady] = useState(false);
  const [isCartOpen, setCartOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastExiting, setToastExiting] = useState(false);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearToastTimeout = (): void => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
  };

  const showAddToast = useCallback((): void => {
    clearToastTimeout();
    setToastExiting(false);
    setToastVisible(true);

    toastTimeoutRef.current = setTimeout(() => {
      setToastExiting(true);
      toastTimeoutRef.current = setTimeout(() => {
        setToastVisible(false);
        setToastExiting(false);
      }, 250);
    }, 1500);
  }, []);

  useEffect(() => clearToastTimeout, []);

  useEffect(() => {
    const storedItems = readCartFromStorage();
    const frame = window.requestAnimationFrame(() => {
      if (storedItems) {
        setItems(storedItems);
      }

      setIsCartReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!isCartReady) {
      return;
    }

    writeCartToStorage(items);
  }, [items, isCartReady]);

  const addToCart = useCallback(
    (payload: AddToCartPayload) => {
      const cartLineId = buildCartLineId(payload);
      const quantityToAdd = payload.quantity ?? 1;

      setItems((currentItems) => {
        const existing = currentItems.find((entry) => entry.itemId === cartLineId);

        if (existing) {
          return currentItems.map((entry) =>
            entry.itemId === cartLineId
              ? { ...entry, quantity: entry.quantity + quantityToAdd }
              : entry
          );
        }

        return [
          ...currentItems,
          {
            id: `cart-${cartLineId}`,
            itemId: cartLineId,
            name: payload.item.name,
            description: buildCartDescription(payload),
            price: payload.price,
            quantity: quantityToAdd,
            imageUrl: payload.item.imageUrl,
            imageAlt: payload.item.imageAlt,
            size: payload.size,
            crust: payload.crust,
            toppings: payload.toppings,
            removedIngredients: payload.removedIngredients,
          },
        ];
      });

      showAddToast();
    },
    [showAddToast]
  );

  const incrementItem = useCallback((id: string) => {
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item))
    );
  }, []);

  const decrementItem = useCallback((id: string) => {
    setItems((currentItems) =>
      currentItems
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item))
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }, []);

  const cartCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      deliveryMode,
      deliveryFee,
      cartCount,
      isCartReady,
      isCartOpen,
      setCartOpen,
      setDeliveryMode,
      addToCart,
      incrementItem,
      decrementItem,
      removeItem,
    }),
    [
      items,
      deliveryMode,
      deliveryFee,
      cartCount,
      isCartReady,
      isCartOpen,
      addToCart,
      incrementItem,
      decrementItem,
      removeItem,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <AddToCartToast exiting={toastExiting} message="Added to order!" visible={toastVisible} />
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
