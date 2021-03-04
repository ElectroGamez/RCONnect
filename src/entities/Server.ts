import { Rcon } from "rcon-client/lib";
import {
    Entity,
    Column,
    BaseEntity,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToMany,
} from "typeorm";
import { User } from "./User";

import { Player } from "./Player";
import { getUUID } from "../helpers/mojangUUIDs";
import { ServerDataEntry } from "./ServerDataEntry";
import Statistic from "../interfaces/Statistic";
import statisticsFile from "../items";
import { ServerDataPoint } from "./ServerDataPoint";
import { PlayerDataEntry } from "./PlayerDataEntry";
import { PlayerDataPoint } from "./PlayerDataPoint";

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
     * @param {string} ipAddress Server IP address
     * @param {number} port Server RCON port
     * @param {string} password Server RCON Password
     * @param {User} owner Owner of server
     * @param {string} name Server Name
     * @param {string} description Server Description
     * @memberof Server
     */
    constructor(
        ipAddress: string | "localhost",
        port: number | 25575,
        password: string,
        owner: User,
        name?: string,
        description?: string
    ) {
        super();
        this.ipAddress = ipAddress;
        this.port = port;
        this.password = password;
        this.owner = owner;
        this.name = name;
        this.description = description;
    }

    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ nullable: true })
    name?: string;

    @Column({ nullable: true })
    description?: string;

    @Column()
    ipAddress!: string;

    @Column()
    port!: number;

    @Column()
    password!: string;

    @ManyToOne(() => User, (user) => user.servers)
    owner: User;

    @OneToMany(
        () => ServerDataEntry,
        (serverDataEntry) => serverDataEntry.server
    )
    dataEntries?: ServerDataEntry[];

    /**
     * Gets player list from server
     * Uses Rcon connection to retreive all active players, returned as Player entity array.
     * @memberof Server
     */
    getPlayers = async (): Promise<Player[]> => {
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
            return playerList;
        }
        console.error("Could not create Rcon connection for server " + this.id);
        return [];
    };

    /**
     *
     * Read and save all statisics on connected players.
     * @return {*}  {Promise<void>}
     * @memberof Server
     */
    async readStatistics(
        playerCycle?: (player: Player) => void
    ): Promise<void> {
        const statistics: Statistic[] = statisticsFile;

        const players = await this.getPlayers();
        const rcon = await this.connect();

        if (!(rcon instanceof Rcon))
            throw new Error("Connecting to server failed!");

        // Create ServerDataEntry and ServerDataPoint number of connected players
        const serverEntry = await new ServerDataEntry(this).save();
        await new ServerDataPoint(
            "server_connectedPlayers",
            players.length,
            serverEntry
        ).save();

        // Debug Message
        rcon.send("say Rcon connected!");

        for (const player of players) {
            if (playerCycle) playerCycle(player);

            const playername = await player.name();
            if (typeof playername == "string") {
                const dataEntry = await new PlayerDataEntry(
                    player,
                    this
                ).save();

                let dataPointsLength = 0;

                for (const statistic of statistics) {
                    await rcon.send(
                        `say Reading ${statistic.title} for player ${playername}`
                    );
                    const result = await this.readStatistic(
                        playername,
                        statistic.title,
                        rcon
                    );

                    if (result != 0) {
                        // Check if the latest datapoint was the same as the point before.
                        const latestData = await PlayerDataPoint.createQueryBuilder()
                            .leftJoin(
                                "PlayerDataPoint.linkedEntry",
                                "PlayerDataEntry"
                            )
                            .select([
                                "PlayerDataEntry.time",
                                "PlayerDataPoint.title",
                                "PlayerDataPoint.data",
                                "PlayerDataPoint.linkedEntry",
                            ])
                            .where("PlayerDataPoint.title = :title", {
                                title: statistic.title,
                            })
                            .orderBy("PlayerDataEntry.time", "DESC")
                            .getOne();

                        if (latestData?.data != result) {
                            const dataPoint = new PlayerDataPoint(
                                statistic.title,
                                result,
                                dataEntry
                            );
                            await dataPoint.save();
                            dataPointsLength++;
                        }
                    }
                }
                if (dataPointsLength == 0) {
                    await (await dataEntry.remove()).save();
                }
            }
        }

        // Debug Message
        await rcon.send("say Rcon disconnected!");
        await rcon.end();
    }

    private async readStatistic(
        playername: string,
        statTitle: string,
        rcon: Rcon
    ): Promise<number> {
        try {
            const response = await rcon.send(
                `scoreboard players get ${playername} ${statTitle}`
            );

            const checksum = response.split(" ")[0];
            if (checksum == playername) {
                return parseInt(response.split(" ")[2]);
            }

            return 0; // Played had no data for item, returning 0;
        } catch (error) {
            console.error(error);
            return 0;
        }
    }

    /**
     * Creates a Rcon rconnection to the server.
     *
     * @memberof Server
     * @return {*} {(Promise<Rcon>)} Returns the Rcon object.
     * @throws Connection Error
     */
    private async connect(): Promise<Rcon | RconnectionError> {
        const rcon = await Rcon.connect({
            host: this.ipAddress,
            port: this.port,
            password: this.password,
        });

        return rcon;
    }

    /**
     * Return this objects public data.
     * @returns {Server} Returns the server object with limited data.
     */
    dataAsGuest = (): Server => {
        const resultData = {
            id: this.id,
            name: this.name,
            description: this.description,
            owner: this.owner.dataAsGuest(),
        } as Server;
        return resultData;
    };

    /**
     * Return this objects private data.
     * @returns {Server} Returns the server object with partially limited data.
     */
    dataAsOwner = (): Server => {
        const resultData = {
            id: this.id,
            name: this.name,
            description: this.description,
            owner: this.owner.dataAsGuest(),
            ipAddress: this.ipAddress,
            port: this.port,
        } as Server;
        return resultData;
    };
}
