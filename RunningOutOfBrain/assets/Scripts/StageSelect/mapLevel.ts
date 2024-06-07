const { ccclass, property } = cc._decorator;

@ccclass
export default class ButtonBackgroundSwitcher extends cc.Component {

    @property({ type: cc.SpriteFrame })
    passedSpriteFrame: cc.SpriteFrame = null; 

    @property({ type: cc.SpriteFrame })
    notPassedSpriteFrame: cc.SpriteFrame = null; 

    @property
    isPassed: boolean = false; 

    @property(cc.Node)
    backgroundNode: cc.Node = null; 

    onLoad() {
        this.updateButtonBackground();
    }

    updateButtonBackground() {
        const backgroundSprite = this.backgroundNode.getComponent(cc.Sprite);
        if (!backgroundSprite) {
            console.error("No cc.Sprite component found on the background node.");
            return;
        }

        if (this.isPassed) {
            backgroundSprite.spriteFrame = this.passedSpriteFrame;
        } else {
            backgroundSprite.spriteFrame = this.notPassedSpriteFrame;
        }
    }
}
