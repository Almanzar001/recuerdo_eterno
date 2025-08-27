# Recuerdo Eterno - Web App de Páginas Conmemorativas

Una aplicación web moderna para crear páginas conmemorativas personalizadas con integración de códigos QR, galería de fotos interactiva y sistema de comentarios.

## Características

- 🏛️ **Panel Administrativo**: Gestión completa de difuntos, clientes, fotos y comentarios
- 📱 **Códigos QR Únicos**: Generación automática para acceso móvil rápido
- 🖼️ **Galería Interactiva**: Fotos con efecto card flip y modal de visualización completa
- 💬 **Sistema de Comentarios**: Moderación de comentarios con aprobación manual
- 📹 **Videos de YouTube**: Integración nativa de videos conmemorativos
- 📍 **Ubicación**: Opcional para mostrar información del cementerio
- 🎨 **Diseño Responsive**: Optimizado para todos los dispositivos

## Tecnologías

- **Frontend**: Next.js 15, React, TypeScript
- **Estilos**: TailwindCSS
- **Backend**: NocoDB (API REST)
- **Base de Datos**: MySQL/PostgreSQL (manejada por NocoDB)
- **Códigos QR**: qrcode.react
- **Formularios**: React Hook Form + Zod
- **Iconos**: Lucide React

## Estructura del Proyecto

```
src/
├── app/
│   ├── admin/                 # Panel administrativo
│   ├── difunto/[id]/         # Páginas conmemorativas dinámicas
│   └── page.tsx              # Página de inicio
├── components/
│   ├── PhotoGallery.tsx      # Galería con card flip
│   └── CommentSection.tsx    # Sistema de comentarios
└── lib/
    ├── nocodb.ts            # Configuración y API de NocoDB
    └── qr.ts                # Utilidades para códigos QR
```

## Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Actualiza el archivo `.env.local` con tu configuración:

```env
# NocoDB Configuration
NOCODB_BASE_URL=http://localhost:8080
NOCODB_TOKEN=your_nocodb_token_here

# Next.js Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Configurar NocoDB

#### Instalación con Docker:
```bash
docker run -d --name nocodb \
  -v "$(pwd)/nc_data:/usr/app/data/" \
  -p 8080:8080 \
  -e NC_AUTH_JWT_SECRET="your_jwt_secret" \
  nocodb/nocodb:latest
```

#### Crear las tablas necesarias en NocoDB:

**1. Tabla `clientes`:**
- `id` (Number, Primary Key, Auto Increment)
- `nombre` (Single Line Text, Required)
- `email` (Email, Required)
- `telefono` (Single Line Text)
- `created_at` (DateTime)
- `updated_at` (DateTime)

**2. Tabla `difuntos`:**
- `id` (Number, Primary Key, Auto Increment)
- `nombre` (Single Line Text, Required)
- `fecha_nacimiento` (Date, Required)
- `fecha_fallecimiento` (Date, Required)
- `historia` (Long Text)
- `foto_principal` (URL)
- `video_youtube` (Single Line Text)
- `ubicacion` (Single Line Text)
- `qr_code` (Long Text)
- `cliente_id` (Link to Another Record → clientes)
- `created_at` (DateTime)
- `updated_at` (DateTime)

**3. Tabla `fotos`:**
- `id` (Number, Primary Key, Auto Increment)
- `difunto_id` (Link to Another Record → difuntos)
- `url` (URL, Required)
- `descripcion` (Long Text)
- `orden` (Number)
- `created_at` (DateTime)
- `updated_at` (DateTime)

**4. Tabla `comentarios`:**
- `id` (Number, Primary Key, Auto Increment)
- `foto_id` (Link to Another Record → fotos)
- `difunto_id` (Link to Another Record → difuntos)
- `autor` (Single Line Text, Required)
- `email` (Email)
- `comentario` (Long Text, Required)
- `aprobado` (Checkbox, Default: false)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### 4. Ejecutar la aplicación

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Uso

### Panel Administrativo
Accede a `/admin` para:
- Gestionar difuntos y clientes
- Generar y descargar códigos QR
- Moderar comentarios
- Ver estadísticas de uso

### Páginas Conmemorativas
- Cada difunto tiene una URL única: `/difunto/[id]`
- Acceso directo mediante código QR
- Visualización de historia, fotos, videos
- Sistema de comentarios moderados

### Flujo de Trabajo
1. **Registro**: Admin crea cliente y difunto en el panel
2. **Contenido**: Se añaden fotos, videos e historia
3. **QR**: Se genera código QR único para la lápida
4. **Acceso**: Familiares acceden escaneando el QR
5. **Interacción**: Visitantes pueden comentar y reaccionar

## Despliegue

### Vercel (Recomendado)
```bash
npm i -g vercel
vercel
```

### Variables de Entorno en Producción
- `NOCODB_BASE_URL`: URL de tu instancia de NocoDB
- `NOCODB_TOKEN`: Token de autenticación de NocoDB
- `NEXT_PUBLIC_BASE_URL`: URL pública de tu aplicación

## Futuras Mejoras

- [ ] Autenticación de usuarios
- [ ] Dashboard con estadísticas avanzadas
- [ ] Notificaciones por email/WhatsApp
- [ ] Formularios dinámicos para clientes
- [ ] Álbum colaborativo
- [ ] Acceso privado con contraseña
- [ ] Integración con redes sociales
- [ ] Modo offline para visitantes

---

**Recuerdo Eterno** - Manteniendo vivos los recuerdos digitalmente ❤️