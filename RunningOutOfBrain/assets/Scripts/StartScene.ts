import { AudioManager } from "./AudioManager";
import { DataManager } from "./DataManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StartScene extends cc.Component {

    @property([cc.Label])
    Labels: cc.Label[] = [];

    @property(cc.AudioClip)
    bgmClip: cc.AudioClip = null;

    private Index: number = 0;

    onKeyDown(event) {
        if (event.keyCode == cc.macro.KEY.up) this.Index--;
        if (event.keyCode == cc.macro.KEY.down) this.Index++;
        this.Index = (this.Index + 3) % 3;
        if (event.keyCode == cc.macro.KEY.enter) {
            if (this.Index == 0) cc.director.loadScene("ChoosePlayerScene");
            else if (this.Index == 1) cc.director.loadScene("SettingScene");
            else if (this.Index == 2) cc.director.loadScene("Login");
        }
    }

    start() {
        // system
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        // music
        cc.audioEngine.setMusicVolume(DataManager.getInstance().bgmVolume);
        cc.audioEngine.setEffectsVolume(DataManager.getInstance().effectVolume);
        AudioManager.getInstance().playBGM(this.bgmClip);
    }

    update(dt) {
        let Pointer = cc.find("Canvas/Pointer");

        for (let label of this.Labels) label.node.scaleX = label.node.scaleY = 1;
        
        this.Labels[this.Index].node.scaleX = 1.5;
        this.Labels[this.Index].node.scaleY = 1.5;

        if (this.Index == 0) Pointer.position = cc.v3(-316, 70, 0);
        if (this.Index == 1) Pointer.position = cc.v3(-316, -10, 0);
        if (this.Index == 2) Pointer.position = cc.v3(-316, -90, 0);
        // Pointer.angle += 360 * dt;
    }
}
