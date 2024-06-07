const {ccclass, property} = cc._decorator;
import { DataManager } from "../../Scripts/DataManager";

@ccclass
export default class UIManager extends cc.Component {

    @property(cc.Prefab)
    heart: cc.Prefab = null;

    @property(cc.Prefab)
    star: cc.Prefab = null;

    private heartNumber = 0;
    private starNumber = 0;

    private heartNodes: cc.Node[] = [];
    private starNodes: cc.Node[] = [];

    // onLoad() {}

    update(dt) {
        if (this.heartNumber !== DataManager.getInstance().currentPlayerLives || this.starNumber !== DataManager.getInstance().currentStars) {
            this.heartNumber = DataManager.getInstance().currentPlayerLives;
            this.starNumber = DataManager.getInstance().currentStars;

            this.heartNodes.forEach(node => node.destroy());
            this.heartNodes = [];

            this.starNodes.forEach(node => node.destroy());
            this.starNodes = [];

            for (let i = 0; i < this.heartNumber; i++) {
                const heartNode = cc.instantiate(this.heart);
                heartNode.parent = this.node;
                heartNode.setPosition(cc.v2(50 + i * 40, cc.winSize.height - 50)); // 左上角
                this.heartNodes.push(heartNode);
            }

            for (let i = 0; i < this.starNumber; i++) {
                const starNode = cc.instantiate(this.star);
                starNode.parent = this.node;
                starNode.setPosition(cc.v2(50 + i * 40, cc.winSize.height - 100)); // 左上角心下方
                this.starNodes.push(starNode);
            }
        }
    }
}