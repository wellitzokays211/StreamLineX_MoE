import express from 'express';
import { getAllAnalytics } from '../controllers/analyticsController.js';

const AnalyticsRouter = express.Router();

// Single endpoint for all analytics data
AnalyticsRouter.get('/analytics', getAllAnalytics );

export default AnalyticsRouter;