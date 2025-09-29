import Joi from "joi";

export interface brandDto {
    brandId: string;
    brandName: string;
    companyName: string;
    brandLogo: string;
    status: boolean;
    cuid: string;
    muid: string;
    companyId: string
    isEdited: boolean
}

export interface brandStatusDto {
    brandId: string;
    status: boolean;
    companyId: string
    satusUpdatedUser: string
}

export const brandValidation = Joi.object({
    brandId: Joi.string().required(),
    brandName: Joi.string().required(),
    companyName: Joi.string().required(),
    brandLogo: Joi.string().optional().allow(null, ''),
    status: Joi.boolean().optional().allow(null, ''),
    cuid: Joi.string().optional().allow(null, ''),
    muid: Joi.string().optional().allow(null, ''),
    companyId: Joi.string().required(),
    isEdited: Joi.boolean().optional().allow(null, ''),
})