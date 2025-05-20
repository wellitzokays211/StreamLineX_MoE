import { getDevelopmentOfficerById, loginDevelopmentOfficer, registerDevelopmentOfficer, updateDevelopmentOfficerById } from "../controllers/DevelopmentOfficerController.js";

import authMiddleware from "../middleware/auth.js";
import express from "express";

const DevelopmentOfficerRouter = express.Router();

DevelopmentOfficerRouter.post("/register", registerDevelopmentOfficer);
DevelopmentOfficerRouter.post("/login", loginDevelopmentOfficer);
DevelopmentOfficerRouter.get("/get", authMiddleware, getDevelopmentOfficerById);
DevelopmentOfficerRouter.put("/update", authMiddleware, updateDevelopmentOfficerById);


export default DevelopmentOfficerRouter;
