import Axios from "axios";
import { RequestError } from "../express";

export /**
 * Returns the Minecraft UUID from a player username.
 *
 * @param {string} username The username of the player
 * @return {*}  {(Promise<string | null>)}
 */
const getUUID = async (username: string): Promise<string | null> => {
    const response = await Axios.get(
        `https://api.mojang.com/users/profiles/minecraft/${username}`
    ).catch((error) => {
        throw new RequestError(
            "Could not get UUID from Mojang API",
            error.response.data
        );
    });
    return typeof response == "object" && response.data
        ? response.data.id
        : null;
};
