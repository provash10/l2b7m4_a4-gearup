export interface IGearFilter {
  categoryId?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  isAvailable?: string;
  searchTerm?: string;
}

export interface ICreateGear {
  name: string;
  description: string;
  pricePerDay: number;
  brand: string;
  stock?: number;
  isAvailable?: boolean;
  categoryId: string;
}

export interface IUpdateGear {
  name?: string;
  description?: string;
  pricePerDay?: number;
  brand?: string;
  stock?: number;
  isAvailable?: boolean;
  categoryId?: string;
}
