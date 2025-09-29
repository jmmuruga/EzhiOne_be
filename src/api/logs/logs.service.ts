import { appSource } from "../../core/dataBase/db";
import { UserDetails } from "../userRegistration/userRegistration.model";
import { logsDto } from "./logs.dto";
import { Logs } from "./logs.model";

export const InsertLog = async (payload: logsDto): Promise<void> => {
    const logsRepository = appSource.getRepository(Logs);
    const userRepository = appSource.getRepository(UserDetails);

    const userDetail = await userRepository.findOneBy({ userId: payload.userId });
    const userName = userDetail?.userName;
    payload.message = payload.message + " " + userName;
    payload.userName = userName || '';
    await logsRepository.save(payload);
};

