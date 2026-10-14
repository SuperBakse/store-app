import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useCatalog } from './catalog-context';

// Позиция корзины: только id товара, id размера и количество.
// Название, имя размера, цену и картинку берём из каталога в момент показа.
export type CartItem = {
  itemId: string;
  sizeId: string;
  quantity: number;
};

// Один JSON-ключ в локальном хранилище: массив CartItem
const STORAGE_KEY = 'cart.v1';

type CartContextValue = {
  items: CartItem[];
  // true, когда сохранённая корзина уже прочитана с диска
  hydrated: boolean;
  // сумма quantity по всем позициям (для бейджа)
  count: number;
  addItem: (itemId: string, sizeId: string) => void;
  increment: (itemId: string, sizeId: string) => void;
  decrement: (itemId: string, sizeId: string) => void;
  remove: (itemId: string, sizeId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

// Складывает позиции с одинаковой парой (товар, размер) в одну
function mergeItems(...lists: CartItem[][]): CartItem[] {
  const result: CartItem[] = [];
  for (const list of lists) {
    for (const item of list) {
      const existing = result.find(
        (x) => x.itemId === item.itemId && x.sizeId === item.sizeId
      );
      if (existing) existing.quantity += item.quantity;
      else result.push({ ...item });
    }
  }
  return result;
}

// Разбор содержимого хранилища: всё, что не похоже на позицию, молча отбрасываем
function parseStored(raw: string | null): CartItem[] {
  if (!raw) return [];
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data)) return [];

  const valid: CartItem[] = [];
  for (const entry of data) {
    if (
      entry &&
      typeof entry === 'object' &&
      typeof (entry as CartItem).itemId === 'string' &&
      typeof (entry as CartItem).sizeId === 'string' &&
      Number.isInteger((entry as CartItem).quantity) &&
      (entry as CartItem).quantity > 0
    ) {
      const { itemId, sizeId, quantity } = entry as CartItem;
      valid.push({ itemId, sizeId, quantity });
    }
  }
  return mergeItems(valid);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { status, products } = useCatalog();
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // 1. Один раз при старте читаем корзину с диска
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const stored = parseStored(await AsyncStorage.getItem(STORAGE_KEY));
        if (cancelled) return;
        // Если пользователь успел что-то добавить до конца чтения — не теряем это
        setItems((current) => mergeItems(stored, current));
      } catch (e) {
        console.warn('Не удалось прочитать корзину', e);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // 2. Сохраняем при каждом изменении, но только после чтения:
  // иначе стартовый пустой массив затёр бы сохранённую корзину
  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch((e) => {
      console.warn('Не удалось сохранить корзину', e);
    });
  }, [items, hydrated]);

  // 3. Когда каталог загружен, тихо убираем позиции, которых в нём больше нет
  useEffect(() => {
    if (!hydrated || status !== 'ready') return;
    setItems((current) => {
      const filtered = current.filter((item) => {
        const product = products.find((p) => p.id === item.itemId);
        return !!product && product.sizes.some((s) => s.id === item.sizeId);
      });
      return filtered.length === current.length ? current : filtered;
    });
  }, [hydrated, status, products]);

  const addItem = useCallback((itemId: string, sizeId: string) => {
    setItems((current) => {
      const exists = current.some((x) => x.itemId === itemId && x.sizeId === sizeId);
      if (exists) {
        return current.map((x) =>
          x.itemId === itemId && x.sizeId === sizeId
            ? { ...x, quantity: x.quantity + 1 }
            : x
        );
      }
      return [...current, { itemId, sizeId, quantity: 1 }];
    });
  }, []);

  const increment = useCallback((itemId: string, sizeId: string) => {
    setItems((current) =>
      current.map((x) =>
        x.itemId === itemId && x.sizeId === sizeId ? { ...x, quantity: x.quantity + 1 } : x
      )
    );
  }, []);

  // Когда количество доходит до 0, позиция удаляется
  const decrement = useCallback((itemId: string, sizeId: string) => {
    setItems((current) =>
      current
        .map((x) =>
          x.itemId === itemId && x.sizeId === sizeId ? { ...x, quantity: x.quantity - 1 } : x
        )
        .filter((x) => x.quantity > 0)
    );
  }, []);

  const remove = useCallback((itemId: string, sizeId: string) => {
    setItems((current) => current.filter((x) => !(x.itemId === itemId && x.sizeId === sizeId)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = items.reduce((sum, x) => sum + x.quantity, 0);

  const value = useMemo(
    () => ({ items, hydrated, count, addItem, increment, decrement, remove, clear }),
    [items, hydrated, count, addItem, increment, decrement, remove, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart нужно использовать внутри CartProvider');
  return context;
}
