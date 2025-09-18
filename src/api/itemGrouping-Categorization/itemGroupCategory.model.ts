import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class ItemGroupCategory {
    @PrimaryGeneratedColumn()
    id: string;
    @Column()
    itemGroupId: string;
    @Column()
    groupName: string
    @Column({default: true})
    status: boolean
    @Column({ nullable: true })
    cuid: string
    @Column({ nullable: true })
    muid: string
    @CreateDateColumn()
    created_at: Date
    @UpdateDateColumn()
    updated_at: Date
    @Column()
    companyId: string
}