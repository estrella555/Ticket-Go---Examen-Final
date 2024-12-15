# Ticket-Go 🎟️
#  Sistema de Gestión de Eventos con Firebase


Este proyecto es una plataforma interactiva para la gestión de eventos que incluye funcionalidades CRUD y características de autenticación, visualización de eventos, carrito de compras y confirmación de pedidos, todo integrado con Firebase.

---


## Características Principales

###  **Autenticación**
- Registro e inicio de sesión utilizando Firebase Authentication.
- Redirección automática para usuarios no autenticados.

###  **Gestión de Eventos**
- Visualización de eventos con filtros dinámicos por **categoría** y **ubicación**.
- Funcionalidades de eventos como: Crear, editar y eliminar.
- Etiquetas automáticas que destacan los eventos con descuentos.

###  **Carrito de Compras**
- Selección dinámica de entradas desde los eventos disponibles.
- Actualización automática de la disponibilidad de entradas en **Firestore**.
- Limpieza automática del carrito después de confirmar la compra.

###  **Confirmación de Compra**
- Posibilidad de adjuntar un comprobante de pago.
- Registro de pedidos directamente en Firebase.
- Restablecimiento automático de estados de eventos en Firestore (`addedToCart: false`).

---

##  **Cómo Ejecutar el Proyecto**

1. Clona o descarga ese repositorio
2. Asegurate de tener las dependencias npm install instaladas (node modules)
3. Compilar/ ejecutar el servidor de desarrollo con ng server
