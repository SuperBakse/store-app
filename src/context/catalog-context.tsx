import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

import { loadCatalog } from '../data/catalog-repository';
import type { CatalogTab, Product } from '../types/product';

export const NEW_TAB_ID = 'new';
const NEW_TAG = 'New';

type CatalogContextType = {
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
  const [catalog] = useState(() => loadCatalog());
  const [selectedTabId, setSelectedTabId] = useState<string>(NEW_TAB_ID);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

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
    [catalog, tabs, selectedTabId, visibleProducts, selectedProductId]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) throw new Error('useCatalog must be used inside CatalogProvider');
  return context;
}
