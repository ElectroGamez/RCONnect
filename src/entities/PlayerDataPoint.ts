import {
    Entity,
    BaseEntity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
} from "typeorm";
import { PlayerDataEntry } from "./PlayerDataEntry";

@Entity()
export class PlayerDataPoint extends BaseEntity {
    constructor(title: string, data: number, linkedEntry: PlayerDataEntry) {
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
        () => PlayerDataEntry,
        (playerDataEntry) => playerDataEntry.dataPoints
    )
    linkedEntry!: PlayerDataEntry;
}
