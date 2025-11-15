// backend/routes/services.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // debe exportar un pool de mysql2/promise

// Obtener todos los servicios
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM services');
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener servicios:', err);
    res.status(500).json({ success: false, message: 'Error al obtener servicios' });
  }
});

// Crear nuevo servicio
router.post('/', async (req, res) => {
  try {
    const { name, price, duration, active } = req.body;

    if (!name || price == null || duration == null) {
      return res.status(400).json({ success: false, message: 'Datos incompletos para crear el servicio' });
    }

    const [result] = await db.query(
      'INSERT INTO services (name, price, duration, active) VALUES (?, ?, ?, ?)',
      [name, price, duration, active ?? 1]
    );

    res.json({
      success: true,
      message: 'Servicio creado correctamente',
      id: result.insertId,
      name,
      price,
      duration,
      active: active ?? 1
    });
  } catch (err) {
    console.error('Error al crear servicio:', err);
    res.status(500).json({ success: false, message: 'Error al crear servicio' });
  }
});

// Actualizar servicio existente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, duration, active } = req.body;

    if (!id || !name || price == null || duration == null) {
      return res.status(400).json({ success: false, message: 'Datos incompletos para modificar el servicio' });
    }

    await db.query(
      'UPDATE services SET name=?, price=?, duration=?, active=? WHERE id=?',
      [name, price, duration, active, id]
    );

    res.json({
      success: true,
      message: 'Servicio modificado correctamente',
      id,
      name,
      price,
      duration,
      active
    });
  } catch (err) {
    console.error('Error al modificar servicio:', err);
    res.status(500).json({ success: false, message: 'Error al modificar servicio' });
  }
});

// Eliminar servicio
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: 'ID de servicio no especificado' });
    }

    await db.query('DELETE FROM services WHERE id=?', [id]);

    res.json({ success: true, message: 'Servicio eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar servicio:', err);
    res.status(500).json({ success: false, message: 'Error al eliminar servicio' });
  }
});

module.exports = router;
