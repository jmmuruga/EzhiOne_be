import Joi from "joi";

export interface brandDto {
    brandId: string;
    brandName: string;
    companyName: string;
    brandLogo: string;
    status: boolean;
    cuid: string;
    muid: string;
}

export interface brandStatusDto {
    brandId: string;
    status: boolean;
}

export const brandValidation = Joi.object({
    brandId: Joi.string().required(),
    brandName: Joi.string().required(),
    companyName: Joi.string().required(),
    brandLogo: Joi.string().optional().allow(null, ''),
    status: Joi.boolean().required(),
    cuid: Joi.string().optional().allow(null, ''),
    muid: Joi.string().optional().allow(null, ''),
})