import { Request, Response } from "express";
import { appSource } from "../../core/dataBase/db";
import { licenseSubscription } from "./licenseSubscription.model";
import { ValidationException } from "../../core/exception";
import { licenseSubscriptionDto, licenseSubscriptionStatusDto, licenseSubscriptionValidation } from "./licenseSubscription.dto";
import { getChangedProperty } from "../../shared/helper";
import { logsDto } from "../logs/logs.dto";
import { InsertLog } from "../logs/logs.service";

export const createLicenseId = async (req: Request, res: Response) => {
    try {
        const companyId = req.params.companyId;
        const licenseRepositry =
            appSource.getRepository(licenseSubscription);
        let licenseId = await licenseRepositry.query(
            `SELECT licenseId 
            FROM [${process.env.DB_NAME}].[dbo].[license_subscription] where companyId = '${companyId}'
            Group by licenseId 
            ORDER BY CAST(licenseId  AS INT) DESC;`
        );
        let id = "0";
        if (licenseId?.length > 0) {
            id = licenseId[0].licenseId;
        }
        const finalRes = Number(id) + 1;
        res.status(200).send({
            Result: finalRes,
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

export const addUpdateLicenseSubscription = async (
    req: Request,
    res: Response
) => {
    const payload: licenseSubscriptionDto = req.body;

    const userId = payload.isEdited
        ? payload.muid
        : payload.cuid;

    const companyId = payload.companyId

    const validation = licenseSubscriptionValidation.validate(payload);
    try {

        if (validation.error) {
            throw new ValidationException(validation.error.message);
        }
        const licenseRepositry = appSource.getRepository(
            licenseSubscription
        );
        const existingDetails = await licenseRepositry.findOneBy({
            licenseId: payload.licenseId,
            companyId: payload.companyId
        });

        if (existingDetails) {
            payload.cuid = existingDetails.cuid;
            payload.muid = payload.muid || userId;
        }

        if (existingDetails) {
            await licenseRepositry
                .update({ licenseId: payload.licenseId, companyId: payload.companyId }, payload)
                .then(async () => {
                    const updatedFields: string = await getChangedProperty([payload], [existingDetails]);
                    const logsPayload: logsDto = {
                        userId: userId,
                        userName: null,
                        statusCode: '200',
                        message: `License Updated For ${payload.companyName} Updated Changes ${updatedFields} By User -`,
                        companyId: companyId
                    }
                    await InsertLog(logsPayload);

                    res.status(200).send({
                        IsSuccess: "License Updated Successfully",
                    });
                })
                .catch(async (error) => {
                    const logsPayload: logsDto = {
                        userId: userId,
                        userName: null,
                        statusCode: '400',
                        message: `Error While Updating License for  "${payload.companyName}" - ${error.message}  By User -`,
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
            return;
        } else {

            payload.cuid = userId;
            payload.muid = null;

            await licenseRepositry.save(payload);

            const logsPayload: logsDto = {
                userId: userId,
                userName: null,
                statusCode: '200',
                message: `License For  "${payload.companyName}" Added By User -`,
                companyId: companyId
            }
            await InsertLog(logsPayload);

            res.status(200).send({
                IsSuccess: "License Added Successfully",
            });
        }
    } catch (error) {
        const logsPayload: logsDto = {
            userId: userId,
            userName: null,
            statusCode: '400',
            message: `Error While Adding License For  "${payload.companyName}"  By User-`,
            companyId: companyId
        }
        if (error instanceof ValidationException) {
            return res.status(400).send({
                message: error?.message,
            });
        }
        res.status(500).send(error);
    }
};

export const getLicenseDetails = async (req: Request, res: Response) => {
    try {
        const companyId = req.params.companyId;
        const licenseRepositry = appSource.getRepository(licenseSubscription);
        const getLicense = await licenseRepositry
            .createQueryBuilder("")
            .where({ companyId: companyId })
            .getMany();
        res.status(200).send({
            Result: getLicense,
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

export const updateLicenseStatus = async (req: Request, res: Response) => {
    const licenseStatus: licenseSubscriptionStatusDto = req.body;
    const licenseRepositry =
        appSource.getRepository(licenseSubscription);
    const licenseFound = await licenseRepositry.findOneBy({
        licenseId: licenseStatus.licenseId, companyId: licenseStatus.companyId
    });

    try {

        if (!licenseFound) {
            throw new ValidationException("Leads Not Found");
        }
        await licenseRepositry
            .createQueryBuilder()
            .update(licenseSubscription)
            .set({ status: licenseStatus.status })
            .where({ licenseId: licenseStatus.licenseId })
            .andWhere({ companyId: licenseStatus.companyId })
            .execute();

        const logsPayload: logsDto = {
            userId: licenseStatus.userId,
            userName: null,
            statusCode: '200',
            message: `License Status For  "${licenseFound.companyName}"  Changed To  "${licenseStatus.status}"  By User-`,
            companyId: licenseStatus.companyId
        }
        await InsertLog(logsPayload);

        res.status(200).send({
            IsSuccess: `Status for ${licenseFound.companyName} Changed Successfully`,
        });
    } catch (error) {

        const logsPayload: logsDto = {
            userId: licenseStatus.userId,
            userName: null,
            statusCode: '400',
            message: `Error While Updating License Subscription Status For "${licenseFound.companyName}" changed to "${licenseStatus.status}" By User`,
            companyId: licenseStatus.companyId
        }
        await InsertLog(logsPayload);

        if (error instanceof ValidationException) {
            return res.status(400).send({
                message: error?.message,
            });
        }
        res.status(500).send(error);
    }
};

export const deleteLicense = async (req: Request, res: Response) => {
    const { licenseId, companyId, userId } = req.params
    const licenseRepositry = appSource.getTreeRepository(licenseSubscription);
    const licenseFound = await licenseRepositry.findOneBy({
        licenseId: licenseId, companyId: companyId
    });

    try {

        if (!licenseFound) {
            throw new ValidationException("Customer Not Found ");
        }
        await licenseRepositry
            .createQueryBuilder()
            .delete()
            .from(licenseSubscription)
            .where({ licenseId: licenseId, companyId: companyId })
            .execute();

        const logsPayload: logsDto = {
            userId: userId,
            userName: null,
            statusCode: '200',
            message: `License For  "${licenseFound.companyName}"  Deleted By User -`,
            companyId: companyId
        }
        await InsertLog(logsPayload)

        res.status(200).send({
            IsSuccess: `${licenseFound.companyName} Deleted Successfully `,
        });

    } catch (error) {

        const logsPayload: logsDto = {
            userId: userId,
            userName: null,
            statusCode: '400',
            message: `Error While Deleting License Subscription  "${licenseFound.companyName}"  By User -  `,
            companyId: companyId,
        }
        await InsertLog(logsPayload);
        if (error instanceof ValidationException) {
            return res.status(400).send({
                message: error.message,
            });
        }
        res.status(500).send(error);
    }
};