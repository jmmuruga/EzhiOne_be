import { appSource } from "../../core/dataBase/db";
import { ValidationException } from "../../core/exception";
import { logsDto } from "../logs/logs.dto";
import { InsertLog } from "../logs/logs.service";
import { Request, Response } from "express";
import sql from 'mssql';

export const getDataBaseBackup = async (req: Request, res: Response) => {
    let dbName = process.env.DB_NAME;
    let drive = 'D';
    const sqlConfig = {
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        server: process.env.DB_SERVER_HOST,
        database: process.env.DB_NAME,
        options: {
            encrypt: false, // Disable encryption
            trustServerCertificate: true, // Depending on your SQL Server settings
        },
        requestTimeout: 1200000
    };
    // const dbSettingsRepo = appSource.getRepository(databaseBackupSettings);
    // let details = await dbSettingsRepo.query(
    //     `select drive from [${process.env.DB_NAME}].[dbo].[database_backup_settings]`
    // )
    // if (details?.length > 0) {
    //     drive = details[0].drive
    // }
    try {
        const backup = await sql.connect(sqlConfig);
        // Your SQL query
        const query: string = `
        DECLARE @path VARCHAR(256) -- path of backup files
        DECLARE @fileName VARCHAR(256) -- filename for backup
        DECLARE @fileDate VARCHAR(20) -- used for file name
        DECLARE @time datetime
        SET @time = GETDATE() -- No need for explicit conversion here
        SET @path = '${drive}:\\DATABASE_BACKUP\\'
        -- specify filename format
        SET @fileDate = REPLACE(CONVERT(VARCHAR(20), @time, 120), ':', '') -- Format the date without colons
            BEGIN
                SET @fileName = @path + '${dbName}' + '_' + @fileDate + '.BAK'
                BACKUP DATABASE [${process.env.DB_NAME}] TO DISK = @fileName
            END
  `;
        // Execute the query
        const result = await backup.request().query(query);
        await sql.close();
        // const logPayload: logsDto = {
        //     userId: userId,
        //     userName: null,
        //     statusCode: '200',
        //     message: `Database ${dbName} Backup Taken Succesfully and stored in D:\\DATABASE_BACKUP\\ - `,
        //     companyId: null
        // }
        // await InsertLog(logPayload);
        res.status(200).send({
            IsSuccess: "DataBase BackUp Taken Succesfully...!",
        });
    }
    catch (error) {
        console.log(error, 'error')
        // const logPayload: logsDto = {
        //     userId: userId,
        //     userName: null,
        //     statusCode: '400',
        //     message: `Error while taking Database Backup for ${dbName} - `,
        //     companyId: null
        // }
        // await InsertLog(logPayload);
        if (error instanceof ValidationException) {
            return res.status(400).send({
                message: error?.message,
            });
        }
        res.status(500).send(error);
    }
}