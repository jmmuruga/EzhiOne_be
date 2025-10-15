import { Router } from "express";
import { addUpdateLicenseSubscription, createLicenseId, deleteLicense, getLicenseDetails, updateLicenseStatus } from "./licenseSubscription.service";

const licenseRouter = Router();

licenseRouter.get('/createLicenseId/:companyId', (req, res) => { createLicenseId(req, res) });
licenseRouter.post('/addUpdateLicenseSubscription', (req, res) => { addUpdateLicenseSubscription(req, res) });
licenseRouter.get('/getLicenseDetails/:companyId', (req, res) => { getLicenseDetails(req, res) });
licenseRouter.post('/updateLicenseStatus', (req, res) => { updateLicenseStatus(req, res) });
licenseRouter.delete('/deleteLicense/:companyId/:userId', (req, res) => { deleteLicense(req, res) });

export default licenseRouter;