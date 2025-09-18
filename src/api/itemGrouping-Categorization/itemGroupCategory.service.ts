import { Request, Response } from "express";
import { appSource } from "../../core/dataBase/db";
import { ItemGroupCategory } from "./itemGroupCategory.model";
import { ValidationException } from "../../core/exception";
import { ItemGroupCategoryDto, itemGroupCategoryValidation } from "./itemGroupCategory.dto";
import { itemMaster } from "../itemMaster/itemMaster.model";
import { Not } from "typeorm";

export const getGroupCategoryId = async (req: Request, res: Response) => {
    try {
        const companyId = req.params.companyId
        const itemGroupCategoryRepositry =
            appSource.getRepository(ItemGroupCategory);
        let itemGroupId = await itemGroupCategoryRepositry.query(
            `SELECT itemGroupId
            FROM [${process.env.DB_NAME}].[dbo].[item_group_category] where companyId = '${companyId}'
            Group by itemGroupId
            ORDER BY CAST(itemGroupId AS INT) DESC;`
        );
        let id = "0";
        if (itemGroupId?.length > 0) {
            id = itemGroupId[0].itemGroupId;
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

export const addUpdateItemGroupCategory = async (req: Request, res: Response) => {
    try {
        const payload: ItemGroupCategoryDto = req.body;
        // Validate payload schema
        const validation = itemGroupCategoryValidation.validate(payload);
        if (validation.error) {
            throw new ValidationException(validation.error.message);
        }

        const itemGroupCategoryRepositry = appSource.getRepository(ItemGroupCategory);

        // Check if record exists
        const existingDetails = await itemGroupCategoryRepositry.findOneBy({
            itemGroupId: payload.itemGroupId,
            companyId: payload.companyId
        });

        if (existingDetails) {
            const groupNameValidation = await itemGroupCategoryRepositry.findOneBy({
                groupName: payload.groupName,
                itemGroupId: Not(payload.itemGroupId),
                companyId: payload.companyId
            });
            if (groupNameValidation) {
                throw new ValidationException(
                    "Grout Name already exists for this Company."
                );
            }
            // Update existing record
            await itemGroupCategoryRepositry
                .update({ itemGroupId: payload.itemGroupId }, payload)
                .then(() => {
                    res.status(200).send({
                        IsSuccess: "Item Details Updated Successfully",
                    });
                })
                .catch((error) => {
                    res.status(500).send(error);
                });
        } else {
            const groupNameValidation = await itemGroupCategoryRepositry.findOneBy({
                groupName: payload.groupName,
                itemGroupId: Not(payload.itemGroupId),
                companyId: payload.companyId
            });
            if (groupNameValidation) {
                throw new ValidationException(
                    "Grout Name already exists for this Company."
                );
            }
            // Add new record
            await itemGroupCategoryRepositry.save(payload);
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

export const getItemGroupCategoryDetails = async (req: Request, res: Response) => {
    try {
        const companyId = req.params.companyId
        const itemGroupCategoryRepositry =
            appSource.getRepository(ItemGroupCategory);
        const itemGroupandCategory = await itemGroupCategoryRepositry
            .createQueryBuilder("")
            .where({ companyId: companyId })
            .getMany();
        res.status(200).send({
            Result: itemGroupandCategory,
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

export const updateItemGroupCategoryStatus = async (req: Request, res: Response) => {
    try {
        const ItemGroupCategorystatus: ItemGroupCategory = req.body;
        const itemGroupCategoryRepositry =
            appSource.getRepository(ItemGroupCategory);
        const UnitMeasurementFound = await itemGroupCategoryRepositry.findOneBy({
            itemGroupId: ItemGroupCategorystatus.itemGroupId,
            companyId: ItemGroupCategorystatus.companyId
        });
        if (!UnitMeasurementFound) {
            throw new ValidationException("UnitMeasurement Not Found");
        }
        await itemGroupCategoryRepositry
            .createQueryBuilder()
            .update(ItemGroupCategory)
            .set({ status: ItemGroupCategorystatus.status })
            .where({ itemGroupId: ItemGroupCategorystatus.itemGroupId })
            .andWhere({ companyId: ItemGroupCategorystatus.companyId })
            .execute();
        res.status(200).send({
            IsSuccess: `Status for ${UnitMeasurementFound.groupName} Changed Successfully`,
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

export const deleteItemGroupCategory = async (req: Request, res: Response) => {
    try {
        const itemGroupId = req.params.itemGroupId;
        const itemGroupCategoryRepositry = appSource.getRepository(ItemGroupCategory);
        const companyId = req.params.companyId;
        // Check if company exists
        const itemGrpCatFound = await itemGroupCategoryRepositry.findOneBy({
            itemGroupId: itemGroupId, companyId: companyId
        });

        if (!itemGrpCatFound) {
            throw new ValidationException("Company Not Found");
        }

        // Delete using QueryBuilder (explicit cast to string)
        const deleteResult = await itemGroupCategoryRepositry
            .createQueryBuilder()
            .delete()
            .from(ItemGroupCategory)
            .where({ itemGroupId: itemGroupId, companyId: companyId })
            .execute();

        if (deleteResult.affected && deleteResult.affected > 0) {
            res.status(200).send({
                IsSuccess: `${itemGrpCatFound.groupName} Deleted Successfully`,
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