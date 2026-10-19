export const FB_PIXEL_ID = '2337773886975154';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

/**
 * Trigger standard PageView
 */
export const pageview = () => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', 'PageView');
  }
};

/**
 * Trigger standard Meta Pixel event
 * https://developers.facebook.com/docs/meta-pixel/reference
 */
export const trackEvent = (name: string, options: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', name, options);
  }
};

/**
 * Trigger custom Meta Pixel event
 */
export const trackCustomEvent = (name: string, options: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('trackCustom', name, options);
  }
};

/**
 * E-commerce: AddToCart
 */
export const trackAddToCart = (product: {
  id?: string;
  name?: string;
  price?: number;
  quantity?: number;
  category?: string;
}) => {
  trackEvent('AddToCart', {
    content_ids: product.id ? [String(product.id)] : undefined,
    content_name: product.name,
    content_category: product.category,
    content_type: 'product',
    value: (Number(product.price) || 0) * (Number(product.quantity) || 1),
    currency: 'INR',
  });
};

/**
 * E-commerce: InitiateCheckout
 */
export const trackInitiateCheckout = (value: number, numItems: number) => {
  trackEvent('InitiateCheckout', {
    value: Number(value) || 0,
    currency: 'INR',
    num_items: numItems,
  });
};

/**
 * E-commerce: Purchase
 */
export const trackPurchase = (order: {
  orderNumber?: string;
  value: number;
  items?: Array<{ id?: string; name?: string; price?: number; quantity?: number }>;
}) => {
  trackEvent('Purchase', {
    content_ids: order.items?.map(item => String(item.id)).filter(Boolean),
    content_type: 'product',
    value: Number(order.value) || 0,
    currency: 'INR',
    order_id: order.orderNumber,
  });
};

/**
 * E-commerce: ViewContent
 */
export const trackViewContent = (product: {
  id?: string;
  name?: string;
  price?: number;
  category?: string;
}) => {
  trackEvent('ViewContent', {
    content_ids: product.id ? [String(product.id)] : undefined,
    content_name: product.name,
    content_category: product.category,
    content_type: 'product',
    value: Number(product.price) || 0,
    currency: 'INR',
  });
};
