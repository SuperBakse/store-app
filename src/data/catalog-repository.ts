import catalogJson from '../../assets/data/products.json';
import type { CatalogData } from '../types/product';

// Единственное место, которое знает, откуда берутся данные каталога.
export function loadCatalog(): CatalogData {
  return catalogJson as CatalogData;
}