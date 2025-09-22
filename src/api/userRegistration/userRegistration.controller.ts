import { Router } from "express";
import { addUpdateUserDetails, deleteUserDetails, forgetPasswordSendOtp, getResgiterUserId, getUserDetails, getUserId, SendOtpNewAdminUser, superAdminResigteration, updatePassword, updateUserStatus, VerifyOtpUser } from "./userRegistration.service";

const userDetailsRouter = Router()

userDetailsRouter.get('/getUserId/:companyId', (req, res) => { getUserId(req, res) });
userDetailsRouter.post('/addUpdateUserDetails', (req, res) => { addUpdateUserDetails(req, res) });
userDetailsRouter.get('/getUserDetails/:companyId', (req, res) => { getUserDetails(req, res) });
userDetailsRouter.post('/updateUserStatus', (req, res) => { updateUserStatus(req, res) });
userDetailsRouter.delete('/deleteUserDetails/:userId/:companyId', (req, res) => { deleteUserDetails(req, res) });
userDetailsRouter.get('/SendOtpNewAdminUser/:userId/:userName/:Email/:Mobile', (req, res) => { SendOtpNewAdminUser(req, res) })
userDetailsRouter.get('/getResgiterUserId', (req, res) => { getResgiterUserId(req, res) });
userDetailsRouter.get('/verifyOtpUser/:userId/:otp', (req, res) => { VerifyOtpUser(req, res) });
userDetailsRouter.post('/superAdminResigteration', (req, res) => { superAdminResigteration(req, res) });
userDetailsRouter.get('/forgetPasswordSendOtp/:Email', (req, res) => { forgetPasswordSendOtp(req, res) });
userDetailsRouter.post('/updatePassword', (req, res) => { updatePassword(req, res) });


export default userDetailsRouter;