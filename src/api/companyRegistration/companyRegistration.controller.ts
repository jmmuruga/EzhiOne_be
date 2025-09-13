import { Router } from "express";
import { addUpdateCompanyRegistration, deleteCompany, getCompanyDetails, getCompanyId, updateCompanyStatus } from "./companyRegistration.service";

const companyRegistrationRouter = Router()

companyRegistrationRouter.get('/getCompanyId', (req, res) => { getCompanyId(req, res) });
companyRegistrationRouter.post('/addUpdateCompanyRegistration', (req, res) => { addUpdateCompanyRegistration(req, res) });
companyRegistrationRouter.get('/getCompanyDetails', (req, res)=> {getCompanyDetails(req, res)});
companyRegistrationRouter.post('/updateCompanyStatus', (req, res)=> {updateCompanyStatus(req, res)});
companyRegistrationRouter.delete('/deleteCompany/:companyId', (req, res)=> {deleteCompany(req, res)});

export default companyRegistrationRouter;