import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

@Entity()
export class otpStore {
    @PrimaryGeneratedColumn()
    id: number
    @Column({ nullable: true })
    userId: string
    @Column()
    otp: string
    @CreateDateColumn()
    created_At: Date
    @UpdateDateColumn()
    updated_At: Date
}