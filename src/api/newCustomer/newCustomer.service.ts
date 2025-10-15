import { Request, Response } from "express";
import { appSource } from "../../core/dataBase/db";
import { newCustomer } from "./newCustomer.model";
import { ValidationException } from "../../core/exception";
import { newCustomerDto, newCustomerStatusDto, newCustomerValidation } from "./newCustomer.dto";
import { Not } from "typeorm";
import { getChangedProperty } from "../../shared/helper";
import { logsDto } from "../logs/logs.dto";
import { InsertLog } from "../logs/logs.service";

export const createCustomerId = async (req: Request, res: Response) => {
    try {
        const companyId = req.params.companyId;
        const newCustomerRepositry =
            appSource.getRepository(newCustomer);
        let customerId = await newCustomerRepositry.query(
            `SELECT customerId 
            FROM [${process.env.DB_NAME}].[dbo].[new_customer]  where companyId = '${companyId}'
            Group by customerId 
            ORDER BY CAST(customerId  AS INT) DESC;`
        );
        let id = "0";
        if (customerId?.length > 0) {
            id = customerId[0].customerId;
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

export const addUpdateNewCustomer = async (
    req: Request,
    res: Response
) => {
    const payload: newCustomerDto = req.body;
    const userId = payload.isEdited
        ? payload.muid
        : payload.cuid;

    const companyId = payload.companyId;
    const validation = newCustomerValidation.validate(payload);

    try {
        if (validation.error) {
            throw new ValidationException(validation.error.message);
        }
        const newCustomerRepositry = appSource.getRepository(
            newCustomer
        );
        const existingDetails = await newCustomerRepositry.findOneBy({
            customerId: payload.customerId,
            companyId: payload.companyId
        });
        if (existingDetails) {
            const emailValidation = await newCustomerRepositry.findOneBy({
                email: payload.email,
                customerId: Not(payload.customerId),
            });
            if (emailValidation) {
                throw new ValidationException("Email Address Already Exist");
            }
            const mobileValidation = await newCustomerRepositry.findOneBy(
                {
                    mobile: payload.mobile,
                    customerId: Not(payload.customerId),
                }
            );
            if (mobileValidation) {
                throw new ValidationException("Mobile Number Already Exist");
            }

            if (existingDetails) {
                payload.cuid = existingDetails.cuid;
                payload.muid = payload.muid || userId;
            }

            await newCustomerRepositry
                .update({ customerId: payload.customerId, companyId: payload.companyId }, payload)
                .then(async () => {

                    const updatedFields: string = await getChangedProperty([payload], [existingDetails]);
                    const logsPayload: logsDto = {
                        userId: userId,
                        userName: null,
                        statusCode: '200',
                        message: `New Customer Updated For "${payload.customerName}"  Changed To ${updatedFields} By User-`,
                        companyId: companyId
                    }
                    await InsertLog(logsPayload);

                    res.status(200).send({
                        IsSuccess: "Customer Details Updated Successfully",
                    });
                })
                .catch(async (error) => {
                    const logsPayload: logsDto = {
                        userId: userId,
                        userName: null,
                        statusCode: '400',
                        message: `Error While Updating ${payload.customerName} - ${error.message} By User-`,
                        companyId: companyId
                    }
                    await InsertLog(logsPayload);

                    if (error instanceof ValidationException) {
                        return res.status(400).send({
                            message: error?.message,
                        });
                    }
                    res.status(500).send(error.message);
                });
            return;
        } else {
            const emailValidation = await newCustomerRepositry.findOneBy({
                email: payload.email,
            });
            if (emailValidation) {
                throw new ValidationException("Email Address Already Exist");
            }
            const mobileValidation = await newCustomerRepositry.findOneBy(
                {
                    mobile: payload.mobile,
                }
            );
            if (mobileValidation) {
                throw new ValidationException("Mobile Number Already Exist");
            }

            payload.cuid = userId;
            payload.muid = null;

            await newCustomerRepositry.save(payload);

            const logsPayload: logsDto = {
                userId: userId,
                userName: null,
                statusCode: '200',
                message: `New Customer "${payload.customerName}" Added By User - `,
                companyId: companyId
            }
            await InsertLog(logsPayload);

            res.status(200).send({
                IsSuccess: "Customer Details Added Successfully",
            });
        }
    } catch (error) {

        const logsPayload: logsDto = {
            userId: userId,
            userName: null,
            statusCode: '400',
            message: `Error While Adding Customer "${payload.customerName}" By User - `,
            companyId: companyId
        };
        await InsertLog(logsPayload);

        if (error instanceof ValidationException) {
            return res.status(400).send({
                message: error?.message,
            });
        }
        res.status(500).send(error.message);
    }
};

export const getNewCustomerDetails = async (req: Request, res: Response) => {
    try {
        const companyId = req.params.companyId;
        const newCustomerRepositry = appSource.getRepository(newCustomer);
        const newCustomerRegistor = await newCustomerRepositry
            .createQueryBuilder("")
            .where({ companyId: companyId })
            .getMany();
        res.status(200).send({
            Result: newCustomerRegistor,
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

export const deleteNewCustomer = async (req: Request, res: Response) => {
    const { customerId, companyId, userId } = req.params
    const newCustomerRepositry = appSource.getTreeRepository(newCustomer);
    const newCustomerFound = await newCustomerRepositry.findOneBy({
        customerId: customerId, companyId: companyId
    });

    try {
        if (!newCustomerFound) {
            throw new ValidationException("Customer Not Found ");
        }
        await newCustomerRepositry
            .createQueryBuilder()
            .delete()
            .from(newCustomer)
            .where({ customerId: customerId, companyId: companyId })
            .execute();

        const logsPayload: logsDto = {
            userId: userId,
            userName: null,
            statusCode: '200',
            message: `Customer  "${newCustomerFound.customerName}"  Deleted By USer - `,
            companyId: companyId
        };
        await InsertLog(logsPayload)

        res.status(200).send({
            IsSuccess: `${newCustomerFound.customerName} Deleted Successfully `,
        });

    } catch (error) {
        const logsPayload: logsDto = {
            userId: userId,
            userName: null,
            statusCode: '400',
            message: `Error While Deleting Customer  "${newCustomerFound.customerName}"  By User -  `,
            companyId: companyId,
        }
        await InsertLog(logsPayload);

        if (error instanceof ValidationException) {
            return res.status(400).send({
                message: error.message,
            });
        }
        res.status(500).send(error);
    }
};

export const updateNewCustomerStatus = async (req: Request, res: Response) => {
    const newCustomerStatus: newCustomerStatusDto = req.body;
    const newCustomerRepositry =
        appSource.getRepository(newCustomer);
    const newCustomerFound = await newCustomerRepositry.findOneBy({
        customerId: newCustomerStatus.customerId, companyId: newCustomerStatus.companyId
    });

    try {

        if (!newCustomerFound) {
            throw new ValidationException("Customer Not Found");
        }
        await newCustomerRepositry
            .createQueryBuilder()
            .update(newCustomer)
            .set({ status: newCustomerStatus.status })
            .where({ customerId: newCustomerStatus.customerId })
            .andWhere({ companyId: newCustomerStatus.companyId })
            .execute();

        const logsPayload: logsDto = {
            userId: newCustomerStatus.userId,
            userName: null,
            statusCode: '200',
            message: `Customer Status For "${newCustomerFound.customerName}" Changed To "${newCustomerStatus.status}" By User -`,
            companyId: newCustomerStatus.companyId
        }
        await InsertLog(logsPayload);

        res.status(200).send({
            IsSuccess: `Status for ${newCustomerFound.customerName} Changed Successfully`,
        });
    } catch (error) {

        const logsPayload: logsDto = {
            userId: newCustomerStatus.userId,
            userName: null,
            statusCode: '400',
            message: `Error While Updating Customer Status For "${newCustomerFound.customerName}" changed to "${newCustomerStatus.status}" By User`,
            companyId: newCustomerStatus.companyId
        }
        await InsertLog(logsPayload);

        if (error instanceof ValidationException) {
            return res.status(400).send({
                message: error?.message,
            });
        }
        res.status(500).send(error);
    }
};