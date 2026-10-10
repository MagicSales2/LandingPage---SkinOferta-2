# Skin Ofertas · Landing de Alta Conversión Pure Niacinamide 10

Landing page optimizada y lista para producción para el producto **Pure Niacinamide 10 (30ml)** en Colombia, con asistente virtual inteligente integrado con la API oficial de Google Gemini, soporte de pago contraentrega y pasarela Wompi.

---

## 🚀 Requisitos Previos

- **Node.js** >= 18.x o superior
- **npm**, **pnpm** o **bun**

---

## 🛠️ Instalación y Configuración Local

1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DE_TU_REPOSITORIO>
   cd <CARPETA_DEL_PROYECTO>
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Variables de Entorno:**
   Copia el archivo `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
   Configura tus variables en `.env`:
   - `GEMINI_API_KEY`: Tu clave de API de Google Gemini (opcional para desarrollo local; si no está definida, el chat cuenta con un motor inteligente de contingencia que responde todas las dudas frecuentes con precisión).
   - `PORT`: Puerto de escucha del servidor Express (por defecto `3000`).

---

## 💻 Comandos Disponibles

- **Modo Desarrollo:**
  ```bash
  npm run dev
  ```
  Inicia el servidor backend Express junto al middleware de Vite en `http://localhost:3000`.

- **Compilar para Producción:**
  ```bash
  npm run build
  ```
  Genera la versión optimizada en la carpeta `dist/`.

- **Iniciar en Producción:**
  ```bash
  npm run start
  ```
  Ejecuta el servidor Express sirviendo el bundle estático de producción y la API de chat.

- **Verificación de Tipos (TypeScript):**
  ```bash
  npm run lint
  ```

---

## 📂 Estructura del Proyecto

```
├── .env.example          # Plantilla de variables de entorno
├── .gitignore            # Exclusiones optimizadas para Git / GitHub
├── index.html            # Entry point HTML con meta-tags SEO y tipografía
├── package.json          # Dependencias y scripts
├── server.ts             # Servidor full-stack Express + endpoint /api/chat (Gemini)
├── src/
│   ├── App.tsx           # Componente principal con secciones completas y chat flotante
│   ├── main.tsx          # Montaje de React
│   └── index.css         # Importación de Tailwind CSS
├── tsconfig.json         # Configuración TypeScript
└── vite.config.ts        # Configuración de Vite con plugins React y Tailwind
```

---

## ✨ Características Principales

- **Diseño Móvil Primero:** Optimizado para carga ultra rápida y conversión en dispositivos móviles y de escritorio.
- **Asesor Inteligente:** Chat automatizado para responder sobre beneficios, modo de uso, ofertas, precios COP, tiempos de despacho y medios de pago.
- **Formulario de Pedido Contraentrega:** Validación de datos para despachos a toda Colombia.
- **Garantías y Prueba Social:** Sección de testimonios verificados, preguntas frecuentes y sellos de confianza.
