const { ccclass, property } = cc._decorator;

@ccclass
export default class ChoosePlayerScene extends cc.Component {

    @property(cc.Node)
    playerOneUnready: cc.Node = null;

    @property(cc.Node)
    playerOneReady: cc.Node = null;

    @property(cc.Node)
    playerTwoUnready: cc.Node = null;

    @property(cc.Node)
    playerTwoReady: cc.Node = null;

    @property(cc.Node)
    playerThreeUnready: cc.Node = null;

    @property(cc.Node)
    playerThreeReady: cc.Node = null;

    @property(cc.Node)
    playerFourUnready: cc.Node = null;

    @property(cc.Node)
    playerFourReady: cc.Node = null;

    public playerNumber: number = 0;

    loadNextScene() {
        cc.sys.localStorage.setItem('playerNumber', this.playerNumber);
        cc.director.loadScene("ChooseRoleScene");
    }

    loadBackScene() {
        cc.director.loadScene("StartScene");
    }

    initNextButton() {
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = "ChoosePlayerScene";
        clickEventHandler.handler = "loadNextScene";
        cc.find("Canvas/NextButton").getComponent(cc.Button).clickEvents.push(clickEventHandler);
    }

    initBackButton() {
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = "ChoosePlayerScene";
        clickEventHandler.handler = "loadBackScene";
        cc.find("Canvas/BackButton").getComponent(cc.Button).clickEvents.push(clickEventHandler);
    }

    onKeyDown(event) {
        if (event.keyCode == cc.macro.KEY.q) {
            if (this.playerOneUnready.active == true && this.playerNumber == 0)
                this.playerOneReady.active = true, this.playerOneUnready.active = false, this.playerNumber++;
            else if (this.playerOneReady.active == true && this.playerNumber == 1)
                this.playerOneReady.active = false, this.playerOneUnready.active = true, this.playerNumber--;
        }
        if (event.keyCode == cc.macro.KEY.r) {
            if (this.playerTwoUnready.active == true && this.playerNumber == 1)
                this.playerTwoReady.active = true, this.playerTwoUnready.active = false, this.playerNumber++;
            else if (this.playerTwoReady.active == true && this.playerNumber == 2)
                this.playerTwoReady.active = false, this.playerTwoUnready.active = true, this.playerNumber--;
        }
        if (event.keyCode == cc.macro.KEY.u) {
            if (this.playerThreeUnready.active == true && this.playerNumber == 2)
                this.playerThreeReady.active = true, this.playerThreeUnready.active = false, this.playerNumber++;
            else if (this.playerThreeReady.active == true && this.playerNumber == 3)
                this.playerThreeReady.active = false, this.playerThreeUnready.active = true, this.playerNumber--;
        }
        if (event.keyCode == cc.macro.KEY.p) {
            if (this.playerFourUnready.active == true && this.playerNumber == 3)
                this.playerFourReady.active = true, this.playerFourUnready.active = false, this.playerNumber++;
            else if (this.playerFourReady.active == true && this.playerNumber == 4)
                this.playerFourReady.active = false, this.playerFourUnready.active = true, this.playerNumber--;
        }
    }

    start() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        this.playerNumber = parseInt(cc.sys.localStorage.getItem('playerNumber')) || 0;

        if (this.playerNumber == 0) {
            this.playerOneReady.active = false, this.playerOneUnready.active = true;
            this.playerTwoReady.active = false, this.playerTwoUnready.active = true;
            this.playerThreeReady.active = false, this.playerThreeUnready.active = true;
            this.playerFourReady.active = false, this.playerFourUnready.active = true;
        }
        else if (this.playerNumber == 1) {
            this.playerOneReady.active = true, this.playerOneUnready.active = false;
            this.playerTwoReady.active = false, this.playerTwoUnready.active = true;
            this.playerThreeReady.active = false, this.playerThreeUnready.active = true;
            this.playerFourReady.active = false, this.playerFourUnready.active = true;
        }
        else if (this.playerNumber == 2) {
            this.playerOneReady.active = true, this.playerOneUnready.active = false;
            this.playerTwoReady.active = true, this.playerTwoUnready.active = false;
            this.playerThreeReady.active = false, this.playerThreeUnready.active = true;
            this.playerFourReady.active = false, this.playerFourUnready.active = true;
        }
        else if (this.playerNumber == 3) {
            this.playerOneReady.active = true, this.playerOneUnready.active = false;
            this.playerTwoReady.active = true, this.playerTwoUnready.active = false;
            this.playerThreeReady.active = true, this.playerThreeUnready.active = false;
            this.playerFourReady.active = false, this.playerFourUnready.active = true;
        }
        else if (this.playerNumber == 4) {
            this.playerOneReady.active = true, this.playerOneUnready.active = false;
            this.playerTwoReady.active = true, this.playerTwoUnready.active = false;
            this.playerThreeReady.active = true, this.playerThreeUnready.active = false;
            this.playerFourReady.active = true, this.playerFourUnready.active = false;
        }

        this.initNextButton();
        this.initBackButton();
    }

    update(dt) {
        cc.find("Canvas/PlayerNumber").getComponent(cc.Label).string = String(this.playerNumber);
        cc.find("Canvas/NextButton").getComponent(cc.Button).node.active = this.playerNumber !== 0;
    }
}
