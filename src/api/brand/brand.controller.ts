import { Router } from "express";
import { addUpdateBrand, createBrandId, deleteBrand, getBrandDetails, updateBrandStatus } from "./brand.service";

const brandRouter = Router()

brandRouter.get('/createBrandId', (req, res) => { createBrandId(req, res) });
brandRouter.post('/addUpdateBrand', (req, res) => { addUpdateBrand(req, res) });
brandRouter.get('/getBrandDetails', (req, res) => { getBrandDetails(req, res) });
brandRouter.post('/updateBrandStatus', (req, res) => { updateBrandStatus(req, res) });
brandRouter.delete('/deleteBrand/:brandId', (req, res) => { deleteBrand(req, res) });

export default brandRouter;