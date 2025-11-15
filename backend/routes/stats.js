
const express = require('express');
const router = express.Router();
const db = require('../db');

// RUTA PRINCIPAL DASHBOARD (HOY)

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

    // Servicios completados hoy
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

// DATOS  DE LA SEMANA

router.get('/weekly', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        DAYOFWEEK(created_at) AS dia,
        SUM(total) AS total
      FROM transactions
      WHERE YEARWEEK(created_at, 1) = YEARWEEK(NOW(), 1)
      AND status='Completado'
      GROUP BY DAYOFWEEK(created_at)
    `);

    const week = { Lun: 0, Mar: 0, Mié: 0, Jue: 0, Vie: 0, Sáb: 0, Dom: 0 };

    const map = {
      2: 'Lun',
      3: 'Mar',
      4: 'Mié',
      5: 'Jue',
      6: 'Vie',
      7: 'Sáb',
      1: 'Dom'
    };

    rows.forEach(r => {
      const dayName = map[r.dia];
      week[dayName] = r.total;
    });

    res.json(week);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error obteniendo estadísticas semanales' });
  }
});

module.exports = router;
