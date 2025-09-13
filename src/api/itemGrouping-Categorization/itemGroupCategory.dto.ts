import Joi from "joi"

export interface ItemGroupCategoryDto {
    itemGroupId: string
    groupName: string
    status: boolean
    cuid?: string
    muid?: string
}

export interface ItemGroupCategoryStatusDto {
    itemGroupId: string;
    status: boolean;
}

export const itemGroupCategoryValidation = Joi.object({
    itemGroupId: Joi.string().required(),
    groupName: Joi.string().required(),
    status: Joi.boolean().optional(),
    cuid: Joi.string().optional(),
    muid: Joi.string().optional(),
})