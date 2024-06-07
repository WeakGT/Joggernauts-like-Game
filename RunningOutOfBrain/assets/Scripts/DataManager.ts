export class DataManager {
    private static _instance:DataManager = null;
    public static getInstance(): DataManager {
        if(!this._instance) {
            this._instance = new DataManager();
        }
        return this._instance;
    }

    // Volumes
    public bgmVolume: number = 0.5;
    public effectVolume: number = 0.5;

    // GamePlay
    public playerLives: number = 5;
    public gameSpeed: number = 1;
    public userCount: number = 1;
    public selectedPlayers: string[] = ["black", "white"];
    public gameSummary: {} = {
        // "black": {
        //     "kills": 12,
        //     "deathes": 3,
        //     "stars": 1,
        // },
        // "white": {
        //     "kills": 3,
        //     "deathes": 13,
        //     "stars": 1,
        // }
    };
}