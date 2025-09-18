import { Router } from "express";
import { addUpdateNewCustomer, createCustomerId, deleteNewCustomer, getNewCustomerDetails, updateNewCustomerStatus } from "./newCustomer.service";

const newCustomerRouter = Router()

newCustomerRouter.get('/createCustomerId/:companyId', (req, res) => { createCustomerId(req, res) });
newCustomerRouter.post('/addUpdateNewCustomer', (req, res) => { addUpdateNewCustomer(req, res) });
newCustomerRouter.get('/getNewCustomerDetails/:companyId', (req, res) => { getNewCustomerDetails(req, res) });
newCustomerRouter.post('/updateNewCustomerStatus', (req, res) => { updateNewCustomerStatus(req, res) });
newCustomerRouter.delete('/deleteNewCustomer/:customerId/:companyId', (req, res) => { deleteNewCustomer(req, res) });

export default newCustomerRouter;