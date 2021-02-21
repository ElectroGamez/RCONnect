import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Player } from "./Player";
import { Server } from "./Server";
import { PlayerDataPoint } from "./PlayerDataPoint";

@Entity()
export class PlayerDataEntry extends BaseEntity {
    constructor(owner: Player, server: Server) {
        super();

        this.server = server;
        this.owner = owner;
    }

    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Player, (player) => player.dataEntries)
    owner!: Player;

    @ManyToOne(() => Server, (server) => server.dataEntries)
    server!: Server;

    @OneToMany(
        () => PlayerDataPoint,
        (playerDataPoint) => playerDataPoint.linkedEntry
    )
    dataPoints!: PlayerDataPoint[];

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    time!: string;
}
