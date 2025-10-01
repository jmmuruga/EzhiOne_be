import { Request, Response } from "express";
import { appSource } from "../../core/dataBase/db";
import { ItemGroupCategory } from "./itemGroupCategory.model";
import { ValidationException } from "../../core/exception";
import { ItemGroupCategoryDto, ItemGroupCategoryStatusDto, itemGroupCategoryValidation } from "./itemGroupCategory.dto";
import { itemMaster } from "../itemMaster/itemMaster.model";
import { Not } from "typeorm";
import { getChangedProperty } from "../../shared/helper";
import { logsDto } from "../logs/logs.dto";
import { InsertLog } from "../logs/logs.service";
import { itemMasterStatusDto } from "../itemMaster/itemMaster.dto";

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
    const payload: ItemGroupCategoryDto = req.body;
    const companyId = payload.companyId;
    const userId = payload.isEdited
        ? payload.muid
        : payload.cuid;
    try {
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
            if (existingDetails) {
                payload.cuid = existingDetails.cuid;
                payload.muid = payload.muid || userId;
            }
            // Update existing record
            await itemGroupCategoryRepositry
                .update({ itemGroupId: payload.itemGroupId, companyId: payload.companyId }, payload)
                .then(async () => {
                    const updatedFields: string = await getChangedProperty([payload], [existingDetails]);
                    const logsPayload: logsDto = {
                        userId: userId,
                        userName: null,
                        statusCode: '200',
                        message: `Item Group/ Categorization Updated For "${payload.groupName}" Updated - Changes: ${updatedFields} By User - `,
                        companyId: companyId
                    };
                    await InsertLog(logsPayload);

                    res.status(200).send({
                        IsSuccess: "Item Details Updated Successfully",
                    });
                })
                .catch(async (error) => {
                    const logsPayload: logsDto = {
                        userId: userId,
                        userName: null,
                        statusCode: '400',
                        message: `Error While Updating Item Group/ Categorization ${payload.groupName} - ${error.message} By User - `,
                        companyId: companyId
                    };
                    await InsertLog(logsPayload);
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

            payload.cuid = userId;
            payload.muid = null;

            // Add new record
            await itemGroupCategoryRepositry.save(payload);

            const logsPayload: logsDto = {
                userId: userId,
                userName: null,
                statusCode: '200',
                message: `Item Group / Categorization "${payload.groupName}" Added By User - `,
                companyId: companyId
            };
            await InsertLog(logsPayload);

            res.status(200).send({
                IsSuccess: "Item Details Added Successfully",
            });
        }
    } catch (error) {
        const logsPayload: logsDto = {
            userId: userId,
            userName: null,
            statusCode: '400',
            message: `Error While Adding/Updating Brand Details ${payload.groupName} - ${error.message} By User - `,
            companyId: companyId
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
        const ItemGroupCategorystatus: ItemGroupCategoryStatusDto = req.body;
        const itemGroupCategoryRepositry =
            appSource.getRepository(ItemGroupCategory);
        const itemsFound = await itemGroupCategoryRepositry.findOneBy({
            itemGroupId: ItemGroupCategorystatus.itemGroupId,
            companyId: ItemGroupCategorystatus.companyId
        });
        if (!itemsFound) {
            throw new ValidationException("UnitMeasurement Not Found");
        }
        await itemGroupCategoryRepositry
            .createQueryBuilder()
            .update(ItemGroupCategory)
            .set({ status: ItemGroupCategorystatus.status })
            .where({ itemGroupId: ItemGroupCategorystatus.itemGroupId })
            .andWhere({ companyId: ItemGroupCategorystatus.companyId })
            .execute();

        const logsPayload: logsDto = {
            userId: ItemGroupCategorystatus.userId,
            userName: null,
            statusCode: '200',
            message: `Item Group/ Categorization Status For ${itemsFound.groupName} changed to ${itemsFound.status} By User`,
            companyId: ItemGroupCategorystatus.companyId
        }
        await InsertLog(logsPayload);

        res.status(200).send({
            IsSuccess: `Status for ${itemsFound.groupName} Changed Successfully`,
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
    const { itemGroupId, companyId, userId } = req.params;

    try {
        const itemGroupCategoryRepositry = appSource.getRepository(ItemGroupCategory);

        // Check if the category exists
        const itemGrpCatFound = await itemGroupCategoryRepositry.findOneBy({
            itemGroupId: itemGroupId,
            companyId: companyId
        });

        if (!itemGrpCatFound) {
            return res.status(404).json({ message: "Item Group Not Found" });
        }

        // Check if this group is used in Item Master
        const usedInItemMaster = await appSource.getRepository(itemMaster)
            .createQueryBuilder("itemMaster")
            .where("itemMaster.itemGroup = :itemGroupId", { itemGroupId })
            .andWhere("itemMaster.companyId = :companyId", { companyId })
            .getCount();

        const logsPayload: logsDto = {
            userId: userId,
            userName: null,
            statusCode: '200',
            message: `Financial Year Creation for: ${itemGrpCatFound.groupName} Deleted By User -  `,
            companyId: companyId,
        }
        await InsertLog(logsPayload)

        if (usedInItemMaster > 0) {
            return res.status(400).json({
                message: `Unable to delete "${itemGrpCatFound.groupName}". It is currently used in Item Master.`
            });
        }

        // Delete the item group
        const deleteResult = await itemGroupCategoryRepositry.delete({
            itemGroupId: itemGroupId,
            companyId: companyId
        });

        if (deleteResult.affected && deleteResult.affected > 0) {
            return res.status(200).json({
                IsSuccess: `${itemGrpCatFound.groupName} Deleted Successfully`
            });
        } else {
            return res.status(500).json({ message: "Delete failed: No rows affected" });
        }

    } catch (error) {
        console.error('Delete Item Group Error:', error);
        res.status(500).json({ message: error?.message || 'Internal Server Error' });
    }
};
