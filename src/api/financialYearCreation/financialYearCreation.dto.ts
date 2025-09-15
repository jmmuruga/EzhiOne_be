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
}

export interface financialYearStatusDto {
    financialYearId: string;
    status: boolean;
}

export const financialYearCreationValidation = Joi.object({
    financialYearId: Joi.string().required(),
    companyName: Joi.string().required(),
    financialYear: Joi.string().required(),
    fromDate: Joi.string().required(),
    toDate: Joi.string().required(),
    status: Joi.boolean().optional(),
    cuid: Joi.string().optional(),
    muid: Joi.string().optional(),
})