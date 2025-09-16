import { BooleanSchema } from "joi";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Brand {
    @PrimaryGeneratedColumn()
    id: string;
    @Column()
    brandId: string;
    @Column()
    brandName: string
    @Column()
    companyName: string
    @Column({ type: "ntext", nullable: true })
    brandLogo: string
    @Column()
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

