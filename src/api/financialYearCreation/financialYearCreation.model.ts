import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class FinancialYearCreation {
    @PrimaryGeneratedColumn()
    id: string;
    @Column()
    financialYearId: string
    @Column()
    companyName: string
    @Column()
    financialYear: string
    @Column()
    fromDate: string
    @Column()
    toDate: string
    @Column({ default: false })
    status: boolean
    @Column({ 'nullable': true })
    cuid: string
    @Column({ 'nullable': true })
    muid: string
    @CreateDateColumn()
    created_at: Date;
    @UpdateDateColumn()
    updated_at: Date;
    @Column()
    companyId: string
    @Column({ default: false })
    isEdited: boolean
}