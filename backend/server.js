// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// ========================
// 🔧 Middlewares
// ========================
app.use(cors());
app.use(express.json());

// ========================
// 💾 Conexión a la base de datos
// ========================
require('./db');

// ========================
// 🌐 Rutas públicas (Login)
// ========================
app.use('/login', express.static(path.join(__dirname, '../login')));
app.use('/auth', require('./routes/auth')); // Autenticación

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../login/login.html'));
});

// ========================
// 🧭 Archivos estáticos del panel Admin
// ========================
app.use('/css', express.static(path.join(__dirname, '../admin/css')));
app.use('/js', express.static(path.join(__dirname, '../admin/js')));
app.use('/html', express.static(path.join(__dirname, '../admin/html')));

app.use('/admin', express.static(path.join(__dirname, '../admin/html')));
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/html/index.html'));
});

// ========================
// 🧾 Archivos estáticos del panel Secretario
// ========================
app.use('/css1', express.static(path.join(__dirname, '../secretario/css1')));
app.use('/js1', express.static(path.join(__dirname, '../secretario/js1')));
app.use('/html1', express.static(path.join(__dirname, '../secretario/html1')));

app.use('/secretario', express.static(path.join(__dirname, '../secretario/html1')));
app.get('/secretario', (req, res) => {
  res.sendFile(path.join(__dirname, '../secretario/html1/index.html'));
});

// ========================
// 🧩 Rutas de la API (Backend)
// ========================
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/services', require('./routes/services'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/washers', require('./routes/washers'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/stats', require('./routes/stats')); // 📊 incluye /dashboard y /weekly-income

// ========================
// 🚀 Inicialización del servidor
// ========================
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log('=======================================');
  console.log(`✅ CleanCar Web corriendo correctamente`);
  console.log(`🌐 Login:        http://localhost:${PORT}/`);
  console.log('=======================================');
});

// ========================
// ⚠️ Manejo de errores de puerto
// ========================
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️  El puerto ${PORT} ya está en uso. Intentando otro...`);
    const newPort = PORT + 1;
    app.listen(newPort, () => {
      console.log(`✅ Servidor movido a http://localhost:${newPort}`);
    });
  } else {
    console.error('❌ Error al iniciar el servidor:', err);
  }
});
