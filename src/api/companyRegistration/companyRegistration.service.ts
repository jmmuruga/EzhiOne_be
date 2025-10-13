import { Not } from "typeorm";
import { appSource } from "../../core/dataBase/db";
import { ValidationException } from "../../core/exception";
import { companyRegistrationDto, companyRegistrationStatusDto, companyRegistrationValidation } from "./companyRegistration.dto";
import { companyRegistration } from "./companyRegistration.model";
import { Request, Response } from "express";
import { InsertLog } from "../logs/logs.service";
import { logsDto } from "../logs/logs.dto";
import { generateOpt, getChangedProperty } from "../../shared/helper";
import nodemailer from 'nodemailer';
import { otpStore } from "../otp/otp.model";

export const getCompanyId = async (req: Request, res: Response) => {
    try {
        const companyRegistrationRepositry =
            appSource.getRepository(companyRegistration);
        let companyId = await companyRegistrationRepositry.query(
            `SELECT companyId
            FROM [${process.env.DB_NAME}].[dbo].[company_registration]
            Group by companyId
            ORDER BY CAST(companyId AS INT) DESC;`
        );
        let id = "0";
        if (companyId?.length > 0) {
            id = companyId[0].companyId;
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

export const addUpdateCompanyRegistration = async (
    req: Request,
    res: Response
) => {
    const payload: companyRegistrationDto = req.body;
    const userId = payload.isEdited ? payload.muid : payload.cuid;
    // console.log(userId , 'user id')
    const companyId = payload.companyId;
    // const userName = (req.body as any).userName || null;
    // const loggedInCompanyId = (req.body as any).loggedInCompanyId || null;
    // const userName = (req.body as any).userName || null;

    try {
        // Validation
        const validation = companyRegistrationValidation.validate(payload);
        if (validation.error) {
            throw new ValidationException(validation.error.message);
        }

        const companyRegistrationRepositry = appSource.getRepository(companyRegistration);
        const existingDetails = await companyRegistrationRepositry.findOneBy({
            companyId: payload.companyId,
        });

        if (existingDetails) {
            // Check duplicate branch & email & mobile
            const companyNameAndBranchValidation = await companyRegistrationRepositry.findOneBy({
                companyName: payload.companyName,
                branch: payload.branch,
                companyId: Not(payload.companyId),
            });
            if (companyNameAndBranchValidation) {
                throw new ValidationException("Branch already exists for this Company.");
            }

            const emailValidation = await companyRegistrationRepositry.findOneBy({
                Email: payload.Email,
                companyId: Not(payload.companyId),
            });
            if (emailValidation) {
                throw new ValidationException("Email Address Already Exist");
            }

            if (payload.branchMobile) {
                const mobileValidation = await companyRegistrationRepositry.findOneBy({
                    branchMobile: payload.branchMobile,
                    companyId: Not(payload.companyId),
                });
                if (mobileValidation) {
                    throw new ValidationException("Mobile Number Already Exist");
                }
            }

            payload.cuid = existingDetails.cuid;
            payload.muid = payload.muid || userId;

            await companyRegistrationRepositry
                .update({ companyId: payload.companyId }, payload)
                .then(async () => {
                    const updatedFields: string = await getChangedProperty([payload], [existingDetails]);

                    const logsPayload: logsDto = {
                        userId: userId,
                        userName: null,
                        statusCode: '200',
                        message: `Company Details Updated for "${payload.companyName}" - Changes: ${updatedFields} By User - `,
                        companyId: companyId
                    };
                    // console.log(logsPayload.userId, logsPayload.companyId, logsPayload.userName, 'log data')
                    await InsertLog(logsPayload);

                    res.status(200).send({
                        IsSuccess: "Company Details Updated Successfully",
                    });
                })
                .catch(async (error) => {
                    const logsPayload: logsDto = {
                        userId: userId,
                        userName: null,
                        statusCode: '400',
                        message: `Error While Updating Company Details For  "${payload.companyName}" - ${error.message} By User - `,
                        companyId: companyId
                    };
                    await InsertLog(logsPayload);

                    if (error instanceof ValidationException) {
                        return res.status(400).send({
                            message: error?.message,
                        });
                    }
                    res.status(500).send(error.message);
                });

        } else {
            // Check duplicate branch & email & mobile
            const companyNameAndBranchValidation = await companyRegistrationRepositry.findOneBy({
                companyName: payload.companyName,
                branch: payload.branch,
            });
            if (companyNameAndBranchValidation) {
                throw new ValidationException("Branch already exists for this company.");
            }

            const emailValidation = await companyRegistrationRepositry.findOneBy({
                Email: payload.Email,
            });
            if (emailValidation) {
                throw new ValidationException("Email Address Already Exist");
            }

            if (payload.branchMobile) {
                const mobileValidation = await companyRegistrationRepositry.findOneBy({
                    branchMobile: payload.branchMobile,
                });
                if (mobileValidation) {
                    throw new ValidationException("Mobile Number Already Exist");
                }
            }

            payload.cuid = userId;
            payload.muid = null;

            await companyRegistrationRepositry.save(payload);

            const logsPayload: logsDto = {
                userId: userId,
                userName: null,
                statusCode: '200',
                message: `Company Details Added for "${payload.companyName}" By User - `,
                companyId: companyId
            };
            await InsertLog(logsPayload);

            res.status(200).send({
                IsSuccess: "Company Details Added successfully",
            });
        }
    } catch (error) {
        const logsPayload: logsDto = {
            userId: userId,
            userName: null,
            statusCode: '400',
            message: `Error While Adding Company Details ${payload.companyName} - ${error.message} By User - `,
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

export const getCompanyDetails = async (req: Request, res: Response) => {
    try {
        const companyRegistrationRepositry =
            appSource.getRepository(companyRegistration);
        const companies = await companyRegistrationRepositry
            .createQueryBuilder("")
            .getMany();
        res.status(200).send({
            Result: companies,
        });
    } catch (error) {
        if (error instanceof ValidationException) {
            return res.status(400).send({
                message: error?.message,
            });
        }
        res.status(500).send(error.message);
    }
};

export const updateCompanyStatus = async (req: Request, res: Response) => {
    const companystatus: companyRegistrationStatusDto = req.body;
    const companyRegistrationRepositry =
        appSource.getRepository(companyRegistration);
    const companyFound = await companyRegistrationRepositry.findOneBy({
        companyId: companystatus.companyId,
    });
    try {
        if (!companyFound) {
            throw new ValidationException("Company Not Found");
        }
        await companyRegistrationRepositry
            .createQueryBuilder()
            .update(companyRegistration)
            .set({ status: companystatus.status })
            .where({ companyId: companystatus.companyId })
            .execute();

        const logsPayload: logsDto = {
            userId: companystatus.userId,
            userName: null,
            statusCode: '200',
            message: `Company Registration Status For ${companyFound.companyName} changed to ${companyFound.status} By User - userId- `,
            companyId: companystatus.companyId
        }
        await InsertLog(logsPayload);

        res.status(200).send({
            IsSuccess: `Status for ${companyFound.companyName} Changed Successfully`,
        });
    } catch (error) {
        const logsPayload: logsDto = {
            userId: companystatus.userId,
            userName: null,
            statusCode: '400',
            message: `Error While Updating Company Status For "${companyFound.companyName}" changed to "${companystatus.status}" By User`,
            companyId: companystatus.companyId
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

export const deleteCompany = async (req: Request, res: Response) => {
    const { userId, companyId } = req.params;
    const companyRepository = appSource.getRepository(companyRegistration);
    const companyFound = await companyRepository.findOneBy({ companyId });
    if (!companyFound) {
        throw new ValidationException("Company Not Found");
    }

    try {
        // Delete using QueryBuilder (explicit cast to string)
        const deleteResult = await companyRepository
            .createQueryBuilder()
            .delete()
            .from(companyRegistration)
            .where("companyId = :companyId", { companyId: String(companyId) })
            .execute();

        const logsPayload: logsDto = {
            userId: userId,
            userName: null,
            statusCode: '200',
            message: `Company : ${companyFound.companyName} Deleted By User -  `,
            companyId: companyId,
        }
        await InsertLog(logsPayload);

        if (deleteResult.affected && deleteResult.affected > 0) {
            res.status(200).send({
                IsSuccess: `${companyFound.companyName} Deleted Successfully`,
            });
        } else {
            res.status(500).send({ message: "Delete failed: No rows affected" });
        }

    } catch (error) {
        const logsPayload: logsDto = {
            userId: userId,
            userName: null,
            statusCode: '400',
            message: `Error While Deleting Company  "${companyFound.companyName}"  By User -  `,
            companyId: companyId,
        }
        await InsertLog(logsPayload);

        if (error instanceof ValidationException) {
            return res.status(400).send({ message: error.message });
        }
        res.status(500).send(error);
    }
};

export const getOpt = async (req: Request, res: Response) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "savedatain@gmail.com",
                pass: "unpk bcsy ibhp wzrm",
            },
        });

        const GeneratedOtp = generateOpt();
        console.log("Generated OTP:", GeneratedOtp);

        const mailOptions = {
            from: "savedatain@gmail.com",
            to: "savedataakshaya03@gmail.com",
            subject: "OTP for Company Registration",
            text: `Please enter the OTP: ${GeneratedOtp} to register your company.`,
        };

        await transporter.sendMail(mailOptions);

        const otpRepo = appSource.getRepository(otpStore);
        const otpTablePayload = { otp: GeneratedOtp };
        await otpRepo.save(otpTablePayload);

        return res.status(200).json({
            IsSuccess: `Otp Send Successfully...!`,
        });
    } catch (error: any) {
        if (error instanceof ValidationException) {
            return res.status(400).send({
                message: error,
            });
        }
    }
};

export const VerifyOtpUser = async (req: Request, res: Response) => {
    try {
        const { otp } = req.params;
        console.log("Received OTP for verification:", otp);
        if (!otp) {
            throw new ValidationException("OTP not received");
        }

        const otpRepo = appSource.getRepository(otpStore);
        console.log("Verifying OTP:", otp);
        const storedOtp = await otpRepo.findOne({ where: { otp } });
        console.log("Stored OTP found:", storedOtp);

        if (!storedOtp) {
            throw new ValidationException("Invalid OTP entered!");
        }

        await otpRepo.delete({ otp });

        return res.status(200).send({
            IsSuccess: `Otp Verified Successfully...!`,
        });


    } catch (error) {
        console.error("Error verifying OTP:", error);

        if (error instanceof ValidationException) {
            return res.status(400).send({
                Result: false,
                Message: error.message,
            });
        }
        res.status(500).send(error.message);
    }
};


