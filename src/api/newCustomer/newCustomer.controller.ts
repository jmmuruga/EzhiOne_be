import { Router } from "express";
import { addUpdateNewCustomer, createCustomerId, getNewCustomerDetails, updateNewCustomerStatus } from "./newCustomer.service";

const newCustomerRouter = Router()

newCustomerRouter.get('/createCustomerId', (req, res) => { createCustomerId(req, res) });
newCustomerRouter.post('/addUpdateNewCustomer', (req, res) => { addUpdateNewCustomer(req, res) });
newCustomerRouter.get('/getNewCustomerDetails', (req, res) => { getNewCustomerDetails(req, res) });
newCustomerRouter.post('/updateNewCustomerStatus', (req, res) => { updateNewCustomerStatus(req, res) });
newCustomerRouter.delete('/deleteNewCustomer/:customerId', (req, res) => { createCustomerId(req, res) });

export default newCustomerRouter;