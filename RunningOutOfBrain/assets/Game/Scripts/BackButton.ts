const { ccclass, property } = cc._decorator;

@ccclass
export default class BackButton extends cc.Component {

    @property(cc.Button)
    button: cc.Button = null;

    start() {
        if (this.button) {
            this.button.node.on('click', this.onButtonClick, this);
        }
    }

    onButtonClick() {
        cc.director.resume();
        cc.director.loadScene("StageSelectScene");
    }
}

