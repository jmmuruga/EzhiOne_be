import Joi from "joi"

export interface licenseSubscriptionDto {
    licenseId: string
    companyName: string
    licenseStartDate: string
    licenseExpiryDate: string
    graceDays: string
    status: boolean
    companyId: string
    cuid: string
    muid: string
    isEdited: boolean
}

export interface licenseSubscriptionStatusDto {
    licenseId: string
    status: boolean
    companyId: string
    userId: string
}

export const licenseSubscriptionValidation = Joi.object({
    licenseId: Joi.string().required(),
    companyName: Joi.string().required(),
    licenseStartDate: Joi.string().required(),
    licenseExpiryDate: Joi.string().required(),
    graceDays: Joi.string().required(),
    status: Joi.boolean().optional().allow(null, ''),
    companyId: Joi.string().required(),
    cuid: Joi.string().optional().allow(null, ''),
    muid: Joi.string().optional().allow(null, ''),
    isEdited: Joi.boolean().optional().allow(null, ''),
})