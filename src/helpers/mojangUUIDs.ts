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

/**
 * Returns the current Minecraft username from a player UUID.
 *
 * @param {string} username The username of the player
 * @return {*}  {(Promise<string | null>)}
 */
export const getUsername = async (uuid: string): Promise<string | null> => {
    const response = await Axios.get(
        `https://api.mojang.com/user/profiles/${uuid}/names`
    ).catch((error) => {
        throw new RequestError(
            "Could not get Username from Mojang API",
            error.response.data
        );
    });

    const usernames: { name: string; changedToAt?: number }[] = response.data;
    const username = usernames[usernames.length - 1].name;
    return username.length > 0 ? username : null;
};
