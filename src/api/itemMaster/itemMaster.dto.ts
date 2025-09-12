import Joi from "joi";

export interface itemMasterDto {
    itemMasterId: string,
    itemName: string,
    itemGroup: string,
    hsn: string,
    gstPercentage: string,
    unit: string,
    itemMaster: string,
    status: boolean,
    cuid: string,
    muid: string
}

export const itemMasterValidation = Joi.object({
    itemMasterId: Joi.string().required(),
    itemName: Joi.string().required(),
    itemGroup: Joi.string().required(),
    hsn: Joi.string().required(),
    gstPercentage: Joi.string().required(),
    unit: Joi.string().required(),
    itemMaster: Joi.string().required(),
    status: Joi.boolean().required(),
    cuid: Joi.string().optional().allow(null, ''),
    muid: Joi.string().optional().allow(null, ''),
});

export interface itemMasterStatusDto {
  itemMasterId: string;
  status: boolean;
}