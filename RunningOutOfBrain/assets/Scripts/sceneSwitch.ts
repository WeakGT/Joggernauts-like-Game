const { ccclass, property } = cc._decorator;

@ccclass
export default class SceneSwitcher extends cc.Component {
    @property(cc.SceneAsset)
    targetScene: cc.SceneAsset = null;

    onLoad() {
        this.scheduleOnce(this.switchScene, 4);
    }

    switchScene() {
        cc.director.loadScene(this.targetScene.name);
    }
}
