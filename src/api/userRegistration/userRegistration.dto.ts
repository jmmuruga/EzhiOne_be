import Joi from "joi"

export interface UserDetailsDto {
    userId: string
    userName: string
    Email: string
    Mobile: string
    userType: string
    password: string
    confirmpassword: string
    status: boolean
    cuid?: string
    muid?: string
    companyId: string
}

export interface UserDetailsStatusDto {
    userId: string
    status: boolean
    companyId: string
}

export const userDetailsValidtion = Joi.object({
    userId: Joi.string().required(),
    userName: Joi.string().required(),
    Email: Joi.string().email().required(),
    Mobile: Joi.string().required(),
    userType: Joi.string().required(),
    password: Joi.string().required(),
    confirmpassword: Joi.string().required(),
    status: Joi.boolean().optional().allow(null, ''),
    cuid: Joi.string().optional().allow(null, ''),
    muid: Joi.string().optional().allow(null, ''),
    companyId: Joi.string().required(),
})