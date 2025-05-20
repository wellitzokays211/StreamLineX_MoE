import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

// Function to add an activity

export const addActivity = async (req, res) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { description, province, district, zone, status, component, subcomponent,assigned_engineer_id } = req.body;

    if (!description || !province || !district || !zone) {
      return res.status(400).json({ success: false, message: 'All fields except status are required.' });
    }

    const finalStatus = status || 'Pending';
    
    let query, params;
    if (finalStatus === 'Pending') {
      query = 'INSERT INTO activities (responsible_personsID, description, province, district, zone, status, component, subcomponent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
      params = [userId, description, province, district, zone, finalStatus, component || null, subcomponent || null];
    } else {
      query = 'INSERT INTO activities (officer_id, description, province, district, zone, status, component, subcomponent,assigned_engineer_id) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?)';
      params = [userId, description, province, district, zone, finalStatus, component || null, subcomponent || null,assigned_engineer_id];
    }

    const [activityResult] = await pool.query(query, params);
    const activityId = activityResult.insertId;

    if (req.files && req.files.length > 0) {
      const imageDetails = req.files.map((file) => ({
        path: file.path,
        type: file.mimetype,
        filename: file.filename,
      }));

      for (const image of imageDetails) {
        await pool.query(
          'INSERT INTO activity_images (activity_id, file_path, file_type, file_name) VALUES (?, ?, ?, ?)',
          [activityId, image.path, image.type, image.filename]
        );
      }
    }

    res.json({
      success: true,
      message: 'Activity added successfully!',
      activity: {
        id: activityId,
        description,
        province,
        district,
        zone,
        status: finalStatus,
        component,
        subcomponent,
        images: req.files ? req.files.map((file) => file.path) : [],
      },
    });
  } catch (error) {
    console.error('Error adding activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add the activity. Please try again.',
      error: error.message,
    });
  }
};

// Function to list all activities
export const getAllActivities = async (req, res) => {
  try {
    const [activities] = await pool.query(
      `SELECT 
        a.id, 
        a.description, 
        a.province, 
        a.district, 
        a.zone, 
        a.status, 
        a.component,
        a.subcomponent,
        a.assigned_engineer_id,
        ai.file_name, 
        a.created_at,
        ad.priority,
        se.engineer_name,
        se.specialization
       FROM activities a 
       LEFT JOIN activity_images ai ON a.id = ai.activity_id
       LEFT JOIN activity_details ad ON a.id = ad.activity_id
       LEFT JOIN site_engineers se ON a.assigned_engineer_id = se.engineer_id
       ORDER BY COALESCE(ad.priority, 999) ASC, a.created_at DESC`
    );

    const groupedActivities = activities.reduce((acc, activity) => {
      if (!acc[activity.id]) {
        acc[activity.id] = {
          id: activity.id,
          description: activity.description,
          province: activity.province,
          district: activity.district,
          zone: activity.zone,
          status: activity.status,
          component: activity.component,
          subcomponent: activity.subcomponent,
          priority: activity.priority,
          assignedEngineer: activity.assigned_engineer_id ? {
            id: activity.assigned_engineer_id,
            name: activity.engineer_name,
            specialization: activity.specialization
          } : null,
          createdAt: activity.created_at,
          images: [],
        };
      }

      if (activity.file_name) {
        acc[activity.id].images.push(activity.file_name);
      }

      return acc;
    }, {});

    const activitiesList = Object.values(groupedActivities);

    res.json({
      success: true,
      message: 'Activities fetched successfully',
      activities: activitiesList,
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities. Please try again.',
      error: error.message,
    });
  }
};

// Function to update activity status (for admin approval/rejection)
export const updateActivityStatus = async (req, res) => {
  try {
    const { id, status, assigned_engineer_id, rejectionReason, component, subcomponent } = req.body;

    if (!id || !status) {
      return res.status(400).json({ success: false, message: 'Activity ID and Status are required.' });
    }

    const validStatuses = ['Pending', 'Approved', 'Rejected', 'Not Started', 'On-Going', 'Completed', 'Cancelled', 'Accepted', 'PDApproved', 'PDRejected','FinalApproved','FinalRejected','PendingFinalApproved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    if (status === 'Approved' && !assigned_engineer_id) {
      return res.status(400).json({ success: false, message: 'Engineer assignment is required when approving.' });
    }

    if (status === 'Rejected' && !rejectionReason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required.' });
    }

    // Build dynamic update fields
    const updateData = { status }; // Always update status

    if (status === 'Approved') {
      updateData.assigned_engineer_id = assigned_engineer_id;
    }

    if (status === 'Rejected') {
      updateData.rejection_reason = rejectionReason;
    }

    if (component !== undefined) {
      updateData.component = component;
    }

    if (subcomponent !== undefined) {
      updateData.subcomponent = subcomponent;
    }

    // Generate SET clause dynamically
    const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);

    const [updateResult] = await pool.query(
      `UPDATE activities SET ${setClause} WHERE id = ?`,
      [...values, id]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Activity not found.' });
    }

    const [activity] = await pool.query(`
      SELECT 
        a.*, 
        e.engineer_name, 
        e.specialization,
        ad.priority
      FROM activities a
      LEFT JOIN site_engineers e ON a.assigned_engineer_id = e.engineer_id
      LEFT JOIN activity_details ad ON a.id = ad.activity_id
      WHERE a.id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Activity updated successfully!',
      activity: {
        ...activity[0],
        assignedEngineer: activity[0].assigned_engineer_id ? {
          id: activity[0].assigned_engineer_id,
          name: activity[0].engineer_name,
          specialization: activity[0].specialization
        } : null
      }
    });

  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update activity.',
      error: error.message,
    });
  }
};

// Function to delete an activity
export const deleteActivity = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Activity ID is required to delete activity.' });
    }

    // Delete associated images first (foreign key will handle this due to ON DELETE CASCADE)
    await pool.query('DELETE FROM activity_images WHERE activity_id = ?', [id]);

    // Now delete the activity
    const [deleteResult] = await pool.query('DELETE FROM activities WHERE id = ?', [id]);

    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Activity not found.' });
    }

    res.json({
      success: true,
      message: 'Activity deleted successfully!',
    });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete activity. Please try again.',
      error: error.message,
    });
  }
};

// Function to get activities by status (for filtering)
export const getActivitiesByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const [activities] = await pool.query(
      `SELECT a.id, a.description, a.province, a.district, a.zone, a.status, 
       ai.file_name, a.created_at 
       FROM activities a 
       LEFT JOIN activity_images ai ON a.id = ai.activity_id
       WHERE a.status = ?
       ORDER BY a.created_at DESC`,
      [status]
    );

    const groupedActivities = activities.reduce((acc, activity) => {
      if (!acc[activity.id]) {
        acc[activity.id] = {
          id: activity.id,
          description: activity.description,
          province: activity.province,
          district: activity.district,
          zone: activity.zone,
          status: activity.status,
          createdAt: activity.created_at,
          images: [],
        };
      }

      if (activity.file_name) {
        acc[activity.id].images.push(activity.file_name);
      }

      return acc;
    }, {});

    const activitiesList = Object.values(groupedActivities);

    res.json({
      success: true,
      message: `Activities with status ${status} fetched successfully`,
      activities: activitiesList,
    });
  } catch (error) {
    console.error('Error fetching activities by status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities by status. Please try again.',
      error: error.message,
    });
  }
};


export const getActivitiesByResponsiblePerson = async (req, res) => {
  try {
    // 1. Get responsible_personsID from request body
    const responsible_personsID  = req.body.userId;

    if (!responsible_personsID) {
      return res.status(400).json({ 
        success: false, 
        message: 'responsible_personsID is required in the request body' 
      });
    }

    // 2. Query database for activities
    const [activities] = await pool.query(
      `SELECT 
        a.id, 
        a.description, 
        a.province, 
        a.district, 
        a.zone, 
        a.status, 
        a.created_at,
       
        GROUP_CONCAT(ai.file_path) as image_paths,
        GROUP_CONCAT(ai.file_name) as image_names
      FROM activities a
      LEFT JOIN activity_images ai ON a.id = ai.activity_id
      WHERE a.responsible_personsID = ?
      GROUP BY a.id
      ORDER BY a.created_at DESC`,
      [responsible_personsID]
    );

    // 3. Format the results
    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      description: activity.description,
      province: activity.province,
      district: activity.district,
      zone: activity.zone,
      status: activity.status,
      created_at: activity.created_at,
   
      images: activity.image_paths 
        ? activity.image_paths.split(',').map((path, index) => ({
            path: path,
            name: activity.image_names.split(',')[index]
          }))
        : []
    }));

    // 4. Return success response
    res.status(200).json({
      success: true,
      message: 'Activities retrieved successfully',
      data: formattedActivities,
      count: formattedActivities.length
    });

  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
export const updatesActivityStatus = async (req, res) => {
  try {
    const { id, status, rejectionReason } = req.body;

    // Validate required fields
    if (!id || !status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Activity ID and Status are required.' 
      });
    }

    // Validate status values
    const validStatuses = ['Pending', 'Approved', 'Rejected', 'Not Started', 'On-Going', 'Completed', 'Cancelled', 'Accepted', 'PDApproved', 'PDRejected','FinalApproved','FinalRejected','PendingFinalApproved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status value.' 
      });
    }

    if (status === 'Rejected' && !rejectionReason) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rejection reason is required.' 
      });
    }

    // Prepare update data - only update status and rejection_reason
    const updateData = {
      status,
      rejection_reason: status === 'Rejected' ? rejectionReason : null
      // assigned_engineer_id remains unchanged
    };

    const [updateResult] = await pool.query(
      'UPDATE activities SET ? WHERE id = ?',
      [updateData, id]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Activity not found.' 
      });
    }

    // Get updated activity
    const [activity] = await pool.query(
      'SELECT * FROM activities WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Activity updated successfully!',
      activity: activity[0]
    });

  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update activity.',
      error: error.message,
    });
  }
};