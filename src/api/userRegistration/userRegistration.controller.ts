import { Router } from "express";
import { addUpdateUserDetails, deleteUserDetails, getUserDetails, getUserId, updateUserStatus } from "./userRegistration.service";

const userDetailsRouter = Router()

userDetailsRouter.get('/getUserId/:companyId', (req, res) => { getUserId(req, res) });
userDetailsRouter.post('/addUpdateUserDetails', (req, res) => { addUpdateUserDetails(req, res) });
userDetailsRouter.get('/getUserDetails/:companyId', (req, res) => { getUserDetails(req, res) });
userDetailsRouter.post('/updateUserStatus', (req, res) => { updateUserStatus(req, res) });
userDetailsRouter.delete('/deleteUserDetails/:userId/:companyId', (req, res) => { deleteUserDetails(req, res) });

export default userDetailsRouter;