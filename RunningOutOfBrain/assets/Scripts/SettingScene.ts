const { ccclass, property } = cc._decorator;
import { AudioManager } from "./AudioManager";
import { DataManager } from "./DataManager";

@ccclass
export default class SettingScene extends cc.Component {

    @property(cc.AudioClip)
    bgmClip: cc.AudioClip = null;

    loadBackScene() {
        cc.director.loadScene("StartScene");
    }

    initBackButton() {
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = "SettingScene";
        clickEventHandler.handler = "loadBackScene";
        cc.find("Canvas/BackButton").getComponent(cc.Button).clickEvents.push(clickEventHandler);
    }

    start() {
        this.initBackButton();

        cc.find("Canvas/BackgroundMusicSlider").getComponent(cc.Slider).progress = DataManager.getInstance().bgmVolume;
        cc.find("Canvas/EffectSlider").getComponent(cc.Slider).progress = DataManager.getInstance().effectVolume;
        cc.find("Canvas/PlaySpeedSlider").getComponent(cc.Slider).progress = Math.trunc(DataManager.getInstance().gameSpeed / 2);
        cc.find("Canvas/LivesSlider").getComponent(cc.Slider).progress = Math.trunc(DataManager.getInstance().playerLives / 10);

        // music
        AudioManager.getInstance().playBGM(this.bgmClip);
    }
    
    update(dt) {
        let bgmSlider = cc.find("Canvas/BackgroundMusicSlider").getComponent(cc.Slider);
        DataManager.getInstance().bgmVolume = bgmSlider.progress; 
        cc.find("Canvas/BackgroundMusicSlider/ValueLabel").getComponent(cc.Label).string = Math.trunc(bgmSlider.progress * 100).toString();
        cc.audioEngine.setMusicVolume(bgmSlider.progress);

        let effectSlider = cc.find("Canvas/EffectSlider").getComponent(cc.Slider);
        DataManager.getInstance().effectVolume = effectSlider.progress; 
        cc.find("Canvas/EffectSlider/ValueLabel").getComponent(cc.Label).string = Math.trunc(effectSlider.progress * 100).toString();
        cc.audioEngine.setEffectsVolume(effectSlider.progress);

        let playSpeedSlider = cc.find("Canvas/PlaySpeedSlider").getComponent(cc.Slider);
        DataManager.getInstance().gameSpeed = Math.trunc(playSpeedSlider.progress * 7) * 0.25 + 0.25;
        cc.find("Canvas/PlaySpeedSlider/ValueLabel").getComponent(cc.Label).string = DataManager.getInstance().gameSpeed.toString();

        let livesSlider = cc.find("Canvas/LivesSlider").getComponent(cc.Slider);
        DataManager.getInstance().playerLives = Math.trunc(livesSlider.progress * 9) + 1;
        cc.find("Canvas/LivesSlider/ValueLabel").getComponent(cc.Label).string = DataManager.getInstance().playerLives.toString();
    }
}