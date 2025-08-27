# **PRD --- Web App de Páginas Conmemorativas con NocoDB y QR**

**Proyecto:** Recuerdo Eterno\
**Autor:** Carlos Almánzar\
**Versión:** 1.0\
**Fecha:** 23/08/2025

------------------------------------------------------------------------

## **1. Resumen Ejecutivo**

La aplicación **Recuerdo Eterno** será una **web app responsive**
conectada a **NocoDB** que permitirá a los clientes crear y gestionar
páginas conmemorativas personalizadas para sus seres queridos.\
Cada página contará con fotos, videos, historia, comentarios y un **QR
único** para acceso rápido desde dispositivos móviles.

El sistema también tendrá un **panel administrativo** para gestionar
clientes, difuntos, formularios, comentarios, imágenes y estadísticas de
uso.

------------------------------------------------------------------------

## **2. Objetivos del Proyecto**

-   Permitir a los clientes enviar fácilmente la información de sus
    seres queridos mediante formularios personalizados.
-   Generar **páginas únicas y personalizadas** con fotos, historia,
    videos, ubicación y recuerdos.
-   Integrar un **componente de QR** para que los clientes puedan
    acceder a la página conmemorativa desde su celular.
-   Permitir que familiares y amigos puedan **comentar en las fotos** o
    en la página principal.
-   Centralizar la gestión de contenido en un **panel administrativo**
    conectado a NocoDB.

------------------------------------------------------------------------

## **3. Público Objetivo**

-   **Clientes finales**: Familiares o allegados que contratan los
    servicios de lápidas y desean una página conmemorativa.
-   **Administradores**: Personal de Recuerdo Eterno encargado de crear,
    revisar y gestionar las páginas.
-   **Visitantes**: Amigos y familiares que acceden a la página desde el
    QR.

------------------------------------------------------------------------

## **4. Alcance del Producto**

### **4.1. Funcionalidades Principales**

#### **A. Panel Administrativo (Backoffice)**

-   **Gestión de difuntos**:
    -   Crear, editar, eliminar registros.\
    -   Asignar QR único.\
    -   Subir múltiples fotos.\
    -   Adjuntar videos de YouTube.
-   **Generación automática de QR**:
    -   Generar QR único para cada difunto.\
    -   Descargar QR en PNG/JPG.\
    -   Enviar QR al cliente por email o WhatsApp.
-   **Gestión de clientes**:
    -   Crear, editar y asociar clientes a difuntos.\
    -   Consultar historial de páginas creadas.
-   **Gestión de formularios**:
    -   Crear y personalizar formularios dinámicos.\
    -   Enviar formularios al cliente vía email/WhatsApp.
-   **Gestión de comentarios**:
    -   Aprobar o eliminar comentarios inapropiados.\
    -   Notificaciones de nuevos comentarios.
-   **Estadísticas**:
    -   Visitas por página.\
    -   Fotos más comentadas.\
    -   Clientes activos.

#### **B. Frontend --- Páginas Conmemorativas**

-   **Página principal del difunto**:
    -   Foto destacada.
    -   Historia y biografía.
    -   Video principal (YouTube).
    -   Galería de fotos con **Card Flip** para descripción por detrás.
    -   Mapa con ubicación opcional (por ejemplo, cementerio).
-   **Componente QR**:
    -   Al escanear el QR, se abre directamente la página conmemorativa.
-   **Comentarios**:
    -   Cada foto tendrá un módulo para dejar comentarios.
    -   Sistema de moderación automática + manual.
    -   Opción de reaccionar con "me gusta" ❤️.
-   **Diseño responsive y elegante**:
    -   Colores sobrios.
    -   Tipografías legibles.
    -   Enfoque minimalista y respetuoso.

#### **C. Formulario Personalizado para Clientes**

-   Campos principales:
    -   Nombre del difunto.
    -   Fecha de nacimiento y fallecimiento.
    -   Historia/biografía.
    -   Fotos y videos.
    -   Redes sociales opcionales.
-   Validación de datos antes de enviarlos.
-   Guardado automático en **NocoDB**.
-   Confirmación por email/WhatsApp.

------------------------------------------------------------------------

## **5. Integraciones Técnicas**

### **5.1. Backend / Base de Datos**

-   **NocoDB** como backend principal.
-   Tablas clave:
    -   **Difuntos** → info personal, QR, videos, historia.
    -   **Clientes** → datos del contratante.
    -   **Fotos** → URL, descripción, contador de comentarios.
    -   **Comentarios** → autor, fecha, texto, foto asociada.
    -   **Formularios** → registro dinámico de inputs.

### **5.2. Generación de QR**

-   Librería recomendada: `qrcode` o `QRCode.js`.
-   Endpoint para generar QR dinámicamente basado en el `id` del
    difunto.

### **5.3. Videos**

-   Soporte para **YouTube Embed** en la página conmemorativa.
-   Opción de agregar varios videos.

### **5.4. Notificaciones**

-   **Email**: Integración con SendGrid / Gmail API.
-   **WhatsApp**: Integración vía Twilio o la API oficial de WhatsApp
    Business.

------------------------------------------------------------------------

## **6. Diseño UI/UX**

### **6.1. Estilo Visual**

-   Paleta de colores sobria (grises, azules suaves, blanco, negro).
-   Tipografía principal: **Roboto** o **Poppins**.
-   Animaciones suaves, respetando la solemnidad.

### **6.2. Componentes Clave**

-   **Card Flip en fotos**:
    -   Cara frontal: foto.\
    -   Reverso: descripción, fecha, comentarios.
-   **Galería interactiva**:
    -   Carrusel con zoom.
-   **Formulario dinámico**:
    -   Validación en vivo.
-   **Módulo de comentarios**:
    -   Estilo similar a redes sociales.

------------------------------------------------------------------------

## **7. Roles de Usuario**

  ---------------------------------------------------------------------------
  Rol             Permisos
  --------------- -----------------------------------------------------------
  **Admin**       CRUD difuntos, clientes, formularios, fotos, comentarios,
                  QR

  **Cliente**     Llenar formulario, subir fotos/videos, ver su página

  **Visitante**   Ver página pública, comentar, reaccionar
  ---------------------------------------------------------------------------

------------------------------------------------------------------------

## **8. Flujo General del Sistema**

1.  **Admin** registra al difunto en NocoDB o envía formulario al
    cliente.
2.  **Cliente** llena formulario con fotos, videos y biografía.
3.  **Admin** aprueba la página y genera el **QR único**.
4.  **QR** se coloca en la lápida y al escanearlo lleva a la página.
5.  **Visitantes** acceden, ven fotos, comentan y dejan recuerdos.

------------------------------------------------------------------------

## **9. Tecnologías Recomendadas**

-   **Frontend**: Next.js + React + TailwindCSS.
-   **Backend**: NocoDB API REST.
-   **Base de Datos**: MySQL / PostgreSQL (gestionada por NocoDB).
-   **QR**: `qrcode.react` (React) o `QRCode.js`.
-   **Hosting**: Vercel / Netlify.
-   **Formulario**: React Hook Form + integración directa a NocoDB.

------------------------------------------------------------------------

## **10. Roadmap de Implementación**

  Fase   Entrega                                             Tiempo Estimado
  ------ --------------------------------------------------- -----------------
  1      Diseño de base de datos y APIs en NocoDB            1 semana
  2      Panel administrativo + gestión de difuntos          2 semanas
  3      Generación de QR + integración con WhatsApp/email   1 semana
  4      Frontend páginas conmemorativas                     3 semanas
  5      Módulo de comentarios + Card Flip fotos             1 semana
  6      Formularios personalizados para clientes            1 semana
  7      Pruebas, QA y despliegue                            1 semana

**Tiempo total estimado:** 10 semanas.

------------------------------------------------------------------------

## **11. Futuras Mejoras**

-   Podcast de historia del difunto con IA.
-   Álbum colaborativo editable por familiares.
-   Límite de accesos privados con clave.
-   Dashboard para estadísticas avanzadas.
