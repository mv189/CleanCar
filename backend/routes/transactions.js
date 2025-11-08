const express = require('express');
const router = express.Router();
const pool = require('../db');

// CORREGIDO: Métricas del día usando solo campos que existen en la BD
router.get('/today', async (req, res) => {
  try {
    // Obtener métricas básicas del día
    const [metrics] = await pool.query(`
      SELECT 
        COALESCE(SUM(t.total), 0) AS totalRevenue,
        COUNT(DISTINCT t.vehicle_id) AS totalVehicles,
        COUNT(t.id) AS completedServices,
        COALESCE(AVG(t.total), 0) AS averageService
      FROM transactions t
      WHERE DATE(t.created_at) = CURDATE() 
        AND t.status = 'Completado'
    `);

    // Obtener transacciones detalladas del día
    const [transactions] = await pool.query(`
      SELECT 
        t.id,
        t.total,
        t.status,
        t.created_at,
        v.plate,
        v.owner,
        v.type,
        w.name as washer_name,
        GROUP_CONCAT(s.name) as services
      FROM transactions t
      JOIN vehicles v ON t.vehicle_id = v.id
      LEFT JOIN washers w ON v.washer_id = w.id
      LEFT JOIN transaction_services ts ON t.id = ts.transaction_id
      LEFT JOIN services s ON ts.service_id = s.id
      WHERE DATE(t.created_at) = CURDATE()
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);

    // Procesar transacciones para el frontend
    const processedTransactions = transactions.map(t => ({
      id: t.id,
      plate: t.plate,
      owner: t.owner,
      type: t.type,
      services: t.services ? t.services.split(',') : [],
      washer: t.washer_name || 'No asignado',
      total: parseFloat(t.total),
      status: t.status,
      payment: 'Efectivo', // Por ahora solo efectivo según tu BD
      time: new Date(t.created_at).toLocaleTimeString('es-CO', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      timestamp: t.created_at
    }));

    // Calcular resumen por método de pago (solo efectivo por ahora)
    const paymentSummary = [{
      method: 'Efectivo',
      count: processedTransactions.length,
      total: metrics[0].totalRevenue
    }];

    res.json({
      metrics: {
        totalRevenue: parseFloat(metrics[0].totalRevenue),
        totalVehicles: metrics[0].totalVehicles,
        completedServices: metrics[0].completedServices,
        averageService: parseFloat(metrics[0].averageService)
      },
      transactions: processedTransactions,
      paymentSummary: paymentSummary
    });

  } catch (error) {
    console.error('Error al obtener métricas del día:', error);
    res.status(500).json({ error: 'Error al obtener métricas del día' });
  }
});

// Obtener métricas de un rango de fechas
router.get('/range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const [metrics] = await pool.query(`
      SELECT 
        COALESCE(SUM(t.total), 0) AS totalRevenue,
        COUNT(DISTINCT t.vehicle_id) AS totalVehicles,
        COUNT(t.id) AS completedServices,
        COALESCE(AVG(t.total), 0) AS averageService
      FROM transactions t
      WHERE DATE(t.created_at) BETWEEN ? AND ?
        AND t.status = 'Completado'
    `, [startDate, endDate]);

    res.json({
      metrics: {
        totalRevenue: parseFloat(metrics[0].totalRevenue),
        totalVehicles: metrics[0].totalVehicles,
        completedServices: metrics[0].completedServices,
        averageService: parseFloat(metrics[0].averageService)
      }
    });

  } catch (error) {
    console.error('Error al obtener métricas por rango:', error);
    res.status(500).json({ error: 'Error al obtener métricas por rango' });
  }
});

// Obtener servicios más populares del día
router.get('/popular-services', async (req, res) => {
  try {
    const [services] = await pool.query(`
      SELECT 
        s.name,
        s.price,
        COUNT(ts.service_id) as count,
        SUM(s.price) as total_revenue
      FROM transaction_services ts
      JOIN services s ON ts.service_id = s.id
      JOIN transactions t ON ts.transaction_id = t.id
      WHERE DATE(t.created_at) = CURDATE()
        AND t.status = 'Completado'
      GROUP BY s.id, s.name, s.price
      ORDER BY count DESC
      LIMIT 10
    `);

    res.json(services.map(s => ({
      name: s.name,
      price: parseFloat(s.price),
      count: s.count,
      totalRevenue: parseFloat(s.total_revenue)
    })));

  } catch (error) {
    console.error('Error al obtener servicios populares:', error);
    res.status(500).json({ error: 'Error al obtener servicios populares' });
  }
});

module.exports = router;