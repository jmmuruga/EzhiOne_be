import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class unitOfMeasurement {
    @PrimaryGeneratedColumn()
    id: string
    @Column()
    unitMeasurementId: string
    @Column()
    unitShort: string
    @Column()
    unitName: string
    @Column({ default: true })
    status: boolean
    @Column({ 'nullable': true })
    cuid: string
    @Column({ 'nullable': true })
    muid: string
    @CreateDateColumn()
    created_at: Date;
    @CreateDateColumn()
    updated_at: Date;
}