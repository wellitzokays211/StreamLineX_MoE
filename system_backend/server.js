// Load environment variables from .env file
import 'dotenv/config';

// Route imports for different modules
import ActivityRouter from './routes/addActivityRoutes.js';
import AnalyticsRouter from './routes/analyticsRoutes.js';
import BudgetRouter from './routes/budgetRoutes.js';
import DevelopmentOfficerRouter from './routes/DevelopmentOfficerRouter.js';
import EngineerRouter from './routes/siteEngineerRouter.js';
import FinalApprovalRouter from './routes/finalApprovalRoutes.js';
import OrderRoutes from './routes/orderRoutes.js';
import ProductRouter from './routes/productRoutes.js';
import adminRouter from './routes/adminRouter.js';
import assignRouter from './routes/assignEmployeesRouter.js';
import pdApprovalRoutes from './routes/pdApprovalRoutes.js';
import quotationRouter from './routes/addquotation.js';
import reportRouter from './routes/reportRouter.js';
import updateActivityRouter from './routes/activityRoutes.js';
import userRouter from './routes/userRouter.js';
import machineRouter from './routes/machineRouter.js';

// Core dependencies
import cors from 'cors';
import express from 'express';

// Database connection
import pool from './config/db.js';

// Initialize Express application
const app = express();
const port = process.env.PORT || 4000;

// Middleware configuration
app.use(express.json()); // Parse JSON request bodies
app.use(cors()); // Enable Cross-Origin Resource Sharing

// Serve static files (uploaded images)
app.use('/images', express.static('uploads'));

// API route configuration - organized by functional modules
app.use('/api/activity', ActivityRouter); // Activity management endpoints
app.use('/api/user', userRouter); // User authentication and management
app.use('/api/admin', adminRouter); // Administrative functions
app.use('/api/report', reportRouter); // Report generation and analytics
app.use('/api/dev_office', DevelopmentOfficerRouter); // Development Officer operations
app.use('/api/quotation', quotationRouter); // Quotation management
app.use('/api/product', ProductRouter); // Product catalog management
app.use('/api/jobs', assignRouter); // Job assignment functionality
app.use('/api/machine', machineRouter); // Machine/equipment management
app.use('/api/order', OrderRoutes); // Order processing
app.use('/api/analytics', AnalyticsRouter); // Data analytics and insights
app.use('/api/budgets', BudgetRouter); // Budget allocation and management
app.use('/api/update_activity', updateActivityRouter); // Activity status updates
app.use('/api', EngineerRouter); // Site Engineer specific endpoints
app.use('/api/pd-approvals', pdApprovalRoutes); // Provincial Director approvals
app.use('/api/final-approvals', FinalApprovalRouter); // Final approval workflow

// Database connection test endpoint
app.get('/test-db', async (req, res) => {
    try {
        // Simple query to test database connectivity
        const [rows] = await pool.query('SELECT 1 + 1 AS solution');
        res.json({ success: true, message: 'Database connected!', result: rows[0] });
    } catch (error) {
        console.error('Error connecting to the database:', error);
        res.status(500).json({ success: false, message: 'Error connecting to the database', error });
    }
});

// Root endpoint - API health check
app.get('/', (req, res) => {
    res.json({ 
        success: true, 
        message: 'StreamLineX API Server is running!',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Start the server with enhanced logging
app.listen(port, () => {
    console.log(`🚀 StreamLineX Server running on port ${port}`);
    console.log(`📊 API Documentation: http://localhost:${port}/`);
    console.log(`🔗 Database Test: http://localhost:${port}/test-db`);
    console.log(`📁 Static Files: http://localhost:${port}/images/`);
});
