import { Request, Response } from "express";
import { appSource } from "../../core/dataBase/db";
import { employeeRegistration } from "./employee.model";
import { ValidationException } from "../../core/exception";
import { employeeRegistrationStatusDto, employeeRegistrationValidation } from "./employee.dto";
import { Not } from "typeorm";
import { InsertLog } from "../logs/logs.service";
import { logsDto } from "../logs/logs.dto";
import { getChangedProperty } from "../../shared/helper";

export const getEmployeeId = async (req: Request, res: Response) => {
    try {
        const companyId = req.params.companyId;
        const employeeRegistrationRepositry =
            appSource.getRepository(employeeRegistration);
        let employeeId = await employeeRegistrationRepositry.query(
            `SELECT employeeId
            FROM [${process.env.DB_NAME}].[dbo].[employee_registration] where companyId = '${companyId}'
            Group by employeeId
            ORDER BY CAST(employeeId AS INT) DESC;`
        );
        let id = "0";
        if (employeeId?.length > 0) {
            id = employeeId[0].employeeId;
        }
        const finalRes = Number(id) + 1;
        res.status(200).send({
            Result: finalRes,
        });
    } catch (error) {
        if (error instanceof ValidationException) {
            return res.status(400).send({
                message: error?.message,
            });
        }
        res.status(500).send(error);
    }
};

// export const addUpdateEmployeeRegistration = async (
//     req: Request,
//     res: Response
// ) => {
//     try {
//         const payload: employeeRegistration = req.body;
//         const userId = payload.isEdited
//             ? payload.muid
//             : payload.cuid;

//         const validation = employeeRegistrationValidation.validate(payload);
//         if (validation.error) {
//             throw new ValidationException(validation.error.message);
//         }
//         const employeeRegistrationRepositry =
//             appSource.getRepository(employeeRegistration);
//         const existingDetails = await employeeRegistrationRepositry.findOneBy({
//             employeeId: payload.employeeId,
//             companyId: payload.companyId
//         });

//         if (existingDetails) {
//             payload.cuid = existingDetails.cuid;
//             payload.muid = payload.muid || userId;
//         }

//         if (existingDetails) {
//             const emailValidation = await employeeRegistrationRepositry.findOneBy({
//                 empEmail: payload.empEmail,
//                 employeeId: Not(payload.employeeId),
//                 companyId: payload.companyId
//             });
//             if (emailValidation) {
//                 throw new ValidationException("Email Address Already Exist");
//             }

//             const mobileValidation = await employeeRegistrationRepositry.findOneBy({
//                 employeeMobile: payload.employeeMobile,
//                 employeeId: Not(payload.employeeId),
//                 companyId: payload.companyId
//             });
//             if (mobileValidation) {
//                 throw new ValidationException("Mobile Number Already Exist");
//             }

//             if (payload.workStatus === 'resigned') {
//                 payload.status = false;
//             } else {
//                 payload.status = true;
//             }

//             await employeeRegistrationRepositry
//                 .update({ employeeId: payload.employeeId, companyId: payload.companyId }, payload)
//                 .then(() => {
//                     res.status(200).send({
//                         IsSuccess: "Employee Details Updated Successfully",
//                     });
//                 })
//                 .catch((error) => {
//                     if (error instanceof ValidationException) {
//                         return res.status(400).send({
//                             message: error?.message,
//                         });
//                     }
//                     res.status(500).send(error);
//                 });
//             return;
//         } else {
//             const emailValidation = await employeeRegistrationRepositry.findOneBy({
//                 empEmail: payload.empEmail,
//                 companyId: payload.companyId
//             });
//             if (emailValidation) {
//                 throw new ValidationException("Email Address Already Exist");
//             }
//             const mobileValidation = await employeeRegistrationRepositry.findOneBy({
//                 employeeMobile: payload.employeeMobile,
//                 companyId: payload.companyId
//             });
//             if (mobileValidation) {
//                 throw new ValidationException("Mobile Number Already Exist");
//             }

//             if (payload.workStatus === 'resigned') {
//                 payload.status = false;
//             } else {
//                 payload.status = true;
//             }

//             payload.cuid = userId;
//             payload.muid = null;

//             await employeeRegistrationRepositry.save(payload);
//             res.status(200).send({
//                 IsSuccess: "Employee Details Added successfully",
//             });
//         }
//     } catch (error) {
//         if (error instanceof ValidationException) {
//             return res.status(400).send({
//                 message: error?.message,
//             });
//         }
//         res.status(500).send(error);
//     }
// };

export const addUpdateEmployeeRegistration = async (
    req: Request,
    res: Response
) => {
    const payload: employeeRegistration = req.body;
    const userId = payload.isEdited ? payload.muid : payload.cuid;
    const companyId = payload.companyId;

    try {
        // Validation
        const validation = employeeRegistrationValidation.validate(payload);
        if (validation.error) {
            throw new ValidationException(validation.error.message);
        }

        const employeeRegistrationRepositry = appSource.getRepository(employeeRegistration);
        const existingDetails = await employeeRegistrationRepositry.findOneBy({
            employeeId: payload.employeeId,
            companyId: payload.companyId
        });

        if (existingDetails) {
            // Set cuid and muid
            payload.cuid = existingDetails.cuid;
            payload.muid = payload.muid || userId;

            // Duplicate checks
            const emailValidation = await employeeRegistrationRepositry.findOneBy({
                empEmail: payload.empEmail,
                employeeId: Not(payload.employeeId),
                companyId: payload.companyId
            });
            if (emailValidation) {
                throw new ValidationException("Email Address Already Exist");
            }

            const mobileValidation = await employeeRegistrationRepositry.findOneBy({
                employeeMobile: payload.employeeMobile,
                employeeId: Not(payload.employeeId),
                companyId: payload.companyId
            });
            if (mobileValidation) {
                throw new ValidationException("Mobile Number Already Exist");
            }

            // Set status based on workStatus
            payload.status = payload.workStatus === 'resigned' ? false : true;

            await employeeRegistrationRepositry
                .update({ employeeId: payload.employeeId, companyId: payload.companyId }, payload)
                .then(async () => {
                    const updatedFields: string = await getChangedProperty([payload], [existingDetails]);

                    const logsPayload: logsDto = {
                        userId: userId,
                        userName: null,
                        statusCode: '200',
                        message: `Employee Details Updated for "${payload.employeeName}" - Changes: ${updatedFields} By User - `,
                        companyId: companyId
                    };
                    await InsertLog(logsPayload);

                    res.status(200).send({
                        IsSuccess: "Employee Details Updated Successfully",
                    });
                })
                .catch(async (error) => {
                    const logsPayload: logsDto = {
                        userId: userId,
                        userName: null,
                        statusCode: '400',
                        message: `Error While Updating Employee Details ${payload.employeeName} - ${error.message} By User - `,
                        companyId: companyId
                    };
                    await InsertLog(logsPayload);

                    if (error instanceof ValidationException) {
                        return res.status(400).send({
                            message: error?.message,
                        });
                    }
                    res.status(500).send(error);
                });

        } else {
            // Duplicate checks for add
            const emailValidation = await employeeRegistrationRepositry.findOneBy({
                empEmail: payload.empEmail,
                companyId: payload.companyId
            });
            if (emailValidation) {
                throw new ValidationException("Email Address Already Exist");
            }

            const mobileValidation = await employeeRegistrationRepositry.findOneBy({
                employeeMobile: payload.employeeMobile,
                companyId: payload.companyId
            });
            if (mobileValidation) {
                throw new ValidationException("Mobile Number Already Exist");
            }

            payload.status = payload.workStatus === 'resigned' ? false : true;
            payload.cuid = userId;
            payload.muid = null;

            await employeeRegistrationRepositry.save(payload);

            const logsPayload: logsDto = {
                userId: userId,
                userName: null,
                statusCode: '200',
                message: `Employee Details Added for "${payload.employeeName}" By User - `,
                companyId: companyId
            };
            await InsertLog(logsPayload);

            res.status(200).send({
                IsSuccess: "Employee Details Added successfully",
            });
        }
    } catch (error) {
        const logsPayload: logsDto = {
            userId: userId,
            userName: null,
            statusCode: '400',
            message: `Error While Adding/Updating Employee Details ${payload.employeeName} - ${error.message} By User - `,
            companyId: companyId
        };
        await InsertLog(logsPayload);

        if (error instanceof ValidationException) {
            return res.status(400).send({
                message: error?.message,
            });
        }
        res.status(500).send(error);
    }
};

export const getEmployeeDetails = async (req: Request, res: Response) => {
    try {
        const companyId = req.params.companyId;
        const employeeRegistrationRepositry =
            appSource.getRepository(employeeRegistration);
        const employee = await employeeRegistrationRepositry
            .createQueryBuilder("")
            .where({ companyId: companyId })
            .getMany();
        res.status(200).send({
            Result: employee,
        });
    } catch (error) {
        if (error instanceof ValidationException) {
            return res.status(400).send({
                message: error?.message,
            });
        }
        res.status(500).send(error);
    }
};

export const updateEmployeeStatus = async (req: Request, res: Response) => {
    const employeeStatus: employeeRegistrationStatusDto = req.body;
    const employeeRegistrationRepositry =
        appSource.getRepository(employeeRegistration);
    const emlpoyeeFound = await employeeRegistrationRepositry.findOneBy({
        employeeId: employeeStatus.employeeId, companyId: employeeStatus.companyId
    });
    try {
        if (!emlpoyeeFound) {
            throw new ValidationException("Company Not Found");
        }
        await employeeRegistrationRepositry
            .createQueryBuilder()
            .update(employeeRegistration)
            .set({ status: employeeStatus.status })
            .where({ employeeId: employeeStatus.employeeId, companyId: employeeStatus.companyId })
            .execute();

        const logsPayload: logsDto = {
            userId: employeeStatus.userId,
            userName: null,
            statusCode: '200',
            message: `Employee Status For ${emlpoyeeFound.employeeName} changed to ${emlpoyeeFound.status} By User`,
            companyId: employeeStatus.companyId
        }
        await InsertLog(logsPayload);

        res.status(200).send({
            IsSuccess: `Status for ${emlpoyeeFound.employeeName} Changed Successfully`,
        });
    } catch (error) {
        if (error instanceof ValidationException) {
            return res.status(400).send({
                message: error?.message,
            });
        }
        res.status(500).send(error);
    }
};

export const deleteEmployee = async (req: Request, res: Response) => {
    const { employeeId, userId, companyId } = req.params;

    try {
        const employeeRegistrationRepositry = appSource.getTreeRepository(employeeRegistration);
        const employeeFound = await employeeRegistrationRepositry.findOneBy({
            employeeId: employeeId,
        });
        if (!employeeFound) {
            throw new ValidationException("Employee Not Found ");
        }

        await employeeRegistrationRepositry
            .createQueryBuilder()
            .delete()
            .from(employeeRegistration)
            .where({ employeeId: employeeId, companyId: companyId })
            .execute();

        const logsPayload: logsDto = {
            userId: userId,
            userName: null,
            statusCode: '200',
            message: `Employee : ${employeeFound.employeeName} Deleted By User -  `,
            companyId: companyId,
        }
        await InsertLog(logsPayload);

        res.status(200).send({
            IsSuccess: `${employeeFound.employeeName} Deleted Successfully `,
        });
    } catch (error) {
        if (error instanceof ValidationException) {
            return res.status(400).send({
                message: error.message,
            });
        }

        res.status(500).send(error);
    }
};