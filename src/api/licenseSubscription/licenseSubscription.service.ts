import { Request, Response } from "express";
import { appSource } from "../../core/dataBase/db";
import { licenseSubscription } from "./licenseSubscription.model";
import { ValidationException } from "../../core/exception";
import { licenseSubscriptionDto, licenseSubscriptionValidation } from "./licenseSubscription.dto";


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
    try {
        const payload: licenseSubscriptionDto = req.body;
        const validation = licenseSubscriptionValidation.validate(payload);
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
            await licenseRepositry
                .update({ licenseId: payload.licenseId, companyId: payload.companyId }, payload)
                .then(() => {
                    res.status(200).send({
                        IsSuccess: "leads Updated Successfully",
                    });
                })
                .catch((error) => {
                    if (error instanceof ValidationException) {
                        return res.status(400).send({
                            message: error?.message,
                        });
                    }
                    res.status(500).send(error);
                });
            return;
        } else {
            await licenseRepositry.save(payload);
            res.status(200).send({
                IsSuccess: "leads Added Successfully",
            });
        }
    } catch (error) {
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
    try {
        const licenseStatus: licenseSubscription = req.body;
        const licenseRepositry =
            appSource.getRepository(licenseSubscription);
        const licenseFound = await licenseRepositry.findOneBy({
            licenseId: licenseStatus.licenseId, companyId: licenseStatus.companyId
        });
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
        res.status(200).send({
            IsSuccess: `Status for ${licenseFound.companyName} Changed Successfully`,
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

export const deleteLicense = async (req: Request, res: Response) => {
    try {
        const licenseId = req.params.licenseId;
        const companyId = req.params.companyId;
        const licenseRepositry = appSource.getTreeRepository(licenseSubscription);
        const licenseFound = await licenseRepositry.findOneBy({
            licenseId: licenseId, companyId: companyId
        });

        if (!licenseFound) {
            throw new ValidationException("Customer Not Found ");
        }
        await licenseRepositry
            .createQueryBuilder()
            .delete()
            .from(licenseSubscription)
            .where({ licenseId: licenseId, companyId: companyId })
            .execute();

        res.status(200).send({
            IsSuccess: `${licenseFound.companyName} Deleted Successfully `,
        });

    } catch (error) {
        if (error instanceof ValidationException) {
            return res.status(400).send({
                message: error.message,
            });
        }
        res.status(500).send(error);
    }
};