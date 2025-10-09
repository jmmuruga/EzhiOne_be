import { appSource } from "../../core/dataBase/db";
import { ValidationException } from "../../core/exception";
import { UserDetails } from "../userRegistration/userRegistration.model";
import { logsDto } from "./logs.dto";
import { Logs } from "./logs.model";
import { Request, Response } from "express";

export const InsertLog = async (payload: logsDto): Promise<void> => {
    const logsRepository = appSource.getRepository(Logs);
    const userRepository = appSource.getRepository(UserDetails);

    // Fetch user by both userId AND companyId
    const userDetail = await userRepository.findOneBy({
        userId: payload.userId,
        companyId: payload.companyId
    });
    // console.log(userDetail.userName , 'userdetail username')

    const userName = userDetail?.userName || '';
    payload.message = payload.message + " " + userName;
    payload.userName = userName;
    // console.log(payload.userName , 'payload username')

    await logsRepository.save(payload);
};


// export const getLogsReport = async (req: Request, res: Response) => {
//     try {
//         const { fromDate, toDate, userId, companyId } = req.params;
//         const logsRepository = appSource.getRepository(Logs);
//         let Details: logsDto[] = [];
//         if (+userId > 0) {
//             Details = await logsRepository.query(
//                 `Select l.logId,l.userId,ud.userName,l.statusCode,l.message,l.createdAt, l.companyId
//         from [${process.env.DB_NAME}].[dbo].[logs] l
//         inner join [${process.env.DB_NAME}].[dbo].user_details ud
//         on l.userId = ud.userId
//         where l.companyId = '${companyId}' AND l.userId = ud.userId and
//         CONVERT(VARCHAR(10),  l.createdAt, 120) >= CONVERT(VARCHAR(10), '${fromDate}', 120)
//         AND CONVERT(VARCHAR(10), l.createdAt, 120) <= CONVERT(VARCHAR(10), '${toDate}', 120)
//         order by l.logId desc`
//             );

//         } else {
//             Details = await logsRepository.query(
//                 `Select l.logId,l.userId,ud.userName,l.statusCode,l.message,l.createdAt, l.companyId
//         from [${process.env.DB_NAME}].[dbo].[logs] l
//         inner join [${process.env.DB_NAME}].[dbo].user_details ud
//         on l.userId = ud.userId
//         where l.companyId = '${companyId}' AND
//         CONVERT(VARCHAR(10),  l.createdAt, 120) >= CONVERT(VARCHAR(10), '${fromDate}', 120)
//         AND CONVERT(VARCHAR(10), l.createdAt, 120) <= CONVERT(VARCHAR(10), '${toDate}', 120)
//         order by l.logId desc`
//             );
//         }
//         res.status(200).send({
//             Result: Details,
//         });
//     } catch (error) {
//         if (error instanceof ValidationException) {
//             return res.status(400).send({
//                 message: error?.message,
//             });
//         }
//         res.status(500).send(error);
//     }
// };

export const getLogsReport = async (req: Request, res: Response) => {
    try {
        const { fromDate, toDate, userId, companyId } = req.params;
        const logsRepository = appSource.getRepository(Logs);
        let Details: logsDto[] = [];

        const baseQuery = `
            SELECT l.logId, l.userId, ud.userName, l.statusCode, l.message, l.createdAt, l.companyId
            FROM [${process.env.DB_NAME}].[dbo].[logs] l
            INNER JOIN [${process.env.DB_NAME}].[dbo].user_details ud
                ON l.userId = ud.userId AND l.companyId = ud.companyId
            WHERE l.companyId = '${companyId}'
                AND CONVERT(VARCHAR(10), l.createdAt, 120) >= CONVERT(VARCHAR(10), '${fromDate}', 120)
                AND CONVERT(VARCHAR(10), l.createdAt, 120) <= CONVERT(VARCHAR(10), '${toDate}', 120)
        `;

        if (+userId > 0) {
            Details = await logsRepository.query(
                baseQuery + ` AND l.userId = '${userId}' ORDER BY l.logId DESC`
            );
        } else {
            Details = await logsRepository.query(
                baseQuery + ` ORDER BY l.logId DESC`
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

