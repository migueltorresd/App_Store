import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import { 
  Cart, 
  CartItem, 
  CartResponse, 
  AddToCartRequest, 
  CartSummary, 
  CartAction 
} from '../models/cart.model';
import { Product } from '../models/product.model';
import { AuthService } from './auth.service';
import { ProductsService } from './products';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_STORAGE_KEY = 'electrostore_cart';
  
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  private cartSummarySubject = new BehaviorSubject<CartSummary>({
    totalItems: 0,
    subtotal: 0,
    total: 0,
    isEmpty: true
  });
  
  // Observables públicos
  public cart$ = this.cartSubject.asObservable();
  public cartSummary$ = this.cartSummarySubject.asObservable();

  constructor(
    private authService: AuthService,
    private productsService: ProductsService
  ) {
    console.log('🛍️ CartService inicializando...');
    
    // Suscribirse a cambios de autenticación
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        console.log('🔑 Usuario autenticado, cargando carrito...');
        this.loadCart();
      } else {
        console.log('🚫 Usuario no autenticado, limpiando carrito...');
        this.clearLocalCart();
      }
    });
    
    // Cargar carrito inicial si ya hay usuario autenticado
    if (this.authService.isAuthenticated()) {
      this.loadCart();
    }
    
    console.log('🛍️ CartService inicializado');
  }

  /**
   * Cargar carrito desde almacenamiento local
   */
  private async loadCart(): Promise<void> {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        console.log('🚫 No hay usuario autenticado, carrito vacío');
        return;
      }

      const cartKey = `${this.CART_STORAGE_KEY}_${currentUser.id}`;
      const { value } = await Preferences.get({ key: cartKey });
      
      if (value) {
        const cart: Cart = JSON.parse(value);
        // Reconvertir fechas
        cart.createdAt = new Date(cart.createdAt);
        cart.updatedAt = new Date(cart.updatedAt);
        cart.items = cart.items.map(item => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }));
        
        this.cartSubject.next(cart);
        this.updateCartSummary(cart);
        console.log('✅ Carrito cargado:', cart.totalItems, 'items');
      } else {
        // Crear carrito vacío
        this.createEmptyCart(currentUser.id);
      }
    } catch (error) {
      console.error('❌ Error cargando carrito:', error);
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.createEmptyCart(currentUser.id);
      }
    }
  }

  /**
   * Crear carrito vacío
   */
  private createEmptyCart(userId: string): void {
    const emptyCart: Cart = {
      id: this.generateCartId(),
      userId,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      totalItems: 0,
      subtotal: 0,
      total: 0
    };
    
    this.cartSubject.next(emptyCart);
    this.updateCartSummary(emptyCart);
    this.saveCart(emptyCart);
    console.log('🆕 Carrito vacío creado');
  }

  /**
   * Añadir producto al carrito
   */
  async addToCart(request: AddToCartRequest): Promise<CartResponse> {
    try {
      console.log('🛍️ INICIO addToCart - Verificando autenticación...');
      
      // Debugging detallado de autenticación - Verificación robusta
      const token = this.authService.getToken();
      const currentUser = this.authService.getCurrentUser();
      const isAuthenticated = this.authService.isAuthenticated();
      
      // Verificación adicional directamente en localStorage
      const localToken = localStorage.getItem('auth_token');
      const localUser = localStorage.getItem('current_user');
      
      console.log('🔧 Verificación robusta de autenticación:');
      console.log('  - authService.getToken():', token ? 'Existe' : 'No existe');
      console.log('  - authService.getCurrentUser():', currentUser ? 'Existe' : 'No existe');
      console.log('  - authService.isAuthenticated():', isAuthenticated);
      console.log('  - localStorage token:', localToken ? 'Existe' : 'No existe');
      console.log('  - localStorage user:', localUser ? 'Existe' : 'No existe');
      
      // Si los métodos del servicio fallan pero hay datos en localStorage, forzar recarga
      if (!isAuthenticated && localToken && localUser) {
        console.log('🔄 DETECTADO: Datos en localStorage pero servicio no sincronizado. Forzando recarga...');
        // Forzar la verificación del AuthService
        this.authService.checkStoredAuth();
        // Esperar un poco para que se sincronice
        await new Promise(resolve => setTimeout(resolve, 100));
        // Verificar nuevamente
        const newAuth = this.authService.isAuthenticated();
        const newUser = this.authService.getCurrentUser();
        console.log('  - Después de forzar recarga - isAuthenticated:', newAuth);
        console.log('  - Después de forzar recarga - currentUser:', newUser ? 'Existe' : 'No existe');
      }
      
      // Verificación final - usar variables actualizadas si se hizo recarga
      const finalAuth = this.authService.isAuthenticated();
      const finalUser = this.authService.getCurrentUser();
      
      console.log('🏁 Verificación FINAL:');
      console.log('  - finalAuth:', finalAuth);
      console.log('  - finalUser:', finalUser ? 'Existe' : 'No existe');
      
      if (!finalAuth || !finalUser) {
        console.error('🚫 FALLO FINAL: Usuario no autenticado al añadir al carrito');
        console.error('  - finalAuth:', finalAuth);
        console.error('  - finalUser:', finalUser);
        return {
          success: false,
          message: 'Debes iniciar sesión para añadir productos al carrito',
          action: CartAction.ADD_ITEM
        };
      }
      
      console.log('✅ Usuario autenticado confirmado FINAL:', finalUser.email || finalUser.id);
      
      // Forzar la recarga del carrito para el usuario actual
      await this.loadCart();

      let cart = this.cartSubject.value;
      if (!cart) {
        this.createEmptyCart(finalUser.id || finalUser.email);
        cart = this.cartSubject.value!;
      }

      // Buscar si el producto ya existe en el carrito
      const existingItemIndex = cart.items.findIndex(
        item => item.product.id === request.productId && 
               item.selectedVariant === request.selectedVariant
      );

      if (existingItemIndex >= 0) {
        // Actualizar cantidad del item existente
        cart.items[existingItemIndex].quantity += request.quantity;
        console.log('🔄 Cantidad actualizada en carrito');
      } else {
        // Añadir nuevo item (necesitamos obtener el producto)
        const product = await this.getProductById(request.productId);
        if (!product) {
          return {
            success: false,
            message: 'Producto no encontrado',
            action: CartAction.ADD_ITEM
          };
        }

        const newCartItem: CartItem = {
          id: this.generateCartItemId(),
          product,
          quantity: request.quantity,
          selectedVariant: request.selectedVariant,
          addedAt: new Date(),
          priceAtTime: product.precio
        };

        cart.items.push(newCartItem);
        console.log('➕ Nuevo producto añadido al carrito');
      }

      // Recalcular totales
      this.recalculateCart(cart);
      
      // Guardar y actualizar
      await this.saveCart(cart);
      this.cartSubject.next(cart);
      this.updateCartSummary(cart);

      return {
        success: true,
        message: 'Producto añadido al carrito',
        cart,
        action: CartAction.ADD_ITEM
      };
    } catch (error) {
      console.error('❌ Error añadiendo al carrito:', error);
      return {
        success: false,
        message: 'Error al añadir producto al carrito',
        action: CartAction.ADD_ITEM
      };
    }
  }

  /**
   * Remover item del carrito
   */
  async removeFromCart(cartItemId: string): Promise<CartResponse> {
    try {
      const cart = this.cartSubject.value;
      if (!cart) {
        return {
          success: false,
          message: 'Carrito no encontrado',
          action: CartAction.REMOVE_ITEM
        };
      }

      const initialLength = cart.items.length;
      cart.items = cart.items.filter(item => item.id !== cartItemId);
      
      if (cart.items.length === initialLength) {
        return {
          success: false,
          message: 'Item no encontrado en el carrito',
          action: CartAction.REMOVE_ITEM
        };
      }

      this.recalculateCart(cart);
      await this.saveCart(cart);
      this.cartSubject.next(cart);
      this.updateCartSummary(cart);

      console.log('➖ Item removido del carrito');
      return {
        success: true,
        message: 'Producto removido del carrito',
        cart,
        action: CartAction.REMOVE_ITEM
      };
    } catch (error) {
      console.error('❌ Error removiendo del carrito:', error);
      return {
        success: false,
        message: 'Error al remover producto del carrito',
        action: CartAction.REMOVE_ITEM
      };
    }
  }

  /**
   * Actualizar cantidad de un item
   */
  async updateQuantity(cartItemId: string, quantity: number): Promise<CartResponse> {
    try {
      if (quantity <= 0) {
        return this.removeFromCart(cartItemId);
      }

      const cart = this.cartSubject.value;
      if (!cart) {
        return {
          success: false,
          message: 'Carrito no encontrado',
          action: CartAction.UPDATE_QUANTITY
        };
      }

      const itemIndex = cart.items.findIndex(item => item.id === cartItemId);
      if (itemIndex === -1) {
        return {
          success: false,
          message: 'Item no encontrado en el carrito',
          action: CartAction.UPDATE_QUANTITY
        };
      }

      cart.items[itemIndex].quantity = quantity;
      this.recalculateCart(cart);
      await this.saveCart(cart);
      this.cartSubject.next(cart);
      this.updateCartSummary(cart);

      console.log('🔄 Cantidad actualizada en carrito');
      return {
        success: true,
        message: 'Cantidad actualizada',
        cart,
        action: CartAction.UPDATE_QUANTITY
      };
    } catch (error) {
      console.error('❌ Error actualizando cantidad:', error);
      return {
        success: false,
        message: 'Error al actualizar cantidad',
        action: CartAction.UPDATE_QUANTITY
      };
    }
  }

  /**
   * Limpiar carrito
   */
  async clearCart(): Promise<CartResponse> {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        return {
          success: false,
          message: 'Usuario no autenticado',
          action: CartAction.CLEAR_CART
        };
      }

      this.createEmptyCart(currentUser.id);
      
      console.log('🗑️ Carrito limpiado');
      return {
        success: true,
        message: 'Carrito limpiado',
        cart: this.cartSubject.value!,
        action: CartAction.CLEAR_CART
      };
    } catch (error) {
      console.error('❌ Error limpiando carrito:', error);
      return {
        success: false,
        message: 'Error al limpiar carrito',
        action: CartAction.CLEAR_CART
      };
    }
  }

  /**
   * Obtener resumen del carrito
   */
  getCartSummary(): CartSummary {
    return this.cartSummarySubject.value;
  }

  /**
   * Obtener carrito actual
   */
  getCurrentCart(): Cart | null {
    return this.cartSubject.value;
  }

  /**
   * Recalcular totales del carrito
   */
  private recalculateCart(cart: Cart): void {
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.subtotal = cart.items.reduce((total, item) => total + (item.priceAtTime * item.quantity), 0);
    cart.total = cart.subtotal; // Aquí podríamos añadir impuestos, envío, descuentos
    cart.updatedAt = new Date();
  }

  /**
   * Actualizar resumen del carrito
   */
  private updateCartSummary(cart: Cart): void {
    const summary: CartSummary = {
      totalItems: cart.totalItems,
      subtotal: cart.subtotal,
      total: cart.total,
      isEmpty: cart.items.length === 0
    };
    
    this.cartSummarySubject.next(summary);
  }

  /**
   * Guardar carrito en almacenamiento local
   */
  private async saveCart(cart: Cart): Promise<void> {
    try {
      const cartKey = `${this.CART_STORAGE_KEY}_${cart.userId}`;
      await Preferences.set({
        key: cartKey,
        value: JSON.stringify(cart)
      });
      console.log('💾 Carrito guardado localmente');
    } catch (error) {
      console.error('❌ Error guardando carrito:', error);
    }
  }

  /**
   * Obtener producto por ID usando ProductsService
   */
  private async getProductById(productId: string): Promise<Product | null> {
    try {
      const product = await this.productsService.getProductById(productId).toPromise();
      return product || null;
    } catch (error) {
      console.error('❌ Error obteniendo producto:', error);
      return null;
    }
  }

  /**
   * Generar ID único para el carrito
   */
  private generateCartId(): string {
    return 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Generar ID único para item del carrito
   */
  private generateCartItemId(): string {
    return 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  /**
   * Limpiar carrito local (cuando usuario no está autenticado)
   */
  private clearLocalCart(): void {
    this.cartSubject.next(null);
    this.cartSummarySubject.next({
      totalItems: 0,
      subtotal: 0,
      total: 0,
      isEmpty: true
    });
    console.log('🗑️ Carrito local limpiado');
  }
}
