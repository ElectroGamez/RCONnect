/*
    Server router, handles public and private requests.
*/

import { Router } from "express";
import { Like } from "typeorm";
import { Server } from "../entities/Server";
import { User } from "../entities/User";
import { checkToken } from "../middlewares/jwt";

const router = Router();

router.get("/", async (_req, res, next) => {
    try {
        const servers = await Server.find();
        const guestView = servers.map((server) => server.dataAsGuest());

        res.json(guestView);
    } catch (error) {
        next(error);
    }
});

router.get("/search/:name", async (req, res, next) => {
    try {
        const servers = await Server.find({
            where: {
                name: Like(`%${req.params.name}%`),
            },
        });

        res.json(servers.map((server) => server.dataAsGuest()));
    } catch (error) {
        next(error);
    }
});

router.get("/id/:id", checkToken, async (req, res, next) => {
    try {
        const server = (
            await Server.findOneOrFail(req.params.id)
        ).dataAsOwner();
        res.json(server);
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
            (await User.findOneOrFail(res.locals.userId)).dataAsOwner(),
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

export default router;
