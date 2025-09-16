import Joi from "joi";

export interface EmployeeRegistrationDto {
    employeeId: string;
    employeeName: string;
    gender: string;
    employeeMobile: string;
    empEmail: string;
    bloodGroup: string;
    guardianType: string;
    guardianName: string;
    guardianMobile: string;
    dob: string;
    joiningDate: string;
    resignedDate: string;
    designation: string;
    monthlySalary: string;
    workStatus: string;
    empAddress: string;
    employeeImage?: string;
    status?: boolean;
    cuid?: string;
    muid?: string;
}

export interface employeeRegistrationStatusDto {
    employeeId: string;
    status: boolean;
}

export const employeeRegistrationValidation = Joi.object({
    employeeId: Joi.string().required(),
    employeeName: Joi.string().required(),
    gender: Joi.string().required(),
    employeeMobile: Joi.string().required(),
    empEmail: Joi.string().email().required(),
    bloodGroup: Joi.string().required(),
    guardianType: Joi.string().required(),
    guardianName: Joi.string().required(),
    guardianMobile: Joi.string().required(),
    dob: Joi.string().required(),
    joiningDate: Joi.string().required(),
    resignedDate: Joi.string().allow(null, ''),
    designation: Joi.string().required(),
    monthlySalary: Joi.string().required(),
    workStatus: Joi.string().required(),
    empAddress: Joi.string().required(),
    employeeImage: Joi.string().optional().allow(null, ''),
    status: Joi.boolean(),
    cuid: Joi.string().allow(null, ''),
    muid: Joi.string().allow(null, ''),
})