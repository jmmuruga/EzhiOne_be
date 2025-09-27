import Joi from "joi"

export interface companyRegistrationDto {
    companyId: string
    companyStart: string
    companyName: string
    companyShortName: string
    doorNumber: string
    buildingName: string
    Street: string
    Email: string
    Location: string
    pinCode: string
    Post: string
    Taluk: string
    District: string
    gstNumber: string
    panNumber: string
    Website: string
    officeNumber: string
    branch: string
    branchMobile: string
    status: boolean
    companyImage: string
    cuid?: string
    muid?: string
    isEdited: boolean
}

export const companyRegistrationValidation = Joi.object({
    companyId: Joi.string().required(),
    companyStart: Joi.string().required(),
    companyName: Joi.string().required(),
    companyShortName: Joi.string().optional().allow(null, ""),
    doorNumber: Joi.string().required(),
    buildingName: Joi.string().required(),
    Street: Joi.string().required(),
    Email: Joi.string().email().required(),
    Location: Joi.string().required(),
    pinCode: Joi.string().required(),
    Post: Joi.string().required(),
    Taluk: Joi.string().required(),
    District: Joi.string().required(),
    gstNumber: Joi.string().required(),
    panNumber: Joi.string().required(),
    Website: Joi.string().required(),
    officeNumber: Joi.string().required(),
    branch: Joi.string().required(),
    branchMobile: Joi.string().optional().allow(null, ""),
    status: Joi.boolean().optional().allow(null, ""),
    cuid: Joi.string().optional(),
    muid: Joi.string().optional(),
    companyImage: Joi.string().optional().allow(null, ""),
    isEdited: Joi.boolean().optional().allow(null, ""),
})

export interface companyRegistrationStatusDto {
    companyId: string;
    status: boolean;
}