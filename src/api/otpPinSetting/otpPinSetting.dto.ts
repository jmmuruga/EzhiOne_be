import Joi from "joi"

export interface OtpPinSettingDto {
    otpPinId: string
    addPin: string
    editPin: string
    deletePin: string
    status: boolean
    companyId: string
    cuid: string
    muid: string
    isEdited: boolean
}

export interface otpPinSettingStatusDto {
    otpPinId: string
    status: boolean
    companyId: string
}

export const otpPinSettingValidtion = Joi.object({
    otpPinId: Joi.string().required(),
    addPin: Joi.string().required(),
    editPin: Joi.string().required(),
    deletePin: Joi.string().required(),
    status: Joi.boolean().optional().allow(null, ''),
    companyId: Joi.string().required(),
    cuid: Joi.string().optional().allow(null, ''),
    muid: Joi.string().optional().allow(null, ''),
    isEdited: Joi.boolean().optional().allow(null, ''),

})