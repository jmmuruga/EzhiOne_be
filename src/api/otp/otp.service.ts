import { Request, Response } from "express";
import nodemailer from 'nodemailer';
import { generateOpt } from "../../shared/helper";
import { otpStore } from "./otp.model";
import { appSource } from "../../core/dataBase/db";
import { ValidationException } from "../../core/exception";

export const getOpt = async (req: Request, res: Response) => {
    try {
        const { userId, purpose } = req.body;

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "savedatain@gmail.com",
                pass: "unpk bcsy ibhp wzrm",
            },
        });

        const GeneratedOtp = generateOpt();

        const mailText = purpose
            ? `Please enter the OTP: ${GeneratedOtp} to ${purpose}.`
            : `Please enter the OTP: ${GeneratedOtp} to proceed.`;

        const mailOptions = {
            from: "savedatain@gmail.com",
            to: "savedataakshaya03@gmail.com",
            subject: "OTP Verification",
            text: mailText,
        };

        await transporter.sendMail(mailOptions);

        const otpRepo = appSource.getRepository(otpStore);
        const otpTablePayload = { otp: GeneratedOtp, userId: userId };
        await otpRepo.save(otpTablePayload);

        return res.status(200).json({
            IsSuccess: `Otp sent successfully!`,
        });
    } catch (error: any) {
        return res.status(500).send({
            message: error?.message || 'Server error',
        });
    }
};

export const VerifyOtpUser = async (req: Request, res: Response) => {
    try {
        const { otp, userId } = req.params;
        console.log("Received OTP for verification:", otp);
        if (!otp) {
            throw new ValidationException("OTP not received");
        }

        const otpRepo = appSource.getRepository(otpStore);

        console.log("Verifying OTP:", otp);

        const storedOtp = await otpRepo.findOne({
            where: { otp: otp, userId: userId }
        });

        console.log("Stored OTP found:", storedOtp);

        if (!storedOtp) {
            throw new ValidationException("Invalid OTP entered!");
        }

        await otpRepo.delete({ otp, userId });

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