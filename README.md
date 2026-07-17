# Quili Wash – Sistema de Gestión para Lavaderos de Vehículos

Aplicación web diseñada para administrar de forma eficiente los procesos operativos y administrativos de un negocio de lavado de vehículos. Incluye módulos de registro, control financiero, historial de vehículos, gestión de servicios, reportes y asignación de lavadores.

## 👥 Equipo de Desarrollo

- **Maria Victoria Carabali & Jean Carlos Campo Garcia**

## 📦 Tecnologías Utilizadas

### 🖥️ Frontend
- HTML5 / CSS3 / JavaScript
- Modo claro/oscuro integrado
- Componentes UI personalizados (tarjetas, formularios, tablas)
- Chart.js para gráficos (admin)

### ⚙️ Backend
- Node.js + Express
- API REST modularizada

### 🗄 Base de Datos
- MySQL
- Scripts SQL incluidos en `clean_car.sql`

### 🧰 Herramientas
- Git + GitHub
- Postman (pruebas de API)
- VSCode
- XAMPP / WAMP (entorno MySQL)

## 🌟 Características Principales

### 🔧 Panel Administrador
- Dashboard con métricas (ingresos, servicios, vehículos atendidos)
- Gestión de lavadores
- Administración de servicios y precios
- Reportes financieros
- Historial de vehículos
- Modo claro/oscuro
- Exportación de datos

### 🧾 Panel Secretario
- Registro rápido de vehículos
- Selección de servicios y cálculo de precio automático
- Asignación de lavadores
- Cierre de caja y reportes diarios
- Historial de clientes
- Notificaciones tipo toast
- Modo claro/oscuro sincronizado

### 📊 API Backend
- CRUD de vehículos
- CRUD de servicios
- Control de transacciones
- Generación de reportes
- Autenticación simple

## 📁 Estructura del Proyecto

\`\`\`
CLEAN_CAR/
│
├── admin/                    # Panel administrativo
│   ├── css/                  # Estilos del dashboard
│   ├── html/                 # Vistas (Dashboard, Servicios, Vehículos)
│   └── js/                   # Lógica frontend (gráficos, API calls)
│
├── secretario/               # Panel operativo del secretario
│   ├── css1/                 # Estilos del módulo
│   ├── html1/                # Interfaces del secretario
│   └── js1/                  # Scripts dinámicos del módulo
│
├── login/                    # Pantalla de inicio de sesión
│   ├── css/
│   ├── html/
│   └── js/
│
├── backend/                  # Lógica del servidor y la API
│   ├── routes/                # Rutas de API (auth, services, vehicles)
│   ├── db.js                  # Conexión a MySQL
│   └── server.js              # Servidor Express principal
│
├── clean_car.sql             # Script de base de datos
├── package.json               # Dependencias y scripts
└── README.md                  # Este archivo
\`\`\`

## 🚀 Instalación y Configuración

### 📌 Requisitos Previos
- Node.js 16+
- MySQL 8+
- Git
- Navegador moderno

### 1️⃣ Clonar el repositorio

\`\`\`bash
git clone https://github.com/TU_USUARIO/TU_REPO.git
cd TU_REPO
\`\`\`

### 2️⃣ Instalar dependencias

\`\`\`bash
npm install
\`\`\`

### 3️⃣ Configurar la base de datos

Crear la BD:

\`\`\`sql
CREATE DATABASE clean_car;
\`\`\`

Importar el script `clean_car.sql`.

### 4️⃣ Configurar variables de entorno

Crear archivo `.env`:

\`\`\`
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=clean_car
PORT=3000
\`\`\`

### 5️⃣ Iniciar el servidor

\`\`\`bash
node backend/server.js
\`\`\`

Acceder a la app:
- **Admin:** `admin/html/dashboard.html`
- **Secretario:** `secretario/html1/index.html`
- **Login:** `login/login.html`

## 🔁 Flujo de trabajo con Git (estilo profesional)

Clonar:

\`\`\`bash
git clone https://github.com/TU_USUARIO/TU_REPO.git
\`\`\`

Crear una nueva rama:

\`\`\`bash
git checkout -b feature/nueva-funcionalidad
\`\`\`

Guardar cambios:

\`\`\`bash
git add .
git commit -m "Descripción del cambio"
git push origin feature/nueva-funcionalidad
\`\`\`

Crear Pull Request en GitHub.

## 📌 Estado actual del proyecto

- ✔ Panel Administrador funcional
- ✔ Panel Secretario optimizado
- ✔ Modo oscuro en ambos módulos
- ✔ API REST estable
- ✔ Base de datos estructurada
- ✔ Cálculo automático de precios
- ✔ Sistema de notificaciones (toast)
- ✔ Sistema modular y escalable