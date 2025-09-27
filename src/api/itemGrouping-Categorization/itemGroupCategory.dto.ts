import Joi from "joi"

export interface ItemGroupCategoryDto {
    itemGroupId: string
    groupName: string
    status: boolean
    cuid?: string
    muid?: string
    companyId: string
    isEdited: boolean
}

export interface ItemGroupCategoryStatusDto {
    itemGroupId: string;
    status: boolean;
    companyId: string
}

export const itemGroupCategoryValidation = Joi.object({
    itemGroupId: Joi.string().required(),
    groupName: Joi.string().required(),
    status: Joi.boolean().optional().allow(null, ''),
    cuid: Joi.string().optional().allow(null, ''),
    muid: Joi.string().optional().allow(null, ''),
    companyId: Joi.string().required(),
    isEdited: Joi.boolean().optional().allow(null, ''),
})