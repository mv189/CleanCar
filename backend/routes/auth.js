const express = require('express');
const router = express.Router();
const pool = require('../db');   
const bcrypt = require("bcryptjs");

// LOGIN (admin / secretario)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Faltan credenciales' });
  }

  try {
    // Buscar usuario por username
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ? AND active = 1',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos' });
    }

    const user = rows[0];

    // Comparar contraseña usando bcrypt
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos' });
    }

    // Login correcto
    res.json({
      success: true,
      role: user.role,
      name: user.name
    });

  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
});

module.exports = router;
