const { ccclass, property } = cc._decorator;

@ccclass
export default class ButtonSoundEffect extends cc.Component {

    @property({ type: cc.AudioClip })
    soundEffect: cc.AudioClip = null; 

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.playSoundEffect, this);
    }

    playSoundEffect() {
        if (this.soundEffect) {
            cc.audioEngine.playEffect(this.soundEffect, false);
        } else {
            console.error("Sound effect is not assigned.");
        }
    }
}
