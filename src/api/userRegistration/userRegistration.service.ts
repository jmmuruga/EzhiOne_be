import { Request, Response } from "express";
import { appSource } from "../../core/dataBase/db";
import { UserDetails } from "./userRegistration.model";
import { ValidationException } from "../../core/exception";
import { superAdminPasswordDto, superAdminPasswordValidation, superAdminValidtion, UserDetailsDto, UserDetailsStatusDto, userDetailsValidtion } from "./userRegistration.dto";
import { Not } from "typeorm";
import nodemailer from 'nodemailer';
import { decrypter, encryptString, generateOpt, getChangedProperty } from "../../shared/helper";
import { otpStore } from "../otp/otp.model";
import { InsertLog } from "../logs/logs.service";
import { logsDto } from "../logs/logs.dto";

export const getUserId = async (req: Request, res: Response) => {
    try {
        const companyId = req.params.companyId;
        const userDetailsRepositry =
            appSource.getRepository(UserDetails);
        let userId = await userDetailsRepositry.query(
            `SELECT userId
            FROM [${process.env.DB_NAME}].[dbo].[user_details] where companyId = '${companyId}'
            Group by userId
            ORDER BY CAST(userId AS INT) DESC;`
        );
        let id = "0";
        if (userId?.length > 0) {
            id = userId[0].userId;
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

export const addUpdateUserDetails = async (req: Request, res: Response) => {
    const payload: UserDetailsDto = req.body;
    const companyId = payload.companyId;
    const userId = payload.isEdited
        ? payload.muid
        : payload.cuid;
    try {
        const validation = userDetailsValidtion.validate(payload);
        if (validation.error) {
            throw new ValidationException(validation.error.message);
        }
        const userDetailsRepositry = appSource.getRepository(UserDetails);
        const existingDetails = await userDetailsRepositry.findOneBy({
            userId: payload.userId,
            companyId: payload.companyId
        });
        payload.password = await encryptString(payload.password, "ABCXY123");
        payload.confirmpassword = await encryptString(payload.confirmpassword, "ABCXY123");
        if (existingDetails) {
            const userNameValidation = await userDetailsRepositry.findOneBy({
                userName: payload.userName,
                userId: Not(payload.userId),
                companyId: payload.companyId
            });
            if (userNameValidation) {
                throw new ValidationException("User Name Already Exist ");
            }
            const emailValidation = await userDetailsRepositry.findOneBy({
                Email: payload.Email,
                userId: Not(payload.userId),
                companyId: payload.companyId
            });
            if (emailValidation) {
                throw new ValidationException("Email Address Already Exist ");
            }
            const mobileValidation = await userDetailsRepositry.findOneBy({
                Mobile: payload.Mobile,
                userId: Not(payload.userId),
                companyId: payload.companyId
            });
            if (mobileValidation) {
                throw new ValidationException("Mobile Number Already Exist ");
            }

            if (existingDetails) {
                payload.cuid = existingDetails.cuid;
                payload.muid = payload.muid || userId;
            }

            await userDetailsRepositry
                .update({ userId: payload.userId, companyId: payload.companyId }, payload)
                .then(async (r) => {
                    let updatedFields: string = await getChangedProperty([payload], [existingDetails])
                    const logsPayload: logsDto = {
                        userId: userId,
                        userName: null,
                        statusCode: '200',
                        message: `User Details Updated For"${payload.userName}" Updated -  Changes : ${updatedFields}By User - `,
                        companyId: companyId
                    }
                    await InsertLog(logsPayload);
                    res.status(200).send({
                        IsSuccess: "User Details Updated SuccessFully",
                    });
                })
                .catch(async (error) => {

                    const logsPayload: logsDto = {
                        userId: userId,
                        userName: null,
                        statusCode: '400',
                        message: `Error While Updating User Details ${payload.userName} - ${error.message} By User - `,
                        companyId: companyId
                    }
                    await InsertLog(logsPayload);

                    if (error instanceof ValidationException) {
                        return res.status(400).send({
                            message: error?.message,
                        });
                    }
                    res.status(500).send(error);
                });
            return;
        } else {
            const userNameValidation = await userDetailsRepositry.findOneBy({
                userName: payload.userName,
                companyId: payload.companyId
            });
            if (userNameValidation) {
                throw new ValidationException("User Name Already Exist ");
            }
            const EmailValidation = await userDetailsRepositry.findOneBy({
                Email: payload.Email,
                companyId: payload.companyId
            });
            if (EmailValidation) {
                throw new ValidationException("Email Address Already Exist ");
            }
            const mobileValidation = await userDetailsRepositry.findOneBy({
                Mobile: payload.Mobile,
                companyId: payload.companyId
            });
            if (mobileValidation) {
                throw new ValidationException("Mobile Number Already Exist ");
            }

            payload.cuid = userId
            payload.muid = null

            await userDetailsRepositry.save(payload);

            const logsPayload: logsDto = {
                userId: userId,
                userName: null,
                statusCode: '200',
                message: `User Details ${payload.userName} Added By User - `,
                companyId: companyId
            }
            await InsertLog(logsPayload);

            res.status(200).send({
                IsSuccess: "User Details Added successFully",
            });
        }
    } catch (error) {

        const logsPayload: logsDto = {
            userId: userId,
            userName: null,
            statusCode: '400',
            message: `Error While Adding User Details ${payload.userName} - ${error.message} By User - `,
            companyId: companyId
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

export const getUserDetails = async (req: Request, res: Response) => {
    try {
        const companyId = req.params.companyId;
        const userDetailsRepositry =
            appSource.getRepository(UserDetails);
        const userRegistration = await userDetailsRepositry
            .createQueryBuilder("")
            .where({ companyId: companyId })
            .getMany();
        userRegistration.forEach(element => {
            element.password = decrypter(element.password);
            element.confirmpassword = decrypter(element.confirmpassword);
        });
        res.status(200).send({
            Result: userRegistration,
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

// export const updateUserStatus = async (req: Request, res: Response) => {
//     const userstatus: UserDetailsStatusDto = req.body;
//     // const userRegisterStatus: UserDetails = req.body;
//     const userDetailsRepositry = appSource.getRepository(UserDetails);
//     const userregisterFound = await userDetailsRepositry.findOneBy({
//         userId: userstatus.userId, companyId: userstatus.companyId
//     });
//     try {
//         if (!userregisterFound) {
//             throw new ValidationException("User Not Found");
//         }
//         await userDetailsRepositry
//             .createQueryBuilder()
//             .update(UserDetails)
//             .set({ status: userstatus.status })
//             .where({ userId: userstatus.userId })
//             .andWhere({ companyId: userstatus.companyId })
//             .execute();

//         const logsPayload: logsDto = {
//             userId: userstatus.userId,
//             userName: null,
//             statusCode: '200',
//             message: `User Status For ${userregisterFound.userName} changed to ${userstatus.status} By User - userId- `,
//             companyId: userstatus.companyId
//         }
//         await InsertLog(logsPayload);
//         res.status(200).send({
//             IsSuccess: `Status for ${userregisterFound.userName} Changed Successfully`,
//         });
//     } catch (error) {
//         if (error instanceof ValidationException) {
//             return res.status(400).send({
//                 message: error?.message,
//             });
//         }
//         res.status(500).send(error);
//     }
// };

export const updateUserStatus = async (req: Request, res: Response) => {
    const userstatus: UserDetailsStatusDto = req.body;
    const userRepoistry = appSource.getRepository(UserDetails);
    const userFound = await userRepoistry.findOneBy({
        userId: userstatus.userId,
    });
    try {
        if (!userFound) {
            throw new ValidationException("User Not Found");
        }
        await userRepoistry
            .createQueryBuilder()
            .update(UserDetails)
            .set({ status: userstatus.status })
            .where({ userId: userstatus.userId })
            .execute();
        const logsPayload: logsDto = {
            userId: userstatus.satusUpdatedUser,
            userName: null,
            statusCode: "200",
            message: `User Status For ${userFound.userName} changed to ${userstatus.status} By User - `,
            companyId: userstatus.companyId,
        };
        await InsertLog(logsPayload);
        res.status(200).send({
            IsSuccess: `Status for ${userFound.userName} Changed Successfully`,
        });
    } catch (error) {
        const logsPayload: logsDto = {
            userId: userstatus.satusUpdatedUser,
            userName: null,
            statusCode: "400",
            message: `Error While Changing User Status For ${userFound.userName} to ${userstatus.status} - ${error.message} By User - `,
            companyId: userstatus.companyId,
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

export const deleteUserDetails = async (req: Request, res: Response) => {
    const { userId, deletedUserId, companyId } = req.params;
    const userDetailsRepositry = appSource.getRepository(UserDetails);
    const userregisterFound = await userDetailsRepositry.findOneBy({ userId });

    try {

        if (!userregisterFound) {
            throw new ValidationException("User Not Found");
        }

        // Delete using QueryBuilder (explicit cast to string)
        const deleteResult = await userDetailsRepositry
            .createQueryBuilder()
            .delete()
            .from(UserDetails)
            .where({ userId: userId, companyId: companyId })
            .execute();
        const logsPayload: logsDto = {
            userId: deletedUserId,
            userName: null,
            statusCode: "200",
            message: `User Details : ${userregisterFound.userName} Deleted By User -  `,
            companyId: companyId,
        };
        await InsertLog(logsPayload);

        if (deleteResult.affected && deleteResult.affected > 0) {
            res.status(200).send({
                IsSuccess: `${userregisterFound.userName} Deleted Successfully`,
            });
        } else {
            res.status(500).send({ message: "Delete failed: No rows affected" });
        }

    } catch (error) {
        const logsPayload: logsDto = {
            userId: userId,
            userName: null,
            statusCode: '400',
            message: `Error While Deleting User  "${userregisterFound.userName}"  By User -  `,
            companyId: companyId,
        }
        await InsertLog(logsPayload);

        if (error instanceof ValidationException) {
            return res.status(400).send({ message: error.message });
        }
        res.status(500).send(error);
    }
};

export const SendOtpNewAdminUser = async (req: Request, res: Response) => {
    try {
        const userName = req.params.userName;
        const userId = req.params.userId;
        const Email = req.params.Email;
        const Mobile = req.params.Mobile;
        const userRepository = appSource.getRepository(UserDetails);
        // check whether user already exist
        const userDetail = await userRepository
            .createQueryBuilder("user")
            .where("user.Mobile = :Mobile", {
                Mobile: Mobile,
            })
            .orWhere("user.Email = :Email", { Email: Email })
            .getMany();
        if (userDetail?.length) {
            throw new ValidationException("User already exist");
        }

        const GeneratedOtp = generateOpt();

        // // Save OTP in otpStore table
        // const otpRepo = appSource.getRepository(otpStore);
        // const otpRecord  = otpRepo.create({
        //     userId: userId,
        //     otp: GeneratedOtp
        // });
        // await otpRepo.save(otpRecord );

        let response: any;
        const transporter = nodemailer.createTransport({
            service: "gmail",
            port: 465,
            secure: false,
            auth: {
                user: "savedatain@gmail.com",
                pass: "unpk bcsy ibhp wzrm",
            },
        });
        // const Generatedotp = generateOpt();
        response = await transporter.sendMail({
            from: "savedatain@gmail.com",
            to: "savedataakshaya03@gmail.com",
            subject: `OTP to register ${userName}`,
            text: `Please enter the OTP: ${GeneratedOtp} to Register a Super Admin account
     User Name: ${userName} , Email: ${Email} , Mobile Number: ${Mobile}`,
        });
        const otpRepo = appSource.getRepository(otpStore);
        const otpTablePayload = {
            userId: userId,
            otp: GeneratedOtp
        };
        // //save otp
        await otpRepo.save(otpTablePayload);
        res.status(200).send({
            IsSuccess: "OTP sent successfully",
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

export const getResgiterUserId = async (req: Request, res: Response) => {
    try {
        const Repository = await appSource.getRepository(UserDetails);
        const Userid = await Repository.find({
            skip: 0,
            take: 1,
            order: { newId: "DESC" },
        });
        const id = Userid.length ? +Userid[Userid.length - 1].userId + +1 : 1;
        res.status(200).send({
            Result: id,
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

export const VerifyOtpUser = async (req: Request, res: Response) => {
    try {
        const { userId, otp } = req.params;
        if (!userId || !otp) {
            throw new ValidationException("Invalid userId or otp received");
        }
        const OtpRepo = appSource.getRepository(otpStore);
        await OtpRepo
            .createQueryBuilder()
            .delete()
            .from(otpStore)
            .where({ userId: userId })
            .execute();
        res.status(200).send({
            IsSuccess: `Otp Verified Successfully...!`,
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

export const superAdminResigteration = async (req: Request, res: Response) => {
    const payload: UserDetailsDto = req.body;
    try {
        const validationResponse = superAdminValidtion.validate(payload);
        if (validationResponse.error) {
            throw new ValidationException(validationResponse.error?.message);
        }
        const userRepository = await appSource.getRepository(UserDetails);
        const userDetailFromDb = await userRepository
            .createQueryBuilder("userDetail")
            // .where("userDetail.userId = :userId", {
            //     userId: payload.userId,
            // })
            // .orWhere("userDetail.Email = :Email", {
            //     Email: payload.Email,
            // })
            .where("userDetail.Email = :Email", { Email: payload.Email })
            .getMany();
        if (userDetailFromDb?.length) {
            throw new ValidationException("User alredy exist");
        }
        payload.password = await encryptString(payload.password, "ABCXY123");
        payload.confirmpassword = await encryptString(
            payload.confirmpassword,
            "ABCXY123"
        );
        payload.companyId = '1'
        await userRepository.save(payload);
        res.status(200).send({
            IsSuccess: "User Registered successfully",
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

export const forgetPasswordSendOtp = async (req: Request, res: Response) => {
    const Email = req.params.Email;
    try {
        const userRepository = await appSource.getRepository(UserDetails);
        let user = await userRepository.findOneBy({
            Email: Email,
        });
        if (!user) {
            user = await userRepository.findOneBy({
                Mobile: Email,
            });
        }
        if (!user) {
            throw new ValidationException("User not found");
        }
        if (user.userType !== "5") {
            throw new ValidationException("User is not a Super Admin");
        }
        if (!user.status) {
            throw new ValidationException("User is Inactive, Please contact Admin");
        }
        let response: any;
        const transporter = nodemailer.createTransport({
            service: "gmail",
            port: 465,
            secure: false,
            auth: {
                user: "savedatain@gmail.com",
                pass: "unpk bcsy ibhp wzrm",
            },
        });
        const { userName, Mobile, } = user;
        const Generatedotp = generateOpt();
        response = await transporter.sendMail({
            from: "savedatain@gmail.com",
            to: "savedataakshaya03@gmail.com",
            subject: `OTP to register ${userName}`,
            text: `Please enter the OTP: ${Generatedotp} to Register a Super Admin account
     User Name: ${userName} , Email: ${Email} , Mobile Number: ${Mobile}`,
        });
        const otpRepo = appSource.getRepository(otpStore);
        const otpTablePayload = {
            userId: user.userId,
            otp: Generatedotp,
        };
        await otpRepo.save(otpTablePayload);
        res.status(200).send({
            Result: user,
        });
    } catch (error) {
        if (error instanceof ValidationException) {
            return res.status(400).send({
                message: error,
            });
        }
    }
};

export const updatePassword = async (req: Request, res: Response) => {
    const payload: superAdminPasswordDto = req.body;
    const userRepository = await appSource.getRepository(UserDetails);
    const CheckUser = await userRepository.findOneBy({
        userId: payload.userId,
    });
    try {
        if (!CheckUser) {
            throw new ValidationException("User not found");
        }
        const validationResponse = superAdminPasswordValidation.validate(payload);
        if (validationResponse.error) {
            throw new ValidationException(validationResponse.error?.message);
        }
        const encryptedPassword = await encryptString(payload.password, "ABCXY123");
        const encryptedConfirmPassword = await encryptString(payload.confirmpassword, "ABCXY123");

        await userRepository
            .createQueryBuilder()
            .update(UserDetails)
            .set({
                password: encryptedPassword,
                confirmpassword: encryptedConfirmPassword,
                updated_at: new Date(),
            })
            .where("userId = :userId", { userId: payload.userId })
            .execute();

        res.status(200).send({
            IsSuccess: "Password updated successfully",
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

export const signIn = async (req: Request, res: Response) => {
    try {
        const { EmailorMobile, password } = req.params;
        const encryptedPassword = await encryptString(password, "ABCXY123");
        const userRepository = appSource.getRepository(UserDetails);
        let user = await userRepository.findOneBy({ Email: EmailorMobile });
        if (!user) {
            user = await userRepository.findOneBy({ Mobile: EmailorMobile });
        }

        if (!user) {
            throw new ValidationException("Invalid Email or Mobile!");
        }
        if (user.password != encryptedPassword) {
            throw new ValidationException("Incorrect Password!");
        }

        res.status(200).send({
            IsSuccess: "Signed In Successfully", Result: user,
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

export const resetUserPasswordOtp = async (req: Request, res: Response) => {
    const Email = req.params.Email;
    try {
        const userRepository = await appSource.getRepository(UserDetails);
        let user = await userRepository.findOneBy({
            Email: Email,
        });
        if (!user) {
            user = await userRepository.findOneBy({
                Mobile: Email,
            });
        }
        if (!user) {
            throw new ValidationException("User not found");
        }
        if (user.userType === "5") {
            throw new ValidationException("Super Admin cannot change password here");
        }
        if (!user.status) {
            throw new ValidationException("User is Inactive, Please contact Admin");
        }
        let response: any;
        const transporter = nodemailer.createTransport({
            service: "gmail",
            port: 465,
            secure: false,
            auth: {
                user: "savedatain@gmail.com",
                pass: "unpk bcsy ibhp wzrm",
            },
        });
        const { userName, Mobile, } = user;
        const Generatedotp = generateOpt();
        response = await transporter.sendMail({
            from: "savedatain@gmail.com",
            to: "savedataakshaya03@gmail.com",
            subject: `OTP to register ${userName}`,
            text: `Please enter the OTP: ${Generatedotp} to reset user password for
     User Name: ${userName} , Email: ${Email} , Mobile Number: ${Mobile}`,
        });
        const otpRepo = appSource.getRepository(otpStore);
        const otpTablePayload = {
            userId: user.userId,
            otp: Generatedotp,
        };
        await otpRepo.save(otpTablePayload);
        res.status(200).send({
            Result: user,
        });
    } catch (error) {
        if (error instanceof ValidationException) {
            return res.status(400).send({
                message: error,
            });
        }
    }
};
