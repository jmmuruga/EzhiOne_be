import { Router } from "express";
import { addUpdateUnitMeasurement, deleteUnitMeasurement, getUnitMeasurementDetails, getUnitMeasurementId, updateUnitMeasurementStatus } from "./unitofMeasurement.service";

const unitMeasuremtRouter = Router()

unitMeasuremtRouter.get('/getUnitMeasurementId', (req, res) => { getUnitMeasurementId(req, res) });
unitMeasuremtRouter.post('/addUpdateUnitMeasurement', (req, res) => { addUpdateUnitMeasurement(req, res) });
unitMeasuremtRouter.get('/getUnitMeasurementDetails', (req, res) => { getUnitMeasurementDetails(req, res) });
unitMeasuremtRouter.post('/updateUnitMeasurementStatus', (req, res) => { updateUnitMeasurementStatus(req, res) });
unitMeasuremtRouter.delete('/deleteUnitMeasurement/:unitMeasurementId', (req, res) => { deleteUnitMeasurement(req, res) });

export default unitMeasuremtRouter;