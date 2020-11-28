import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { DataEntry } from "./DataEntry";

@Entity()
export class DataPoint extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    title!: string;

    @Column()
    data!: string;

    @ManyToOne(() => DataEntry, dataEntry => dataEntry.owner)
    linkedEntry!: DataEntry
}
