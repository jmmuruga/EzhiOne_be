import { Router } from "express";
import { addUpdatedbSettings } from "./dbSettings.service";

const dbSettingsRouter = Router();

dbSettingsRouter.post('/addUpdatedbSettings', (req, res) => { addUpdatedbSettings(req, res) });

export default dbSettingsRouter;