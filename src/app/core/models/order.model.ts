export interface CartItem {
  productId: string | number;
  quantity: number;
  price?: number;
  name?: string;
  image?: string;
  options?: any[];
}

export interface PromoCode {
  code: string;
  discount?: number;
  type?: 'percentage' | 'fixed';
}

export interface OrderRequest {
  items?: CartItem[];
  billingInfo?: BillingInfo;
  shippingInfo?: ShippingInfo;
  promoCode?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface BillingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode?: string;
}

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode?: string;
}

export interface CartResponse {
  items: CartItem[];
  subtotal: number;
  total: number;
  tax?: number;
  shipping?: number;
  discount?: number;
  promoCode?: PromoCode;
}

export interface OrderResponse {
  orderId: string | number;
  status: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  tax?: number;
  shipping?: number;
  discount?: number;
  promoCode?: PromoCode;
  billingInfo: BillingInfo;
  shippingInfo: ShippingInfo;
  paymentMethod: string;
  createdAt: string;
}

export interface PromoCodeResponse {
  valid: boolean;
  message?: string;
  promoCode?: PromoCode;
}
