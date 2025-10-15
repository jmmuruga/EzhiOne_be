import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class companyRegistration {
    @PrimaryGeneratedColumn()
    id: string
    @Column()
    companyId: string
    @Column()
    companyStart: string
    @Column()
    companyName: string
    @Column()
    companyShortName: string
    @Column()
    doorNumber: string
    @Column()
    buildingName: string
    @Column()
    Street: string
    @Column()
    Email: string
    @Column()
    Location: string
    @Column()
    pinCode: string
    @Column()
    Post: string
    @Column()
    Taluk: string
    @Column()
    District: string
    @Column()
    gstNumber: string
    @Column()
    panNumber: string
    @Column()
    Website: string
    @Column()
    officeNumber: string
    @Column()
    branch: string
    @Column({ nullable: true })
    branchMobile: string
    @Column({ default: true })
    status: boolean
    @Column({ type: "nvarchar", length: "MAX", nullable: true })
    companyImage: string
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