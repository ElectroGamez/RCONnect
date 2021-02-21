import {
    Entity,
    Column,
    BaseEntity,
    PrimaryGeneratedColumn,
    OneToMany,
} from "typeorm";
import { getUsername } from "../helpers/mojangUUIDs";
import { PlayerDataEntry } from "./PlayerDataEntry";

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

    @OneToMany(
        () => PlayerDataEntry,
        (playerDataEntry) => playerDataEntry.owner
    )
    dataEntries?: PlayerDataEntry[];

    name() {
        return getUsername(this.uuid);
    }
}
