export interface IProductDetails {
  product: IProduct;
  relatedProducts: IProduct[];
}

export interface IProduct {
  id: number;
  category_id: number;
  subcategory_id: number;
  en_name: string;
  ar_name: string;
  en_slug: string;
  ar_slug: string;
  en_description?: string;
  ar_description?: string;
  price?: string;
  sale_price: string;
  price_after_sale: string;
  stock_status: boolean;
  main_image: string;
  additional_images?: Array<{ img: string }>;
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
  choices?: any[];
  size: string;
  ar_meta_Title?: string | null;
  en_meta_Title?: string | null;
  ar_meta_text?: string | null;
  en_meta_text?: string | null;
}

export interface Choice {
  id: number;
  product_id: number;
  en_name: string;
  ar_name: string;
  cuurent_value: number;
  active_status: number;
  created_at: string;
  updated_at: string;
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
