class RconnectManager {
    private interval: NodeJS.Timeout | undefined;

    /**
     * Starts the interval on Rconnect checkup function.
     * @param {number} [refreshRate] Set the millisecond interval for the checkup function
     */
    startListener = (refreshRate?: number): void => {
        this.interval = setInterval(
            this.listener,
            refreshRate ? refreshRate : 60000 * 30 // 30 Min
        );

        // Run ones
        this.listener();
    };

    /**
     * The main interval function, checks player stats and online players
     */
    private listener = async () => {
        console.log("adadad");
    };

    stopListener = (): void => {
        if (this.interval) clearInterval(this.interval);
    };
}

export default RconnectManager;
