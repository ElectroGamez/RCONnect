import { Server } from "../entities/Server";

import statisticsFile from "../items";
import Statistic from "../interfaces/Statistic";
import { Rcon } from "rcon-client/lib";
import { ServerDataEntry } from "../entities/ServerDataEntry";
import { PlayerDataEntry } from "../entities/PlayerDataEntry";
import { ServerDataPoint } from "../entities/ServerDataPoint";
import { PlayerDataPoint } from "../entities/PlayerDataPoint";

class RconnectManager {
    private interval: NodeJS.Timeout | undefined;

    /**
     * Starts the interval on Rconnect checkup function.
     * @param {number} [refreshRate] Set the millisecond interval for the checkup function
     */
    startListener = (refreshRate?: number): void => {
        this.interval = setInterval(
            this.listener,
            refreshRate ? refreshRate : 60000 * 30 // 30 Min
        );

        // Run ones
        this.listener();
    };

    /**
     * The main interval function, checks player stats and online players
     */
    private listener = async () => {
        try {
            const servers = await Server.find();
            const statistics: Statistic[] = statisticsFile;

            for (const server of servers) {
                const players = await server.getPlayers();

                // Connect to server by RCON
                const rcon = await server.connect();

                if (!(rcon instanceof Rcon))
                    throw new Error("Connecting to server failed!");

                // Create dataentry for number of connected players
                const serverEntry = await new ServerDataEntry(server).save();

                new ServerDataPoint(
                    "server_connectedPlayers",
                    players.length,
                    serverEntry
                );

                // Debug Message
                rcon.send("say Rcon connected!");

                for (const player of players) {
                    const playername = await player.name();
                    if (typeof playername == "string") {
                        const dataEntry = await new PlayerDataEntry(
                            player,
                            server
                        ).save();

                        for (const statistic of statistics) {
                            const result = await server.readStatistic(
                                playername,
                                statistic.title,
                                rcon
                            );

                            if (result != 0) {
                                const dataPoint = new PlayerDataPoint(
                                    statistic.title,
                                    result,
                                    dataEntry
                                );
                                await dataPoint.save();
                            }
                        }
                    }
                }

                // Debug Message
                await rcon.send("say Rcon disconnected!");
                await rcon.end();
            }
        } catch (error) {
            console.error(error);
        }

        /*
        for each server

        check all player stats from online players

        save stats

        save server stats ( number of online players )
        */
    };

    stopListener = (): void => {
        if (this.interval) clearInterval(this.interval);
    };
}

export default RconnectManager;
