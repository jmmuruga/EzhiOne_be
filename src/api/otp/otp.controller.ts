import { Router } from "express";
import { getOpt, VerifyOtpUser } from "./otp.service";

const otpRputer = Router();

otpRputer.post('/getOpt', (req, res) => { getOpt(req, res) });
otpRputer.get('/verifyOtp/:otp/:userId', (req, res) => { VerifyOtpUser(req, res); });

export default otpRputer;