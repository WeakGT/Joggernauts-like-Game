const { ccclass, property } = cc._decorator;

@ccclass
export default class ButtonHover extends cc.Component {
    @property(cc.Node)
    labelNode: cc.Node | null = null;

    onLoad() {
        if (this.labelNode) {
            this.labelNode.active = false;
        }

        this.node.on(cc.Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.on(cc.Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
    }

    onMouseEnter() {
        if (this.labelNode) {
            this.labelNode.active = true;
        }
    }

    onMouseLeave() {
        if (this.labelNode) {
            this.labelNode.active = false;
        }
    }

    onDestroy() {
        this.node.off(cc.Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.off(cc.Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
    }
}
