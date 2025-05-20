import 'dotenv/config';

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
import cors from 'cors';
import express from 'express';
import machineRouter from './routes/machineRouter.js';
import pdApprovalRoutes from './routes/pdApprovalRoutes.js';
import pool from './config/db.js';
import quotationRouter from './routes/addquotation.js';
import reportRouter from './routes/reportRouter.js';
import updateActivityRouter from './routes/activityRoutes.js';
import userRouter from './routes/userRouter.js';

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors());

// Serve static images
app.use('/images', express.static('uploads'));

// API endpoints
app.use('/api/activity', ActivityRouter);
app.use('/api/user', userRouter); 
app.use('/api/admin', adminRouter);
app.use('/api/report', reportRouter);
app.use('/api/dev_office', DevelopmentOfficerRouter);
app.use('/api/quotation', quotationRouter);
app.use('/api/product', ProductRouter);
app.use('/api/jobs', assignRouter);
app.use('/api/machine', machineRouter);
app.use('/api/order',OrderRoutes);
app.use('/api/analytics',AnalyticsRouter);
app.use('/api/budgets', BudgetRouter);
app.use('/api/update_activity', updateActivityRouter);
app.use('/api', EngineerRouter);
app.use('/api/pd-approvals', pdApprovalRoutes);
app.use('/api/final-approvals', FinalApprovalRouter);
// Test database connection
app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS solution');
        res.json({ success: true, message: 'Database connected!', result: rows[0] });
    } catch (error) {
        console.error('Error connecting to the database:', error);
        res.status(500).json({ success: false, message: 'Error connecting to the database', error });
    }
});

// Root route
app.get('/', (req, res) => {
    res.send('API WORKING');
});

// Start the server
app.listen(port, () => {
    console.log(`Server starting on http://localhost:${port}`);
});
