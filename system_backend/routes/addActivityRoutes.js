import { addActivity, deleteActivity, getActivitiesByResponsiblePerson, getActivitiesByStatus, getAllActivities, updateActivityStatus, updatesActivityStatus } from '../controllers/addActivity.js';

import authMiddleware from '../middleware/auth.js';
import express from 'express';
import multer from 'multer';
import path from 'path';

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Set the destination folder for uploaded files
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Extract the file extension
    cb(null, `${Date.now()}-${file.fieldname}${ext}`); // Generate a unique filename
  },
});

// Initialize multer
const upload = multer({ storage: storage });

const ActivityRouter = express.Router();

// Define the POST route for adding a new tour
ActivityRouter.post('/add',upload.array('images',10), addActivity);
ActivityRouter.get('/get',getAllActivities)
ActivityRouter.put('/update',updateActivityStatus)  
ActivityRouter.put('/update_id',authMiddleware,updatesActivityStatus)  
ActivityRouter.delete('/delete',deleteActivity)
ActivityRouter.get('/get_all',getActivitiesByStatus)
ActivityRouter.get('/get_all_id',authMiddleware,getActivitiesByResponsiblePerson)

export default ActivityRouter;
