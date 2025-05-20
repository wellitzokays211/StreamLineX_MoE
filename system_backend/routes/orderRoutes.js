import {createCustomOrder, getAllOrders, getCustomOrders, getOrderByCustomerId, getOrdersByCustomerId, processPayment, updateAmountPaid, updateNewOrderStatus, updateOrderStatus} from '../controllers/orderController.js';

import authMiddleware from '../middleware/auth.js';
import express from 'express';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {

    if (req.originalUrl.includes('/custom-order')) {
      cb(null, 'uploads/');
    } else {
      cb(null, 'uploads/products/');
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|pdf|ai|psd/; // Added design file types
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image/design files (jpeg, jpg, png, gif, pdf, ai, psd) are allowed!'));
  }
});
const OrderRoutes = express.Router();

OrderRoutes.post('/process-payment', authMiddleware, processPayment);

// Get customer's order history
OrderRoutes.get('/order', authMiddleware, getOrdersByCustomerId);

// Get specific order details
OrderRoutes.get('/all_order',getAllOrders);

OrderRoutes.put('/all_order_update',updateNewOrderStatus);

OrderRoutes.post('/custom-order',upload.array('designFiles', 5), createCustomOrder);

OrderRoutes.get('/all_custom_order',getCustomOrders);

OrderRoutes.get('/all_customer_order_Id',authMiddleware, getOrderByCustomerId);

OrderRoutes.put('/status',updateOrderStatus);


OrderRoutes.put('/update_am',updateAmountPaid);

export default OrderRoutes;