import bcrypt from 'bcrypt';
import { createToken } from '../middleware/token.js';
import pool from '../config/db.js';
import validator from 'validator';

// Common validation function
const validateUserInput = (email, password, tel_num) => {
    if (!validator.isEmail(email)) {
        return { valid: false, message: 'Please enter a valid email' };
    }
    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters' };
    }
    if (!validator.isMobilePhone(tel_num)) {
        return { valid: false, message: 'Invalid phone number format' };
    }
    return { valid: true };
};

// Register Cashier
const registerCashier = async (req, res) => {
    const { name, password, email, tel_num } = req.body;
    
    try {
        // Validate input
        const validation = validateUserInput(email, password, tel_num);
        if (!validation.valid) {
            return res.status(400).json({ success: false, message: validation.message });
        }

        // Check if email exists
        const [existing] = await pool.query(
            'SELECT email FROM cashiers WHERE email = ?', 
            [email]
        );
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'Email already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Handle profile image
        const profileImage = req.file ? `/uploads/cashiers/${req.file.filename}` : null;

        // Create cashier
        const [result] = await pool.query(
            `INSERT INTO cashiers 
            (cashier_name, email, password, tel_num, profile_image) 
            VALUES (?, ?, ?, ?, ?)`,
            [name, email, hashedPassword, tel_num, profileImage]
        );

        // Generate token with role
        const token = createToken(result.insertId, 'cashier');

        res.status(201).json({ 
            success: true, 
            token,
            cashier: {
                id: result.insertId,
                name,
                email,
                profileImage
            }
        });

    } catch (error) {
        console.error('Cashier registration error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during registration' 
        });
    }
};

// Login Cashier
const loginCashier = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find cashier
        const [cashiers] = await pool.query(
            'SELECT * FROM cashiers WHERE email = ?',
            [email]
        );

        if (cashiers.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        const cashier = cashiers[0];
        
        // Verify password
        const isMatch = await bcrypt.compare(password, cashier.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Generate token with role
        const token = createToken(cashier.CashierID, 'cashier');

        res.json({ 
            success: true,
            token,
            cashier: {
                id: cashier.CashierID,
                name: cashier.cashier_name,
                email: cashier.email,
                profileImage: cashier.profile_image,
                isAdmin: cashier.is_admin
            }
        });

    } catch (error) {
        console.error('Cashier login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during login' 
        });
    }
};

// Keep your existing customer auth functions and add:
export { registerCashier, loginCashier };