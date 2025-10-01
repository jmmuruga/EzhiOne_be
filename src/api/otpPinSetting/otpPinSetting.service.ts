import { Request, Response } from "express";
import { ValidationException } from "../../core/exception";
import { appSource } from "../../core/dataBase/db";
import { OtpPinSetting } from "./otpPinSetting.model";
import { OtpPinSettingDto, otpPinSettingStatusDto, otpPinSettingValidtion } from "./otpPinSetting.dto";
import { decrypter, encryptString, generateOpt, getChangedProperty } from "../../shared/helper";
import { UserDetails } from "../userRegistration/userRegistration.model";
import nodemailer from 'nodemailer';
import { otpStore } from "../otp/otp.model";
import { companyRegistration } from "../companyRegistration/companyRegistration.model";
import { logsDto } from "../logs/logs.dto";
import { InsertLog } from "../logs/logs.service";

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
    const payload: OtpPinSettingDto = req.body;

    const userId = payload.isEdited
        ? payload.muid
        : payload.cuid;

    const companyId = payload.companyId

    const validation = otpPinSettingValidtion.validate(payload);

    try {
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
            payload.muid = payload.muid || userId
        }

        if (existingDetails) {
            // Update existing record
            await otpPinRepostory
                .update({ otpPinId: payload.otpPinId, companyId: payload.companyId }, payload)
                .then(async () => {

                    const updatedFields: string = await getChangedProperty([payload], [existingDetails]);
                    const logsPayload: logsDto = {
                        userId: userId,
                        userName: null,
                        statusCode: '200',
                        message: `OTP Pin Setting Updated For "${payload.companyId}" updated - Chnages ${updatedFields} By User - `,
                        companyId: companyId
                    }
                    await InsertLog(logsPayload);

                    res.status(200).send({
                        IsSuccess: "OTP Pin Setting Updated Successfully",
                    });
                })
                .catch(async (error) => {
                    const logsPayload: logsDto = {
                        userId: userId,
                        userName: null,
                        statusCode: '400',
                        message: `Error While Updating OTP Pin Settings For "${payload.companyId}" - ${error.message} By User -`,
                        companyId: companyId
                    }
                    await InsertLog(logsPayload);

                    res.status(500).send(error.message);
                });
        } else {

            payload.cuid = userId
            payload.muid = null
            // Add new record
            await otpPinRepostory.save(payload);

            const logsPayload: logsDto = {
                userId: userId,
                userName: null,
                statusCode: '200',
                message: `OTP Pin Setting For "${payload.companyId}"  Added By User -`,
                companyId: companyId
            }
            await InsertLog(logsPayload);

            res.status(200).send({
                IsSuccess: "OTP Pin Added Successfully",
            });
        }
    } catch (error) {

        const logsPayload: logsDto = {
            userId: userId,
            userName: null,
            statusCode: '400',
            message: `Error While Adding OTP Pin Setting For "${payload.companyId}" By User -`,
            companyId: companyId
        }
        await InsertLog(logsPayload);

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
        res.status(500).send(error.message);
    }
};

export const updateOtpPinStatus = async (req: Request, res: Response) => {
    try {
        const otpPinStatus: otpPinSettingStatusDto = req.body;
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

        const logsPayload: logsDto = {
            userId: otpPinStatus.userId,
            userName: null,
            statusCode: '200',
            message: `OTP Pin Setting Status For Company Id"${otpPinFound.companyId}" Changed To "${otpPinStatus.status}" By User - `,
            companyId: otpPinStatus.companyId
        }
        await InsertLog(logsPayload);

        res.status(200).send({
            IsSuccess: `Status for Company Id${otpPinFound.addPin} Changed Successfully`,
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
    const { otpPinId, companyId, userId } = req.params
    try {
        const otpPinRepostory = appSource.getRepository(OtpPinSetting);
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

        const logsPayload: logsDto = {
            userId: userId,
            userName: null,
            statusCode: '200',
            message: `OTP Pin Setting Deleted For Comapny Id"${otpPinFound.companyId}"  By User -`
        }
        await InsertLog(logsPayload);

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
            text: `Please enter the OTP: ${Generatedotp} to update OTP pin settings of ${userName}, Email: ${Email}, Mobile Number: ${Mobile}`,
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


