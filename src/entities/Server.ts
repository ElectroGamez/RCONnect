import { Rcon } from "rcon-client/lib";
import {
    Entity,
    Column,
    BaseEntity,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToMany,
} from "typeorm";
import { DataEntry } from "./DataEntry";
import { User } from "./User";

import { Player } from "./Player";
import { getUUID } from "../helpers/mojangUUIDs";

interface RconnectionError {
    errno: number;
    code: string;
    syscall: string;
    address: string;
    port: number;
}

/**
 * Minecraft Server entity
 * Used for connecting to Rcon, stored in Database
 *
 * @class Server
 * @extends BaseEntity Extends typeorms BaseEntiry, provides db functions.
 */
@Entity()
export class Server extends BaseEntity {
    /**
     * Creates an instance of Server.
     * @param {string} ipAddress
     * @param {number} port
     * @param {string} password
     * @memberof Server
     */
    constructor(
        ipAddress: string | "localhost",
        port: number | 25575,
        password: string,
        name?: string,
        description?: string,
    ) {
        super();
        this.ipAddress = ipAddress;
        this.port = port;
        this.password = password;
        this.name = name;
        this.description = description;
    }

    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({nullable: true})
    name?: string;

    @Column({nullable: true})
    description?: string;

    @Column()
    ipAddress!: string;

    @Column()
    port!: number;

    @Column()
    password!: string;

    @ManyToOne(() => User, (user) => user.servers)
    owner?: User;

    @OneToMany(() => DataEntry, (dataEntry) => dataEntry.owner)
    dataEntries?: DataEntry[];

    /**
     * Gets player list from server
     * Uses Rcon connection to retreive all active players, returned as Player entity array.
     * @memberof Server
     */
    getPlayers = async (): Promise<Player[]> => {
        try {
            const rcon = await this.connect();
            if (rcon instanceof Rcon) {
                const rawList = await rcon.send("list");
                await rcon.end();

                const lines = rawList.split(":"); // Remove title

                const playerListRaw = lines[1].replaceAll(" ", "").split(","); // Generate clean player list

                const playerList: Player[] = [];

                // Check each playername

                for (let i = 0; i < playerListRaw.length; i++) {
                    if (playerListRaw[i].length < 2) return [];
                    const uuid = await getUUID(playerListRaw[i]);

                    // When the UUId function fails, throw a new error.
                    if (!uuid)
                        throw new Error(
                            "Could not get UUID for player " + playerListRaw[i]
                        );

                    // Check if player already exists.
                    const tempPlayer = await Player.findOne({
                        where: {
                            uuid: uuid,
                        },
                    });

                    // If not, create a new player entity otherwise we add the found player to the return list.
                    if (!tempPlayer) {
                        const newPlayer = await new Player(uuid).save();
                        playerList.push(newPlayer);
                    } else {
                        playerList.push(tempPlayer);
                    }
                }
                rcon.end();
                return playerList;
            }
            console.error(
                "Could not create Rcon connection for server " + this.id
            );
            return [];
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    /**
     * Creates a Rcon rconnection to the server.
     * @return {*}  {(Promise<Rcon | RconnectionError>)} Returns the Rcon object or an error.
     */
    private connect = async (): Promise<Rcon | RconnectionError> => {
        try {
            const rcon = await Rcon.connect({
                host: this.ipAddress,
                port: this.port,
                password: this.password,
            });

            return rcon;
        } catch (error) {
            return error;
        }
    };

    /**
     * Return this objects public data.
     * @returns {Server} Returns the server object with limited data.
     */
    dataAsGuest = (): Server => {
        const resultData = {
            id: this.id,
            name: this.name,
            description: this.description,
            owner: this.owner,
        } as Server;
        return resultData;
    }

    /**
     * Return this objects private data.
     * @returns {Server} Returns the server object with partially limited data.
     */
    dataAsOwner = (): Server => {
        const resultData = {
            id: this.id,
            name: this.name,
            description: this.description,
            owner: this.owner,
            ipAddress: this.ipAddress,
            port: this.port
        } as Server;
        return resultData;
    }
}
