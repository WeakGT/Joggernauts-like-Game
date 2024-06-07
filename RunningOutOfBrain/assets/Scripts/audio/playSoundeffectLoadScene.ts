const { ccclass, property } = cc._decorator;

@ccclass
export default class SoundManager extends cc.Component {

    @property({ type: cc.AudioClip })
    soundEffect: cc.AudioClip = null; 

    protected onLoad(): void {
        this.playSoundEffect();
    }
    
    playSoundEffect() {
        cc.audioEngine.playEffect(this.soundEffect, false);
    }
}
