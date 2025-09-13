import { Request, Response } from "express";
import { appSource } from "../../core/dataBase/db";
import { unitOfMeasurement } from "./unitofMeasurement.model";
import { ValidationException } from "../../core/exception";
import { unitOfMeasurementDto, unitOfMeasurementValidation } from "./unitofMeasurement.dto";
import { Not } from "typeorm";

export const getUnitMeasurementId = async (req: Request, res: Response) => {
    try {
        const unitMeasurementRepositry =
            appSource.getRepository(unitOfMeasurement);
        let unitMeasurementId = await unitMeasurementRepositry.query(
            `SELECT unitMeasurementId
            FROM [${process.env.DB_NAME}].[dbo].[unit_of_measurement]
            Group by unitMeasurementId
            ORDER BY CAST(unitMeasurementId AS INT) DESC;`
        );
        let id = "0";
        if (unitMeasurementId?.length > 0) {
            id = unitMeasurementId[0].unitMeasurementId;
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

export const addUpdateUnitMeasurement = async (req: Request, res: Response) => {
    try {
        const payload: unitOfMeasurementDto = req.body;
        console.log("Payload received:", payload);
        // Validate payload schema
        const validation = unitOfMeasurementValidation.validate(payload);
        if (validation.error) {
            console.error("Validation failed:", validation.error.details);
            throw new ValidationException(validation.error.message);
        }

        const unitMeasurementRepository = appSource.getRepository(unitOfMeasurement);

        // Check if record exists
        const existingDetails = await unitMeasurementRepository.findOneBy({
            unitMeasurementId: payload.unitMeasurementId,
        });

        if (existingDetails) {
            const unitShortValidation = await unitMeasurementRepository.findOneBy({
                unitShort: payload.unitShort,
                unitMeasurementId: Not(payload.unitMeasurementId),
            })
            if (unitShortValidation) {
                throw new ValidationException(
                    "UnitShort already exists for this Company."
                );
            }
            // Update existing record
            await unitMeasurementRepository
                .update({ unitMeasurementId: payload.unitMeasurementId }, payload)
                .then(() => {
                    res.status(200).send({
                        IsSuccess: "Item Details Updated Successfully",
                    });
                })
                .catch((error) => {
                    res.status(500).send(error);
                });
        } else {
            const unitShortValidation = await unitMeasurementRepository.findOneBy({
                unitShort: payload.unitShort,
                unitMeasurementId: Not(payload.unitMeasurementId),
            })
            if (unitShortValidation) {
                throw new ValidationException(
                    "UnitShort already exists for this Company."
                );
            }
            // Add new record
            await unitMeasurementRepository.save(payload);
            res.status(200).send({
                IsSuccess: "Item Details Added Successfully",
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

export const getUnitMeasurementDetails = async (req: Request, res: Response) => {
    try {
        const unitMeasurementRepository =
            appSource.getRepository(unitOfMeasurement);
        const unitMeasurement = await unitMeasurementRepository
            .createQueryBuilder("")
            .getMany();
        res.status(200).send({
            Result: unitMeasurement,
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

export const updateUnitMeasurementStatus = async (req: Request, res: Response) => {
    try {
        const UnitMeasurementstatus: unitOfMeasurement = req.body;
        const unitMeasurementRepository =
            appSource.getRepository(unitOfMeasurement);
        const UnitMeasurementFound = await unitMeasurementRepository.findOneBy({
            unitMeasurementId: UnitMeasurementstatus.unitMeasurementId,
        });
        if (!UnitMeasurementFound) {
            throw new ValidationException("UnitMeasurement Not Found");
        }
        await unitMeasurementRepository
            .createQueryBuilder()
            .update(unitOfMeasurement)
            .set({ status: UnitMeasurementstatus.status })
            .where({ unitMeasurementId: UnitMeasurementstatus.unitMeasurementId })
            .execute();
        res.status(200).send({
            IsSuccess: `Status for ${UnitMeasurementFound.unitShort} Changed Successfully`,
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

export const deleteUnitMeasurement = async (req: Request, res: Response) => {
    try {
        const unitMeasurementId = req.params.unitMeasurementId;
        const unitMeasurementRepository = appSource.getRepository(unitOfMeasurement);

        // Check if company exists
        // console.log("Deleting unitMeasurementId:", unitMeasurementId);
        const unitMeasurementFound = await unitMeasurementRepository.findOneBy({ unitMeasurementId });
        console.log("Found unitMeasurement:", unitMeasurementFound);
        if (!unitMeasurementFound) {
            throw new ValidationException("Company Not Found");
        }

        // Delete using QueryBuilder (explicit cast to string)
        const deleteResult = await unitMeasurementRepository
            .createQueryBuilder()
            .delete()
            .from(unitOfMeasurement)
            .where("unitMeasurementId = :unitMeasurementId", { unitMeasurementId: String(unitMeasurementId) })
            .execute();

        console.log("Delete Result:", deleteResult);

        if (deleteResult.affected && deleteResult.affected > 0) {
            res.status(200).send({
                IsSuccess: `${unitMeasurementFound.unitShort} Deleted Successfully`,
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
