const { ccclass, property } = cc._decorator;

import { DataManager } from "./DataManager";

@ccclass("PlayerJoin")
class PlayerJoin {
    @property(cc.Node)
    nodeUnready: cc.Node = null;

    @property(cc.Node)
    nodeReady: cc.Node = null;
}

@ccclass
export default class ChoosePlayerScene extends cc.Component {
    @property([PlayerJoin])
    availablePlayers: PlayerJoin[] = [];

    loadNextScene() {
        cc.director.loadScene("ChooseRoleScene");
    }

    loadBackScene() {
        cc.director.loadScene("StartScene");
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
        let keys = [
            cc.macro.KEY.q,
            cc.macro.KEY.r,
            cc.macro.KEY.u,
            cc.macro.KEY.p,
        ];
        DataManager.getInstance().userCount = 0;
        for(let i = 0; i < keys.length; i++) {
            if(event.keyCode == keys[i]) {
                [
                    this.availablePlayers[i].nodeReady.active,
                    this.availablePlayers[i].nodeUnready.active,
                ] = [
                    this.availablePlayers[i].nodeUnready.active,
                    this.availablePlayers[i].nodeReady.active,
                ];
            }
            if(this.availablePlayers[i].nodeReady.active) {
                DataManager.getInstance().userCount++;
            }
        }
    }

    onLoad() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);

        this.availablePlayers.forEach((p, idx)=>{
            p.nodeReady.active = idx < DataManager.getInstance().userCount;
            p.nodeUnready.active = idx >= DataManager.getInstance().userCount;
        });

        this.initNextButton();
        this.initBackButton();
    }
  
    update() {
        cc.find("Canvas/UserCount").getComponent(cc.Label).string = String(DataManager.getInstance().userCount);
        cc.find("Canvas/NextButton").getComponent(cc.Button).node.active = DataManager.getInstance().userCount !== 0;
    }
}
