import Joi from "joi"

export interface financialYearCreationDto {
    financialYearId: string
    companyName: string
    financialYear: string
    fromDate: string
    toDate: string
    status: boolean
    cuid?: string
    muid?: string
    companyId: string
    isEdited: boolean
}

export interface financialYearStatusDto {
    financialYearId: string;
    status: boolean;
    companyId: string
}

export const financialYearCreationValidation = Joi.object({
    financialYearId: Joi.string().required(),
    companyName: Joi.string().required(),
    financialYear: Joi.string().required(),
    fromDate: Joi.string().required(),
    toDate: Joi.string().required(),
    status: Joi.boolean().optional().allow(null, ''),
    cuid: Joi.string().optional().allow(null, ''),
    muid: Joi.string().optional().allow(null, ''),
    companyId: Joi.string().required(),
    isEdited: Joi.boolean().optional().allow(null, ''),
})