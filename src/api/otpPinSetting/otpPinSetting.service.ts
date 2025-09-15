import { Request, Response } from "express";
import { ValidationException } from "../../core/exception";
import { appSource } from "../../core/dataBase/db";
import { OtpPinSetting } from "./otpPinSetting.model";
import { OtpPinSettingDto, otpPinSettingValidtion } from "./otpPinSetting.dto";
import { decrypter, encryptString } from "../../shared/helper";

export const getOtpPinId = async (req: Request, res: Response) => {
    try {
        const otpPinRepostory =
            appSource.getRepository(OtpPinSetting);
        let otpPinId = await otpPinRepostory.query(
            `SELECT otpPinId
            FROM [${process.env.DB_NAME}].[dbo].[otp_pin_setting]
            Group by otpPinId
            ORDER BY CAST(otpPinId AS INT) DESC;`
        );
        let id = "0";
        if (otpPinId?.length > 0) {
            id = otpPinId[0].otpPinId;
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

// export const addUpdateOtpPinSetting = async (req: Request, res: Response) => {
//     try {
//         const payload: OtpPinSettingDto = req.body;
//         console.log("Payload received:", payload);
//         // Validate payload schema
//         const validation = otpPinSettingValidtion.validate(payload);
//         if (validation.error) {
//             console.error("Validation failed:", validation.error.details);
//             throw new ValidationException(validation.error.message);
//         }

//         const otpPinRepostory = appSource.getRepository(OtpPinSetting);

//         // Check if record exists
//         const existingDetails = await otpPinRepostory.findOneBy({
//             otpPinId: payload.otpPinId,
//         });

//         if (existingDetails) {
//             // Update existing record
//             await otpPinRepostory
//                 .update({ otpPinId: payload.otpPinId }, payload)
//                 .then(() => {
//                     res.status(200).send({
//                         IsSuccess: "OTP Pin Setting Updated Successfully",
//                     });
//                 })
//                 .catch((error) => {
//                     res.status(500).send(error);
//                 });
//         } else {

//             // Add new record
//             await otpPinRepostory.save(payload);
//             res.status(200).send({
//                 IsSuccess: "OTP Pin Added Successfully",
//             });
//         }
//     } catch (error) {
//         if (error instanceof ValidationException) {
//             return res.status(400).send({
//                 message: error.message,
//             });
//         }
//         res.status(500).send(error);
//     }
// };

export const addUpdateOtpPinSetting = async (req: Request, res: Response) => {
    try {
        const payload: OtpPinSettingDto = req.body;
        console.log("Payload received:", payload);

        // Validate payload schema
        const validation = otpPinSettingValidtion.validate(payload);
        if (validation.error) {
            console.error("Validation failed:", validation.error.details);
            throw new ValidationException(validation.error.message);
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
        });

        if (existingDetails) {
            // Update existing record
            await otpPinRepostory
                .update({ otpPinId: payload.otpPinId }, payload)
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
        res.status(500).send(error);
    }
};

// export const getOtpPinDetails = async (req: Request, res: Response) => {
//     try {
//         const otpPinRepostory =
//             appSource.getRepository(OtpPinSetting);
//         const otpPin = await otpPinRepostory
//             .createQueryBuilder("")
//             .getMany();
//         res.status(200).send({
//             Result: otpPin,
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

export const getOtpPinDetails = async (req: Request, res: Response) => {
    try {
        const otpPinRepository = appSource.getRepository(OtpPinSetting);

        // Fetch all OTP pin settings
        const otpPins: OtpPinSetting[] = await otpPinRepository.find();

        // Decrypt each pin safely
        const decryptedPins = otpPins.map((x) => {
            try {
                return {
                    ...x,
                    addPin: x.addPin ? decrypter(x.addPin) : x.addPin,
                    editPin: x.editPin ? decrypter(x.editPin) : x.editPin,
                    deletePin: x.deletePin ? decrypter(x.deletePin) : x.deletePin,
                };
            } catch (err) {
                console.error("Decryption error for record:", x, err);
                // Return original values if decryption fails
                return x;
            }
        });

        res.status(200).send({
            Result: decryptedPins,
        });
    } catch (error) {
        console.error("Error fetching OTP pin details:", error);
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
            otpPinId: otpPinStatus.otpPinId,
        });
        if (!otpPinFound) {
            throw new ValidationException("OTP pin Not Found");
        }
        await otpPinRepostory
            .createQueryBuilder()
            .update(OtpPinSetting)
            .set({ status: otpPinStatus.status })
            .where({ otpPinId: otpPinStatus.otpPinId })
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

        const otpPinFound = await otpPinRepostory.findOneBy({ otpPinId });
        console.log("Found OTP year:", otpPinFound);
        if (!otpPinFound) {
            throw new ValidationException("OTP Not Found");
        }

        // Delete using QueryBuilder (explicit cast to string)
        const deleteResult = await otpPinRepostory
            .createQueryBuilder()
            .delete()
            .from(OtpPinSetting)
            .where("otpPinId = :otpPinId", { otpPinId: String(otpPinId) })
            .execute();

        console.log("Delete Result:", deleteResult);

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
        console.error("Delete Error:", error);
        res.status(500).send(error);
    }
};