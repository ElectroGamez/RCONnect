import { ConnectionOptions } from "typeorm";
import { parse } from "pg-connection-string";

import { config } from "dotenv";
config();

const dbOptions = parse(
    process.env.DATABASE_URL ?? process.env.DEV_DB_URL ?? ""
);

const options: ConnectionOptions = {
    host: dbOptions.host ?? "localhost",
    type: "mysql",
    port: parseInt(dbOptions.port ?? "3307"),
    username: dbOptions.user,
    password: dbOptions.password,
    database: dbOptions.database ?? "default",
    logging: false,
    entities: [
        `${process.env.NODE_ENV == "production" ? "dist" : "src"}/entities/*${
            process.env.NODE_ENV == "production" ? ".js" : ".ts"
        }`,
    ],
    synchronize: true,
};

export default options;
