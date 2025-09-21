import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductsService } from '../../services/products';
import { Product, ProductCategory, ProductFilter } from '../../models/product.model';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
  standalone: false
})
export class ProductsPage implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm = '';
  selectedCategory = 'all';
  showSearchbar = false;
  isLoading = true;
  cartCount = 0;
  
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private productsService: ProductsService,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    // Configurar búsqueda con debounce
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.performSearch(searchTerm);
      });
  }

  ngOnInit() {
    console.log('🛍️ Inicializando página de productos...');
    this.loadProducts();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Cargar productos desde el servicio
   */
  loadProducts(): void {
    this.isLoading = true;
    
    this.productsService.getProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products) => {
          this.products = products;
          this.applyFilters();
          this.isLoading = false;
          console.log('✅ Productos cargados:', products.length);
        },
        error: (error) => {
          console.error('❌ Error cargando productos:', error);
          this.showErrorToast('Error al cargar productos');
          this.isLoading = false;
        }
      });
  }

  /**
   * Aplicar filtros actuales
   */
  applyFilters(): void {
    let filtered = [...this.products];

    // Filtro por categoría
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.categoria === this.selectedCategory
      );
    }

    // Filtro por búsqueda
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.nombre.toLowerCase().includes(search) ||
        product.descripcionCorta.toLowerCase().includes(search) ||
        product.marca.toLowerCase().includes(search) ||
        product.tags?.some(tag => tag.toLowerCase().includes(search))
      );
    }

    this.filteredProducts = filtered;
    console.log('🔍 Productos filtrados:', this.filteredProducts.length);
  }

  /**
   * Manejar cambio de categoría
   */
  onCategoryChange(event: any): void {
    this.selectedCategory = event.detail.value;
    console.log('📊 Categoría seleccionada:', this.selectedCategory);
    this.applyFilters();
  }

  /**
   * Abrir barra de búsqueda
   */
  openSearch(): void {
    this.showSearchbar = true;
    console.log('🔍 Abriendo búsqueda');
  }

  /**
   * Cerrar barra de búsqueda
   */
  closeSearch(): void {
    this.showSearchbar = false;
    this.searchTerm = '';
    this.applyFilters();
    console.log('✖️ Cerrando búsqueda');
  }

  /**
   * Manejar input de búsqueda
   */
  onSearch(event: any): void {
    const searchTerm = event.target.value || '';
    this.searchSubject.next(searchTerm);
  }

  /**
   * Realizar búsqueda
   */
  private performSearch(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.applyFilters();
    console.log('🔍 Buscando:', searchTerm);
  }

  /**
   * Limpiar búsqueda
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  /**
   * Limpiar todos los filtros
   */
  clearAllFilters(): void {
    this.selectedCategory = 'all';
    this.searchTerm = '';
    this.showSearchbar = false;
    this.applyFilters();
    console.log('🗑️ Filtros limpiados');
  }

  /**
   * Ver detalle del producto
   */
  viewProduct(product: Product): void {
    console.log('👁️ Ver producto:', product.nombre);
    // TODO: Implementar navegación a página de detalle
    this.showProductPreview(product);
  }

  /**
   * Añadir producto al carrito
   */
  async addToCart(product: Product, event: Event): Promise<void> {
    event.stopPropagation(); // Evitar que se abra el detalle del producto
    
    if (product.estado === 'agotado') {
      await this.showErrorToast('Este producto está agotado');
      return;
    }

    // TODO: Integrar con servicio de carrito
    this.cartCount++;
    console.log('🛍️ Añadido al carrito:', product.nombre);
    
    await this.showSuccessToast(`${product.nombre} añadido al carrito`);
  }

  /**
   * Mostrar preview del producto
   */
  async showProductPreview(product: Product): Promise<void> {
    const alert = await this.alertController.create({
      header: product.nombre,
      subHeader: `${product.marca} - ${this.formatPrice(product.precio)}`,
      message: `
        <div style="text-align: center; margin: 10px 0;">
          <img src="${product.imagen}" style="max-width: 150px; border-radius: 8px;">
        </div>
        <p>${product.descripcion}</p>
        <p><strong>Stock:</strong> ${product.stock} unidades</p>
        <p><strong>Valoración:</strong> ${product.valoracion}/5 (${product.numeroReviews} reviews)</p>
      `,
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel'
        },
        {
          text: 'Añadir al carrito',
          handler: () => {
            this.addToCart(product, new Event('click'));
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Obtener título de la categoría
   */
  getCategoryTitle(): string {
    const titles: { [key: string]: string } = {
      'all': 'Todos los productos',
      'smartphones': 'Smartphones',
      'laptops': 'Laptops',
      'audio': 'Audio',
      'gaming': 'Gaming',
      'tablets': 'Tablets',
      'accesorios': 'Accesorios'
    };
    
    return titles[this.selectedCategory] || 'Productos';
  }

  /**
   * TrackBy para optimizar el *ngFor
   */
  trackByProductId(index: number, product: Product): string {
    return product.id;
  }

  /**
   * Formatear precio
   */
  private formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  /**
   * Mostrar toast de éxito
   */
  private async showSuccessToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color: 'success',
      icon: 'checkmark-circle-outline'
    });
    await toast.present();
  }

  /**
   * Mostrar toast de error
   */
  private async showErrorToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color: 'danger',
      icon: 'alert-circle-outline'
    });
    await toast.present();
  }
}
