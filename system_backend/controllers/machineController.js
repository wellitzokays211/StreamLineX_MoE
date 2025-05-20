// controllers/machineController.js

import pool from '../config/db.js';

// Add a new machine
export const addMachine = async (req, res) => {
  try {
    const { machineId, machineName, description, purchaseDate, status, hourlyRate } = req.body;

    if (!machineId || !machineName) {
      return res.status(400).json({ success: false, message: 'Machine ID and Name are required.' });
    }

    const [result] = await pool.query(
      'INSERT INTO machines (machine_id, machine_name, description, purchase_date, status, hourly_rate) VALUES (?, ?, ?, ?, ?, ?)',
      [machineId, machineName, description, purchaseDate, status, hourlyRate]
    );

    const machineIdInserted = result.insertId;

    // Handle images if any
    if (req.files && req.files.length > 0) {
      const imageDetails = req.files.map((file) => ({
        path: file.path,
        type: file.mimetype,
        filename: file.filename,
      }));

      for (const image of imageDetails) {
        await pool.query(
          'INSERT INTO machine_images (machine_id, file_path, file_type, file_name) VALUES (?, ?, ?, ?)',
          [machineIdInserted, image.path, image.type, image.filename]
        );
      }
    }

    res.json({
      success: true,
      message: 'Machine added successfully!',
      machine: {
        id: machineIdInserted,
        machineId,
        machineName,
        description,
        purchaseDate,
        status,
        hourlyRate,
        images: req.files ? req.files.map((file) => file.filename) : [],
      },
    });
  } catch (error) {
    console.error('Error adding machine:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add the machine. Please try again.',
      error: error.message,
    });
  }
};

// Get all machines
export const getAllMachines = async (req, res) => {
  try {
    const [machines] = await pool.query(
      `SELECT m.id, m.machine_id, m.machine_name, m.description, 
       m.purchase_date, m.status, m.hourly_rate, mi.file_name 
       FROM machines m LEFT JOIN machine_images mi ON m.id = mi.machine_id`
    );

    const groupedMachines = machines.reduce((acc, machine) => {
      if (!acc[machine.id]) {
        acc[machine.id] = {
          id: machine.id,
          machineId: machine.machine_id,
          machineName: machine.machine_name,
          description: machine.description,
          purchaseDate: machine.purchase_date,
          status: machine.status,
          hourlyRate: machine.hourly_rate,
          images: [],
        };
      }

      if (machine.file_name) {
        acc[machine.id].images.push(machine.file_name);
      }

      return acc;
    }, {});

    const machinesList = Object.values(groupedMachines);

    res.json({
      success: true,
      message: 'Machines fetched successfully',
      machines: machinesList,
    });
  } catch (error) {
    console.error('Error fetching machines:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch machines. Please try again.',
      error: error.message,
    });
  }
};

// Update a machine
export const updateMachine = async (req, res) => {
  try {
    const { id, machineName, description, status, hourlyRate } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Machine ID is required.' });
    }

    const [result] = await pool.query(
      `UPDATE machines SET 
       machine_name = ?, 
       description = ?, 
       status = ?, 
       hourly_rate = ? 
       WHERE id = ?`,
      [machineName, description, status, hourlyRate, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Machine not found.' });
    }

    res.json({
      success: true,
      message: 'Machine updated successfully!',
    });
  } catch (error) {
    console.error('Error updating machine:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update machine. Please try again.',
      error: error.message,
    });
  }
};

// Delete a machine
export const deleteMachine = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Machine ID is required.' });
    }

    // Delete associated images first
    await pool.query('DELETE FROM machine_images WHERE machine_id = ?', [id]);

    // Then delete the machine
    const [result] = await pool.query('DELETE FROM machines WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Machine not found.' });
    }

    res.json({
      success: true,
      message: 'Machine deleted successfully!',
    });
  } catch (error) {
    console.error('Error deleting machine:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete machine. Please try again.',
      error: error.message,
    });
  }
};

// Add maintenance record
export const addMaintenance = async (req, res) => {
  try {
    const { machineId, maintenanceDate, description, cost, technician, nextMaintenanceDate } = req.body;

    if (!machineId || !maintenanceDate || !description) {
      return res.status(400).json({ success: false, message: 'Required fields are missing.' });
    }

    await pool.query(
      `INSERT INTO machine_maintenance 
       (machine_id, maintenance_date, description, cost, technician, next_maintenance_date) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [machineId, maintenanceDate, description, cost, technician, nextMaintenanceDate]
    );

    // Update machine's last maintenance date
    await pool.query(
      'UPDATE machines SET last_maintenance_date = ? WHERE id = ?',
      [maintenanceDate, machineId]
    );

    res.json({
      success: true,
      message: 'Maintenance record added successfully!',
    });
  } catch (error) {
    console.error('Error adding maintenance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add maintenance record. Please try again.',
      error: error.message,
    });
  }
};

// Get maintenance records for a machine
export const getMaintenanceRecords = async (req, res) => {
  try {
    const { machineId } = req.params;

    const [records] = await pool.query(
      'SELECT * FROM machine_maintenance WHERE machine_id = ? ORDER BY maintenance_date DESC',
      [machineId]
    );

    res.json({
      success: true,
      message: 'Maintenance records fetched successfully',
      records,
    });
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance records. Please try again.',
      error: error.message,
    });
  }
};