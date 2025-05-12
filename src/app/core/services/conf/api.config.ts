export const API_CONFIG = {
  BASE_URL: 'https://digitalbondmena.com/mesoshop/api/',
  BASE_URL_IMAGE: 'https://digitalbondmena.com/mesoshop/',

  /* Home Page  */
  HOME: {
    GET: 'home',
  },

  PRODUCTS: {
    GET_ALL: 'menu/products',
    GET_WITH_CATEGORY: 'menu/category',
    GET_WITH_SUBCATEGORY: 'menu/subcategory',
    GET_WITH_SLUG: 'menu/product',
  },

  CATEGORY: {
    GET_ALL: 'menu/category',
  },

  BLOG: {
    GET_ALL: 'blogs',
    GET_SINGLE: 'blogs/ar-blog-title',
  },

  STATIC_PAGES: {
    ABOUT_US: 'home/about-us',
    CONTACT_US: 'home/contact-us',
  },

  ORDERS: {
    CHECK_CART: 'Check Cart',
    ADD_TO_CART: 'Add To Cart & Create Order',
    UPDATE_QUANTITY: 'Update Quantity',
    REMOVE_FROM_CART: 'Remove From Cart',
    REMOVE_ALL: 'Remove All Cart',
    PROMO_CODE: 'Promo Code Validation',
    PLACE_ORDER: 'Place Order',
  },
};
