import { ConnectionOptions } from "typeorm";
import { config } from "dotenv";
config();

const connectionConfig: ConnectionOptions = {
    type: "mysql",
    host: "192.168.22.27",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    username: "rconnect",
    password: "W9BlF4hpWNv2kh8u5l10!v*7$a&!rr",
    database: "rconnect",
    synchronize: true,
    logging: false,
    entities:
        process.env.NODE_ENV == "production"
            ? ["dist/entities/*.js"]
            : ["src/entities/**/*.ts"],
};

export default connectionConfig;
