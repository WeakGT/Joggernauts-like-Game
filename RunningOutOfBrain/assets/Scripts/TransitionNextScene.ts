const { ccclass, property } = cc._decorator;

@ccclass
export default class TransitionNextScene extends cc.Component {
    
    @property(cc.String)
    nextScene: string = "StartScene";

    start() {
        cc.audioEngine.stopAll();
        cc.find("Canvas/VideoPlayer").getComponent(cc.VideoPlayer).play();
        this.scheduleOnce(() => {
            cc.director.loadScene(this.nextScene);
        }, 6);
    }
}
