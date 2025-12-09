const express = require('express');
const router = express.Router();
const pool = require('../db');


// 📅 Obtener ingresos diarios de un mes
router.get('/monthly/:year/:month', async (req, res) => {
  const { year, month } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT 
        DATE(created_at) AS date,
        SUM(total) AS daily_total
      FROM transactions
      WHERE YEAR(created_at) = ? AND MONTH(created_at) = ?
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `, [year, month]);

    res.json(rows);
  } catch (error) {
    console.error('Error en /monthly:', error);
    res.status(500).json({ error: 'Error obteniendo reportes mensuales' });
  }
});


// 📊 Obtener ingresos acumulados por mes del año
router.get('/yearly/:year', async (req, res) => {
  const { year } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        SUM(total) AS monthly_total
      FROM transactions
      WHERE YEAR(created_at) = ?
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month
    `, [year]);

    res.json(rows);
  } catch (error) {
    console.error('Error en /yearly:', error);
    res.status(500).json({ error: 'Error obteniendo reportes anuales' });
  }
});


// 💰 Cierre de caja diario
router.get('/cierre', async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        IFNULL(SUM(t.total), 0) AS totalRecaudado,
        COUNT(DISTINCT t.vehicle_id) AS vehiculosAtendidos,
        COUNT(ts.id) AS serviciosCompletados,
        CASE 
          WHEN COUNT(ts.id) > 0 THEN ROUND(SUM(t.total) / COUNT(ts.id), 0)
          ELSE 0 
        END AS promedioServicio
      FROM transactions t
      LEFT JOIN transaction_services ts ON ts.transaction_id = t.id
      WHERE DATE(t.created_at) = CURDATE()
      AND t.status = 'Completado'
    `);

    res.json(stats[0]);
  } catch (error) {
    console.error('Error en /reports/cierre:', error);
    res.status(500).json({ error: 'Error al obtener el cierre de caja' });
  }
});


// =====================================================
// 📤 Exportar transacciones del mes (necesario para PDF)
// =====================================================
router.get('/month/:year/:month', async (req, res) => {
  const { year, month } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT 
        t.id,
        v.plate,
        v.owner,
        GROUP_CONCAT(s.name SEPARATOR ', ') AS services,
        t.total,
        t.payment_method,
        t.created_at
      FROM transactions t
      INNER JOIN vehicles v ON v.id = t.vehicle_id
      LEFT JOIN transaction_services ts ON ts.transaction_id = t.id
      LEFT JOIN services s ON s.id = ts.service_id
      WHERE YEAR(t.created_at) = ? AND MONTH(t.created_at) = ?
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `, [year, month]);

    res.json(rows);
  } catch (error) {
    console.error('Error en /reports/month:', error);
    res.status(500).json({ error: 'Error obteniendo datos para exportación' });
  }
});


module.exports = router;