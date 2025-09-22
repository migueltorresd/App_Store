/**
 * Script para generar imágenes placeholder para productos
 * Este script crea imágenes SVG simples como placeholders
 */

const fs = require('fs');
const path = require('path');

// Configuración de productos
const products = [
  {
    category: 'smartphones',
    items: [
      { name: 'iphone_15_pro', color: '#1976D2', text: 'iPhone 15 Pro' },
      { name: 'galaxy_s24_ultra', color: '#6B46C1', text: 'Galaxy S24 Ultra' },
      { name: 'xiaomi_14_pro', color: '#EF4444', text: 'Xiaomi 14 Pro' }
    ]
  },
  {
    category: 'laptops',
    items: [
      { name: 'macbook_pro_16_m3', color: '#374151', text: 'MacBook Pro 16"' }
    ]
  },
  {
    category: 'audio',
    items: [
      { name: 'sony_wh1000xm5', color: '#1F2937', text: 'Sony WH-1000XM5' }
    ]
  },
  {
    category: 'gaming',
    items: [
      { name: 'playstation_5', color: '#0EA5E9', text: 'PlayStation 5' }
    ]
  }
];

// Función para crear SVG placeholder
function createSVGPlaceholder(color, text) {
  return `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="400" fill="${color}"/>
  <text x="200" y="180" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="white" text-anchor="middle">${text}</text>
  <text x="200" y="220" font-family="Arial, sans-serif" font-size="14" fill="rgba(255,255,255,0.8)" text-anchor="middle">ElectroStore</text>
</svg>`;
}

// Crear las carpetas si no existen
const basePath = path.join(__dirname, '..', 'src', 'assets', 'images', 'products');

// Generar placeholders
products.forEach(category => {
  const categoryPath = path.join(basePath, category.category);
  
  // Crear carpeta si no existe
  if (!fs.existsSync(categoryPath)) {
    fs.mkdirSync(categoryPath, { recursive: true });
  }
  
  category.items.forEach(item => {
    const svgContent = createSVGPlaceholder(item.color, item.text);
    const filePath = path.join(categoryPath, `${item.name}.svg`);
    
    fs.writeFileSync(filePath, svgContent);
    console.log(`✅ Creado placeholder: ${filePath}`);
  });
});

console.log('🎉 Placeholders generados exitosamente!');
console.log('💡 Puedes reemplazar estos archivos SVG con imágenes JPG reales más tarde.');