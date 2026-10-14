import { createContext, ReactNode, useContext, useState } from 'react';

// Позиция корзины = товар + выбранный размер.
// key уникален для пары (товар, размер): тот же товар в другом размере — отдельная строка.
type CartItem = { key: string; id: string; sizeId: string | null; quantity: number };

type CartContextType = {
  items: CartItem[];
  addToCart: (id: string, sizeId: string | null) => void;
  increment: (key: string) => void;
  decrement: (key: string) => void;
  remove: (key: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const makeKey = (id: string, sizeId: string | null) => `${id}:${sizeId ?? ''}`;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (id: string, sizeId: string | null) => {
    const key = makeKey(id, sizeId);
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { key, id, sizeId, quantity: 1 }];
    });
  };

  const increment = (key: string) => {
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, quantity: i.quantity + 1 } : i))
    );
  };

  const decrement = (key: string) => {
    setItems((prev) =>
      prev
        .map((i) => (i.key === key ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const remove = (key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider value={{ items, addToCart, increment, decrement, remove, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}
