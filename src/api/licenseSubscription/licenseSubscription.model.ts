import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class licenseSubscription {
    @PrimaryGeneratedColumn()
    id: string
    @Column()
    licenseId: string
    @Column()
    companyName: string
    @Column()
    licenseStartDate: string
    @Column()
    licenseExpiryDate: string
    @Column()
    graceDays: string
    @Column({ default: true })
    status: boolean
    @Column()
    companyId: string
    @Column({ 'nullable': true })
    cuid: string
    @Column({ 'nullable': true })
    muid: string
    @CreateDateColumn()
    created_at: Date;
    @UpdateDateColumn()
    updated_at: Date;
    @Column({ default: false })
    isEdited: boolean
}