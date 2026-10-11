export type Product = {
  id: number;
  name: string;
  priceInKopecks: number;
  imageUrl: string;
  description: string;
  category: string;
  tags: string[];
};

export type Category = {
  id: string;
  title: string;
};

export type CatalogData = {
  categories: Category[];
  products: Product[];
};

export type CatalogTab = {
  id: string;
  title: string;
};