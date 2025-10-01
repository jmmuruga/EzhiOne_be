import Joi from "joi"

export interface leadsDto {
    leadsId: string
    employeeName: string
    mobileNo: string
    mailId: string
    companyName: string
    location: string
    requirement: string
    dateAndTime: string
    leadsFrom: string
    status: boolean
    companyId: string
    cuid: string
    muid: string
    isEdited: boolean
}

export interface leadsStatusDto {
    leadsId: string
    status: boolean
    companyId: string
    userId: string
}

export const leadsValidation = Joi.object({
    leadsId: Joi.string().required(),
    employeeName: Joi.string().required(),
    mobileNo: Joi.string().required(),
    mailId: Joi.string().required(),
    companyName: Joi.string().required(),
    location: Joi.string().required(),
    requirement: Joi.string().required(),
    dateAndTime: Joi.string().required(),
    leadsFrom: Joi.string().required(),
    status: Joi.boolean().optional().allow(null, ''),
    companyId: Joi.string().required(),
    cuid: Joi.string().optional().allow(null, ''),
    muid: Joi.string().optional().allow(null, ''),
    isEdited: Joi.boolean().optional().allow(null, ''),
})