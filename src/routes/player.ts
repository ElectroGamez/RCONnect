import { Router } from "express";
import { Player } from "../entities/Player";
import { RequestError } from "../express";
import { getUUID } from "../helpers/mojangUUIDs";

const router = Router();

router.get("/id/:id", async (req, res, next) => {
    try {
        const server = await Player.findOneOrFail(req.params.id);
        res.json(server);
    } catch (error) {
        next(error);
    }
});

router.get("/search/:username", async (req, res, next) => {
    try {
        if (!req.params.username)
            throw new RequestError(
                "No username provided, search canceled",
                {},
                400
            );
        const uuid = await getUUID(req.params.username);

        const players = await Player.find({
            where: {
                uuid,
            },
        });

        res.json(players);
    } catch (error) {
        next(error);
    }
});

router.get("/id/:id/username", async (req, res, next) => {
    try {
        if (!req.params.id)
            throw new RequestError("No userId provided", {}, 400);
        const player = await Player.findOneOrFail(req.params.id);

        const username = await player.name();

        res.json({ username });
    } catch (error) {
        next(error);
    }
});

interface IUsernameProp {
    linkedEntry: {
        owner: {
            username?: string;
        };
    };
}
export default router;
