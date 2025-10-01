
import { error, log } from "console";
import { appSource } from "../../core/dataBase/db";
import { ValidationException } from "../../core/exception";
import { logsDto } from "../logs/logs.dto";
import { itemMasterDto, itemMasterStatusDto, itemMasterValidation } from "./itemMaster.dto";
import { itemMaster } from "./itemMaster.model";
import { Request, Response } from "express";
import { Not } from "typeorm";
import { getChangedProperty } from "../../shared/helper";
import { InsertLog } from "../logs/logs.service";

export const createItemMasterID = async (req: Request, res: Response) => {
    try {
        const companyId = req.params.companyId
        const itemMasterRepositry =
            appSource.getRepository(itemMaster);
        let itemMasterId = await itemMasterRepositry.query(
            `SELECT itemMasterId 
            FROM [${process.env.DB_NAME}].[dbo].[item_master] where companyId = '${companyId}'
            Group by itemMasterId 
            ORDER BY CAST(itemMasterId  AS INT) DESC;`
        );
        let id = "0";
        if (itemMasterId?.length > 0) {
            id = itemMasterId[0].itemMasterId;
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

export const addUpdateItemMaster = async (req: Request, res: Response) => {
    const payload: itemMasterDto = req.body;

    const userId = payload.isEdited
        ? payload.muid
        : payload.cuid;
    const validation = itemMasterValidation.validate(payload);
    const companyId = payload.companyId
    try {
        if (validation.error) {
            throw new ValidationException(validation.error.message);
        }

        const itemMasterRepository = appSource.getRepository(itemMaster);
        const existingDetails = await itemMasterRepository.findOneBy({
            itemMasterId: payload.itemMasterId,
            companyId: payload.companyId
        });

        if (existingDetails) {
            const itemNameValidation = await itemMasterRepository.findOneBy({
                // itemMasterId: payload.itemMasterId,
                itemName: payload.itemName,
                itemMasterId: Not(payload.itemMasterId),
                companyId: payload.companyId
            });
            if (itemNameValidation) {
                throw new ValidationException(
                    "item name already exists for this Item."
                );
            }
            if (existingDetails) {
                payload.cuid = existingDetails.cuid;
                payload.muid = payload.muid || userId;
            }

            await itemMasterRepository
                .update({ itemMasterId: payload.itemMasterId, companyId: payload.companyId }, payload)
                .then(async () => {
                    const updatedFields: string = await getChangedProperty([payload], [existingDetails]);
                    const logsPayload: logsDto = {
                        userId: userId,
                        userName: null,
                        statusCode: '200',
                        message: `Brand Details Updated For "${payload.itemName}" Updated - Changes: ${updatedFields} By User - `,
                        companyId: companyId
                    }
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
                        message: `Error while updating Item Master for ${payload.itemName} - ${error.message} bu user -`,
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
            const itemNameValidation = await itemMasterRepository.findOneBy({
                itemName: payload.itemName,
                companyId: payload.companyId
            });
            if (itemNameValidation) {
                throw new ValidationException(
                    "Item Name already exists"
                );
            }
        }

        payload.cuid = userId;
        payload.muid = null;

        await itemMasterRepository.save(payload);

        const logsPayload: logsDto = {
            userId: userId,
            userName: null,
            statusCode: '200',
            message: `Item Master For "${payload.itemName}" Added By User -`,
            companyId: companyId
        }
        await InsertLog(logsPayload);

        res.status(200).send({
            IsSuccess: "Item Details Added Successfully",
        });
    } catch (error) {

        const logsPayload: logsDto = {
            userId: userId,
            userName: null,
            statusCode: '400',
            message: `Error While Adding Item Master For ${payload.itemName}- ${error.message} By User-`,
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
};

export const getItemMasterDetails = async (req: Request, res: Response) => {
    try {
        const companyId = req.params.companyId
        const itemMasterRepository = appSource.getRepository(itemMaster);
        const itemmaster = await itemMasterRepository
            .createQueryBuilder("")
            .where({ companyId: companyId })
            .getMany();
        res.status(200).send({
            Result: itemmaster,
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

export const deleteItemMaster = async (req: Request, res: Response) => {
    const { itemMasterId, companyId, userId } = req.params
    try {
        const itemMasterRepository = appSource.getTreeRepository(itemMaster);
        const itemMasterFound = await itemMasterRepository.findOneBy({
            itemMasterId: itemMasterId, companyId: companyId
        });
        if (!itemMasterFound) {
            throw new ValidationException("Item Not Found ");
        }
        await itemMasterRepository
            .createQueryBuilder()
            .delete()
            .from(itemMaster)
            .where({ itemMasterId: itemMasterId, companyId: companyId })
            .execute();

        const logsPayload: logsDto = {
            userId: userId,
            userName: null,
            statusCode: '200',
            message: `Item Master "${itemMasterFound.itemName}" Deleted By User -`,
            companyId: companyId
        }
        await InsertLog(logsPayload);

        res.status(200).send({
            IsSuccess: `${itemMasterFound.itemName} Deleted Successfully `,
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

export const updateItemMasterStatus = async (req: Request, res: Response) => {
    const itemMasterStatus: itemMasterStatusDto = req.body;
    const itemMasterRepository =
        appSource.getRepository(itemMaster);
    const itemMasterFound = await itemMasterRepository.findOneBy({
        itemMasterId: itemMasterStatus.itemMasterId, companyId: itemMasterStatus.companyId
    });
    try {
        if (!itemMasterFound) {
            throw new ValidationException("Item Not Found");
        }
        await itemMasterRepository
            .createQueryBuilder()
            .update(itemMaster)
            .set({ status: itemMasterStatus.status })
            .where({ itemMasterId: itemMasterStatus.itemMasterId })
            .andWhere({ companyId: itemMasterStatus.companyId })
            .execute();

        const logsPayload: logsDto = {
            userId: itemMasterStatus.userId,
            userName: null,
            statusCode: '200',
            message: `Item Master For ${itemMasterFound.itemName} Changed To ${itemMasterFound.status} By User- `,
            companyId: itemMasterStatus.companyId
        }
        await InsertLog(logsPayload);

        res.status(200).send({
            IsSuccess: `Status for ${itemMasterFound.itemName} Changed Successfully`,
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