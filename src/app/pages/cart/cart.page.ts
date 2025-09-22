import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CartService } from '../../services/cart';
import { Cart, CartItem, CartSummary } from '../../models/cart.model';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: false
})
export class CartPage implements OnInit, OnDestroy {
  cart: Cart | null = null;
  cartItems: CartItem[] = [];
  cartSummary: CartSummary = {
    totalItems: 0,
    subtotal: 0,
    total: 0,
    isEmpty: true
  };
  isLoading = true;
  
  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    console.log('🛍️ Inicializando página del carrito...');
    this.loadCartData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Cargar datos del carrito
   */
  loadCartData(): void {
    this.isLoading = true;
    
    // Suscribirse al carrito
    this.cartService.cart$
      .pipe(takeUntil(this.destroy$))
      .subscribe(cart => {
        this.cart = cart;
        this.cartItems = cart?.items || [];
        console.log('🛍️ Carrito cargado:', this.cartItems.length, 'items');
        this.isLoading = false;
      });
    
    // Suscribirse al resumen del carrito
    this.cartService.cartSummary$
      .pipe(takeUntil(this.destroy$))
      .subscribe(summary => {
        this.cartSummary = summary;
        console.log('📈 Resumen del carrito actualizado:', summary);
      });
  }

  /**
   * Aumentar cantidad de un item
   */
  async increaseQuantity(item: CartItem): Promise<void> {
    const response = await this.cartService.updateQuantity(item.id, item.quantity + 1);
    
    if (response.success) {
      await this.showToast('Cantidad actualizada', 'success');
    } else {
      await this.showToast(response.message, 'danger');
    }
  }

  /**
   * Disminuir cantidad de un item
   */
  async decreaseQuantity(item: CartItem): Promise<void> {
    if (item.quantity <= 1) {
      // Si es 1, eliminar el item
      await this.removeItem(item);
      return;
    }
    
    const response = await this.cartService.updateQuantity(item.id, item.quantity - 1);
    
    if (response.success) {
      await this.showToast('Cantidad actualizada', 'success');
    } else {
      await this.showToast(response.message, 'danger');
    }
  }

  /**
   * Remover item del carrito
   */
  async removeItem(item: CartItem): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar "${item.product.nombre}" del carrito?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            const response = await this.cartService.removeFromCart(item.id);
            
            if (response.success) {
              await this.showToast(response.message, 'success');
            } else {
              await this.showToast(response.message, 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Limpiar todo el carrito
   */
  async clearCart(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Vaciar carrito',
      message: '¿Estás seguro de que deseas eliminar todos los productos del carrito?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Vaciar',
          role: 'destructive',
          handler: async () => {
            const response = await this.cartService.clearCart();
            
            if (response.success) {
              await this.showToast('Carrito vaciado', 'success');
            } else {
              await this.showToast(response.message, 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Proceder al checkout (placeholder)
   */
  async proceedToCheckout(): Promise<void> {
    await this.showToast('¡Función de pago próximamente!', 'primary');
    console.log('💳 Procediendo al checkout...', this.cartSummary);
  }

  /**
   * Navegar a productos
   */
  goToProducts(): void {
    console.log('🛍️ Navegando a productos...');
    this.router.navigate(['/products']);
  }

  /**
   * TrackBy para optimizar el *ngFor
   */
  trackByItemId(index: number, item: CartItem): string {
    return item.id;
  }

  /**
   * Mostrar toast
   */
  private async showToast(message: string, color: 'success' | 'danger' | 'warning' | 'primary' = 'success'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color,
      buttons: [
        {
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
}
