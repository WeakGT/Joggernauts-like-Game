const { ccclass, property } = cc._decorator;

import { DataManager } from "./DataManager";

@ccclass
export default class ChooseRoleScene extends cc.Component {
    @property([cc.Node])
    selectedCharactor: cc.Node[] = [];

    @property(cc.Node)
    availableCharactorContainer: cc.Node = null;

    @property([cc.SpriteFrame])
    rolesSprite: cc.SpriteFrame[] = [];

    private rolesIndex: number = 0;
    private rolesUsed: boolean[] = [false, false, false, false, false, false, false, false];

    loadNextScene() {
        cc.director.loadScene("StageSelectScene");
    }

    loadBackScene() {
        cc.director.loadScene("ChoosePlayerScene");
    }

    initNextButton() {
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = cc.director.getScene().name;
        clickEventHandler.handler = "loadNextScene";
        cc.find("Canvas/NextButton").getComponent(cc.Button).clickEvents.push(clickEventHandler);
    }

    initBackButton() {
        let clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = this.node;
        clickEventHandler.component = cc.director.getScene().name;
        clickEventHandler.handler = "loadBackScene";
        cc.find("Canvas/BackButton").getComponent(cc.Button).clickEvents.push(clickEventHandler);
    }

    onKeyDown(event) {
        if (event.keyCode == cc.macro.KEY.up) this.rolesIndex = (this.rolesIndex + 4) % 8;
        if (event.keyCode == cc.macro.KEY.down) this.rolesIndex = (this.rolesIndex - 4 + 8) % 8;
        if (event.keyCode == cc.macro.KEY.left) this.rolesIndex = (this.rolesIndex >= 4 ? 4 : 0) + (this.rolesIndex - 1 + 4) % 4;
        if (event.keyCode == cc.macro.KEY.right) this.rolesIndex = (this.rolesIndex >= 4 ? 4 : 0) + (this.rolesIndex + 1) % 4;
        if (event.keyCode == cc.macro.KEY.enter) {
            if (DataManager.getInstance().selectedPlayers.length < Math.max(2, DataManager.getInstance().userCount)) {
                if (this.rolesUsed[this.rolesIndex]) return;
                this.rolesUsed[this.rolesIndex] = true;

                let roleNode = this.availableCharactorContainer.children[this.rolesIndex];
                roleNode.getChildByName("Sprite").active = false;

                DataManager.getInstance().selectedPlayers.push(roleNode.name.toLowerCase());
            }
        }
    }

    onLoad() {
        DataManager.getInstance().selectedPlayers = [];

        // system
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
 
        // buttons
        this.initNextButton();
        this.initBackButton();

        // labels
        cc.find("Canvas/UserCount").getComponent(cc.Label).string = String(DataManager.getInstance().userCount);

        // player position
        this.selectedCharactor.forEach(s=>{ s.active = false });
        let minPlacingX =-540;
        let maxPlacingX = 540;
        let neededCharactors = Math.max(2, DataManager.getInstance().userCount);
        let frameSpacing = (maxPlacingX-minPlacingX) / (neededCharactors + 1);
        for(let i = 0; i < neededCharactors; i++) {
            this.selectedCharactor[i].active = true;
            this.selectedCharactor[i].setPosition(new cc.Vec2(minPlacingX+frameSpacing*(i+1), -160));
        }
    }

    update () {
        if (DataManager.getInstance().selectedPlayers.length < Math.max(2, DataManager.getInstance().userCount)) {
            cc.find("Canvas/NextButton").getComponent(cc.Button).node.active = false;

            let playerNode = this.selectedCharactor[DataManager.getInstance().selectedPlayers.length].getChildByName("UseRole");

            playerNode.getComponent(cc.Sprite).spriteFrame = this.rolesSprite[this.rolesIndex];
            playerNode.scaleX = 5, playerNode.scaleY = 5;
            if (this.rolesUsed[this.rolesIndex] == true) playerNode.active = false;
            else playerNode.active = true;
        } else {
            cc.find("Canvas/NextButton").getComponent(cc.Button).node.active = true;
        }
    }
}
