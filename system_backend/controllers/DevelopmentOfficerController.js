import bcrypt from 'bcrypt';
import { createToken } from '../middleware/token.js';
import pool from '../config/db.js';
import validator from 'validator';

// Register Development Officer with secret key validation
const registerDevelopmentOfficer = async (req, res) => {
  const { name, password, email, tel_num, nic, secretKey } = req.body;
  try {
    // Validation checks
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: 'Please enter a valid email' });
    }
    if (password.length < 8) {
      return res.json({ success: false, message: 'Password must be at least 8 characters' });
    }
    if (tel_num.length !== 10) {
      return res.json({ success: false, message: 'Please enter a valid 10-digit phone number' });
    }
    if (secretKey !== '1234') {
      return res.json({ success: false, message: 'Invalid secret key' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into the database
    const INSERT_USER_QUERY =
      'INSERT INTO development_officers (officer_name, email, password, tel_num, nic) VALUES (?, ?, ?, ?, ?)';
    const [result] = await pool.query(INSERT_USER_QUERY, [
      name,
      email,
      hashedPassword,
      tel_num,
      nic
    ]);

    // Generate token for the newly registered user
    const token = createToken(result.insertId);

    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: 'Email already exists or error occurred' });
  }
};

// Login Development Officer
const loginDevelopmentOfficer = async (req, res) => {
  const { email, password } = req.body;
  try {
    const SELECT_USER_QUERY = 'SELECT * FROM development_officers WHERE email = ?';
    const [rows] = await pool.query(SELECT_USER_QUERY, [email]);

    if (rows.length === 0) {
      return res.json({ success: false, message: 'Invalid email or password' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: 'Invalid email or password' });
    }

    const token = createToken(user.officer_id);

    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: 'Error logging in user' });
  }
};

// Get Development Officers
const getDevelopmentOfficers = async (req, res) => {
  try {
    const SELECT_USERS_QUERY =
      'SELECT officer_id, officer_name, email, tel_num FROM development_officers';
    const [users] = await pool.query(SELECT_USERS_QUERY);

    res.json({ success: true, users });
  } catch (error) {
    console.error('Error getting development officers:', error);
    res.status(500).json({ success: false, message: 'Error getting development officers' });
  }
};

// Delete Development Officer
const deleteDevelopmentOfficer = async (req, res) => {
  const { officerId } = req.body;
  try {
    const DELETE_USER_QUERY = 'DELETE FROM development_officers WHERE officer_id = ?';
    const [result] = await pool.query(DELETE_USER_QUERY, [officerId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Development officer not found' });
    }

    res.json({ success: true, message: 'Development officer deleted successfully' });
  } catch (error) {
    console.error('Error deleting development officer:', error);
    res.status(500).json({ success: false, message: 'Error deleting development officer' });
  }
};

// Get Development Officer by ID
const getDevelopmentOfficerById = async (req, res) => {
  const  officerId  = req.body.userId;

  try {
    const SELECT_USER_QUERY =
      'SELECT officer_id, officer_name, email, tel_num, nic, join_date FROM development_officers WHERE officer_id = ?';
    const [rows] = await pool.query(SELECT_USER_QUERY, [officerId]);

    if (rows.length === 0) {
      return res.json({ success: false, message: 'Development officer not found' });
    }

    res.json({ success: true, officer: rows[0] });
  } catch (error) {
    console.error('Error getting development officer by ID:', error);
    res.status(500).json({ success: false, message: 'Error fetching development officer data' });
  }
};
const updateDevelopmentOfficerById = async (req, res) => {
  const {
    officer_name,
    email,
    tel_num,
    nic,
    join_date,
    userId
  } = req.body;

  console.log('Incoming data:', req.body); // 👈 useful for debugging

  if (!officer_name || !email || !tel_num || !nic || !userId) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    const UPDATE_USER_QUERY = `
      UPDATE development_officers 
      SET officer_name = ?, email = ?, tel_num = ?, nic = ?, join_date = ?
      WHERE officer_id = ?
    `;

    const [result] = await pool.query(UPDATE_USER_QUERY, [
      officer_name,
      email,
      tel_num,
      nic,
      join_date || null, // optional: handle if join_date is not provided
      userId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Development officer not found' });
    }

    res.json({ success: true, message: 'Development officer details updated successfully' });
  } catch (error) {
    console.error('Error updating development officer:', error);
    res.status(500).json({ success: false, message: 'Error updating development officer data' });
  }
};



export {
  registerDevelopmentOfficer,
  loginDevelopmentOfficer,
  getDevelopmentOfficers,
  deleteDevelopmentOfficer,
  getDevelopmentOfficerById,
  updateDevelopmentOfficerById
};