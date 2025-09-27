import Joi from "joi"

export interface unitOfMeasurementDto {
    unitMeasurementId: string
    unitShort: string
    unitName: string
    status: boolean
    cuid: string
    muid: string
    companyId: string
    isEdited: boolean
}

export const unitOfMeasurementValidation = Joi.object({
    unitMeasurementId: Joi.string().required(),
    unitShort: Joi.string().required(),
    unitName: Joi.string().required(),
    status: Joi.boolean().optional().allow(null, ''),
    companyId: Joi.string().required(),
    cuid: Joi.string().optional().allow(null, ''),
    muid: Joi.string().optional().allow(null, ''),
    isEdited: Joi.boolean().optional().allow(null, ''),
})

export interface unitOfMeasurementStatusDto {
    unitMeasurementId: string;
    status: boolean;
    companyId: string
}