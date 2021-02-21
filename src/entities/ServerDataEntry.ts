import {
    BaseEntity,
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from "typeorm";
import { Server } from "./Server";
import { ServerDataPoint } from "./ServerDataPoint";

@Entity()
export class ServerDataEntry extends BaseEntity {
    constructor(server: Server) {
        super();

        this.server = server;
    }

    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Server, (server) => server.dataEntries)
    server!: Server;

    @OneToMany(
        () => ServerDataPoint,
        (serverDataPoint) => serverDataPoint.linkedEntry
    )
    dataPoints!: ServerDataPoint[];

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    time!: string;
}
