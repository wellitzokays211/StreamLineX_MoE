import pool from '../config/db.js';

export const addActivityDetails = async (req, res) => {
  const { activityId, budget, priority } = req.body;

  // Validate inputs
  if (!activityId || budget === undefined || priority === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: activityId, budget, or priority'
    });
  }

  let connection;
  try {
    // Get a connection from the pool
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Check if activity exists
    const [activityCheck] = await connection.query(
      'SELECT id FROM activities WHERE id = ?',
      [activityId]
    );

    if (activityCheck.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Check if details already exist
    const [detailsCheck] = await connection.query(
      'SELECT id FROM activity_details WHERE activity_id = ?',
      [activityId]
    );

    if (detailsCheck.length > 0) {
      // Update existing details
      await connection.query(
        'UPDATE activity_details SET budget = ?, priority = ? WHERE activity_id = ?',
        [budget, priority, activityId]
      );
    } else {
      // Insert new details
      await connection.query(
        'INSERT INTO activity_details (activity_id, budget, priority) VALUES (?, ?, ?)',
        [activityId, budget, priority]
      );
    }

    await connection.commit();
    res.status(200).json({
      success: true,
      message: 'Activity details set successfully'
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error setting activity details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set activity details',
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
};
export const getsAllActivities = async (req, res) => {
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
        ai.file_name, 
        a.created_at, 
        ad.budget, 
        ad.priority
       FROM activities a 
       LEFT JOIN activity_images ai ON a.id = ai.activity_id
       LEFT JOIN activity_details ad ON a.id = ad.activity_id
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
          component: activity.component || null,
          subcomponent: activity.subcomponent || null,
          createdAt: activity.created_at,
          budget: activity.budget,
          priority: activity.priority,
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
export const getActivitiesByEngineer = async (req, res) => {
  try {
    const  engineerId  = req.body.userId; // Get engineerId from URL params

    if (!engineerId) {
      return res.status(400).json({
        success: false,
        message: 'Engineer ID is required'
      });
    }

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
        a.rejection_reason,
        a.created_at,
        ad.budget, 
        ad.priority,
        ai.file_name,
        e.engineer_name,
        e.specialization
       FROM activities a 
       LEFT JOIN activity_images ai ON a.id = ai.activity_id
       LEFT JOIN activity_details ad ON a.id = ad.activity_id
       LEFT JOIN site_engineers e ON a.assigned_engineer_id = e.engineer_id
       WHERE a.assigned_engineer_id = ?
       ORDER BY 
         CASE 
           WHEN a.status = 'On-Going' THEN 1
           WHEN a.status = 'Not Started' THEN 2
           WHEN a.status = 'Pending' THEN 3
           WHEN a.status = 'Approved' THEN 4
           WHEN a.status = 'Completed' THEN 5
           ELSE 6
         END,
         COALESCE(ad.priority, 999) ASC,
         a.created_at DESC`,
      [engineerId]
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
          rejection_reason: activity.rejection_reason,
          createdAt: activity.created_at,
          budget: activity.budget,
          priority: activity.priority,
          assignedEngineer: activity.engineer_name ? {
            name: activity.engineer_name,
            specialization: activity.specialization
          } : null,
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