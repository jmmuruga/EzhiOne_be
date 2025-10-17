import { Request, Response } from "express";
import { dbSettingsDto, dbSettingsStatusDto, dbSettingsValidation } from "./dbSetting.dto";
import { ValidationException } from "../../core/exception";
import { DbSettings } from "./dbSettings.model";
import { appSource } from "../../core/dataBase/db";
import { getChangedProperty } from "../../shared/helper";
import { logsDto } from "../logs/logs.dto";
import { InsertLog } from "../logs/logs.service";

export const addUpdatedbSettings = async (req: Request, res: Response) => {
    const payload: DbSettings = req.body;
    const userId = payload.isEdited ? payload.muid || payload.cuid : payload.cuid;
    const companyId = payload.companyId;

    try {
        const validation = dbSettingsValidation.validate(payload);
        if (validation.error) throw new ValidationException(validation.error.message);

        const dbsettingRepo = appSource.getRepository(DbSettings);
        const existingDetails = await dbsettingRepo.findOneBy({
            dbSettingsId: payload.dbSettingsId,
            companyId
        });

        if (existingDetails) {
            payload.cuid = existingDetails.cuid;
            payload.muid = userId;

            await dbsettingRepo.update({ dbSettingsId: payload.dbSettingsId, companyId }, payload);
            const updatedFields = await getChangedProperty([payload], [existingDetails]);

            await InsertLog({
                userId,
                userName: null,
                statusCode: '200',
                message: `Database Settings Updated to ${updatedFields} By User -`,
                companyId
            });

            return res.status(200).send({
                IsSuccess: 'DataBase Settings updated Successfully'
            });
        }

        // If not found, create new
        payload.cuid = userId;
        payload.muid = null;

        await dbsettingRepo.save(payload);

        await InsertLog({
            userId,
            userName: null,
            statusCode: '200',
            message: `Database Settings Added By User -`,
            companyId
        });

        res.status(200).send({
            IsSuccess: 'DataBase Settings Added Successfully'
        });

    } catch (error: any) {
        await InsertLog({
            userId,
            userName: null,
            statusCode: '400',
            message: `Error While Adding/Updating Database Setting - ${error.message} By User`,
            companyId
        });

        if (error instanceof ValidationException) {
            return res.status(400).send({ message: error.message });
        }

        res.status(500).send(error);
    }
};

export const getdbSettings = async (req: Request, res: Response) => {
    try {
        // const companyId = req.params.companyId
        const dbsettingRepo = appSource.getRepository(DbSettings);
        const database = await dbsettingRepo
            .createQueryBuilder("")
            // .where({ companyId: companyId })
            .getMany();

        res.status(200).send({
            Result: database,
        })
        // console.log(database, 'out going')
    }
    catch (error) {
        if (error instanceof ValidationException) {
            return res.status(400).send({
                message: error?.message
            })
        }
        res.status(500).send(error)
    }
}

export const dbStatusChange = async (req: Request, res: Response) => {
    const dbSettingsStatus: dbSettingsStatusDto = req.body;
    const dbsettingRepo = appSource.getRepository(DbSettings);
    const dbFound = await dbsettingRepo.findOneBy({
        dbSettingsId: dbSettingsStatus.dbSettingsId, companyId: dbSettingsStatus.companyId
    });

    try {
        if (!dbFound) {
            throw new ValidationException("DataBase Setting Not Found")
        }

        await dbsettingRepo
            .createQueryBuilder()
            .update(DbSettings)
            .set({ dbStatus: dbSettingsStatus.dbStatus })
            .where({ dbSettingsId: dbSettingsStatus.dbSettingsId })
            .andWhere({ companyId: dbSettingsStatus.companyId })
            .execute();

        const logsPayload: logsDto = {
            userId: dbSettingsStatus.userId,
            userName: null,
            statusCode: '200',
            message: `Data Base Setting Status Changed to "${dbSettingsStatus.dbStatus}"  By User- `,
            companyId: dbSettingsStatus.companyId
        }

        await InsertLog(logsPayload);

        res.status(200).send({
            IsSuccess: 'Status Updated SuccessFully'
        });
    }
    catch (error) {
        const logsPayload: logsDto = {
            userId: dbSettingsStatus.userId,
            userName: null,
            statusCode: '400',
            message: 'Error While Updating Status',
            companyId: dbSettingsStatus.companyId
        }

        await InsertLog(logsPayload);

        if (error instanceof ValidationException) {
            return res.status(400).send({
                message: error?.message
            })
        }

        res.status(500).send(error)
    }
}