import { stat } from "fs"
import Joi from "joi"

export interface unitOfMeasurementDto {
    unitMeasurementId: string
    unitShort: string
    unitName: string
    status: boolean
    cuid?: string
    muid?: string
}

export const unitOfMeasurementValidation = Joi.object({
    unitMeasurementId: Joi.string().required(),
    unitShort: Joi.string().required(),
    unitName: Joi.string().required(),
    status: Joi.boolean().optional(),
})

export interface unitOfMeasurementStatusDto {
    unitMeasurementId: string;
    status: boolean;
}