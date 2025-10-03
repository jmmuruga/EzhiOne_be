import { appSource } from "../../core/dataBase/db";
import { ValidationException } from "../../core/exception";
import { UserDetails } from "../userRegistration/userRegistration.model";
import { logsDto } from "./logs.dto";
import { Logs } from "./logs.model";
import { Request, Response } from "express";

export const InsertLog = async (payload: logsDto): Promise<void> => {
    const logsRepository = appSource.getRepository(Logs);
    const userRepository = appSource.getRepository(UserDetails);

    const userDetail = await userRepository.findOneBy({ userId: payload.userId });
    const userName = userDetail?.userName;
    payload.message = payload.message + " " + userName;
    payload.userName = userName || '';
    await logsRepository.save(payload);
};

export const getLogsReport = async (req: Request, res: Response) => {
    try {
        const { fromDate, toDate, userId, companyId } = req.params;
        const logsRepository = appSource.getRepository(Logs);
        let Details: logsDto[] = [];
        if (+userId > 0) {
            Details = await logsRepository.query(
                `SELECT 
    l.logId,
    l.userId,
    ud.userName,
    l.statusCode,
    l.message,
    l.created_at
FROM [BILLING_SOFTWARE].[dbo].[logs] l
INNER JOIN [BILLING_SOFTWARE].[dbo].[user_details] ud
    ON l.userId = ud.userId
WHERE l.companyId = '${companyId}'              
  AND l.userId = '${userId}
  AND l.created_at >= '${fromDate}'
  AND l.created_at <  '${toDate}'  
ORDER BY l.logId DESC`
            );

        } else {
            Details = await logsRepository.query(
                `Select l.logId,l.userId,ud.userName,l.statusCode,l.message,l.created_at
        from [BILLING_SOFTWARE].[dbo].[logs] l
        inner join [BILLING_SOFTWARE].[dbo].user_details ud
        on l.userId = ud.userId
        where l.companyId = '${companyId}'
        AND l.created_at >= '${toDate}' 
  AND l.created_at <  '2025-10-04' 
        order by l.logId desc`
            );
        }
        res.status(200).send({
            Result: Details,
        });
    } catch (error) {
        if (error instanceof ValidationException) {
            return res.status(400).send({
                message: error?.message,
            });
        }
        res.status(500).send(error);
    }
};
