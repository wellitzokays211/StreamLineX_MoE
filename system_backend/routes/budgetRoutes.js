import {
  addBudget,
  finalizeAllocation,
  getAllBudgets,
  getAllocations,
  updateBudget
} from '../controllers/budgetController.js';

import express from 'express';

const BudgetRouter = express.Router();

// Budget routes
BudgetRouter.post('/add', addBudget);
BudgetRouter.get('/get', getAllBudgets);
BudgetRouter.put('/update', updateBudget);
BudgetRouter.post('/finalize', finalizeAllocation);
BudgetRouter.get('/get_all', getAllocations);
export default BudgetRouter;