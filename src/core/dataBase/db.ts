import "dotenv/config";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { itemMaster } from "../../api/itemMaster/itemMaster.model";
import { companyRegistration } from "../../api/companyRegistration/companyRegistration.model";
import { unitOfMeasurement } from "../../api/unitOfMeasurement/unitofMeasurement.model";
import { ItemGroupCategory } from "../../api/itemGrouping-Categorization/itemGroupCategory.model";
import { FinancialYearCreation } from "../../api/financialYearCreation/financialYearCreation.model";
import { OtpPinSetting } from "../../api/otpPinSetting/otpPinSetting.model";
import { employeeRegistration } from "../../api/employeeRegistration/employee.model";
import { Brand } from "../../api/brand/brand.model";
import { newCustomer } from "../../api/newCustomer/newCustomer.model";
import { leads } from "../../api/leads/leads.model";
import { licenseSubscription } from "../../api/licenseSubscription/licenseSubscription.model";
import { UserDetails } from "../../api/userRegistration/userRegistration.model";
import { otpStore } from "../../api/otp/otp.model";
import { Logs } from "../../api/logs/logs.model";

const Entities = [
  itemMaster,
  companyRegistration,
  unitOfMeasurement,
  ItemGroupCategory,
  FinancialYearCreation,
  OtpPinSetting,
  UserDetails,
  employeeRegistration,
  Brand,
  newCustomer,
  leads,
  licenseSubscription,
  otpStore,
  Logs
]

export const appSource = new DataSource({
  type: "mssql",
  host: process.env.DB_SERVER_HOST,      // <- use host now
  port: parseInt(process.env.DB_PORT as string),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: Entities,
  synchronize: true,
  logging: false,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
});

appSource
  .initialize()
  .then((res) => console.log("SQL Server Connected"))
  .catch((error) => console.log(error, "Error while connecting to DB"));