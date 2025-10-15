import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class OtpPinSetting {
    @PrimaryGeneratedColumn()
    id: string
    @Column()
    otpPinId: string
    @Column()
    addPin: string
    @Column()
    editPin: string
    @Column()
    deletePin: string
    @Column({ default: true })
    status: boolean
    @Column()
    companyId: string
    @Column({ 'nullable': true })
    cuid: string
    @Column({ 'nullable': true })
    muid: string
    @CreateDateColumn()
    created_at: Date
    @UpdateDateColumn()
    updated_at: Date
    @Column({ default: false })
    isEdited: boolean
}