const { ccclass, property } = cc._decorator;

@ccclass
export default class ChooseRoleScene extends cc.Component {

    @property(cc.Node)
    playerOne: cc.Node = null;

    @property(cc.Node)
    playerTwo: cc.Node = null;

    @property(cc.Node)
    playerThree: cc.Node = null;

    @property(cc.Node)
    playerFour: cc.Node = null;

    @property(cc.SpriteFrame)
    currentFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    originalFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    currentRole: cc.SpriteFrame = null;

    @property([cc.SpriteFrame])
    rolesSprite: cc.SpriteFrame[] = [];

    @property(cc.Material)
    grayScaleMaterial: cc.Material = null;

    private currentPlayer: number = 1;
    private rolesIndex: number = 0;
    private rolesUsed: boolean[] = [false, false, false, false, false, false];
    public playerNumber: number = 0;

    loadNextScene() {
        // cc.director.loadScene("Map");
    }

    loadBackScene() {
        cc.director.loadScene("ChoosePlayerScene");
    }

    initNextButton() {
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = "ChooseRoleScene";
        clickEventHandler.handler = "loadNextScene";
        cc.find("Canvas/NextButton").getComponent(cc.Button).clickEvents.push(clickEventHandler);
    }

    initBackButton() {
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = "ChooseRoleScene";
        clickEventHandler.handler = "loadBackScene";
        cc.find("Canvas/BackButton").getComponent(cc.Button).clickEvents.push(clickEventHandler);
    }

    onKeyDown(event) {
        if (event.keyCode == cc.macro.KEY.up) this.rolesIndex = (this.rolesIndex + 3) % 6;
        if (event.keyCode == cc.macro.KEY.down) this.rolesIndex = (this.rolesIndex - 3 + 6) % 6;
        if (event.keyCode == cc.macro.KEY.left) this.rolesIndex = (this.rolesIndex >= 3 ? 3 : 0) + (this.rolesIndex - 1 + 3) % 3;
        if (event.keyCode == cc.macro.KEY.right) this.rolesIndex = (this.rolesIndex >= 3 ? 3 : 0) + (this.rolesIndex + 1) % 3;
        if (event.keyCode == cc.macro.KEY.enter) {
            if (this.currentPlayer <= this.playerNumber) {
                if (this.rolesUsed[this.rolesIndex]) return;
                this.rolesUsed[this.rolesIndex] = true;
                let currentNode: cc.Node;
                if (this.rolesIndex == 0) currentNode = cc.find("Canvas/PinkFrame/Pink");
                if (this.rolesIndex == 1) currentNode = cc.find("Canvas/RedFrame/Red");
                if (this.rolesIndex == 2) currentNode = cc.find("Canvas/GreenFrame/Green");
                if (this.rolesIndex == 3) currentNode = cc.find("Canvas/OrangeFrame/Orange");
                if (this.rolesIndex == 4) currentNode = cc.find("Canvas/BlueFrame/Blue");
                if (this.rolesIndex == 5) currentNode = cc.find("Canvas/YellowFrame/Yellow");
                currentNode.getComponent(cc.Sprite).setMaterial(0, this.grayScaleMaterial);
                this.currentPlayer++;
            }
        }
    }

    start() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        this.playerNumber = parseInt(cc.sys.localStorage.getItem('playerNumber')) || 0;
        
        this.initNextButton();
        this.initBackButton();

        if (this.playerNumber == 1) {
            this.playerOne.active = true
            this.playerTwo.active = false;
            this.playerThree.active = false;
            this.playerFour.active = false;

            this.playerOne.position = cc.v3(0, -160, 0);
        }
        else if (this.playerNumber == 2) {
            this.playerOne.active = true
            this.playerTwo.active = true;
            this.playerThree.active = false;
            this.playerFour.active = false;

            this.playerOne.position = cc.v3(-160, -160, 0);
            this.playerTwo.position = cc.v3(160, -160, 0);
            
        }
        else if (this.playerNumber == 3) {
            this.playerOne.active = true
            this.playerTwo.active = true;
            this.playerThree.active = true;
            this.playerFour.active = false;
            
            this.playerOne.position = cc.v3(-240, -160, 0);
            this.playerTwo.position = cc.v3(0, -160, 0);
            this.playerThree.position = cc.v3(240, -160, 0);
        }
        else if (this.playerNumber == 4) {
            this.playerOne.active = true
            this.playerTwo.active = true;
            this.playerThree.active = true;
            this.playerFour.active = true;

            this.playerOne.position = cc.v3(-270, -160, 0);
            this.playerTwo.position = cc.v3(-90, -160, 0);
            this.playerThree.position = cc.v3(90, -160, 0);
            this.playerFour.position = cc.v3(270, -160, 0);            
        }
    }

    update (dt) {
        cc.find("Canvas/PlayerNumber").getComponent(cc.Label).string = String(this.playerNumber);
        if (this.currentPlayer <= this.playerNumber) {
            let playerNode: cc.Node;
            if (this.currentPlayer == 1) playerNode = cc.find("Canvas/Player1/UseRole");
            if (this.currentPlayer == 2) playerNode = cc.find("Canvas/Player2/UseRole");
            if (this.currentPlayer == 3) playerNode = cc.find("Canvas/Player3/UseRole");
            if (this.currentPlayer == 4) playerNode = cc.find("Canvas/Player4/UseRole");

            playerNode.getComponent(cc.Sprite).spriteFrame = this.rolesSprite[this.rolesIndex];
            if (this.rolesUsed[this.rolesIndex] == true) playerNode.getComponent(cc.Sprite).setMaterial(0, this.grayScaleMaterial);
            else playerNode.getComponent(cc.Sprite).setMaterial(0, cc.Material.getBuiltinMaterial('2d-sprite'));
        }
        cc.find("Canvas/NextButton").getComponent(cc.Button).node.active = this.currentPlayer - 1 == this.playerNumber;
    }
}
