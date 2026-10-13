import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { loadCatalog } from '../data/catalog-repository';
import type { CatalogData, CatalogTab, Product } from '../types/product';

export const NEW_TAB_ID = 'new';
const NEW_TAG = 'New';

export type CatalogStatus = 'loading' | 'error' | 'ready';

const EMPTY_CATALOG: CatalogData = { categories: [], items: [] };

type CatalogContextType = {
  // Состояние загрузки каталога из API
  status: CatalogStatus;
  errorMessage: string;
  reload: () => void;

  products: Product[];
  tabs: CatalogTab[];
  selectedTabId: string;
  selectTab: (id: string) => void;
  visibleProducts: Product[];
  getProductById: (id: string) => Product | undefined;
  // Какой товар открыт в bottom sheet (null — sheet закрыт).
  // Живёт здесь, выше списка, поэтому sheet один на всё приложение.
  selectedProduct: Product | null;
  openProduct: (id: string) => void;
  closeProduct: () => void;
};

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<CatalogData>(EMPTY_CATALOG);
  const [status, setStatus] = useState<CatalogStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  // Каждое «Повторить» увеличивает счётчик и запускает загрузку заново
  const [attempt, setAttempt] = useState(0);
  const [selectedTabId, setSelectedTabId] = useState<string>(NEW_TAB_ID);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    loadCatalog(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setCatalog(data);
        setStatus('ready');
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        setErrorMessage(e instanceof Error ? e.message : 'Неизвестная ошибка');
        setStatus('error');
      });

    return () => controller.abort();
  }, [attempt]);

  const reload = useCallback(() => {
    setStatus('loading');
    setAttempt((n) => n + 1);
  }, []);

  // «Новинки» собираются на клиенте и всегда стоят первым табом
  const tabs = useMemo<CatalogTab[]>(
    () => [
      { id: NEW_TAB_ID, title: 'Новинки' },
      ...catalog.categories.map((c) => ({ id: c.id, title: c.name })),
    ],
    [catalog]
  );

  const visibleProducts = useMemo(
    () =>
      selectedTabId === NEW_TAB_ID
        ? catalog.items.filter((p) => p.tags.includes(NEW_TAG))
        : catalog.items.filter((p) => p.categoryId === selectedTabId),
    [catalog, selectedTabId]
  );

  const value = useMemo<CatalogContextType>(
    () => ({
      status,
      errorMessage,
      reload,
      products: catalog.items,
      tabs,
      selectedTabId,
      selectTab: setSelectedTabId,
      visibleProducts,
      getProductById: (id: string) => catalog.items.find((p) => p.id === id),
      selectedProduct:
        catalog.items.find((p) => p.id === selectedProductId) ?? null,
      openProduct: setSelectedProductId,
      closeProduct: () => setSelectedProductId(null),
    }),
    [
      status,
      errorMessage,
      reload,
      catalog,
      tabs,
      selectedTabId,
      visibleProducts,
      selectedProductId,
    ]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) throw new Error('useCatalog must be used inside CatalogProvider');
  return context;
}