import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { Product } from '@shared/schema';
import { formatPrice } from '@/lib/utils';

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; product: Product; quantity: number }
  | { type: 'REMOVE_ITEM'; id: number }
  | { type: 'UPDATE_QUANTITY'; id: number; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' };

interface CartContextProps {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity: number) => void;
  removeItem: (id: number) => void;
  updateItemQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

const initialState: CartState = {
  items: [],
  isOpen: false,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => item.product.id === action.product.id
      );

      if (existingItemIndex !== -1) {
        // Item exists, update quantity
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + action.quantity,
        };
        return { ...state, items: updatedItems };
      }

      // Item doesn't exist, add new item
      return {
        ...state,
        items: [
          ...state.items,
          {
            id: action.product.id,
            product: action.product,
            quantity: action.quantity,
          },
        ],
      };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.product.id !== action.id),
      };

    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item =>
        item.product.id === action.id
          ? { ...item, quantity: action.quantity }
          : item
      );
      return { ...state, items: updatedItems };
    }

    case 'CLEAR_CART':
      return { ...state, items: [] };

    case 'OPEN_CART':
      return { ...state, isOpen: true };

    case 'CLOSE_CART':
      return { ...state, isOpen: false };

    default:
      return state;
  }
}

export const CartProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Load cart from localStorage on initial render
  const [state, dispatch] = useReducer(cartReducer, initialState, () => {
    if (typeof window === 'undefined') return initialState;
    
    try {
      const storedCart = localStorage.getItem('cart');
      return storedCart ? { ...JSON.parse(storedCart), isOpen: false } : initialState;
    } catch (error) {
      console.error('Failed to parse cart from localStorage:', error);
      return initialState;
    }
  });

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('cart', JSON.stringify({ items: state.items }));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [state.items]);

  // Calculate cart total
  const cartTotal = state.items.reduce(
    (total, item) => total + parseFloat(item.product.price) * item.quantity,
    0
  );

  // Calculate total number of items
  const cartCount = state.items.reduce(
    (count, item) => count + item.quantity,
    0
  );

  const value = {
    items: state.items,
    isOpen: state.isOpen,
    addItem: (product: Product, quantity: number) =>
      dispatch({ type: 'ADD_ITEM', product, quantity }),
    removeItem: (id: number) => dispatch({ type: 'REMOVE_ITEM', id }),
    updateItemQuantity: (id: number, quantity: number) =>
      dispatch({ type: 'UPDATE_QUANTITY', id, quantity }),
    clearCart: () => dispatch({ type: 'CLEAR_CART' }),
    openCart: () => dispatch({ type: 'OPEN_CART' }),
    closeCart: () => dispatch({ type: 'CLOSE_CART' }),
    cartTotal,
    cartCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
