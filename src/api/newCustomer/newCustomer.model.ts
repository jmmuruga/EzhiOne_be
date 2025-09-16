import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class newCustomer {
    @PrimaryGeneratedColumn()
    id: string
    @Column()
    customerId: string
    @Column()
    customerName: string
    @Column()
    mobile: string
    @Column({ nullable: true })
    alterMobile: string
    @Column({ nullable: true })
    whatsappNumber: string
    @Column()
    email: string
    @Column()
    doorNumber: string
    @Column()
    street: string
    @Column()
    landmark: string
    @Column()
    location: string
    @Column()
    post: string
    @Column()
    taluk: string
    @Column()
    district: string
    @Column()
    pincode: string
    @Column()
    companyName: string
    @Column({default: true})
    status: boolean
    @Column({ nullable: true })
    cuid: string;
    @Column({ nullable: true })
    muid: string;
    @CreateDateColumn({ name: "created_at" })
    createdAt: string;
    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: string;

}