import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity()
export class employeeRegistration {
    @PrimaryGeneratedColumn()
    newId: number;
    @Column()
    employeeId: string;
    @Column()
    employeeName: string;
    @Column()
    gender: string;
    @Column()
    employeeMobile: string;
    @Column()
    empEmail: string;
    @Column()
    bloodGroup: string;
    @Column()
    guardianType: string;
    @Column()
    guardianName: string;
    @Column()
    guardianMobile: string;
    @Column()
    dob: string;
    @Column()
    joiningDate: string;
    @Column({ 'nullable': true })
    resignedDate: string;
    @Column()
    designation: string;
    @Column()
    monthlySalary: string;
    @Column()
    workStatus: string;
    @Column()
    empAddress: string;
    @Column({ type: "ntext", nullable: true })
    employeeImage: string;
    @Column({ default: true })
    status: boolean;
    @Column({ nullable: true })
    cuid: string;
    @Column({ nullable: true })
    muid: string;
    @CreateDateColumn({ name: "created_at" })
    createdAt: string;
    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: string;
}