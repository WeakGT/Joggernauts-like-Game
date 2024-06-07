const {ccclass, property, disallowMultiple} = cc._decorator;

import { DataManager } from "./../../Scripts/DataManager";

@ccclass
@disallowMultiple
export class Bullet extends cc.Component {
    public bulletSpeed: number = 300;
    public bulletDistance: number = 1000;

    update (dt: number){
        this.node.x += this.bulletSpeed * DataManager.getInstance().gameSpeed * dt;

        if(this.node.x > this.bulletDistance) this.node.destroy();
    }
}
