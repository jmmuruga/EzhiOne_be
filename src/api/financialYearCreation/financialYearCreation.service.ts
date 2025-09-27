import { Request, Response } from "express";
import { appSource } from "../../core/dataBase/db";
import { ValidationException } from "../../core/exception";
import { FinancialYearCreation } from "./financialYearCreation.model";
import { financialYearCreationDto, financialYearCreationValidation } from "./financialYearCreation.dto";
import { Not } from "typeorm";

export const getFinancialYearId = async (req: Request, res: Response) => {
    try {
        const companyId = req.params.companyId;
        const financialYearRepositry =
            appSource.getRepository(FinancialYearCreation);
        let financialYearId = await financialYearRepositry.query(
            `SELECT financialYearId
            FROM [${process.env.DB_NAME}].[dbo].[financial_year_creation] where companyId = '${companyId}'
            Group by financialYearId
            ORDER BY CAST(financialYearId AS INT) DESC;`
        );
        let id = "0";
        if (financialYearId?.length > 0) {
            id = financialYearId[0].financialYearId;
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

export const addUpdateFinancialYear = async (req: Request, res: Response) => {
    try {
        const payload: financialYearCreationDto = req.body;

        const userId = payload.isEdited
            ? payload.muid
            : payload.cuid;

        // Validate payload schema
        const validation = financialYearCreationValidation.validate(payload);
        if (validation.error) {
            throw new ValidationException(validation.error.message);
        }

        const financialYearRepositry = appSource.getRepository(FinancialYearCreation);

        // Check if record exists
        const existingDetails = await financialYearRepositry.findOneBy({
            financialYearId: payload.financialYearId,
            companyId: payload.companyId
        });
        if (existingDetails) {
            payload.cuid = existingDetails.cuid;
            payload.muid = payload.muid || userId;
        }

        if (existingDetails) {
            // Update existing record
            await financialYearRepositry
                .update({ financialYearId: payload.financialYearId, companyId: payload.companyId }, payload)
                .then(() => {
                    res.status(200).send({
                        IsSuccess: "Financial Year Details Updated Successfully",
                    });
                })
                .catch((error) => {
                    res.status(500).send(error);
                });
        } else {
            payload.cuid = userId;
            payload.muid = null;

            // Add new record
            await financialYearRepositry.save(payload);
            res.status(200).send({
                IsSuccess: "Financial Year Details Added Successfully",
            });
        }
    } catch (error) {
        if (error instanceof ValidationException) {
            return res.status(400).send({
                message: error.message,
            });
        }
        res.status(500).send(error);
    }
};

export const getFinancialYearDetails = async (req: Request, res: Response) => {
    try {
        const companyId = req.params.companyId;
        const financialYearRepositry =
            appSource.getRepository(FinancialYearCreation);
        const financialYear = await financialYearRepositry
            .createQueryBuilder("")
            .where({ companyId: companyId })
            .getMany();
        res.status(200).send({
            Result: financialYear,
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

export const updateFinancialYearStatus = async (req: Request, res: Response) => {
    try {
        const financialYearstatus: FinancialYearCreation = req.body;
        const financialYearRepositry =
            appSource.getRepository(FinancialYearCreation);
        const financialYearFound = await financialYearRepositry.findOneBy({
            financialYearId: financialYearstatus.financialYearId, companyId: financialYearstatus.companyId
        });
        if (!financialYearFound) {
            throw new ValidationException("Financia Year Not Found");
        }

        if (financialYearstatus.status === true) {
            await financialYearRepositry
                .createQueryBuilder()
                .update(FinancialYearCreation)
                .set({ status: false })
                .where("companyId = :companyId", { companyId: financialYearstatus.companyId })
                .execute();
        }

        await financialYearRepositry
            .createQueryBuilder()
            .update(FinancialYearCreation)
            .set({ status: financialYearstatus.status })
            .where("financialYearId = :financialYearId", { financialYearId: financialYearstatus.financialYearId })
            .andWhere("companyId = :companyId", { companyId: financialYearstatus.companyId })
            .execute();
        res.status(200).send({
            IsSuccess: `Status for ${financialYearFound.companyName} Changed Successfully`,
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

export const deleteFinancialYear = async (req: Request, res: Response) => {
    try {
        const companyId = req.params.companyId;
        const financialYearId = req.params.financialYearId;
        const financialYearRepositry = appSource.getRepository(FinancialYearCreation);

        // Check if company exists
        const financialYearFound = await financialYearRepositry.findOneBy({ financialYearId });
        if (!financialYearFound) {
            throw new ValidationException("Company Not Found");
        }

        // Delete using QueryBuilder (explicit cast to string)
        const deleteResult = await financialYearRepositry
            .createQueryBuilder()
            .delete()
            .from(FinancialYearCreation)
            .where({ financialYearId: financialYearId, companyId: companyId })
            .execute();

        if (deleteResult.affected && deleteResult.affected > 0) {
            res.status(200).send({
                IsSuccess: `${financialYearFound.companyName} Deleted Successfully`,
            });
        } else {
            res.status(500).send({ message: "Delete failed: No rows affected" });
        }

    } catch (error) {
        if (error instanceof ValidationException) {
            return res.status(400).send({ message: error.message });
        }
        res.status(500).send(error);
    }
};