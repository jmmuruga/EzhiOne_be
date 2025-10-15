import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config(); // load env variables FIRST

import './core/dataBase/db'; // then connect to DB

import cors from 'cors';
import itemMasterRouter from './api/itemMaster/itemMaster.controller';
import companyRegistrationRouter from './api/companyRegistration/companyRegistration.controller';
import unitMeasuremtRouter from './api/unitOfMeasurement/unitofMeasurement.controller';
import itemGroupCategoryRouter from './api/itemGrouping-Categorization/itemGroupCategory.controller';
import financialYearRouter from './api/financialYearCreation/financialYearCreation.controller';
import otpPinRouter from './api/otpPinSetting/otpPinSetting.controller';
import userDetailsRouter from './api/userRegistration/userRegistration.controller';
import employeeRouter from './api/employeeRegistration/employee.controller';
import brandRouter from './api/brand/brand.controller';
import newCustomerRouter from './api/newCustomer/newCustomer.controller';
import leadsRouter from './api/leads/leads.controller';
import licenseRouter from './api/licenseSubscription/licenseSubscription.controller';
import logsRouter from './api/logs/logs.controller';
import otpRputer from './api/otp/otp.controller';
import dbSettingsRouter from './api/dataBaseSettings/dbSetting.controller';

const app = express();

const PORT = process.env.PORT || 5001;
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use("/itemMaster", cors(corsOptions), itemMasterRouter);
app.use('/companyRegistrationRouter', cors(corsOptions), companyRegistrationRouter);
app.use('/unitMeasuremtRouter', cors(corsOptions), unitMeasuremtRouter);
app.use('/itemGroupCategoryRouter', cors(corsOptions), itemGroupCategoryRouter);
app.use('/financialYearRouter', cors(corsOptions), financialYearRouter);
app.use('/otpPinRouter', cors(corsOptions), otpPinRouter);
app.use('/userDetailsRouter', cors(corsOptions), userDetailsRouter);
app.use('/employeeRouter', cors(corsOptions), employeeRouter);
app.use('/brandRouter', cors(corsOptions), brandRouter);
app.use('/newCustomerRouter', cors(corsOptions), newCustomerRouter);
app.use('/leadsRouter', cors(corsOptions), leadsRouter);
app.use('/licenseRouter', cors(corsOptions), licenseRouter);
app.use('/logsRouter', cors(corsOptions), logsRouter);
app.use('/otpRputer', cors(corsOptions), otpRputer);
app.use('/dbSettingsRouter', cors(corsOptions), dbSettingsRouter);

app.listen(PORT, () => console.log(`server upon port ${PORT}`));


