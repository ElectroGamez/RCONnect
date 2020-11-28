import { hash, compare } from "bcrypt";

/**
 * @param password The data to be encrypted.
 * @return A promise to be either resolved with the encrypted data salt or rejected with an Error
 */
export const hashPassword = async (password: string): Promise<string> => {
    return (await hash(password, 10));
};

export const checkPassword = compare;