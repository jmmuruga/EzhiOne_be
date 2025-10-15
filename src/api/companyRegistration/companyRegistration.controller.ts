import { Router } from "express";
import { addUpdateCompanyRegistration, deleteCompany, getCompanyDetails, getCompanyId, getOpt, updateCompanyStatus, VerifyOtpUser } from "./companyRegistration.service";

const companyRegistrationRouter = Router()

companyRegistrationRouter.get('/getCompanyId', (req, res) => { getCompanyId(req, res) });
companyRegistrationRouter.post('/addUpdateCompanyRegistration', (req, res) => { addUpdateCompanyRegistration(req, res) });
companyRegistrationRouter.get('/getCompanyDetails', (req, res) => { getCompanyDetails(req, res) });
companyRegistrationRouter.post('/updateCompanyStatus', (req, res) => { updateCompanyStatus(req, res) });
companyRegistrationRouter.delete('/deleteCompany/:companyId/:userId', (req, res) => { deleteCompany(req, res) });
companyRegistrationRouter.post('/getOpt', (req, res) => { getOpt(req, res) });
companyRegistrationRouter.get('/verifyOtp/:otp/:userId', (req, res) => { VerifyOtpUser(req, res); });

export default companyRegistrationRouter;