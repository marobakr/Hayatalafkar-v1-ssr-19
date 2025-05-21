export interface IGetOrders {
  row: Row;
}

export interface Row {
  id: number;
  name: string;
  email: string;
  phone: any;
  email_verified_at: string;
  role: string;
  admin_status: number;
  verify_status: number;
  deactive_status: number;
  delete_status: number;
  created_at: string;
  updated_at: string;
  confirmed_orders: ConfirmedOrder[];
}

export interface ConfirmedOrder {
  id: number;
  order_number: string;
  user_id: number;
  user_address_id: number;
  promo_code_id?: number;
  promo_code_value: string;
  subtotal: string;
  tax: string;
  shipping: string;
  total: string;
  payment_method: string;
  order_status: string;
  notes: any;
  active_status: boolean;
  order_date: string;
  order_time: string;
  created_at: string;
  updated_at: string;
}

export interface ILastOrderResponse {
  row: {
    id: number;
    name: string;
    email: string;
    phone: string;
    email_verified_at: string | null;
    role: string;
    admin_status: number;
    verify_status: number;
    deactive_status: number;
    delete_status: number;
    created_at: string;
    updated_at: string;
  };
  order: {
    id: number;
    order_number: string;
    user_id: number;
    user_address_id: number;
    promo_code_id: number | null;
    promo_code_value: string;
    subtotal: string;
    tax: string;
    shipping: string;
    total: string;
    payment_method: string | null;
    order_status: string;
    notes: string | null;
    active_status: boolean;
    order_date: string;
    order_time: string;
    created_at: string;
    updated_at: string;
  };
}
