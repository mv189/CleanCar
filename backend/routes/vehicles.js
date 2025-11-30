const express = require('express');
const router = express.Router();
const pool = require('../db');

// VALIDACIONES

// Validar formato de placas
function validarPlaca(placa, tipo) {
  const regexCarro = /^[A-Z]{3}\s?[0-9]{3}$/;      
  const regexMoto = /^[A-Z]{3}\s?[0-9]{2}[A-Z]{1}$/; 
  return tipo === 'moto' ? regexMoto.test(placa) : regexCarro.test(placa);
}

// Validar teléfono colombiano
function validarTelefono(telefono) {
  const regex = /^\+57\s?3[0-9]{9}$/;
  return regex.test(telefono);
}

// VALIDACIÓN EN TIEMPO REAL

router.get('/validate-plate/:type/:plate', async (req, res) => {
  try {
    const { type, plate } = req.params;
    const isValid = validarPlaca(plate.toUpperCase(), type);

    if (!isValid) {
      const format = type === 'moto'
        ? 'AAA 12A (3 letras + 2 números + 1 letra)'
        : 'AAA 123 (3 letras + 3 números)';

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

// REGISTRO COMPLETO (vehículo + transacción + servicios)

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

    // 1. Verificar si el vehículo ya existe
    const [existingVehicle] = await connection.query(
      'SELECT id FROM vehicles WHERE plate = ?',
      [plate.toUpperCase()]
    );

    let vehicleId;

    if (existingVehicle.length > 0) {
      // Ya existe
      vehicleId = existingVehicle[0].id;

      await connection.query(
        'UPDATE vehicles SET owner = ?, phone = ?, washer_id = ?, type = ? WHERE id = ?',
        [owner, phone, washer_id, type, vehicleId]
      );
    } else {
      // Crear nuevo
      const [vehicleResult] = await connection.query(
        'INSERT INTO vehicles (plate, type, owner, phone, washer_id) VALUES (?, ?, ?, ?, ?)',
        [plate.toUpperCase(), type, owner, phone, washer_id]
      );
      vehicleId = vehicleResult.insertId;
    }

    // 2. Crear transacción
    const [transactionResult] = await connection.query(
      'INSERT INTO transactions (vehicle_id, total, status) VALUES (?, ?, ?)',
      [vehicleId, total, 'Completado']
    );
    const transactionId = transactionResult.insertId;

    // 3. Agregar servicios
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
      vehicleId,
      transactionId
    });

  } catch (error) {
    console.error('💥 ERROR EN /vehicles/register-complete:', error);
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// HISTORIAL COMPLETO
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

    res.json(rows.map(row => ({
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
    })));

  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

// ===============================
// BUSCAR POR PLACA
// ===============================
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

// EDITAR VEHÍCULO (PUT)
router.put('/:id', async (req, res) => {
  try {
    const { plate, type, owner, phone, washer_id } = req.body;

    if (!validarPlaca(plate, type)) {
      return res.status(400).json({ error: 'Placa inválida' });
    }

    const [result] = await pool.query(
      `UPDATE vehicles 
       SET plate=?, type=?, owner=?, phone=?, washer_id=?
       WHERE id=?`,
      [plate.toUpperCase(), type, owner, phone, washer_id || null, req.params.id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Vehículo no encontrado' });

    res.json({ message: 'Vehículo actualizado correctamente' });
  } catch (error) {
    console.error('Error actualizando vehículo:', error);
    res.status(500).json({ error: error.message });
  }
});

// ELIMINAR VEHÍCULO (DELETE)
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM vehicles WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Vehículo no encontrado' });

    res.json({ message: 'Vehículo eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando vehículo:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===============================
// HISTORIAL POR PLACA (NUEVO) ✅
// ===============================
router.get('/history/:plate', async (req, res) => {
  try {
    const plate = req.params.plate.toUpperCase();

    // 1. Obtener datos básicos del vehículo
    const [vehicleRows] = await pool.query(
      'SELECT * FROM vehicles WHERE plate = ?',
      [plate]
    );

    if (vehicleRows.length === 0) {
      return res.json({
        vehicle: { 
          plate,
          owner: "No registrado",
          type: "N/A",
        },
        history: []
      });
    }

    const vehicle = vehicleRows[0];

    // 2. Obtener historial de transacciones del vehículo (ARREGLADO)
    const [history] = await pool.query(`
      SELECT 
        t.id,
        t.total,
        t.status,
        t.created_at AS date,
        GROUP_CONCAT(s.name) AS services,
        t.washer AS washer
      FROM transactions t
      LEFT JOIN transaction_services ts ON t.id = ts.transaction_id
      LEFT JOIN services s ON ts.service_id = s.id
      WHERE t.vehicle_id = ?
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `, [vehicle.id]);

    res.json({ vehicle, history });

  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error al obtener historial del vehículo' });
  }
});

module.exports = router;