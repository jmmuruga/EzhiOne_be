import { Router } from "express";
import { getLogsReport } from "./logs.service";

const logsRouter = Router()

logsRouter.get('/getLogsReport/:fromDate/:toDate/:userId/:companyId', (req, res) => { getLogsReport(req, res) });

export default logsRouter;