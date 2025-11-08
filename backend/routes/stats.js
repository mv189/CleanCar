const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/dashboard', async (req, res) => {
  try {
    // Total de ingresos de hoy
    const [ingresosHoy] = await db.query(`
      SELECT IFNULL(SUM(total),0) AS ingresosHoy
      FROM transactions
      WHERE DATE(created_at) = CURDATE()
      AND status='Completado'
    `);

    // Vehículos atendidos hoy
    const [vehiculosHoy] = await db.query(`
      SELECT COUNT(DISTINCT vehicle_id) AS vehiculosHoy
      FROM transactions
      WHERE DATE(created_at) = CURDATE()
      AND status='Completado'
    `);

    // Servicios completados (más exacto, según tabla transaction_services)
    const [serviciosHoy] = await db.query(`
      SELECT COUNT(ts.id) AS serviciosHoy
      FROM transaction_services ts
      INNER JOIN transactions t ON ts.transaction_id = t.id
      WHERE DATE(t.created_at) = CURDATE()
      AND t.status='Completado'
    `);

    // Promedio por transacción
    const [promedio] = await db.query(`
      SELECT IFNULL(AVG(total),0) AS promedio
      FROM transactions
      WHERE DATE(created_at) = CURDATE()
      AND status='Completado'
    `);

    res.json({
      ingresosHoy: ingresosHoy[0].ingresosHoy,
      vehiculosHoy: vehiculosHoy[0].vehiculosHoy,
      serviciosHoy: serviciosHoy[0].serviciosHoy,
      promedio: promedio[0].promedio
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
});

module.exports = router;
