import { Request, Response } from "express";
import { appSource } from "../../core/dataBase/db";
import { leads } from "./leads.model";
import { ValidationException } from "../../core/exception";
import { leadsDto, leadsValidation } from "./leads.dto";

export const createLeadsId = async (req: Request, res: Response) => {
    try {
        const companyId = req.params.companyId;
        const leadsRepositry =
            appSource.getRepository(leads);
        let leadsId = await leadsRepositry.query(
            `SELECT leadsId 
            FROM [${process.env.DB_NAME}].[dbo].[leads] where companyId = '${companyId}'
            Group by leadsId 
            ORDER BY CAST(leadsId  AS INT) DESC;`
        );
        let id = "0";
        if (leadsId?.length > 0) {
            id = leadsId[0].leadsId;
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

export const addUpdateLeads = async (
    req: Request,
    res: Response
) => {
    try {
        const payload: leadsDto = req.body;
        const validation = leadsValidation.validate(payload);
        if (validation.error) {
            throw new ValidationException(validation.error.message);
        }
        const leadsRepositry = appSource.getRepository(
            leads
        );
        const existingDetails = await leadsRepositry.findOneBy({
            leadsId: payload.leadsId,
            companyId: payload.companyId
        });
        if (existingDetails) {
            await leadsRepositry
                .update({ leadsId: payload.leadsId, companyId: payload.companyId }, payload)
                .then(() => {
                    res.status(200).send({
                        IsSuccess: "leads Updated Successfully",
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
            await leadsRepositry.save(payload);
            res.status(200).send({
                IsSuccess: "leads Added Successfully",
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

export const getLeadsDetails = async (req: Request, res: Response) => {
    try {
        const companyId = req.params.companyId;
        const leadsRepositry = appSource.getRepository(leads);
        const getleads = await leadsRepositry
            .createQueryBuilder("")
            .where({ companyId: companyId })
            .getMany();
        res.status(200).send({
            Result: getleads,
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

export const deleteLeads = async (req: Request, res: Response) => {
    try {
        const leadsId = req.params.leadsId;
        const companyId = req.params.companyId;
        const leadsRepositry = appSource.getTreeRepository(leads);
        const leadsFound = await leadsRepositry.findOneBy({
            leadsId: leadsId, companyId: companyId
        });

        if (!leadsFound) {
            throw new ValidationException("Customer Not Found ");
        }
        await leadsRepositry
            .createQueryBuilder()
            .delete()
            .from(leads)
            .where({ leadsId: leadsId, companyId: companyId })
            .execute();

        res.status(200).send({
            IsSuccess: `${leadsFound.employeeName} Deleted Successfully `,
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

export const updateLeadsStatus = async (req: Request, res: Response) => {
    try {
        const leadsStatus: leads = req.body;
        const leadsRepositry =
            appSource.getRepository(leads);
        const leadsFound = await leadsRepositry.findOneBy({
            leadsId: leadsStatus.leadsId, companyId: leadsStatus.companyId
        });
        if (!leadsFound) {
            throw new ValidationException("Leads Not Found");
        }
        await leadsRepositry
            .createQueryBuilder()
            .update(leads)
            .set({ status: leadsStatus.status })
            .where({ leadsId: leadsStatus.leadsId })
            .andWhere({ companyId: leadsStatus.companyId })
            .execute();
        res.status(200).send({
            IsSuccess: `Status for ${leadsFound.employeeName} Changed Successfully`,
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