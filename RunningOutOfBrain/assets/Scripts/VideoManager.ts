const { ccclass, property } = cc._decorator;

@ccclass
export default class VideoManager extends cc.Component {

    // this should be modified since video player is always at top layer
    
    // onLoad() {}

    start() {
        // cc.director.setClearColor(new cc.Color(0, 0, 0, 0));
        // this.node.zIndex = -1;
        this.node.setContentSize(cc.winSize);
        this.node.scaleY *= 1.2;
        this.getComponent(cc.VideoPlayer).play();

    }
}
