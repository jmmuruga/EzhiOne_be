import { Request, Response } from "express";
import { appSource } from "../../core/dataBase/db";
import { UserDetails } from "./userRegistration.model";
import { ValidationException } from "../../core/exception";
import { UserDetailsDto, userDetailsValidtion } from "./userRegistration.dto";
import { Not } from "typeorm";

export const getUserId = async (req: Request, res: Response) => {
    try {
        const userDetailsRepositry =
            appSource.getRepository(UserDetails);
        let userId = await userDetailsRepositry.query(
            `SELECT userId
            FROM [${process.env.DB_NAME}].[dbo].[user_details]
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
    try {
        const payload: UserDetailsDto = req.body;
        console.log("Payload received:", payload);
        const validation = userDetailsValidtion.validate(payload);
        if (validation.error) {
            throw new ValidationException(validation.error.message);
        }
        const userDetailsRepositry = appSource.getRepository(UserDetails);
        const existingDetails = await userDetailsRepositry.findOneBy({
            userId: payload.userId,
        });
        if (existingDetails) {
            const userNameValidation = await userDetailsRepositry.findOneBy({
                userName: payload.userName,
                userId: Not(payload.userId),
            });
            if (userNameValidation) {
                throw new ValidationException("User Name Already Exist ");
            }
            const emailValidation = await userDetailsRepositry.findOneBy({
                Email: payload.Email,
                userId: Not(payload.userId),
            });
            if (emailValidation) {
                throw new ValidationException("Email Address Already Exist ");
            }
            const mobileValidation = await userDetailsRepositry.findOneBy({
                Mobile: payload.Mobile,
                userId: Not(payload.userId),
            });
            if (mobileValidation) {
                throw new ValidationException("Mobile Number Already Exist ");
            }
            await userDetailsRepositry
                .update({ userId: payload.userId }, payload)
                .then(async (r) => {
                    res.status(200).send({
                        IsSuccess: "User Details Updated SuccessFully",
                    });
                })
                .catch(async (error) => {
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
            });
            if (userNameValidation) {
                throw new ValidationException("User Name Already Exist ");
            }
            const EmailValidation = await userDetailsRepositry.findOneBy({
                Email: payload.Email,
            });
            if (EmailValidation) {
                throw new ValidationException("Email Address Already Exist ");
            }
            const mobileValidation = await userDetailsRepositry.findOneBy({
                Mobile: payload.Mobile,
            });
            if (mobileValidation) {
                throw new ValidationException("Mobile Number Already Exist ");
            }
            await userDetailsRepositry.save(payload);
            res.status(200).send({
                IsSuccess: "User Details Added successFully",
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

export const getUserDetails = async (req: Request, res: Response) => {
    try {
        const userDetailsRepositry =
            appSource.getRepository(UserDetails);
        const userRegistration = await userDetailsRepositry
            .createQueryBuilder("")
            .getMany();
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

export const updateUserStatus = async (req: Request, res: Response) => {
    try {
        const userRegisterStatus: UserDetails = req.body;
        const userDetailsRepositry =
            appSource.getRepository(UserDetails);
        const userregisterFound = await userDetailsRepositry.findOneBy({
            userId: userRegisterStatus.userId,
        });
        if (!userregisterFound) {
            throw new ValidationException("User Not Found");
        }
        await userDetailsRepositry
            .createQueryBuilder()
            .update(UserDetails)
            .set({ status: userRegisterStatus.status })
            .where({ userId: userRegisterStatus.userId })
            .execute();
        res.status(200).send({
            IsSuccess: `Status for ${userregisterFound.userName} Changed Successfully`,
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

export const deleteUserDetails = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        const userDetailsRepositry = appSource.getRepository(UserDetails);

        const userregisterFound = await userDetailsRepositry.findOneBy({ userId });
        if (!userregisterFound) {
            throw new ValidationException("User Not Found");
        }

        // Delete using QueryBuilder (explicit cast to string)
        const deleteResult = await userDetailsRepositry
            .createQueryBuilder()
            .delete()
            .from(UserDetails)
            .where("userId = :userId", { userId: String(userId) })
            .execute();

        console.log("Delete Result:", deleteResult);

        if (deleteResult.affected && deleteResult.affected > 0) {
            res.status(200).send({
                IsSuccess: `${userregisterFound.userName} Deleted Successfully`,
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