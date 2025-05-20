import bcrypt from 'bcrypt';
import { createToken } from '../middleware/token.js';
import pool from '../config/db.js';
import validator from 'validator';

const registerUser = async (req, res) => {
  const { name, password, email, tel_num } = req.body;
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

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into the database
    const INSERT_USER_QUERY =
      'INSERT INTO responsible_persons (responsible_persons_name, email, password, tel_num) VALUES (?, ?, ?, ?)';
    const [result] = await pool.query(INSERT_USER_QUERY, [
      name,
      email,
      hashedPassword,
      tel_num
    ]);

    // Create token using the inserted ID (responsible_personsID)
    const token = createToken(result.insertId);

    res.json({ 
      success: true, 
      token,
      user: {
        id: result.insertId,
        name: name,
        email: email
      }
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: 'Email already exists or error occurred' });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const SELECT_USER_QUERY = 'SELECT * FROM responsible_persons WHERE email = ?';
    const [rows] = await pool.query(SELECT_USER_QUERY, [email]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Create token using responsible_personsID from the query result
    const token = createToken(user.responsible_personsID);

    res.json({ 
      success: true, 
      token,
      user: {
        id: user.responsible_personsID,
        name: user.responsible_persons_name,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error logging in user' });
  }
};
// Get Users
const getUsers = async (req, res) => {
  try {
    const SELECT_USERS_QUERY =
      'SELECT responsible_personsID, responsible_persons_name, email, tel_num FROM responsible_persons';
    const [users] = await pool.query(SELECT_USERS_QUERY);

    res.json({ success: true, users });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ success: false, message: 'Error getting users' });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  const { userId } = req.body;
  try {
    const DELETE_USER_QUERY = 'DELETE FROM responsible_persons WHERE responsible_personsID = ?';
    const [result] = await pool.query(DELETE_USER_QUERY, [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Error deleting user' });
  }
};

const getUserById = async (req, res) => {
  const { userId } = req.body; 

  try {
    const SELECT_USER_QUERY =
      'SELECT responsible_personsID, responsible_persons_name, email, tel_num, join_date FROM responsible_persons WHERE responsible_personsID = ?';
    const [rows] = await pool.query(SELECT_USER_QUERY, [userId]);

    if (rows.length === 0) {
      return res.json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user: rows[0] });
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({ success: false, message: 'Error fetching user data' });
  }
};
const updateUserById = async (req, res) => {
  const { userId, responsible_persons_name, email, tel_num, join_date } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required' });
  }

  try {
    // Fetch existing user data
    const [existingRows] = await pool.query(
      'SELECT * FROM responsible_persons WHERE responsible_personsID = ?',
      [userId]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const existingData = existingRows[0];

    // Use new value if provided, otherwise keep old value
    const updatedName = responsible_persons_name ?? existingData.responsible_persons_name;
    const updatedEmail = email ?? existingData.email;
    const updatedTelNum = tel_num ?? existingData.tel_num;
    const updatedJoinDate = join_date ?? existingData.join_date;

    const UPDATE_USER_QUERY = `
      UPDATE responsible_persons
      SET responsible_persons_name = ?, email = ?, tel_num = ?, join_date = ?
      WHERE responsible_personsID = ?
    `;

    const [result] = await pool.query(UPDATE_USER_QUERY, [
      updatedName,
      updatedEmail,
      updatedTelNum,
      updatedJoinDate,
      userId,
    ]);

    if (result.affectedRows === 0) {
      return res.json({ success: false, message: 'No changes made' });
    }

    res.json({ success: true, message: 'User updated successfully' });

  } catch (error) {
    console.error('Error updating user by ID:', error);
    res.status(500).json({ success: false, message: 'Error updating user data' });
  }
};


export { loginUser, registerUser, getUsers, deleteUser, getUserById,updateUserById };
