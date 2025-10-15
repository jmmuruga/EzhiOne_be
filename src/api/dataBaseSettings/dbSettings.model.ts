import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()

export class DbSettings {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    dbSettingsId: string;

    @Column()
    dbStatus: boolean;

    @Column()
    drive: string;

    @Column({ default: false })
    daily: boolean;

    @Column({ default: false })
    weekly: boolean;

    @Column({ default: false })
    monthly: boolean;

    @Column({ nullable: true })
    dailyReminderTime: string;

    @Column({ nullable: true })
    weeklyReminderDay: string;

    @Column({ nullable: true })
    weeklyReminderTime: string;

    @Column({ nullable: true })
    monthlyReminderDate: string;

    @Column({ nullable: true })
    monthlyReminderTime: string;

    @Column({ nullable: true })
    cuid: string;

    @Column({ nullable: true })
    muid: string;

    @Column({ default: false })
    isEdited: boolean;

    @CreateDateColumn({ name: "created_at" })
    createdAt: string;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: string;

    @Column()
    companyId: string;
}