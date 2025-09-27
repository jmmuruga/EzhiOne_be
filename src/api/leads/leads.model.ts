import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class leads {
    @PrimaryGeneratedColumn()
    id: string
    @Column()
    leadsId: string
    @Column()
    employeeName: string
    @Column()
    mobileNo: string
    @Column()
    mailId: string
    @Column()
    companyName: string
    @Column()
    location: string
    @Column()
    requirement: string
    @Column()
    dateAndTime: string
    @Column()
    leadsFrom: string
    @Column({ default: true })
    status: boolean
    @Column()
    companyId: string
    @Column({ nullable: true })
    cuid: string;
    @Column({ nullable: true })
    muid: string;
    @CreateDateColumn({ name: "created_at" })
    createdAt: string;
    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: string;
    @Column({ default: false })
    isEdited: boolean
}