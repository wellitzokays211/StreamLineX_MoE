import {
  addActivityDetails,
  getActivitiesByEngineer,
  getsAllActivities
} from '../controllers/activityController.js';

import authMiddleware from '../middleware/auth.js';
import express from 'express';
import pool from '../config/db.js';

const updateActivityRouter = express.Router();

updateActivityRouter.post('/details', addActivityDetails);
updateActivityRouter.get('/get', getsAllActivities);
updateActivityRouter.get('/get_id',authMiddleware, getActivitiesByEngineer);
 
// In your routes file (activityRoutes.js)
updateActivityRouter.put('/bulk-update-status', async (req, res) => {
  try {
    const { activity_ids, status, rejectionReason } = req.body;

    // Validation
    if (!activity_ids || !Array.isArray(activity_ids) || activity_ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide at least one activity ID' 
      });
    }

    if (!status || !['FinalApproved', 'FinalRejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status must be either FinalApproved or FinalRejected' 
      });
    }

    if (status === 'FinalRejected' && !rejectionReason) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rejection reason is required for FinalRejected status' 
      });
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update activities table
      const [activityUpdate] = await connection.query(
        `UPDATE activities 
         SET status = ?, 
             rejection_reason = ?
         WHERE id IN (?)`,
        [
          status,
          status === 'FinalRejected' ? rejectionReason : null,
          activity_ids
        ]
      );

      // Update final_approvals table
      const [approvalUpdate] = await connection.query(
        `UPDATE final_approvals 
         SET status = ?, 
             approved_at = NOW()
         WHERE activity_id IN (?)`,
        [status, activity_ids]
      );

      await connection.commit();

      res.json({
        success: true,
        message: `Updated ${activityUpdate.affectedRows} activities to ${status}`,
        updatedCount: activityUpdate.affectedRows
      });

    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update activities',
      error: error.message
    });
  }
});
export default updateActivityRouter;