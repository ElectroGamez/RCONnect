import { Router } from "express";
import { User } from "../entities/User";
import { RequestError } from "../express";
import { hashPassword } from "../helpers/bcrypt";
import { checkToken } from "../middlewares/jwt";

const router = Router();

router.get("/", checkToken, async (_req, res, next) => {
    try {
        // Get User account from JWT token.
        const userId: string = res.locals.user;
        const requestor = await User.findOne(userId, {
            select: ["name", "email"],
        });

        res.json(requestor);
    } catch (error) {
        next(error);
    }
});

router.post("/", async (req, res, next) => {
    try {
        // Check if user exists
        const checkUser = await User.findOne({
            where: {
                email: req.body.email,
            },
            select: ["id"],
        });
        // If not, create new user
        if (!checkUser) {
            if (!req.body.email || req.body.name.email < 4)
                throw new RequestError(
                    "Email Address needs to be specified and longer than 4 characters.",
                    {},
                    400
                );
            if (!req.body.name)
                throw new RequestError("Name needs to be specified.", {}, 400);

            const user = await new User(
                req.body.name,
                req.body.email,
                await hashPassword(req.body.password)
            ).save();
            res.json(
                await User.findOne(user.id, { select: ["email", "name"] })
            );
        } else {
            throw new RequestError("This email address is already in use.", {}, 400, 7401);
        }
    } catch (error) {
        next(error);
    }
});

router.delete("/", checkToken, async (_req, res, next) => {
    try {
        // Get User account from JWT token.
        const userId: string = res.locals.user;
        const requestor = await User.findOne(userId);

        // Remove account
        await requestor?.remove();

        res.json(requestor);
    } catch (error) {
        next();
    }
});

router.post("/login", async (req, res, next) => {
    try {
        const user = await User.findOne({
            where: {
                email: req.body.email,
            },
        });
        const valid = await user?.checkPassword(req.body.password);

        if (valid) res.json({ token: user?.authorize() });
        else
            throw new RequestError(
                "Incorrect username or password.",
                undefined,
                403
            );
    } catch (error) {
        next(error);
    }
});

export default router;
