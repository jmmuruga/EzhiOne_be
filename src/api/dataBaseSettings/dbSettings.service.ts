import { Request, Response } from "express";
import { dbSettingsValidation } from "./dbSetting.dto";
import { ValidationException } from "../../core/exception";
import { DbSettings } from "./dbSettings.model";
import { appSource } from "../../core/dataBase/db";
import { getChangedProperty } from "../../shared/helper";
import { logsDto } from "../logs/logs.dto";
import { InsertLog } from "../logs/logs.service";


// export const addUpdatedbSettings = async (req: Request, res: Response) => {
//     const payload: DbSettings = req.body;
//     const userId = payload.isEdited ? payload.muid : payload.cuid;
//     const companyId = payload.companyId;

//     try {
//         const validation = dbSettingsValidation.validate(payload);
//         if (validation.error) {
//             throw new ValidationException(validation.error.message);
//         }

//         const dbsettingRepo = appSource.getRepository(DbSettings);
//         const exitingDetails = await dbsettingRepo.findOneBy({
//             dbSettingsId: payload.dbSettingsId,
//             companyId: companyId
//         });

//         if (exitingDetails) {
//             payload.cuid = exitingDetails.cuid;
//             payload.muid = userId;
//         }

//         await dbsettingRepo.update({ dbSettingsId: payload.dbSettingsId, companyId: companyId }, payload)
//             .then(async () => {
//                 const updatedFields: string = await getChangedProperty([payload], [exitingDetails]);

//                 const logsPayload: logsDto = {
//                     userId: userId,
//                     userName: null,
//                     statusCode: '200',
//                     message: `Database Settings Updated to ${updatedFields} By User -`,
//                     companyId: companyId
//                 }

//                 await InsertLog(logsPayload);

//                 res.status(200).send({
//                     IsSuccess: 'DataBase Settings updated Successfully'
//                 })
//             })
//             .catch(async (error) => {
//                 const logsPayload: logsDto = {
//                     userId: userId,
//                     userName: null,
//                     statusCode: '400',
//                     message: `Error While Updating DataBase Setting ${error.message} By User`,
//                     companyId: companyId
//                 }
//                 await InsertLog(logsPayload);

//                 if (error instanceof ValidationException) {
//                     return res.status(400).send({
//                         message: error?.message,
//                     });
//                 }

//                 res.status(500).send(error);
//             })

//     }else {
//         payload.cuid = userId;
//         payload.muid = null;

//         await dbsettingRepo.save(payload);

//         const logsPayload: logsDto = {
//             userId: userId,
//             userName: null,
//             statusCode: '200',
//             message: `Database Settings Added By User -`,
//             companyId: companyId
//         }
//         await InsertLog(logsPayload);

//         res.status(200).send({
//             IsSuccess: 'DataBase Settings Added Successfully'
//         })
//     } catch (error) {
//         const logsPayload: logsDto = {
//             userId: userId,
//             userName: null,
//             statusCode: '400',
//             message: `Error While Adding DataBase Setting -${error.message}  By User`,
//             companyId: companyId
//         }

//         await InsertLog(logsPayload)

//         if (error instanceof ValidationException) {
//             return res.status(400).send({
//                 message: error?.message,
//             });
//         }
//         res.status(500).send(error);
//     }
// }

export const addUpdatedbSettings = async (req: Request, res: Response) => {
    const payload: DbSettings = req.body;
    const userId = payload.isEdited ? payload.muid : payload.cuid;
    const companyId = payload.companyId;

    try {
        const validation = dbSettingsValidation.validate(payload);
        if (validation.error) {
            throw new ValidationException(validation.error.message);
        }

        const dbsettingRepo = appSource.getRepository(DbSettings);
        const exitingDetails = await dbsettingRepo.findOneBy({
            dbSettingsId: payload.dbSettingsId,
            companyId: companyId
        });

        if (exitingDetails) {
            payload.cuid = exitingDetails.cuid;
            payload.muid = userId;

            await dbsettingRepo.update({ dbSettingsId: payload.dbSettingsId, companyId: companyId }, payload)
                .then(async () => {
                    const updatedFields: string = await getChangedProperty([payload], [exitingDetails]);

                    const logsPayload: logsDto = {
                        userId: userId,
                        userName: null,
                        statusCode: '200',
                        message: `Database Settings Updated to ${updatedFields} By User -`,
                        companyId: companyId
                    }

                    await InsertLog(logsPayload);

                    res.status(200).send({
                        IsSuccess: 'DataBase Settings updated Successfully'
                    })
                })
                .catch(async (error) => {
                    const logsPayload: logsDto = {
                        userId: userId,
                        userName: null,
                        statusCode: '400',
                        message: `Error While Updating DataBase Setting ${error.message} By User`,
                        companyId: companyId
                    }
                    await InsertLog(logsPayload);

                    if (error instanceof ValidationException) {
                        return res.status(400).send({
                            message: error?.message,
                        });
                    }

                    res.status(500).send(error);
                });

        } else {
            payload.cuid = userId;
            payload.muid = null;

            await dbsettingRepo.save(payload);

            const logsPayload: logsDto = {
                userId: userId,
                userName: null,
                statusCode: '200',
                message: `Database Settings Added By User -`,
                companyId: companyId
            }
            await InsertLog(logsPayload);

            res.status(200).send({
                IsSuccess: 'DataBase Settings Added Successfully'
            });
        }

    } catch (error) {
        const logsPayload: logsDto = {
            userId: userId,
            userName: null,
            statusCode: '400',
            message: `Error While Adding DataBase Setting -${error.message}  By User`,
            companyId: companyId
        }

        await InsertLog(logsPayload);

        if (error instanceof ValidationException) {
            return res.status(400).send({
                message: error?.message,
            });
        }
        res.status(500).send(error);
    }
}
