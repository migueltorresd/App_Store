import { Product } from './product.model';

// Item individual del carrito
export interface CartItem {
  id: string; // ID único para el item del carrito
  product: Product;
  quantity: number;
  selectedVariant?: string; // Color, tamaño, etc.
  addedAt: Date;
  priceAtTime: number; // Precio cuando se añadió (por si cambia después)
}

// Estado del carrito completo
export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
  totalItems: number;
  subtotal: number;
  taxes?: number;
  shipping?: number;
  discounts?: number;
  total: number;
}

// Acciones del carrito
export enum CartAction {
  ADD_ITEM = 'ADD_ITEM',
  REMOVE_ITEM = 'REMOVE_ITEM',
  UPDATE_QUANTITY = 'UPDATE_QUANTITY',
  CLEAR_CART = 'CLEAR_CART',
  APPLY_DISCOUNT = 'APPLY_DISCOUNT'
}

// Respuesta de operaciones del carrito
export interface CartResponse {
  success: boolean;
  message: string;
  cart?: Cart;
  action?: CartAction;
}

// Configuración para añadir al carrito
export interface AddToCartRequest {
  productId: string;
  quantity: number;
  selectedVariant?: string;
}

// Resumen del carrito para mostrar
export interface CartSummary {
  totalItems: number;
  subtotal: number;
  total: number;
  isEmpty: boolean;
}