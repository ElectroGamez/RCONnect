import {
    Entity,
    Column,
    BaseEntity,
    PrimaryGeneratedColumn,
    OneToMany,
} from "typeorm";
import { DataEntry } from "./DataEntry";

@Entity()
export class Player extends BaseEntity {
    constructor(uuid: string) {
        super();
        this.uuid = uuid;
    }

    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    uuid!: string;

    @OneToMany(() => DataEntry, (dataEntry) => dataEntry.owner)
    dataEntries?: DataEntry[];
}
