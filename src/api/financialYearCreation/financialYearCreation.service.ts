import { Request, Response } from "express";
import { appSource } from "../../core/dataBase/db";
import { ValidationException } from "../../core/exception";
import { FinancialYearCreation } from "./financialYearCreation.model";
import { financialYearCreationDto, financialYearCreationValidation } from "./financialYearCreation.dto";
import { Not } from "typeorm";

export const getFinancialYearId = async (req: Request, res: Response) => {
    try {
        const financialYearRepositry =
            appSource.getRepository(FinancialYearCreation);
        let financialYearId = await financialYearRepositry.query(
            `SELECT financialYearId
            FROM [${process.env.DB_NAME}].[dbo].[financial_year_creation]
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
        console.log("Payload received:", payload);
        // Validate payload schema
        const validation = financialYearCreationValidation.validate(payload);
        if (validation.error) {
            console.error("Validation failed:", validation.error.details);
            throw new ValidationException(validation.error.message);
        }

        const financialYearRepositry = appSource.getRepository(FinancialYearCreation);

        // Check if record exists
        const existingDetails = await financialYearRepositry.findOneBy({
            financialYearId: payload.financialYearId,
        });

        if (existingDetails) {
            const groupNameValidation = await financialYearRepositry.findOneBy({
                companyName: payload.companyName,
                financialYearId: Not(payload.financialYearId),
            });
            if (groupNameValidation) {
                throw new ValidationException(
                    "Company Name already exists for this Company."
                );
            }
            // Update existing record
            await financialYearRepositry
                .update({ financialYearId: payload.financialYearId }, payload)
                .then(() => {
                    res.status(200).send({
                        IsSuccess: "Financial Year Details Updated Successfully",
                    });
                })
                .catch((error) => {
                    res.status(500).send(error);
                });
        } else {
            const groupNameValidation = await financialYearRepositry.findOneBy({
                companyName: payload.companyName,
                financialYearId: Not(payload.financialYearId),
            });
            if (groupNameValidation) {
                throw new ValidationException(
                    "Company Name already exists for this Company."
                );
            }
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
        const financialYearRepositry =
            appSource.getRepository(FinancialYearCreation);
        const financialYear = await financialYearRepositry
            .createQueryBuilder("")
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
            financialYearId: financialYearstatus.financialYearId,
        });
        if (!financialYearFound) {
            throw new ValidationException("Financia Year Not Found");
        }
        await financialYearRepositry
            .createQueryBuilder()
            .update(FinancialYearCreation)
            .set({ status: financialYearstatus.status })
            .where({ financialYearId: financialYearstatus.financialYearId })
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
        const financialYearId = req.params.financialYearId;
        const financialYearRepositry = appSource.getRepository(FinancialYearCreation);

        // Check if company exists
        // console.log("Deleting unitMeasurementId:", unitMeasurementId);
        const financialYearFound = await financialYearRepositry.findOneBy({ financialYearId });
        console.log("Found financial year:", financialYearFound);
        if (!financialYearFound) {
            throw new ValidationException("Company Not Found");
        }

        // Delete using QueryBuilder (explicit cast to string)
        const deleteResult = await financialYearRepositry
            .createQueryBuilder()
            .delete()
            .from(FinancialYearCreation)
            .where("financialYearId = :financialYearId", { financialYearId: String(financialYearId) })
            .execute();

        console.log("Delete Result:", deleteResult);

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
        console.error("Delete Error:", error);
        res.status(500).send(error);
    }
};