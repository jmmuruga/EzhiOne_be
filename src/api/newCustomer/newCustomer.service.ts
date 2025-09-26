import { Request, Response } from "express";
import { appSource } from "../../core/dataBase/db";
import { newCustomer } from "./newCustomer.model";
import { ValidationException } from "../../core/exception";
import { newCustomerDto, newCustomerStatusDto, newCustomerValidation } from "./newCustomer.dto";
import { Not } from "typeorm";

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
    try {
        const payload: newCustomerDto = req.body;
        const validation = newCustomerValidation.validate(payload);
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
            await newCustomerRepositry
                .update({ customerId: payload.customerId, companyId: payload.companyId }, payload)
                .then(() => {
                    res.status(200).send({
                        IsSuccess: "Customer Details Updated Successfully",
                    });
                })
                .catch((error) => {
                    if (error instanceof ValidationException) {
                        return res.status(400).send({
                            message: error?.message,
                        });
                    }
                    res.status(500).send(error);
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
            await newCustomerRepositry.save(payload);
            res.status(200).send({
                IsSuccess: "Customer Details Added Successfully",
            });
        }
    } catch (error) {
        if (error instanceof ValidationException) {
            return res.status(400).send({
                message: error?.message,
            });
        }
        res.status(500).send(error);
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
    try {
        const customerId = req.params.customerId;
        const companyId = req.params.companyId;
        const newCustomerRepositry = appSource.getTreeRepository(newCustomer);
        const newCustomerFound = await newCustomerRepositry.findOneBy({
            customerId: customerId, companyId: companyId
        });

        if (!newCustomerFound) {
            throw new ValidationException("Customer Not Found ");
        }
        await newCustomerRepositry
            .createQueryBuilder()
            .delete()
            .from(newCustomer)
            .where({ customerId: customerId, companyId: companyId })
            .execute();

        res.status(200).send({
            IsSuccess: `${newCustomerFound.customerName} Deleted Successfully `,
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

export const updateNewCustomerStatus = async (req: Request, res: Response) => {
    try {
        const newCustomerStatus: newCustomerStatusDto = req.body;
        const newCustomerRepositry =
            appSource.getRepository(newCustomer);
        const newCustomerFound = await newCustomerRepositry.findOneBy({
            customerId: newCustomerStatus.customerId, companyId: newCustomerStatus.companyId
        });
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
        res.status(200).send({
            IsSuccess: `Status for ${newCustomerFound.customerName} Changed Successfully`,
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