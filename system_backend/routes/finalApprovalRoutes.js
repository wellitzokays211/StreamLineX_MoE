import {
  createFinalApprovals,
  getFinalApprovals
} from '../controllers/finalApprovalController.js';

import express from 'express';

const FinalApprovalRouter = express.Router();

FinalApprovalRouter.post('/create', createFinalApprovals);
FinalApprovalRouter.get('/get', getFinalApprovals);

export default FinalApprovalRouter;