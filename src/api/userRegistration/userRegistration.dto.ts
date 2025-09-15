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
}

export interface UserDetailsStatusDto {
    userId: string
    status: boolean
}

export const userDetailsValidtion = Joi.object({
    userId: Joi.string().required(),
    userName: Joi.string().required(),
    Email: Joi.string().email().required(),
    Mobile: Joi.string().required(),
    userType: Joi.string().required(),
    password: Joi.string().required(),
    confirmpassword: Joi.string().required(),
    status: Joi.boolean().optional(),
    cuid: Joi.string().optional(),
    muid: Joi.string().optional(),
})