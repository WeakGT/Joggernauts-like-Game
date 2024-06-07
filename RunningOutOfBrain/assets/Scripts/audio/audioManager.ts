const { ccclass, property } = cc._decorator;

@ccclass
export default class AudioManager extends cc.Component {

    // 停止所有正在播放的音效（非背景音乐）
    static stopAllEffects() {
        cc.audioEngine.stopAllEffects();
    }
}
