import { addPayment, createInvoice, createInvoices, createQuotation, getAllInvoicesAdmin, getAllJobs, getAllQuotationsForAdmin, getInvoicesByUserId, getInvoicesByUserId2, getJobsByCustomerId, getQuotations, updateJob, updateQuotationStatus } from '../controllers/addquotationController.js';

import authMiddleware from '../middleware/auth.js';
import express from 'express';

const quotationRouter = express.Router();


quotationRouter.post('/create', authMiddleware, createQuotation);


quotationRouter.get('/get', authMiddleware, getQuotations);
quotationRouter.get('/admin', getAllQuotationsForAdmin); 
quotationRouter.put('/status', updateQuotationStatus);  
quotationRouter.post('/invoice_create', createInvoice);  
quotationRouter.post('/invoice_creates', createInvoices);  
quotationRouter.post('/invoice_payment', addPayment);
quotationRouter.get('/get_all',getAllInvoicesAdmin);
quotationRouter.get('/get_invoice',authMiddleware,getInvoicesByUserId);
quotationRouter.post('/get_invoice2',getInvoicesByUserId2);
quotationRouter.get('/get_all_jobs',getAllJobs);
quotationRouter.put('/update_job',updateJob);
quotationRouter.post('/get_job',authMiddleware,getJobsByCustomerId)

export default quotationRouter;
