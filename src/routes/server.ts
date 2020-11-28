import { Router } from "express";
import { nextTick } from "process";
import { Server } from "../entities/Server";
import { checkToken } from "../middlewares/jwt";

const router = Router();

router.use(checkToken);

router.get("/:id", async (req, res, next) => {
    try {
        const server = await Server.findOneOrFail(req.params.id);
        res.json(server);
    } catch (error) {
        next(error);
    }
});

router.post("/", async (req, res) => {
    try {
        const server = await new Server(
            req.body.ipAddress,
            req.body.port,
            req.body.password,
            req.body.name,
            req.body.description
        ).save();
        res.json(server);
    } catch (error) {
        nextTick(error);
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const server = await Server.findOneOrFail(req.params.id);
        await server?.remove();
        res.json(server);
    } catch (error) {
        nextTick(error);
    }
});

export default router;
