export class AudioManager {
    private static _instance: AudioManager = null;

    // private bgmNode: cc.Node = null;
    private currentBgm: cc.AudioClip = null;
    // private bgmVolume: number = 0.5;

    public static getInstance(): AudioManager {
        if (!this._instance) {
            this._instance = new AudioManager();
        }
        return this._instance;
    }

    public initBGM(bgmClip: cc.AudioClip) {
        // if (!this.bgmNode) {
        //     this.bgmNode = new cc.Node('BGMNode');
        //     cc.game.addPersistRootNode(this.bgmNode);
        // }
        this.playBGM(bgmClip);
    }

    public playBGM(bgmClip: cc.AudioClip) {
        if (this.currentBgm !== bgmClip) {
            cc.audioEngine.stopMusic();
            this.currentBgm = bgmClip;
            cc.audioEngine.playMusic(bgmClip, true);
        }
        else if (!cc.audioEngine.isMusicPlaying) {
            cc.audioEngine.playMusic(bgmClip, true);
        }
    }

    public stopBGM() {
        if (cc.audioEngine.isMusicPlaying) cc.audioEngine.stopMusic();
    }
}
