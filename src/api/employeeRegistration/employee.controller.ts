import { Router } from "express";
import { addUpdateEmployeeRegistration, deleteEmployee, getEmployeeDetails, getEmployeeId, updateEmployeeStatus } from "./employee.service";

const employeeRouter = Router();

employeeRouter.get('/getEmployeeId', (req, res) => { getEmployeeId(req, res) });
employeeRouter.post('/addUpdateEmployeeRegistration', (req, res) => { addUpdateEmployeeRegistration(req, res) });
employeeRouter.get('/getEmployeeDetails', (req, res) => { getEmployeeDetails(req, res) });
employeeRouter.post('/updateEmployeeStatus', (req, res) => { updateEmployeeStatus(req, res) });
employeeRouter.delete('/deleteEmployee/:employeeId', (req, res) => { deleteEmployee(req, res) });

export default employeeRouter;