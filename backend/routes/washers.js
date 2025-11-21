const express = require('express');
const router = express.Router();
const pool = require('../db');

// ✅ GET — Obtener lavadores con vehículos lavados reales
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        w.id,
        w.name,
        w.active,
        w.created_at,
        COALESCE(COUNT(v.id), 0) AS vehicles_washed,
        COALESCE(MAX(v.created_at), NULL) AS last_service
      FROM washers w
      LEFT JOIN vehicles v 
        ON v.washer_id = w.id
      GROUP BY w.id, w.name, w.active, w.created_at
      ORDER BY w.id DESC;
    `);

    res.json(rows);
  } catch (error) {
    console.error('💥 Error al obtener lavadores:', error);
    res.status(500).json({ error: error.message });
  }
});

// ======================================
// ✅ POST — Crear lavador
// ======================================
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    const [result] = await pool.query(
      'INSERT INTO washers (name, active) VALUES (?, 1)',
      [name]
    );

    res.json({ message: 'Lavador creado', id: result.insertId });
  } catch (error) {
    console.error('💥 Error al crear lavador:', error);
    res.status(500).json({ error: error.message });
  }
});

// ======================================
// ✅ PUT — Editar lavador
// ======================================
router.put('/:id', async (req, res) => {
  try {
    const { name, active } = req.body;

    const [result] = await pool.query(
      'UPDATE washers SET name = ?, active = ? WHERE id = ?',
      [name, active ?? 1, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Lavador no encontrado' });
    }

    res.json({ message: 'Lavador actualizado' });
  } catch (error) {
    console.error('💥 Error al actualizar lavador:', error);
    res.status(500).json({ error: error.message });
  }
});

// ======================================
// ✅ DELETE — Eliminar lavador
// ======================================
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM washers WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Lavador no encontrado' });
    }

    res.json({ message: 'Lavador eliminado' });
  } catch (error) {
    console.error('💥 Error al eliminar lavador:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
