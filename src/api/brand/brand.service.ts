import { Request, Response } from "express";
import { appSource } from "../../core/dataBase/db";
import { Brand } from "./brand.model";
import { ValidationException } from "../../core/exception";
import { brandDto, brandValidation } from "./brand.dto";

export const createBrandId = async (req: Request, res: Response) => {
    try {
        const companyId = req.params.companyId;
        const brandRepositry =
            appSource.getRepository(Brand);
        let brandId = await brandRepositry.query(
            `SELECT brandId 
            FROM [${process.env.DB_NAME}].[dbo].[brand] where companyId = '${companyId}'
            Group by brandId 
            ORDER BY CAST(brandId  AS INT) DESC;`
        );
        let id = "0";
        if (brandId?.length > 0) {
            id = brandId[0].brandId;
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

export const addUpdateBrand = async (req: Request, res: Response) => {
    try {
        const payload: brandDto = req.body;

        const userId = payload.isEdited
            ? payload.muid
            : payload.cuid;

        const validation = brandValidation.validate(payload);
        if (validation.error) {
            throw new ValidationException(validation.error.message);
        }

        const brandRepositry = appSource.getRepository(Brand);
        const existingDetails = await brandRepositry.findOneBy({
            brandId: payload.brandId,
            companyId: payload.companyId
        });
        if (existingDetails) {
            payload.cuid = existingDetails.cuid;
            payload.muid = payload.muid || userId;
        }

        if (existingDetails) {
            await brandRepositry
                .update({ brandId: payload.brandId, companyId: payload.companyId }, payload)
                .then(() => {
                    res.status(200).send({
                        IsSuccess: "Brand Details Updated Successfully",
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

            payload.cuid = userId;
            payload.muid = null;

            await brandRepositry.save(payload);
            res.status(200).send({
                IsSuccess: "Brand Details Added Successfully",
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

export const getBrandDetails = async (req: Request, res: Response) => {
    try {
        const companyId = req.params.companyId;
        const brandRepositry = appSource.getRepository(Brand);
        const brand = await brandRepositry
            .createQueryBuilder("")
            .where({ companyId: companyId })
            .getMany();
        res.status(200).send({
            Result: brand,
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

export const deleteBrand = async (req: Request, res: Response) => {
    try {
        const brandId = req.params.brandId;
        const companyId = req.params.companyId;
        const brandRepositry = appSource.getTreeRepository(Brand);
        const brandFound = await brandRepositry.findOneBy({
            brandId: brandId, companyId: companyId
        });
        if (!brandFound) {
            throw new ValidationException("Brand Not Found ");
        }
        await brandRepositry
            .createQueryBuilder()
            .delete()
            .from(Brand)
            .where({ brandId: brandId, companyId: companyId })
            .execute();
        res.status(200).send({
            IsSuccess: `${brandFound.brandName} Deleted Successfully `,
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

export const updateBrandStatus = async (req: Request, res: Response) => {
    try {
        const brandStatus: Brand = req.body;
        const brandRepositry =
            appSource.getRepository(Brand);
        const brandFound = await brandRepositry.findOneBy({
            brandId: brandStatus.brandId, companyId: brandStatus.companyId
        });
        if (!brandFound) {
            throw new ValidationException("Brand Not Found");
        }
        await brandRepositry
            .createQueryBuilder()
            .update(Brand)
            .set({ status: brandStatus.status })
            .where({ brandId: brandStatus.brandId })
            .andWhere({ companyId: brandStatus.companyId })
            .execute();
        res.status(200).send({
            IsSuccess: `Status for ${brandFound.brandName} Changed Successfully`,
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