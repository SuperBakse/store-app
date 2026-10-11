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
  getProductById: (id: number) => Product | undefined;
};

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [catalog] = useState(() => loadCatalog());
  const [selectedTabId, setSelectedTabId] = useState<string>(NEW_TAB_ID);

  // «Новинки» собираются на клиенте и всегда стоят первым табом
  const tabs = useMemo<CatalogTab[]>(
    () => [
      { id: NEW_TAB_ID, title: 'Новинки' },
      ...catalog.categories.map((c) => ({ id: c.id, title: c.title })),
    ],
    [catalog]
  );

  const visibleProducts = useMemo(
    () =>
      selectedTabId === NEW_TAB_ID
        ? catalog.products.filter((p) => p.tags.includes(NEW_TAG))
        : catalog.products.filter((p) => p.category === selectedTabId),
    [catalog, selectedTabId]
  );

  const value = useMemo<CatalogContextType>(
    () => ({
      products: catalog.products,
      tabs,
      selectedTabId,
      selectTab: setSelectedTabId,
      visibleProducts,
      getProductById: (id: number) => catalog.products.find((p) => p.id === id),
    }),
    [catalog, tabs, selectedTabId, visibleProducts]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) throw new Error('useCatalog must be used inside CatalogProvider');
  return context;
}