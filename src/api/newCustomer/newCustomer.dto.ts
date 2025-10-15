import Joi from "joi"

export interface newCustomerDto {
    customerId: string
    customerName: string
    mobile: string
    alterMobile: string
    whatsappNumber: string
    email: string
    doorNumber: string
    street: string
    landmark: string
    location: string
    post: string
    taluk: string
    district: string
    pincode: string
    companyName: string
    cuid: string;
    muid: string;
    companyId: string
    isEdited: boolean
}

export interface newCustomerStatusDto {
    customerId: string
    status: boolean;
    companyId: string;
    userId: string
}

export const newCustomerValidation = Joi.object({
    customerId: Joi.string().required(),
    customerName: Joi.string().required(),
    mobile: Joi.string().required(),
    alterMobile: Joi.string().optional().allow(null, ''),
    whatsappNumber: Joi.string().optional().allow(null, ''),
    email: Joi.string().required(),
    doorNumber: Joi.string().required(),
    street: Joi.string().required(),
    landmark: Joi.string().required(),
    location: Joi.string().required(),
    post: Joi.string().required(),
    taluk: Joi.string().required(),
    district: Joi.string().required(),
    pincode: Joi.string().required(),
    companyName: Joi.string().optional().allow(null, ''),
    cuid: Joi.string().optional().allow(null, ''),
    muid: Joi.string().optional().allow(null, ''),
    companyId: Joi.string().required(),
    status: Joi.boolean().optional().allow(null, ''),
    isEdited: Joi.boolean().optional().allow(null, ''),
})