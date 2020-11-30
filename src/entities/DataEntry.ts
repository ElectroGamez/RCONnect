import { Entity, BaseEntity, PrimaryGeneratedColumn, ManyToOne, OneToMany } from "typeorm";
import { DataPoint } from "./DataPoint";
import { Player } from "./Player";
import { Server } from "./Server";

@Entity()
export class DataEntry extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Player, player => player.dataEntries)
    owner!: Player;

    @ManyToOne(() => Server, server => server.dataEntries)
    server!: Server;

    @OneToMany(() => DataPoint, datapoint => datapoint.linkedEntry)
    dataPoints!: DataPoint[]
}
