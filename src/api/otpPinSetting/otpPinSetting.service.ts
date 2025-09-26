import { Request, Response } from "express";
import { ValidationException } from "../../core/exception";
import { appSource } from "../../core/dataBase/db";
import { OtpPinSetting } from "./otpPinSetting.model";
import { OtpPinSettingDto, otpPinSettingValidtion } from "./otpPinSetting.dto";
import { decrypter, encryptString, generateOpt } from "../../shared/helper";
import { UserDetails } from "../userRegistration/userRegistration.model";
import nodemailer from 'nodemailer';
import { otpStore } from "../otp/otp.model";
import { companyRegistration } from "../companyRegistration/companyRegistration.model";

// export const getOtpPinId = async (req: Request, res: Response) => {
//     try {
//         const companyId = req.params.companyId;
//         const otpPinRepostory =
//             appSource.getRepository(OtpPinSetting);
//         let otpPinId = await otpPinRepostory.query(
//             `SELECT otpPinId
//             FROM [${process.env.DB_NAME}].[dbo].[otp_pin_setting] where companyId = '${companyId}'
//             Group by otpPinId
//             ORDER BY CAST(otpPinId AS INT) DESC;`
//         );
//         let id = "0";
//         if (otpPinId?.length > 0) {
//             id = otpPinId[0].otpPinId;
//         }
//         const finalRes = Number(id) + 1;
//         res.status(200).send({
//             Result: finalRes,
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

export const addUpdateOtpPinSetting = async (req: Request, res: Response) => {
    try {
        const payload: OtpPinSettingDto = req.body;
        // Validate payload schema
        const validation = otpPinSettingValidtion.validate(payload);
        if (validation.error) {
            throw new ValidationException(validation.error.message);
        }

        const { addPin, editPin, deletePin } = payload;

        // ✅ Custom pin uniqueness validation
        if (addPin === editPin || addPin === deletePin || editPin === deletePin) {
            return res.status(400).send({
                message: "Add, Edit, and Delete pins must all be different.",
            });
        }

        const otpPinRepostory = appSource.getRepository(OtpPinSetting);

        // 🔐 Encrypt fields before saving
        if (payload.addPin) {
            payload.addPin = encryptString(payload.addPin, "ABCXY123");
        }
        if (payload.editPin) {
            payload.editPin = encryptString(payload.editPin, "ABCXY123");
        }
        if (payload.deletePin) {
            payload.deletePin = encryptString(payload.deletePin, "ABCXY123");
        }

        // Check if record exists
        const existingDetails = await otpPinRepostory.findOneBy({
            otpPinId: payload.otpPinId,
            companyId: payload.companyId
        });

        if (existingDetails) {
            // Update existing record
            await otpPinRepostory
                .update({ otpPinId: payload.otpPinId, companyId: payload.companyId }, payload)
                .then(() => {
                    res.status(200).send({
                        IsSuccess: "OTP Pin Setting Updated Successfully",
                    });
                })
                .catch((error) => {
                    res.status(500).send(error);
                });
        } else {
            // Add new record
            await otpPinRepostory.save(payload);
            res.status(200).send({
                IsSuccess: "OTP Pin Added Successfully",
            });
        }
    } catch (error) {
        if (error instanceof ValidationException) {
            return res.status(400).send({
                message: error.message,
            });
        }
        res.status(500).send(error.message);
    }
};

export const getOtpPinDetails = async (req: Request, res: Response) => {
    try {
        const otpPinRepository = appSource.getRepository(OtpPinSetting);
        const companyId = req.params.companyId;
        // Fetch all OTP pin settings
        const otpPins: OtpPinSetting[] = await otpPinRepository.find({
            where: { companyId: companyId },
        });
        const decryptedPins = otpPins.map((x) => {
            try {
                return {
                    ...x,
                    addPin: x.addPin ? decrypter(x.addPin) : x.addPin,
                    editPin: x.editPin ? decrypter(x.editPin) : x.editPin,
                    deletePin: x.deletePin ? decrypter(x.deletePin) : x.deletePin,
                };
            } catch (err) {
                // Return original values if decryption fails
                return x;
            }
        });

        res.status(200).send({
            Result: decryptedPins,
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

export const updateOtpPinStatus = async (req: Request, res: Response) => {
    try {
        const otpPinStatus: OtpPinSetting = req.body;
        const otpPinRepostory =
            appSource.getRepository(OtpPinSetting);
        const otpPinFound = await otpPinRepostory.findOneBy({
            otpPinId: otpPinStatus.otpPinId, companyId: otpPinStatus.companyId
        });
        if (!otpPinFound) {
            throw new ValidationException("OTP pin Not Found");
        }
        await otpPinRepostory
            .createQueryBuilder()
            .update(OtpPinSetting)
            .set({ status: otpPinStatus.status })
            .where({ otpPinId: otpPinStatus.otpPinId })
            .andWhere({ companyId: otpPinStatus.companyId })
            .execute();
        res.status(200).send({
            IsSuccess: `Status for ${otpPinFound.addPin} Changed Successfully`,
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

export const deleteOtpPin = async (req: Request, res: Response) => {
    try {
        const otpPinId = req.params.otpPinId;
        const otpPinRepostory = appSource.getRepository(OtpPinSetting);
        const companyId = req.params.companyId;
        const otpPinFound = await otpPinRepostory.findOneBy({
            otpPinId: otpPinId, companyId: companyId
        });
        if (!otpPinFound) {
            throw new ValidationException("OTP Not Found");
        }

        // Delete using QueryBuilder (explicit cast to string)
        const deleteResult = await otpPinRepostory
            .createQueryBuilder()
            .delete()
            .from(OtpPinSetting)
            .where({ otpPinId: otpPinId, companyId: companyId })
            .execute();


        if (deleteResult.affected && deleteResult.affected > 0) {
            res.status(200).send({
                IsSuccess: `${otpPinFound.addPin} Deleted Successfully`,
            });
        } else {
            res.status(500).send({ message: "Delete failed: No rows affected" });
        }

    } catch (error) {
        if (error instanceof ValidationException) {
            return res.status(400).send({ message: error.message });
        }
        res.status(500).send(error);
    }
};

// export const sendOtp = async (req: Request, res: Response) => {
//     const Email = req.params.Email;
//     try {
//         const userRepository = await appSource.getRepository(UserDetails);
//         let user = await userRepository.findOneBy({
//             Email: Email,
//         });
//         let response: any;
//         const transporter = nodemailer.createTransport({
//             service: "gmail",
//             port: 465,
//             secure: false,
//             auth: {
//                 user: "savedatain@gmail.com",
//                 pass: "unpk bcsy ibhp wzrm",
//             },
//         });
//         const { userName, Mobile, } = user;
//         const Generatedotp = generateOpt();
//         response = await transporter.sendMail({
//             from: "savedatain@gmail.com",
//             to: "savedataakshaya03@gmail.com",
//             subject: `OTP to register ${userName}`,
//             text: `Please enter the OTP: ${Generatedotp} to Register a Super Admin account
//      User Name: ${userName} , Email: ${Email} , Mobile Number: ${Mobile}`,
//         });
//         const otpRepo = appSource.getRepository(otpStore);
//         const otpTablePayload = {
//             userId: user.userId,
//             otp: Generatedotp,
//         };
//         await otpRepo.save(otpTablePayload);
//         res.status(200).send({
//             Result: user,
//         });
//     } catch (error) {
//         if (error instanceof ValidationException) {
//             return res.status(400).send({
//                 message: error,
//             });
//         }
//     }
// };

export const sendOtp = async (req: Request, res: Response) => {
    try {
        const companyId = req.params.companyId; // get companyId from route
        const userRepository = appSource.getRepository(UserDetails);

        // Find the user associated with this company
        const user = await userRepository.findOne({
            where: { companyId: companyId }
        });

        if (!user) {
            throw new ValidationException("User not found for this company");
        }

        const Generatedotp = generateOpt();

        // Send OTP email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            port: 465,
            secure: false,
            auth: {
                user: "savedatain@gmail.com",
                pass: "unpk bcsy ibhp wzrm",
            },
        });

        const { userName, Email, Mobile } = user;

        await transporter.sendMail({
            from: "savedatain@gmail.com",
            to: "savedataakshaya03@gmail.com", // send OTP to the user's email
            subject: `OTP to register ${userName}`,
            text: `Please enter the OTP: ${Generatedotp} to Register a Super Admin account
User Name: ${userName}, Email: ${Email}, Mobile Number: ${Mobile}`,
        });

        // Save OTP in database
        const otpRepo = appSource.getRepository(otpStore);
        await otpRepo.save({
            userId: user.userId, // now guaranteed to exist
            otp: Generatedotp,
        });

        res.status(200).send({
            Result: user,
            Message: "OTP sent successfully",
        });

    } catch (error) {
        if (error instanceof ValidationException) {
            return res.status(400).send({ message: error.message });
        }
        res.status(500).send({ message: "Internal server error", error });
    }
};

// export const VerifyOtp = async (req: Request, res: Response) => {
//     try {
//         const { companyId, otp } = req.params;
//         if (!companyId || !otp) {
//             throw new ValidationException("Invalid companyId or otp received");
//         }
//         const OtpRepo = appSource.getRepository(otpStore);
//         await OtpRepo
//             .createQueryBuilder()
//             .delete()
//             .from(otpStore)
//             .where({ companyId: companyId })
//             .execute();
//         res.status(200).send({
//             IsSuccess: `Otp Verified Successfully...!`,
//         });
//     } catch (error) {
//         if (error instanceof ValidationException) {
//             return res.status(400).send({
//                 message: error.message,
//             });
//         }
//         res.status(500).send(error);
//     }
// };

export const VerifyOtp = async (req: Request, res: Response) => {
    try {
        const { otp } = req.params;

        if (!otp) {
            throw new ValidationException("Invalid OTP received");
        }

        const otpRepo = appSource.getRepository(otpStore);

        // ✅ Just check if OTP exists in table
        const otpRecord = await otpRepo.findOneBy({ otp: otp });

        if (!otpRecord) {
            throw new ValidationException("Invalid or expired OTP");
        }

        // ✅ Delete OTP after verification (one-time use)
        await otpRepo
            .createQueryBuilder()
            .delete()
            .from(otpStore)
            .where({ otp: otp })
            .execute();

        res.status(200).send({
            IsSuccess: "OTP Verified Successfully...!",
        });
    } catch (error) {
        if (error instanceof ValidationException) {
            return res.status(400).send({ message: error.message });
        }
        res.status(500).send(error);
    }
};


