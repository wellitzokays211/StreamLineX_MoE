import pool from '../config/db.js';

export const createPDApproval = async (req, res) => {
  const { activity_id, approval_status, rejection_reason } = req.body;
  const approved_by = 1; 
  try {
    // Check if activity exists
    const [activity] = await pool.query('SELECT id FROM activities WHERE id = ?', [activity_id]);
    if (activity.length === 0) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    // Insert approval record
    const [result] = await pool.query(
      `INSERT INTO pd_approvals 
      (activity_id, approval_status, rejection_reason, approved_by) 
      VALUES (?, ?, ?, ?)`,
      [activity_id, approval_status, rejection_reason, approved_by]
    );

    res.status(201).json({
      success: true,
      message: 'PD approval recorded successfully',
      approvalId: result.insertId
    });
  } catch (error) {
    console.error('Error creating PD approval:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record PD approval',
      error: error.message
    });
  }
};