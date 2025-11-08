const express = require('express');
const router = express.Router();
const db = require('../db'); // debe exportar un pool de mysql2/promise

// Obtener todos los servicios
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM services');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear nuevo servicio
router.post('/', async (req, res) => {
  try {
    const { name, price, duration, active } = req.body;
    const [result] = await db.query(
      'INSERT INTO services (name, price, duration, active) VALUES (?, ?, ?, ?)',
      [name, price, duration, active ?? 1]
    );
    res.json({ id: result.insertId, name, price, duration, active: active ?? 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar servicio
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, duration, active } = req.body;
    await db.query(
      'UPDATE services SET name=?, price=?, duration=?, active=? WHERE id=?',
      [name, price, duration, active, id]
    );
    res.json({ id, name, price, duration, active });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar servicio
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM services WHERE id=?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
