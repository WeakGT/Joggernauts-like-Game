const { ccclass, property } = cc._decorator;
import AudioManager from './audioManager';

@ccclass
export default class SceneSwitcher extends cc.Component {

    @property(cc.SceneAsset)
    targetScene: cc.SceneAsset = null;

    @property(cc.Node) 
    switchButton: cc.Node = null;

    @property({ type: cc.AudioClip })
    soundEffect: cc.AudioClip = null;

    onLoad() {
        if (this.switchButton) {
            this.switchButton.on(cc.Node.EventType.TOUCH_END, this.onSwitchButtonClicked, this);
        } else {
            console.error("Switch button is not assigned.");
        }
    }

    onSwitchButtonClicked() {
        this.switchScene();
    }

    switchScene() {
        if (!this.targetScene) {
            console.error("Target scene is not assigned.");
            return;
        }

        // 调用 AudioManager 来停止所有音效
        AudioManager.stopAllEffects();

        cc.director.loadScene(this.targetScene.name, () => {
            console.log(`Switched to ${this.targetScene.name} scene.`);
        });
        
        if (this.soundEffect) {
            cc.audioEngine.playEffect(this.soundEffect, false);
        }
    }
}
