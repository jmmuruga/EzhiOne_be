import { Router } from "express";
import { addUpdateFinancialYear, deleteFinancialYear, getFinancialYearDetails, getFinancialYearId, updateFinancialYearStatus } from "./financialYearCreation.service";

const financialYearRouter = Router();

financialYearRouter.get('/financialYearId/:companyId', (req, res) => { getFinancialYearId(req, res) });
financialYearRouter.post('/addUpdateFinancialYear', (req, res) => { addUpdateFinancialYear(req, res) });
financialYearRouter.get('/financialYearDetails/:companyId', (req, res) => { getFinancialYearDetails(req, res) });
financialYearRouter.post('/updateFinancialYearStatus', (req, res) => { updateFinancialYearStatus(req, res) });
financialYearRouter.delete('/deleteFinancialYear/:financialYearId/:companyId', (req, res) => { deleteFinancialYear(req, res) });

export default financialYearRouter;