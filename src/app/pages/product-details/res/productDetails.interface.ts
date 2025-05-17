export interface IProduct {
  product: Product[];
}

export interface Product {
  id: number;
  category_id: number;
  subcategory_id: number;
  en_name: string;
  ar_name: string;
  en_slug: string;
  ar_slug: string;
  en_description: string;
  ar_description: string;
  price: string;
  sale_price: string;
  price_after_sale: string;
  stock_status: boolean;
  main_image: string;
  additional_images: any[][];
  ar_small_descritpion: any;
  en_small_descritpion: any;
  featured: number;
  active_status: boolean;
  en_more_information: string;
  ar_more_information: string;
  en_ingredient: string;
  ar_ingredient: string;
  en_how_to_use: string;
  ar_how_to_use: string;
  product_counter: number;
  created_at: string;
  updated_at: string;
  category: Category;
  subcategory: Subcategory;
}

export interface Category {
  id: number;
  en_name: string;
  ar_name: string;
  en_slug: string;
  ar_slug: string;
  active_status: number;
  main_image: string;
  order_view: number;
  created_at: string;
  updated_at: string;
}

export interface Subcategory {
  id: number;
  category_id: number;
  en_name: string;
  ar_name: string;
  en_slug: string;
  ar_slug: string;
  active_status: number;
  order_view: number;
  created_at: string;
  updated_at: string;
}
