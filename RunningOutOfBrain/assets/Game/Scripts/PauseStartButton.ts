const { ccclass, property } = cc._decorator;

@ccclass
export default class PauseStartButton extends cc.Component {

    @property(cc.Button)
    button: cc.Button = null;

    @property(cc.Label)
    buttonLabel: cc.Label = null;

    start() {
        if (this.button) {
            this.button.node.on('click', this.onButtonClick, this);
        }

        this.updateButtonLabel();
    }

    onButtonClick() {
        if (cc.director.isPaused()) {
            cc.director.resume();
        } else {
            cc.director.pause();
        }
        this.updateButtonLabel();
    }

    updateButtonLabel() {
        if (this.buttonLabel) {
            if (cc.director.isPaused()) {
                this.buttonLabel.string = "Resume";
            } else {
                this.buttonLabel.string = "Pause";
            }
        }
    }
}
