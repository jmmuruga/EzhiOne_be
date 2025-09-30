import { Router } from "express";
import { addUpdateBrand, createBrandId, deleteBrand, getBrandDetails, updateBrandStatus } from "./brand.service";

const brandRouter = Router()

brandRouter.get('/createBrandId/:companyId', (req, res) => { createBrandId(req, res) });
brandRouter.post('/addUpdateBrand', (req, res) => { addUpdateBrand(req, res) });
brandRouter.get('/getBrandDetails/:companyId', (req, res) => { getBrandDetails(req, res) });
brandRouter.post('/updateBrandStatus', (req, res) => { updateBrandStatus(req, res) });
brandRouter.delete('/deleteBrand/:brandId/:companyId/:userId', (req, res) => { deleteBrand(req, res) });

export default brandRouter;