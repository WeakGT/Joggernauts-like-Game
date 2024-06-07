const { ccclass, property } = cc._decorator;
import { AudioManager } from "./AudioManager";

@ccclass
export default class PlayBGM extends cc.Component {

    @property(cc.AudioClip)
    bgmClip: cc.AudioClip = null;

    onLoad() {
        // music
        AudioManager.getInstance().playBGM(this.bgmClip);
    }
}
