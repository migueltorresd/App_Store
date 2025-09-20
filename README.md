# ElectroStore - Tienda de Electrónicos

## 📱 Descripción del Proyecto

ElectroStore es una aplicación móvil híbrida desarrollada con **Ionic + Angular** para una tienda online especializada en productos electrónicos. La aplicación permite a los usuarios navegar por un catálogo de productos, gestionar un carrito de compras y realizar compras de manera intuitiva.

## 🎯 Características Principales

- ✅ **Autenticación de usuarios** - Sistema completo de login y registro
- ✅ **Catálogo de productos** - Navegación por categorías de electrónicos
- ✅ **Carrito de compras** - Gestión completa de productos seleccionados
- ✅ **Almacenamiento local** - Persistencia offline con Capacitor Storage
- ✅ **Diseño responsive** - Interfaz adaptativa para móviles y tablets
- ✅ **Aplicación híbrida** - Compatible con Android e iOS

## 🛠️ Stack Tecnológico

- **Frontend**: Ionic 7 + Angular 16
- **Capacitor**: Para compilación nativa
- **TypeScript**: Lenguaje principal de desarrollo
- **SCSS**: Estilos y diseño
- **Capacitor Storage**: Almacenamiento local
- **Ionic Components**: UI/UX components nativos

## 📂 Estructura del Proyecto

```
src/
├── app/
│   ├── components/     # Componentes reutilizables
│   ├── guards/         # Guardias de rutas
│   ├── models/         # Interfaces y tipos
│   ├── pages/          # Páginas principales
│   ├── services/       # Servicios y lógica de negocio
│   └── home/           # Página principal
├── assets/             # Recursos estáticos
├── environments/       # Configuraciones de entorno
└── theme/              # Temas y variables CSS
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 16+
- npm 8+
- Ionic CLI 7+
- Angular CLI 16+

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/migueltorresd/App_Store.git
cd App_Store
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Ejecutar en desarrollo**
```bash
ionic serve
```

4. **Compilar para producción**
```bash
ionic build --prod
```

## 📱 Compilación para Dispositivos Móviles

### Android
```bash
ionic capacitor add android
ionic capacitor build android
ionic capacitor open android
```

### iOS
```bash
ionic capacitor add ios
ionic capacitor build ios
ionic capacitor open ios
```

## 🎨 Capturas de Pantalla


## 🤝 Contribución

Este proyecto es desarrollado como parte de un trabajo académico en **Desarrollo de Apps Móviles Híbridas**.

### Equipo de Desarrollo
- Miguel Torres (@migueltorresd)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Contacto

- **GitHub**: [@migueltorresd](https://github.com/migueltorresd)
- **Repositorio**: [App_Store](https://github.com/migueltorresd/App_Store)

---

⭐ Si este proyecto te resulta útil, ¡no olvides darle una estrella en GitHub!