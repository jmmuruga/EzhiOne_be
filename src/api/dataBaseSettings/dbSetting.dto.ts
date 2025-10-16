import Joi from "joi";

export interface dbSettingsDto {
    dbSettingsId: string;
    dbStatus: boolean;
    drive: string;
    daily: boolean;
    weekly: boolean;
    monthly: boolean;
    dailyReminderTime?: string;
    weeklyReminderDay?: string;
    weeklyReminderTime?: string;
    monthlyReminderDate?: string;
    monthlyReminderTime?: string;
    cuid?: string;
    muid?: string;
    isEdited?: boolean;
    companyId: string
}

export interface dbSettingsStatusDto {
    dbSettingsId: string;
    dbStatus: boolean;
    userId: string;
    companyId: string
}

export const dbSettingsValidation = Joi.object({
    dbSettingsId: Joi.string().required(),
    dbStatus: Joi.boolean().required(),
    drive: Joi.string().required(),
    daily: Joi.boolean().optional().allow(null, ''),
    weekly: Joi.boolean().optional().allow(null, ''),
    monthly: Joi.boolean().optional().allow(null, ''),
    dailyReminderTime: Joi.string().optional().allow(null, ''),
    weeklyReminderDay: Joi.string().optional().allow(null, ''),
    weeklyReminderTime: Joi.string().optional().allow(null, ''),
    monthlyReminderDate: Joi.string().optional().allow(null, ''),
    monthlyReminderTime: Joi.string().optional().allow(null, ''),
    cuid: Joi.string().optional().allow(null, ''),
    muid: Joi.string().optional().allow(null, ''),
    isEdited: Joi.boolean().optional().allow(null, ''),
    companyId: Joi.string().required()
})