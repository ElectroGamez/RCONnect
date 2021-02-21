import {
    Entity,
    BaseEntity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
} from "typeorm";
import { ServerDataEntry } from "./ServerDataEntry";

@Entity()
export class ServerDataPoint extends BaseEntity {
    constructor(title: string, data: number, linkedEntry: ServerDataEntry) {
        super();

        this.title = title;
        this.data = data;
        this.linkedEntry = linkedEntry;
    }

    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    title!: string;

    @Column()
    data!: number;

    @ManyToOne(
        () => ServerDataEntry,
        (serverDataEntry) => serverDataEntry.dataPoints
    )
    linkedEntry!: ServerDataEntry;
}
