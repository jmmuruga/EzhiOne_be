import { Router } from "express";
import { addUpdateLeads, createLeadsId, deleteLeads, getLeadsDetails, updateLeadsStatus } from "./leads.service";

const leadsRouter = Router()

leadsRouter.get('/createLeadsId/:companyId', (req, res) => { createLeadsId(req, res) });
leadsRouter.post('/addUpdateLeads', (req, res) => { addUpdateLeads(req, res) });
leadsRouter.get('/getLeadsDetails/:companyId', (req, res) => { getLeadsDetails(req, res) });
leadsRouter.post('/updateLeadsStatus', (req, res) => { updateLeadsStatus(req, res) });
leadsRouter.delete('/deleteLeads/:leadsId/:companyId/:userId', (req, res) => { deleteLeads(req, res) });

export default leadsRouter;