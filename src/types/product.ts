export type Size = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  priceInKopecks: number;
  imageUrl: string;
  tags: string[];
  sizes: Size[];
  categoryId: string;
  material: string;
  weight: string;
  season: string;
  countryOfOrigin: string;
};

export type Category = {
  id: string;
  name: string;
};

export type CatalogData = {
  categories: Category[];
  items: Product[];
};

export type CatalogTab = {
  id: string;
  title: string;
};
