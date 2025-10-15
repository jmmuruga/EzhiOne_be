import { Router } from "express";
import { addUpdateOtpPinSetting, deleteOtpPin, getOtpPinDetails, sendOtp, updateOtpPinStatus, verifyAddPin, verifyEditPin, VerifyOtp } from "./otpPinSetting.service";

const otpPinRouter = Router();

// otpPinRouter.get('/getOtpPinId/:companyId', (req, res) => { getOtpPinId(req, res) });
otpPinRouter.post('/addUpdateOtpPinSetting', (req, res) => { addUpdateOtpPinSetting(req, res) });
otpPinRouter.get('/getOtpPinDetails/:companyId', (req, res) => { getOtpPinDetails(req, res) });
otpPinRouter.post('/updateOtpPinStatus', (req, res) => { updateOtpPinStatus(req, res) });
otpPinRouter.delete('/deleteOtpPin/:otpPinId/:companyId/:userId', (req, res) => { deleteOtpPin(req, res) });
otpPinRouter.get('/sendOtp/:companyId', (req, res) => { sendOtp(req, res) });
otpPinRouter.get('/VerifyOtpUser/:otp', (req, res) => { VerifyOtp(req, res) });
otpPinRouter.get('/verifyAddPin/:addPin', (req, res) => { verifyAddPin(req, res) });
otpPinRouter.get('/verifyEditPin/:editPin', (req, res) => { verifyEditPin(req, res) })

export default otpPinRouter;