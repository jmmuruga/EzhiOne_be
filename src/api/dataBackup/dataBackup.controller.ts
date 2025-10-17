import { Router } from "express";
import { getDataBaseBackup } from "./dataBackup.service";

const databaseRouter = Router();

databaseRouter.get('/getDataBaseBackup', (req, res) => { getDataBaseBackup(req, res) })

export default databaseRouter