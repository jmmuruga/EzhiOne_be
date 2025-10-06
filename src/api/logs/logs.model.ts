import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, } from "typeorm";

@Entity()
export class Logs {
    @PrimaryGeneratedColumn()
    logId: number;
    @Column()
    userId: string;
    @Column()
    userName: string;
    @Column()
    statusCode: string;
    @Column({ type: "ntext" })
    message: string;
    @Column({ nullable: true })
    companyId: string;
    @CreateDateColumn({ name: "createdAt" })
    createdAt: Date;
}