import { Router } from "express";
import { addUpdatedbSettings, dbStatusChange, getdbSettings } from "./dbSettings.service";

const dbSettingsRouter = Router();

dbSettingsRouter.post('/addUpdatedbSettings', (req, res) => { addUpdatedbSettings(req, res) });
dbSettingsRouter.get('/getdbSettings/:companyId', (req, res) => { getdbSettings(req, res) });
dbSettingsRouter.post('/dbStatusChange', (req, res) => { dbStatusChange(req, res) })

export default dbSettingsRouter;