import {assignResources, getAssignedResources} from '../controllers/assignEmployeesController.js';

import express from "express";

const assignRouter = express.Router();

assignRouter.post("/assign", assignResources);
assignRouter.get("/assigned/:jobId", getAssignedResources);


export default assignRouter;
