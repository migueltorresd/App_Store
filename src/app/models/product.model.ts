// Categorías de productos electrónicos
export enum ProductCategory {
  SMARTPHONES = 'smartphones',
  LAPTOPS = 'laptops', 
  AUDIO = 'audio',
  GAMING = 'gaming',
  TABLETS = 'tablets',
  ACCESORIOS = 'accesorios'
}

// Marcas disponibles
export enum ProductBrand {
  APPLE = 'Apple',
  SAMSUNG = 'Samsung',
  XIAOMI = 'Xiaomi',
  HUAWEI = 'Huawei',
  LENOVO = 'Lenovo',
  ASUS = 'Asus',
  HP = 'HP',
  DELL = 'Dell',
  SONY = 'Sony',
  JBL = 'JBL',
  LOGITECH = 'Logitech',
  RAZER = 'Razer',
  NINTENDO = 'Nintendo',
  PLAYSTATION = 'PlayStation'
}

// Estados del producto
export enum ProductStatus {
  DISPONIBLE = 'disponible',
  AGOTADO = 'agotado',
  DESCONTINUADO = 'descontinuado',
  PROXIMAMENTE = 'proximamente'
}

// Especificaciones técnicas del producto
export interface ProductSpecs {
  // Especificaciones comunes
  dimensiones?: string;
  peso?: string;
  color?: string[];
  
  // Para smartphones/tablets
  pantalla?: string;
  procesador?: string;
  ram?: string;
  almacenamiento?: string;
  bateria?: string;
  camara?: string;
  sistemaOperativo?: string;
  
  // Para laptops
  gpu?: string;
  tipoAlmacenamiento?: string;
  puertos?: string[];
  
  // Para audio
  tipoConexion?: string;
  cancelacionRuido?: boolean;
  autonomia?: string;
  respuestafrecuencia?: string;
  
  // Para gaming
  compatibilidad?: string[];
  tipoControl?: string;
}

// Interfaz principal del producto
export interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  descripcionCorta: string;
  categoria: ProductCategory;
  marca: ProductBrand;
  precio: number;
  precioOriginal?: number; // Para productos con descuento
  descuento?: number; // Porcentaje de descuento
  imagen: string;
  imagenes?: string[]; // Múltiples imágenes
  stock: number;
  estado: ProductStatus;
  especificaciones: ProductSpecs;
  valoracion: number; // Rating de 1-5
  numeroReviews: number;
  fechaCreacion: Date;
  esDestacado: boolean; // Para productos destacados en home
  tags?: string[]; // Etiquetas para búsqueda
}

// Filtros para búsqueda de productos
export interface ProductFilter {
  categoria?: ProductCategory;
  marca?: ProductBrand;
  precioMin?: number;
  precioMax?: number;
  valoracionMin?: number;
  enStock?: boolean;
  esDestacado?: boolean;
  busqueda?: string; // Término de búsqueda
}

// Ordenamiento de productos
export enum ProductSort {
  NOMBRE_ASC = 'nombre_asc',
  NOMBRE_DESC = 'nombre_desc',
  PRECIO_ASC = 'precio_asc',
  PRECIO_DESC = 'precio_desc',
  VALORACION_ASC = 'valoracion_asc',
  VALORACION_DESC = 'valoracion_desc',
  FECHA_ASC = 'fecha_asc',
  FECHA_DESC = 'fecha_desc',
  POPULARIDAD = 'popularidad'
}

// Respuesta paginada de productos
export interface ProductResponse {
  productos: Product[];
  total: number;
  pagina: number;
  totalPaginas: number;
  porPagina: number;
}