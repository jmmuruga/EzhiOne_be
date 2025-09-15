import Joi from "joi"

export interface OtpPinSettingDto {
    otpPinId: string
    addPin: string
    editPin: string
    deletePin: string
    status: boolean
    cuid?: string
    muid?: string
}

export interface otpPinSettingStatusDto {
    otpPinId: string
    status: boolean
}

export const otpPinSettingValidtion = Joi.object({
    otpPinId: Joi.string().required(),
    addPin: Joi.string().required(),
    editPin: Joi.string().required(),
    deletePin: Joi.string().required(),
    status: Joi.boolean().optional(),
    cuid: Joi.string().optional(),
    muid: Joi.string().optional(),
})