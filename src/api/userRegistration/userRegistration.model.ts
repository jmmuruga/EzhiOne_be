import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class UserDetails {
    @PrimaryGeneratedColumn()
    newId: number;
    @Column()
    userId: string
    @Column()
    userName: string
    @Column()
    Email: string
    @Column()
    Mobile: string
    @Column()
    userType: string
    @Column()
    password: string
    @Column()
    confirmpassword: string
    @Column()
    status: boolean
    @Column({ 'nullable': true })
    cuid: string
    @Column({ 'nullable': true })
    muid: string
    @CreateDateColumn()
    created_at: Date
    @UpdateDateColumn()
    updated_at: Date
}