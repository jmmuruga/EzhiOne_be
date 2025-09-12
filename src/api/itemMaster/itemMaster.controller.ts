import { Router } from "express";
import { addUpdateItemMaster, createItemMasterID, deleteItemMaster, getItemMasterDetails, updateItemMasterStatus } from "./itemMaster.service";

const itemMasterRouter = Router()

itemMasterRouter.get('/itemMasterId', (req, res) => { createItemMasterID(req, res) });
itemMasterRouter.post('/addUpdateItemMaster', (req, res) => {addUpdateItemMaster(req, res)});
itemMasterRouter.get('/getItemMasterDetails', (req, res)=> {getItemMasterDetails(req, res)});
itemMasterRouter.delete('/deleteItemMaster/:itemMasterId', (req, res)=> {deleteItemMaster(req, res)});
itemMasterRouter.post('/updateItemMasterStatus', (req, res) => {updateItemMasterStatus(req, res)});

export default itemMasterRouter;