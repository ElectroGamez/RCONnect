import { createConnection } from "typeorm";
import "reflect-metadata";

import typeormConfig from "./ormconfig";
import { startServer } from "./express";
// import RconnectManager from "./managers/RconnectManager";

(async () => {
    // Starting DB connection
    await createConnection(typeormConfig);
    console.log("Database connection active");

    startServer();

    // const rconnectManager = new RconnectManager();
    // rconnectManager.startListener();
})();
