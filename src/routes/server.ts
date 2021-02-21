/*
    Server router, handles public and private requests.
*/

import { Router } from "express";
import { PlayerDataEntry } from "../entities/PlayerDataEntry";
import { Server } from "../entities/Server";
import { User } from "../entities/User";
import { RequestError } from "../express";
import { checkToken } from "../middlewares/jwt";

const router = Router();

router.get("/", async (_req, res, next) => {
    try {
        const servers = await Server.createQueryBuilder()
            .leftJoin("Server.owner", "owner")
            .select([
                "Server.id",
                "Server.name",
                "Server.description",
                "owner.id",
                "owner.name",
            ])
            .getMany();

        const guestView = servers.map((server) => server.dataAsGuest());

        res.json(guestView);
    } catch (error) {
        next(error);
    }
});

router.get("/search/:name", async (req, res, next) => {
    try {
        const servers = await Server.createQueryBuilder()
            .where("Server.name LIKE :query", {
                query: `%${req.params.name}%`,
            })
            .leftJoin("Server.owner", "owner")
            .select([
                "Server.id",
                "Server.name",
                "Server.description",
                "owner.id",
                "owner.name",
            ])
            .getMany();

        res.json(servers.map((server) => server.dataAsGuest()));
    } catch (error) {
        next(error);
    }
});

router.get("/id/:id", checkToken, async (req, res, next) => {
    try {
        const server = await Server.createQueryBuilder()
            .where("Server.id = :id", { id: req.params.id })
            .leftJoin("Server.owner", "owner")
            .select([
                "Server.id",
                "Server.name",
                "Server.description",
                "Server.ipAddress",
                "Server.port",
                "owner.id",
                "owner.name",
            ])
            .getOne();

        if (!server)
            throw new RequestError(
                "Server not found",
                { id: req.params.id },
                404
            );

        if (server.owner.id != res.locals.userId) {
            throw new RequestError(
                "You don't have permission for this server",
                {},
                403
            );
        }

        res.json(server.dataAsOwner());
    } catch (error) {
        next(error);
    }
});

router.post("/", checkToken, async (req, res, next) => {
    try {
        const server = await new Server(
            req.body.ipAddress,
            req.body.port,
            req.body.password,
            await User.findOneOrFail(res.locals.userId),
            req.body.name,
            req.body.description
        ).save();
        res.json(server.dataAsOwner());
    } catch (error) {
        next(error);
    }
});

router.delete("/:id", async (req, res, next) => {
    try {
        const server = await Server.findOneOrFail(req.params.id);
        await server?.remove();
        res.json(server);
    } catch (error) {
        next(error);
    }
});

router.get("/id/:id/players", async (req, res, next) => {
    try {
        const server = await Server.findOneOrFail(req.params.id);
        const players = await server.getPlayers();

        res.json(players);
    } catch (error) {
        next(error);
    }
});

router.get("/id/:id/statistics/:playerId", async (req, res, next) => {
    try {
        const dataEntry = await PlayerDataEntry.createQueryBuilder()
            .leftJoin("PlayerDataEntry.owner", "Owner")
            .leftJoin("PlayerDataEntry.server", "Server")
            .where("Owner.id = :playerId", { playerId: req.params.playerId })
            .andWhere("Server.id = :id", { id: req.params.id })
            .leftJoinAndSelect("PlayerDataEntry.dataPoints", "DataPoints")
            .select([
                "PlayerDataEntry.id",
                "PlayerDataEntry.time",
                "Owner.id",
                "Server.id",
                "DataPoints",
            ])
            .getOne();
        res.json(dataEntry);
    } catch (error) {
        next(error);
    }
});

export default router;
