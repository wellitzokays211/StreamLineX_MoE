import pool from '../config/db.js';
import nodemailer from 'nodemailer';

// Add new budget
export const addBudget = async (req, res) => {
  const { budget } = req.body;

  if (!budget || isNaN(budget)) {
    return res.status(400).json({
      success: false,
      message: 'Valid budget amount is required'
    });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO budget (budget) VALUES (?)',
      [budget]
    );

    res.status(201).json({
      success: true,
      message: 'Budget added successfully',
      budgetId: result.insertId
    });
  } catch (error) {
    console.error('Error adding budget:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add budget',
      error: error.message
    });
  }
};

// Get all budgets
export const getAllBudgets = async (req, res) => {
  try {
    const [budgets] = await pool.query('SELECT * FROM budget ORDER BY created_at DESC');
    
    res.status(200).json({
      success: true,
      budgets
    });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budgets',
      error: error.message
    });
  }
};

// Get single budget by ID

// Update budget
export const updateBudget = async (req, res) => {
  const { id } = req.body;
  const { budget } = req.body;

  if (!budget || isNaN(budget)) {
    return res.status(400).json({
      success: false,
      message: 'Valid budget amount is required'
    });
  }

  try {
    // Check if budget exists
    const [existingBudget] = await pool.query('SELECT id FROM budget WHERE id = ?', [id]);

    if (existingBudget.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    await pool.query(
      'UPDATE budget SET budget = ? WHERE id = ?',
      [budget, id]
    );

    res.status(200).json({
      success: true,
      message: 'Budget updated successfully'
    });
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update budget',
      error: error.message
    });
  }
};

export const finalizeAllocation = async (req, res) => {
  const { allocations, budgetId } = req.body;

  if (!allocations || !Array.isArray(allocations)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid allocations data',
    });
  }

  if (!budgetId) {
    return res.status(400).json({
      success: false,
      message: 'Budget ID is required',
    });
  }

  try {
    // Start transaction
    await pool.query('START TRANSACTION');

    // First, check if the budget exists
    const [budgetExists] = await pool.query(
      'SELECT id FROM budget WHERE id = ?',
      [budgetId]
    );

    if (budgetExists.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Budget not found',
      });
    }

    // Insert each allocation with the same budgetId
    for (const allocation of allocations) {
      // Validate each allocation
      if (!allocation.activityId || !allocation.amount || allocation.priority === undefined) {
        await pool.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Each allocation must have activityId, amount, and priority',
        });
      }

      // Check if activity exists and is accepted
      const [activity] = await pool.query(
        'SELECT id, status FROM activities WHERE id = ?',
        [allocation.activityId]
      );

      if (activity.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: `Activity with ID ${allocation.activityId} not found`,
        });
      }

      if (activity[0].status !== 'Accepted') {
        await pool.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Activity with ID ${allocation.activityId} is not in Accepted status`,
        });
      }

      // Insert the allocation
      await pool.query(
        'INSERT INTO budget_allocations (activity_id, budget_id, allocated_amount, priority) VALUES (?, ?, ?, ?)',
        [allocation.activityId, budgetId, allocation.amount, allocation.priority]
      );

      // Update activity status to 'Approved'
      await pool.query(
        'UPDATE activities SET status = ? WHERE id = ?',
        ['Not Started', allocation.activityId]
      );
    }

    // Commit transaction
    await pool.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Budget allocations finalized successfully',
    });
  } catch (error) {
    // Rollback on error
    await pool.query('ROLLBACK');
    console.error('Error finalizing allocations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to finalize budget allocations',
      error: error.message,
    });
  }
};
// Backend controller
export const getAllocations = async (req, res) => {
  try {
    const [allocations] = await pool.query(`
      SELECT 
        ba.*,
        a.description,
        a.province,
        a.district, 
        a.zone,
        a.status,
        a.component,
        a.subcomponent,
        b.budget as total_budget
      FROM budget_allocations ba
      JOIN activities a ON ba.activity_id = a.id
      JOIN budget b ON ba.budget_id = b.id
      ORDER BY ba.created_at DESC
    `);

    res.status(200).json({
      success: true,
      allocations: allocations
    });
  } catch (error) {
    console.error('Error fetching allocations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budget allocations',
      error: error.message
    });
  }
};