import pool from '../config/db.js';

// Create final approval records
export const createFinalApprovals = async (req, res) => {
  try {
    const { activity_ids } = req.body;
    
    // Insert each activity into final_approvals table
    for (const activity_id of activity_ids) {
      // Check if already exists
      const [existing] = await pool.query(
        'SELECT * FROM final_approvals WHERE activity_id = ?',
        [activity_id]
      );
      
      if (existing.length === 0) {
        await pool.query(`
          INSERT INTO final_approvals (activity_id, status, approved_at)
          VALUES (?, 'PendingFinalApproved', NOW())
        `, [activity_id]);
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Activities finally approved',
      count: activity_ids.length
    });
  } catch (error) {
    console.error('Error creating final approvals:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating final approvals',
      error: error.message
    });
  }
};

// Get all final approvals
export const getFinalApprovals = async (req, res) => {
  try {
    const [approvals] = await pool.query(`
      SELECT 
        fa.*,
        a.id as activity_id,
        a.description,
        a.province,
        a.district,
        a.zone,
        a.status,
        a.component,
        a.subcomponent,
        a.created_at as activity_created_at,
       
        ba.allocated_amount,
        ba.priority,
        b.budget as total_budget,
        e.engineer_name as assigned_engineer_name,
        e.specialization as engineer_specialization,
        e.tel_num as engineer_contact,
        rp.responsible_persons_name as requester_name,
        rp.email as requester_email,
        rp.tel_num as requester_contact,
        do.officer_name as development_officer_name,
        do.email as development_officer_email
      FROM final_approvals fa
      JOIN activities a ON fa.activity_id = a.id
      LEFT JOIN budget_allocations ba ON a.id = ba.activity_id
      LEFT JOIN budget b ON ba.budget_id = b.id
      LEFT JOIN site_engineers e ON a.assigned_engineer_id = e.engineer_id
      LEFT JOIN responsible_persons rp ON a.responsible_personsID = rp.responsible_personsID
      LEFT JOIN development_officers do ON a.officer_id = do.officer_id
      ORDER BY fa.approved_at DESC
    `);
    
    // Format the response to include all activity details
    const formattedApprovals = approvals.map(approval => ({
      id: approval.id,
      activity_id: approval.activity_id,
      status: approval.status,
      approved_at: approval.approved_at,
      approved_by: approval.approved_by,
      activity_details: {
        description: approval.description,
        province: approval.province,
        district: approval.district,
        zone: approval.zone,
        status: approval.status,
        component: approval.component,
        subcomponent: approval.subcomponent,
        created_at: approval.activity_created_at,
      
        budget_details: {
          allocated_amount: approval.allocated_amount,
          priority: approval.priority,
          total_budget: approval.total_budget
        },
        assigned_engineer: approval.assigned_engineer_name ? {
          name: approval.assigned_engineer_name,
          specialization: approval.engineer_specialization,
          contact: approval.engineer_contact
        } : null,
        requester: approval.requester_name ? {
          name: approval.requester_name,
          email: approval.requester_email,
          contact: approval.requester_contact
        } : null,
        development_officer: approval.development_officer_name ? {
          name: approval.development_officer_name,
          email: approval.development_officer_email
        } : null
      }
    }));
    
    res.json({ 
      success: true, 
      approvals: formattedApprovals 
    });
  } catch (error) {
    console.error('Error fetching final approvals:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching final approvals',
      error: error.message
    });
  }
};