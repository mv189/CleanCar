const express = require('express');
const router = express.Router();
const pool = require('../db');

// Validar formato de placas
function validarPlaca(placa, tipo) {
  const regexCarro = /^[A-Z]{3}\s?[0-9]{3}$/;      // ABC 123 o ABC123
  const regexMoto = /^[A-Z]{3}\s?[0-9]{2}[A-Z]{1}$/; // XYZ 45D o XYZ45D

  if (tipo === 'moto') return regexMoto.test(placa);
  return regexCarro.test(placa);
}

// Validar teléfono colombiano
function validarTelefono(telefono) {
  const regex = /^\+57\s?3[0-9]{9}$/; // +57 3001234567 o +573001234567
  return regex.test(telefono);
}

// NUEVO: Endpoint para validación en tiempo real
router.get('/validate-plate/:type/:plate', async (req, res) => {
  try {
    const { type, plate } = req.params;
    const isValid = validarPlaca(plate.toUpperCase(), type);
    
    if (!isValid) {
      const format = type === 'moto' ? 'AAA 12A (3 letras + 2 números + 1 letra)' : 'AAA 123 (3 letras + 3 números)';
      return res.json({ 
        valid: false, 
        message: `Formato inválido. Use: ${format}` 
      });
    }
    
    res.json({ valid: true, message: 'Formato válido' });
  } catch (error) {
    console.error('Error validando placa:', error);
    res.status(500).json({ error: 'Error en validación' });
  }
});

// ✅ VERSIÓN CORREGIDA: Registro completo (vehículo + transacción + servicios)
router.post('/register-complete', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { plate, type, owner, phone, washer_id, services, total, discount } = req.body;

    // Validaciones
    if (!validarPlaca(plate, type)) {
      await connection.rollback();
      return res.status(400).json({ error: 'Formato de placa inválido' });
    }

    if (phone && !validarTelefono(phone)) {
      await connection.rollback();
      return res.status(400).json({ error: 'Teléfono inválido. Debe ser +57 3xxxxxxxxx' });
    }

    if (!services || services.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Debe seleccionar al menos un servicio' });
    }

    // 🔹 1. Verificar si el vehículo ya existe
    const [existingVehicle] = await connection.query(
      'SELECT id FROM vehicles WHERE plate = ?',
      [plate.toUpperCase()]
    );

    let vehicleId;

    if (existingVehicle.length > 0) {
      // ✅ Ya existe → reutilizar el ID y actualizar datos
      vehicleId = existingVehicle[0].id;
      
      await connection.query(
        'UPDATE vehicles SET owner = ?, phone = ?, washer_id = ?, type = ? WHERE id = ?',
        [owner, phone, washer_id, type, vehicleId]
      );
    } else {
      // ✅ No existe → crear vehículo nuevo
      const [vehicleResult] = await connection.query(
        'INSERT INTO vehicles (plate, type, owner, phone, washer_id) VALUES (?, ?, ?, ?, ?)',
        [plate.toUpperCase(), type, owner, phone, washer_id]
      );
      vehicleId = vehicleResult.insertId;
    }

    // 🔹 2. Crear transacción
    const [transactionResult] = await connection.query(
      'INSERT INTO transactions (vehicle_id, total, status) VALUES (?, ?, ?)',
      [vehicleId, total, 'Completado']
    );
    const transactionId = transactionResult.insertId;

    // 🔹 3. Agregar servicios a la transacción
    for (const serviceId of services) {
      await connection.query(
        'INSERT INTO transaction_services (transaction_id, service_id) VALUES (?, ?)',
        [transactionId, serviceId]
      );
    }

    await connection.commit();

    res.json({ 
      success: true,
      message: existingVehicle.length > 0 
        ? 'Nueva visita registrada para vehículo existente' 
        : 'Vehículo nuevo registrado exitosamente',
      vehicleId: vehicleId,
      transactionId: transactionId
    });

  } catch (error) {
    console.error('💥 ERROR EN /vehicles/register-complete:', error);
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// NUEVO: Obtener historial completo
router.get('/history', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        v.id,
        v.plate,
        v.type,
        v.owner,
        v.phone,
        v.created_at,
        COUNT(DISTINCT t.id) as total_visits,
        MAX(t.created_at) as last_visit,
        (SELECT SUM(t2.total) 
         FROM transactions t2 
         WHERE t2.vehicle_id = v.id AND t2.status = 'Completado') as total_spent,
        GROUP_CONCAT(DISTINCT s.name) as services
      FROM vehicles v
      LEFT JOIN transactions t ON v.id = t.vehicle_id
      LEFT JOIN transaction_services ts ON t.id = ts.transaction_id
      LEFT JOIN services s ON ts.service_id = s.id
      WHERE t.status = 'Completado'
      GROUP BY v.id
      ORDER BY MAX(t.created_at) DESC
    `);

    // Procesar los datos para el frontend
    const processedData = rows.map(row => ({
      id: row.id,
      plate: row.plate,
      type: row.type,
      owner: row.owner,
      phone: row.phone,
      totalVisits: row.total_visits || 0,
      lastVisit: row.last_visit,
      totalSpent: row.total_spent || 0,
      services: row.services ? row.services.split(',') : [],
      createdAt: row.created_at
    }));

    res.json(processedData);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

// Buscar vehículo por placa (original mejorado)
router.get('/search', async (req, res) => {
  try {
    const { plate } = req.query;
    const [rows] = await pool.query(
      'SELECT * FROM vehicles WHERE plate LIKE ? ORDER BY created_at DESC',
      [`%${plate.toUpperCase()}%`]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al buscar vehículo:', error);
    res.status(500).json({ error: 'Error al buscar vehículo' });
  }
});

module.exports = router;