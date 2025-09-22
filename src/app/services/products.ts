import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  Product,
  ProductCategory,
  ProductBrand,
  ProductStatus,
  ProductFilter,
  ProductSort,
  ProductResponse
} from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private products: Product[] = [];
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();

  constructor() {
    this.initializeProducts();
    console.log('🛍️ ProductsService inicializado con', this.products.length, 'productos');
  }

  /**
   * Inicializar productos mock
   */
  private initializeProducts(): void {
    this.products = [
      // SMARTPHONES
      {
        id: 'sm001',
        nombre: 'iPhone 15 Pro',
        descripcion: 'El iPhone 15 Pro cuenta con el chip A17 Pro, cámara principal de 48MP con teleobjetivo 3x, pantalla Super Retina XDR de 6.1 pulgadas y construcción en titanio.',
        descripcionCorta: 'iPhone 15 Pro con chip A17 Pro y cámara de 48MP',
        categoria: ProductCategory.SMARTPHONES,
        marca: ProductBrand.APPLE,
        precio: 4299000,
        imagen: 'assets/images/products/smartphones/iphone_15_pro.svg',
        stock: 15,
        estado: ProductStatus.DISPONIBLE,
        especificaciones: {
          pantalla: '6.1" Super Retina XDR OLED',
          procesador: 'Apple A17 Pro',
          ram: '8GB',
          almacenamiento: '128GB',
          bateria: 'Hasta 23 horas de video',
          camara: '48MP + 12MP + 12MP',
          sistemaOperativo: 'iOS 17',
          color: ['Titanio Natural', 'Titanio Azul', 'Titanio Blanco'],
          peso: '187g'
        },
        valoracion: 4.8,
        numeroReviews: 234,
        fechaCreacion: new Date('2024-09-12'),
        esDestacado: true,
        tags: ['nuevo', 'flagship', 'premium']
      },
      {
        id: 'sm002',
        nombre: 'Samsung Galaxy S24 Ultra',
        descripcion: 'El Galaxy S24 Ultra redefine la innovación con su S Pen integrado, cámara de 200MP, pantalla Dynamic AMOLED 2X de 6.8 pulgadas.',
        descripcionCorta: 'Galaxy S24 Ultra con S Pen y cámara de 200MP',
        categoria: ProductCategory.SMARTPHONES,
        marca: ProductBrand.SAMSUNG,
        precio: 5199000,
        precioOriginal: 5699000,
        descuento: 9,
        imagen: 'assets/images/products/smartphones/galaxy_s24_ultra.svg',
        stock: 8,
        estado: ProductStatus.DISPONIBLE,
        especificaciones: {
          pantalla: '6.8" Dynamic AMOLED 2X',
          procesador: 'Snapdragon 8 Gen 3',
          ram: '12GB',
          almacenamiento: '256GB',
          bateria: '5000mAh',
          camara: '200MP + 50MP + 12MP + 10MP',
          sistemaOperativo: 'Android 14',
          color: ['Titanium Black', 'Titanium Gray', 'Titanium Violet'],
          peso: '232g'
        },
        valoracion: 4.7,
        numeroReviews: 189,
        fechaCreacion: new Date('2024-01-17'),
        esDestacado: true,
        tags: ['s-pen', 'profesional', 'cámara']
      },
      {
        id: 'sm003',
        nombre: 'Xiaomi 14 Pro',
        descripcion: 'El Xiaomi 14 Pro combina potencia y elegancia con su procesador Snapdragon 8 Gen 3, sistema de cámaras Leica.',
        descripcionCorta: 'Xiaomi 14 Pro con cámaras Leica',
        categoria: ProductCategory.SMARTPHONES,
        marca: ProductBrand.XIAOMI,
        precio: 3499000,
        imagen: 'assets/images/products/smartphones/xiaomi_14_pro.svg',
        stock: 12,
        estado: ProductStatus.DISPONIBLE,
        especificaciones: {
          pantalla: '6.73" AMOLED 120Hz',
          procesador: 'Snapdragon 8 Gen 3',
          ram: '12GB',
          almacenamiento: '512GB',
          bateria: '4880mAh',
          camara: '50MP Leica + 50MP + 50MP',
          sistemaOperativo: 'Android 14',
          color: ['Negro', 'Verde', 'Blanco'],
          peso: '218g'
        },
        valoracion: 4.6,
        numeroReviews: 156,
        fechaCreacion: new Date('2024-02-25'),
        esDestacado: false,
        tags: ['leica', 'fotografía', 'premium']
      },
      // LAPTOPS
      {
        id: 'lp001',
        nombre: 'MacBook Pro 16" M3 Pro',
        descripcion: 'La MacBook Pro de 16 pulgadas con chip M3 Pro ofrece un rendimiento excepcional para profesionales creativos.',
        descripcionCorta: 'MacBook Pro 16" con chip M3 Pro para profesionales',
        categoria: ProductCategory.LAPTOPS,
        marca: ProductBrand.APPLE,
        precio: 9899000,
        imagen: 'assets/images/products/laptops/macbook_pro_16_m3.svg',
        stock: 5,
        estado: ProductStatus.DISPONIBLE,
        especificaciones: {
          pantalla: '16.2" Liquid Retina XDR',
          procesador: 'Apple M3 Pro',
          ram: '18GB',
          almacenamiento: '512GB SSD',
          gpu: 'GPU de 18 núcleos',
          peso: '2.16kg',
          color: ['Gris Espacial', 'Plata']
        },
        valoracion: 4.9,
        numeroReviews: 78,
        fechaCreacion: new Date('2023-11-07'),
        esDestacado: true,
        tags: ['profesional', 'video', 'diseño']
      },
      // AUDIO
      {
        id: 'au001',
        nombre: 'Sony WH-1000XM5',
        descripcion: 'Los auriculares Sony WH-1000XM5 ofrecen la mejor cancelación de ruido de su clase.',
        descripcionCorta: 'Auriculares Sony con cancelación de ruido líder',
        categoria: ProductCategory.AUDIO,
        marca: ProductBrand.SONY,
        precio: 1299000,
        imagen: 'assets/images/products/audio/sony_wh1000xm5.svg',
        stock: 20,
        estado: ProductStatus.DISPONIBLE,
        especificaciones: {
          tipoConexion: 'Bluetooth 5.2, Cable 3.5mm',
          cancelacionRuido: true,
          autonomia: 'Hasta 30 horas',
          peso: '249g',
          color: ['Negro', 'Plata']
        },
        valoracion: 4.8,
        numeroReviews: 445,
        fechaCreacion: new Date('2022-05-12'),
        esDestacado: true,
        tags: ['cancelación ruido', 'premium', 'viajes']
      },
      // GAMING
      {
        id: 'gm001',
        nombre: 'PlayStation 5',
        descripcion: 'La PlayStation 5 redefine los juegos con gráficos en 4K, carga ultra rápida con SSD.',
        descripcionCorta: 'PlayStation 5 con gráficos 4K y SSD ultra rápido',
        categoria: ProductCategory.GAMING,
        marca: ProductBrand.PLAYSTATION,
        precio: 2499000,
        imagen: 'assets/images/products/gaming/playstation_5.svg',
        stock: 3,
        estado: ProductStatus.DISPONIBLE,
        especificaciones: {
          procesador: 'AMD Ryzen Zen 2 8-core',
          ram: '16GB GDDR6',
          almacenamiento: '825GB SSD',
          color: ['Blanco']
        },
        valoracion: 4.9,
        numeroReviews: 1247,
        fechaCreacion: new Date('2020-11-12'),
        esDestacado: true,
        tags: ['consola', '4k', 'ssd']
      }
    ];

    this.productsSubject.next(this.products);
  }

  /**
   * Obtener productos con filtros
   */
  getProducts(filtros: ProductFilter = {}): Observable<Product[]> {
    return new Observable<Product[]>(observer => {
      setTimeout(() => {
        let productos = [...this.products];

        if (filtros.categoria) {
          productos = productos.filter(p => p.categoria === filtros.categoria);
        }

        if (filtros.busqueda) {
          const busqueda = filtros.busqueda.toLowerCase();
          productos = productos.filter(p =>
            p.nombre.toLowerCase().includes(busqueda) ||
            p.descripcionCorta.toLowerCase().includes(busqueda) ||
            p.marca.toLowerCase().includes(busqueda)
          );
        }

        if (filtros.esDestacado !== undefined) {
          productos = productos.filter(p => p.esDestacado === filtros.esDestacado);
        }

        observer.next(productos);
        observer.complete();
      }, 500);
    });
  }

  /**
   * Obtener producto por ID
   */
  getProductById(id: string): Observable<Product | undefined> {
    const product = this.products.find(p => p.id === id);
    return of(product).pipe(delay(300));
  }

  /**
   * Obtener productos destacados
   */
  getFeaturedProducts(): Observable<Product[]> {
    const destacados = this.products.filter(p => p.esDestacado);
    return of(destacados).pipe(delay(400));
  }
}
