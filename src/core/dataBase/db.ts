import "dotenv/config";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { itemMaster } from "../../api/itemMaster/itemMaster.model";

const Entities = [
  itemMaster
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