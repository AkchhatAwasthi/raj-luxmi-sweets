import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { isBengaliSweetItem } from '@/utils/deliveryCalculator';

export interface ProductVariant {
  id: string;
  title: string;
  price: number;
  original_price?: number;
  weight?: string;
  pieces?: string;
  stock_quantity?: number;
  sku?: string;
  is_default?: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  weight: string;
  pieces: string;
  rating: number;
  description: string;
  nutrition?: string;
  inStock: boolean;
  slug: string;
  serves?: number;
  variants?: ProductVariant[];
  selectedVariant?: ProductVariant;
  variantId?: string;
  variantTitle?: string;
  cartItemId?: string;
  nutritionalInfo?: {
    totalEnergy: string;
    carbohydrate: string;
    fat: string;
    protein: string;
  };
  marketingInfo?: {
    marketedBy: string;
    address: string;
    city: string;
    state: string;
    fssaiLicense: string;
  };
  features?: {
    handSelected?: boolean;
    temperatureControlled?: boolean;
    artisanalCut?: boolean;
    hygienicallyVacuumPacked?: boolean;
    qualityAndFoodsafetyChecks?: boolean;
    antibioticResidueFree?: boolean;
  };
  storageInstructions?: string;
}

export interface CartItem extends Product {
  quantity: number;
  cartItemId?: string;
  variantId?: string;
  variantTitle?: string;
  selectedVariant?: ProductVariant;
}


interface Store {
  // Cart
  cartItems: CartItem[];
  isCartOpen: boolean;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;

  // Products
  products: Product[];
  selectedCategory: string;
  setProducts: (products: Product[]) => void;
  setSelectedCategory: (category: string) => void;

  // Delivery Mode
  deliveryMode: 'lucknow' | 'pan-india' | null;
  setDeliveryMode: (mode: 'lucknow' | 'pan-india' | null) => void;
  removeBengaliSweetsFromCart: () => void;

  // User
  isAuthenticated: boolean;
  user: null | { name: string; email: string };
  login: (user: { name: string; email: string }) => void;
  logout: () => void;
}

// Load cart items from localStorage on initial load
const loadCartFromLocalStorage = (): CartItem[] => {
  if (typeof window !== 'undefined') {
    try {
      const storedCart = localStorage.getItem('cartItems');
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  }
  return [];
};

// Save cart items to localStorage
const saveCartToLocalStorage = (cartItems: CartItem[]): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // Cart state
      cartItems: loadCartFromLocalStorage(),
      isCartOpen: false,

      // Cart actions
      addToCart: (product) => {
        const { cartItems } = get();
        const itemKey = product.cartItemId || (product.variantId ? `${product.id}_${product.variantId}` : product.id);
        const existingItem = cartItems.find(item => (item.cartItemId || (item.variantId ? `${item.id}_${item.variantId}` : item.id)) === itemKey);

        let updatedCartItems;
        if (existingItem) {
          updatedCartItems = cartItems.map(item => {
            const currentKey = item.cartItemId || (item.variantId ? `${item.id}_${item.variantId}` : item.id);
            return currentKey === itemKey
              ? { ...item, quantity: item.quantity + 1 }
              : item;
          });
        } else {
          updatedCartItems = [...cartItems, { ...product, cartItemId: itemKey, quantity: 1 }];
        }

        set({ cartItems: updatedCartItems });
        saveCartToLocalStorage(updatedCartItems);
      },

      removeFromCart: (cartItemIdOrProductId) => {
        const cart = get().cartItems;
        const hasKeyMatch = cart.some(item => (item.cartItemId || (item.variantId ? `${item.id}_${item.variantId}` : item.id)) === cartItemIdOrProductId);
        const updatedCartItems = cart.filter(item => {
          const key = item.cartItemId || (item.variantId ? `${item.id}_${item.variantId}` : item.id);
          return hasKeyMatch ? key !== cartItemIdOrProductId : item.id !== cartItemIdOrProductId;
        });
        set({ cartItems: updatedCartItems });
        saveCartToLocalStorage(updatedCartItems);
      },

      updateQuantity: (cartItemIdOrProductId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(cartItemIdOrProductId);
          return;
        }

        const cart = get().cartItems;
        const hasKeyMatch = cart.some(item => (item.cartItemId || (item.variantId ? `${item.id}_${item.variantId}` : item.id)) === cartItemIdOrProductId);
        const updatedCartItems = cart.map(item => {
          const key = item.cartItemId || (item.variantId ? `${item.id}_${item.variantId}` : item.id);
          const isMatch = hasKeyMatch ? key === cartItemIdOrProductId : item.id === cartItemIdOrProductId;
          return isMatch ? { ...item, quantity } : item;
        });

        set({ cartItems: updatedCartItems });
        saveCartToLocalStorage(updatedCartItems);
      },

      clearCart: () => {
        set({ cartItems: [] });
        saveCartToLocalStorage([]);
      },

      toggleCart: () => set({ isCartOpen: !get().isCartOpen }),

      // Products state
      products: [],
      selectedCategory: 'All',
      setProducts: (products) => set({ products }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),

      // Delivery Mode
      deliveryMode: null,
      setDeliveryMode: (mode) => set({ deliveryMode: mode }),
      removeBengaliSweetsFromCart: () => {
        const filtered = get().cartItems.filter((item) => !isBengaliSweetItem(item));
        set({ cartItems: filtered });
        saveCartToLocalStorage(filtered);
      },

      // User state
      isAuthenticated: false,
      user: null,
      login: (user) => set({ isAuthenticated: true, user }),
      logout: () => set({ isAuthenticated: false, user: null }),
    }),
    {
      name: 'sweetsshop-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cartItems: state.cartItems,
        // We only persist cart items, not the entire state
      }),
    }
  )
);