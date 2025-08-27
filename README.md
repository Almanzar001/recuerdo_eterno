# Recuerdo Eterno - Memorial Pages Web App

Una aplicación web moderna para crear páginas conmemorativas digitales con Next.js y NocoDB.

## 🌟 Características

- **Páginas Conmemorativas**: Crea hermosas páginas en memoria de seres queridos
- **Galería de Fotos**: Sube y gestiona múltiples fotos con visualización optimizada
- **Sistema de Comentarios**: Permite a visitantes dejar mensajes conmemorativos
- **Responsive Design**: Funciona perfectamente en dispositivos móviles y desktop
- **Base de Datos Moderna**: Utiliza NocoDB para gestión de datos
- **Interfaz Intuitiva**: Diseño elegante y fácil de usar

## 🚀 Tecnologías

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: NocoDB (API REST)
- **Imágenes**: Sistema de attachments con proxy integrado
- **Forms**: React Hook Form con validación Zod
- **Icons**: Lucide React
- **QR Codes**: Generación automática para compartir

## 📋 Prerrequisitos

- Node.js 18+ 
- NPM o Yarn
- Instancia de NocoDB configurada
- Variables de entorno configuradas

## ⚙️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd recuerdo-eterno
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   # Editar .env.local con tus valores
   ```

4. **Configurar NocoDB**
   - Crear base de datos con tablas `clientes` y `difuntos`
   - Configurar relación uno-a-muchos (cliente tiene muchos difuntos)
   - Obtener IDs de tablas y token API

## 🛠️ Desarrollo

```bash
# Desarrollo con hot reload
npm run dev

# Verificar tipos
npm run type-check

# Linting
npm run lint
```

## 🏗️ Producción

```bash
# Build optimizado para producción
npm run build:prod

# Iniciar servidor de producción
npm start
```

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router (Next.js 13+)
│   ├── api/               # API Routes
│   ├── difunto/[id]/      # Páginas dinámicas de difuntos
│   └── admin/             # Panel administrativo
├── components/            # Componentes reutilizables
│   ├── DifuntoForm.tsx   # Formulario de difuntos
│   ├── PhotoGallery.tsx  # Galería de fotos
│   └── CommentSection.tsx # Sistema de comentarios
└── lib/                   # Utilidades y configuración
    ├── nocodb.ts         # Cliente API NocoDB
    └── client-api.ts     # API del cliente
```

## 🔧 Configuración

### Variables de Entorno Requeridas

```env
NOCODB_BASE_URL=https://tu-instancia-nocodb.com
NOCODB_TOKEN=tu-token-api
TABLE_ID_CLIENTES=id-tabla-clientes
TABLE_ID_DIFUNTOS=id-tabla-difuntos
```

### Estructura de Base de Datos

**Tabla: clientes**
- ID (Primary Key)
- nombre (Text)
- email (Email)
- telefono (Text, opcional)

**Tabla: difuntos**
- ID (Primary Key)
- Cliente (Link to clientes)
- nombre (Text)
- fecha_nacimiento (Date)
- fecha_fallecimiento (Date)
- historia (Long Text)
- Foto Principal (Attachment)
- fotobanner (Attachment)
- video_youtube (URL, opcional)
- ubicacion (Text, opcional)

## 🎨 Características Técnicas

- **Optimización de Imágenes**: Proxy automático para attachments de NocoDB
- **Modal Interactivo**: Galería con navegación por teclado y mouse
- **Responsive**: Adaptado para móviles con diseño optimizado
- **TypeScript**: Tipado fuerte para mejor desarrollo
- **Error Handling**: Manejo robusto de errores y estados de carga

## 📱 Uso

1. **Crear Cliente**: Registra información del cliente
2. **Crear Difunto**: Asocia difunto a cliente con fotos y datos
3. **Compartir**: Usa QR code o URL para compartir página
4. **Gestionar**: Panel admin para administrar contenido

## 🔒 Seguridad

- Validación de datos en frontend y backend
- Sanitización de inputs
- Manejo seguro de archivos
- Variables de entorno para datos sensibles

## 📊 Performance

- Lazy loading de imágenes
- Optimización de bundles con Next.js
- Caching de assets estáticos
- Compresión automática de imágenes

## 🐛 Debugging

Para debugging en desarrollo, revisa:
- Console del navegador para errores frontend
- Logs del servidor Next.js
- Respuestas de API de NocoDB
- Variables de entorno configuradas correctamente

## 📞 Soporte

Para problemas técnicos:
1. Revisa la documentación de NocoDB
2. Verifica configuración de variables de entorno
3. Confirma estructura de base de datos
4. Revisa logs de aplicación

## 📄 Licencia

Copyright © 2025 Recuerdo Eterno. Todos los derechos reservados.

---

*Desarrollado con ❤️ para honrar la memoria de nuestros seres queridos*
