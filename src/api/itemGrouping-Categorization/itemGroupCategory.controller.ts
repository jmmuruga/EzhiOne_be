import { Router } from "express";
import { addUpdateItemGroupCategory, deleteItemGroupCategory, getGroupCategoryId, getItemGroupCategoryDetails, updateItemGroupCategoryStatus } from "./itemGroupCategory.service";

const itemGroupCategoryRouter = Router();

itemGroupCategoryRouter.get('/getGroupCategoryId', (req, res) => { getGroupCategoryId(req, res) })
itemGroupCategoryRouter.post('/addUpdateItemGroupCategory', (req, res) => { addUpdateItemGroupCategory(req, res) })
itemGroupCategoryRouter.get('/getItemGroupCategoryDetails', (req, res) => { getItemGroupCategoryDetails(req, res) })
itemGroupCategoryRouter.post('/updateItemGroupCategoryStatus', (req, res) => { updateItemGroupCategoryStatus(req, res) })
itemGroupCategoryRouter.delete('/deleteItemGroupCategory/:itemGroupId', (req, res) => { deleteItemGroupCategory(req, res) })

export default itemGroupCategoryRouter;