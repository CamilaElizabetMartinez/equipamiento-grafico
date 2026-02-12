# Equipamiento Gráfico - Frontend React

Frontend desarrollado con React + Vite para el catálogo de productos de Equipamiento Gráfico Monte Grande.

## 🚀 Características

- ⚡️ React 18 + Vite
- 🎨 Estilos CSS personalizados (DIN-Regular font)
- 📱 Diseño responsive mobile-first
- 🔍 Búsqueda y filtrado de productos
- 🖼️ Carrusel de imágenes
- 📦 Componentes modulares

## 📁 Estructura del Proyecto

```
client/
├── src/
│   ├── components/
│   │   ├── Header.jsx + Header.css
│   │   ├── Carousel.jsx + Carousel.css
│   │   ├── ProductCard.jsx + ProductCard.css
│   │   └── Footer.jsx + Footer.css
│   ├── services/
│   │   └── api.js                    # Servicio de conexión con backend
│   ├── App.jsx + App.css             # Componente principal
│   ├── index.css                     # Estilos globales
│   └── main.jsx                      # Punto de entrada
├── .env                              # Variables de entorno
└── vite.config.js                    # Configuración de Vite
```

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
```

## ⚙️ Configuración

### Variables de Entorno (.env)

```env
VITE_API_URL=http://localhost:8000
```

### Proxy de Vite

El proxy está configurado en `vite.config.js` para redirigir las peticiones `/api/*` al backend Symfony en `http://localhost:8000`.

## 🎨 Diseño

### Colores

- **Color principal:** `#7C9692`
- **Fondo:** `#FFFFFF`
- **Texto:** `#333333` / `#666666`

### Tipografía

- **Font:** DIN-Regular, sans-serif

## 📡 API Endpoints Esperados

El frontend espera que el backend Symfony exponga los siguientes endpoints:

### Productos

```
GET /api/productos              # Obtener todos los productos
GET /api/productos?page=1       # Paginación
GET /api/productos?search=texto # Búsqueda
GET /api/productos/:id          # Obtener un producto
```

### Categorías

```
GET /api/categorias             # Obtener todas las categorías
```

### Contacto

```
POST /api/contacto              # Enviar formulario de contacto
```

## 🔌 Conexión con Backend

El frontend consume la API REST del backend Symfony. Asegúrate de:

1. **Backend corriendo en `http://localhost:8000`**
2. **CORS habilitado** en Symfony para `http://localhost:5173`
3. **Endpoints API** expuestos correctamente

## 📱 Componentes

### Header
- Logo y nombre de la empresa
- Navegación (Productos, Contacto)
- Sticky header

### Carousel
- Carrusel automático de imágenes
- Controles de navegación
- Indicadores de slide

### ProductCard
- Imagen del producto (con navegación si hay múltiples)
- Título, categoría, descripción
- Precio formateado
- Botón de consulta

### Footer
- Información de contacto
- Redes sociales
- Dirección y teléfono

## 🌐 Despliegue

### Desarrollo

```bash
npm run dev
```
Servidor en: http://localhost:5173

### Producción

```bash
npm run build
```

Los archivos optimizados estarán en `dist/`

## 📝 Notas Importantes

- Cada componente tiene su propio archivo CSS
- Las imágenes de productos deben estar accesibles desde el backend
- El carrusel usa imágenes placeholder por defecto
- La fuente DIN-Regular debe estar en `/public/fonts/`

## 👥 Contacto

**Equipamiento Gráfico Monte Grande**
- 📍 Carlos Pellegrini 1055, Monte Grande, Argentina
- 📞 +54 11 6110 0402
- ✉️ equipamientografico@gmail.com
- 📸 Instagram: @equipamientografico
- 👍 Facebook: Equipamiento Grafico Monte Grande
