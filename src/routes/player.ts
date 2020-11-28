import { Router } from "express";
import { Player } from "../entities/Player";

const router = Router();

router.get("/:id", async (req, res, next) => {
    try {
        const server = await Player.findOneOrFail(req.params.id);
        res.json(server);
    } catch (error) {
        next(error);
    }
});

router.delete("/:id", async (req, res, next) => {
    try {
        const server = await Player.findOneOrFail(req.params.id);
        await server?.remove();
        res.json(server);
    } catch (error) {
        next();
    }
});

export default router;
