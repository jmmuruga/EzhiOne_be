import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class itemMaster {
    @PrimaryGeneratedColumn()
    id: string
    @Column()
    itemMasterId: string
    @Column()
    itemName: string
    @Column()
    itemGroup: string
    @Column()
    hsn: string
    @Column()
    gstPercentage: string
    @Column()
    unit: string
    @Column()
    itemMaster: string
    @Column({ default: true })
    status: boolean
    @Column({ 'nullable': true })
    cuid: string
    @Column({ 'nullable': true })
    muid: string
    @CreateDateColumn()
    created_at: Date;
    @UpdateDateColumn()
    updated_at: Date;
}