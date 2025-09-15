import { Router } from "express";
import { addUpdateOtpPinSetting, deleteOtpPin, getOtpPinDetails, getOtpPinId, updateOtpPinStatus } from "./otpPinSetting.service";

const otpPinRouter = Router();

otpPinRouter.get('/getOtpPinId', (req, res) => { getOtpPinId(req, res) });
otpPinRouter.post('/addUpdateOtpPinSetting', (req, res) => { addUpdateOtpPinSetting(req, res) });
otpPinRouter.get('/getOtpPinDetails', (req, res) => { getOtpPinDetails(req, res) });
otpPinRouter.post('/updateOtpPinStatus', (req, res) => { updateOtpPinStatus(req, res) });
otpPinRouter.delete('/deleteOtpPin/:otpPinId', (req, res) => { deleteOtpPin(req, res) });

export default otpPinRouter;