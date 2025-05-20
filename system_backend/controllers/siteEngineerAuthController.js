import bcrypt from 'bcrypt';
import { createToken } from '../middleware/token.js';
import pool from '../config/db.js';
import validator from 'validator';

const registerEngineer = async (req, res) => {
  const { name, password, email, tel_num, specialization } = req.body;
  try {
    // Validation checks
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }
    if (tel_num.length !== 10) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit phone number' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert engineer into the database
    const INSERT_ENGINEER_QUERY =
      'INSERT INTO site_engineers (engineer_name, email, password, tel_num, specialization) VALUES (?, ?, ?, ?, ?)';
    const [result] = await pool.query(INSERT_ENGINEER_QUERY, [
      name,
      email,
      hashedPassword,
      tel_num,
      specialization || null
    ]);

    // Create token using the inserted ID (engineer_id)
    const token = createToken(result.insertId, 'engineer');

    res.status(201).json({ 
      success: true, 
      token,
      user: {
        id: result.insertId,
        name: name,
        email: email,
        role: 'engineer'
      }
    });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }
    res.status(500).json({ success: false, message: 'Error registering engineer' });
  }
};

const loginEngineer = async (req, res) => {
  const { email, password } = req.body;
  try {
    const SELECT_ENGINEER_QUERY = 'SELECT * FROM site_engineers WHERE email = ?';
    const [rows] = await pool.query(SELECT_ENGINEER_QUERY, [email]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const engineer = rows[0];
    const isMatch = await bcrypt.compare(password, engineer.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Create token using engineer_id from the query result
    const token = createToken(engineer.engineer_id, 'engineer');

    res.json({ 
      success: true, 
      token,
      user: {
        id: engineer.engineer_id,
        name: engineer.engineer_name,
        email: engineer.email,
        role: 'engineer'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error logging in engineer' });
  }
};

const getEngineers = async (req, res) => {
  try {
    const SELECT_ENGINEERS_QUERY =
      'SELECT engineer_id, engineer_name, email, tel_num, specialization, join_date FROM site_engineers';
    const [engineers] = await pool.query(SELECT_ENGINEERS_QUERY);

    res.json({ success: true, engineers });
  } catch (error) {
    console.error('Error getting engineers:', error);
    res.status(500).json({ success: false, message: 'Error getting engineers' });
  }
};

const deleteEngineer = async (req, res) => {
  const { engineerId } = req.body;
  try {
    const DELETE_ENGINEER_QUERY = 'DELETE FROM site_engineers WHERE engineer_id = ?';
    const [result] = await pool.query(DELETE_ENGINEER_QUERY, [engineerId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Engineer not found' });
    }

    res.json({ success: true, message: 'Engineer deleted successfully' });
  } catch (error) {
    console.error('Error deleting engineer:', error);
    res.status(500).json({ success: false, message: 'Error deleting engineer' });
  }
};

const getEngineerById = async (req, res) => {
  const { userId } = req.body; 

  try {
    const SELECT_ENGINEER_QUERY =
      'SELECT engineer_id, engineer_name, email, tel_num, specialization, join_date FROM site_engineers WHERE engineer_id = ?';
    const [rows] = await pool.query(SELECT_ENGINEER_QUERY, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Engineer not found' });
    }

    res.json({ success: true, engineer: rows[0] });
  } catch (error) {
    console.error('Error getting engineer by ID:', error);
    res.status(500).json({ success: false, message: 'Error fetching engineer data' });
  }
};
const  updateEngineerSeen = async (req, res) => {
  const { userId, engineer_name, email, tel_num, specialization, join_date } = req.body;

  try {
    const UPDATE_ENGINEER_QUERY = `
      UPDATE site_engineers 
      SET engineer_name = ?, email = ?, tel_num = ?, specialization = ?, join_date = ?
      WHERE engineer_id = ?
    `;

    const [result] = await pool.query(UPDATE_ENGINEER_QUERY, [
      engineer_name,
      email,
      tel_num,
      specialization,
      join_date,
      userId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Engineer not found or no changes made' });
    }

    res.json({ success: true, message: 'Engineer updated successfully' });
  } catch (error) {
    console.error('Error updating engineer:', error);
    res.status(500).json({ success: false, message: 'Error updating engineer data' });
  }
};

export { 
  loginEngineer, 
  registerEngineer, 
  getEngineers, 
  deleteEngineer, 
  getEngineerById ,
  updateEngineerSeen
};