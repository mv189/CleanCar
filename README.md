CleanCar es una aplicación multiplataforma desarrollada en Node.js, Express, MySQL y Electron, que permite gestionar las operaciones de un lavadero vehicular desde un panel administrativo y otro operativo.
Incluye módulos para control de servicios, vehículos, lavadores, transacciones, reportes, estadísticas y autenticación.

🚀 Características principales

Panel de administrador
Gestiona usuarios, servicios, reportes, vehículos y estadísticas.
Incluye gráficas de ingresos diarios y semanales.

Panel de secretario
Permite registrar vehículos, asignar servicios, realizar cierres de caja y ver historial.

Autenticación segura
Módulo de inicio de sesión con validación y control de acceso.

API REST
Construida con Express para conectar el frontend y el backend.

Base de datos MySQL
Integración completa para registrar transacciones, servicios y estadísticas.

Aplicación de escritorio con Electron
Permite ejecutar el sistema localmente con una interfaz moderna.

🧩 Estructura del proyecto
CleanCar/
│
├── admin/                 # Panel administrativo
│   ├── css/               # Estilos del dashboard
│   ├── html/              # Vistas (Dashboard, Vehículos, Servicios, etc.)
│   └── js/                # Lógica del frontend (Chart.js, API calls)
│
├── secretario/            # Panel operativo (Secretario)
│   ├── css1/              # Estilos del módulo
│   ├── html1/             # Vistas del secretario
│   └── js1/               # Scripts del módulo
│
├── login/                 # Pantalla de inicio de sesión
│   ├── css/
│   ├── html/
│   └── js/
│
├── backend/               # API y lógica de negocio
│   ├── routes/            # Rutas (auth, services, transactions, stats, etc.)
│   ├── db.js              # Conexión a MySQL
│   └── server.js          # Servidor principal Express
│
├── main.js                # Archivo principal de Electron
├── package.json           # Dependencias y scripts del proyecto
└── clean_car.sql          # Script de base de datos

⚙️ Instalación y configuración

Clona el repositorio:

git clone https://github.com/TuUsuario/CleanCar.git
cd CleanCar

Instala las dependencias:
npm install
Crea la base de datos:
Abre phpMyAdmin
Importa el archivo clean_car.sql
Configura la conexión en backend/db.js:

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'clean_car',
  timezone: '-05:00'
});


Inicia el servidor:
cd backend
una vez dentro del backend: node server.js

Accede desde el navegador:
Login: http://localhost:3000/

Panel Admin: http://localhost:3000/admin

Panel Secretario: http://localhost:3000/secretario

📊 Funcionalidades clave

Dashboard con estadísticas de ingresos diarios y semanales (Chart.js)
Registro de vehículos y lavadores
Gestión de servicios y transacciones
Reportes financieros y de desempeño
Cierres de caja automáticos

Tecnologías utilizadas
Tecnología	Descripción
Node.js	Entorno de ejecución backend
Express.js	Framework web para API REST
MySQL	Base de datos relacional
HTML5 / CSS3 / JS	Frontend tradicional con vistas separadas

Jean carlos campo y Maria victoria carabali 
Desarrolladores backend y frontend— Proyecto académico y empresarial

📍 Colombia
