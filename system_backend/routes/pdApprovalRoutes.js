import { createPDApproval } from '../controllers/pdApprovalController.js';
import express from 'express';

const router = express.Router();

router.post('/', createPDApproval);

export default router;