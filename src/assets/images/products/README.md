# Imágenes de Productos - ElectroStore

Esta carpeta contiene todas las imágenes de los productos de la tienda ElectroStore.

## Estructura de Carpetas

```
src/assets/images/products/
├── smartphones/     # Imágenes de smartphones y celulares
├── laptops/        # Imágenes de laptops y computadoras portátiles
├── audio/          # Imágenes de auriculares, altavoces, etc.
├── gaming/         # Imágenes de consolas, accesorios de gaming
└── README.md       # Este archivo
```

## Convenciones de Nomenclatura

- Los nombres de archivo deben ser descriptivos y en minúsculas
- Usar guiones bajos (_) en lugar de espacios
- Incluir la marca y modelo cuando sea posible
- Formato recomendado: `marca_modelo_variante.jpg`

### Ejemplos:
- `iphone_15_pro_black.jpg`
- `macbook_air_m2_silver.jpg`
- `airpods_pro_2_white.jpg`
- `ps5_console_white.jpg`

## Formatos Soportados

- **JPG/JPEG**: Para fotografías de productos (recomendado)
- **PNG**: Para imágenes con transparencia o gráficos
- **WebP**: Para mejor compresión (opcional)

## Resoluciones Recomendadas

- **Imagen principal**: 800x800px (cuadrada)
- **Miniaturas**: 400x400px (cuadrada)
- **Máximo peso**: 500KB por imagen

## Cómo Añadir Nuevas Imágenes

1. Coloca las imágenes en la carpeta de categoría correspondiente
2. Actualiza el servicio `ProductsService` con la nueva ruta
3. Verifica que las imágenes se muestren correctamente en la app

## Imágenes Placeholder

Si no tienes imágenes específicas, puedes usar servicios como:
- https://picsum.photos/ (imágenes aleatorias)
- https://via.placeholder.com/ (placeholders simples)
- https://unsplash.com/ (imágenes de alta calidad - gratis)