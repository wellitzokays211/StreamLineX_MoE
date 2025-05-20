import {
  deleteEngineer,
  getEngineerById,
  getEngineers,
  loginEngineer,
  registerEngineer,
  updateEngineerSeen
} from '../controllers/siteEngineerAuthController.js';

import authMiddleware from '../middleware/auth.js';
import express from 'express';

const EngineerRouter = express.Router();

// Site Engineer Routes
EngineerRouter.post('/register/engineer', registerEngineer);
EngineerRouter.post('/login/engineer', loginEngineer);
EngineerRouter.get('/engineers', getEngineers);
EngineerRouter.delete('/engineers/:engineerId', deleteEngineer);
EngineerRouter.get('/get',authMiddleware, getEngineerById);
EngineerRouter.put('/update',authMiddleware, updateEngineerSeen);
export default EngineerRouter;