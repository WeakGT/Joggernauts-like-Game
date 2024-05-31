// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class PlayerCamera extends cc.Component {

    @property
    yAxisValid = false;
    
    @property(cc.Node)
    target: cc.Node = null;

    @property
    leftBoundary: number = 0;

    @property
    rightBoundary: number = 2880; 
    
    update () {
        if (this.target) {
            let tar_pos = this.target.getPosition();
            tar_pos.x = tar_pos.x > this.leftBoundary ? tar_pos.x : this.leftBoundary;
            tar_pos.x = tar_pos.x < this.rightBoundary - 960 ? tar_pos.x : this.rightBoundary - 960;

            if (this.yAxisValid)
                tar_pos.y = tar_pos.y > 0 ? tar_pos.y : 0;
            let new_pos = this.node.getPosition();
            new_pos.lerp(tar_pos, 0.2, new_pos);
            this.node.x = new_pos.x;
            if (this.yAxisValid)
                this.node.y = new_pos.y;
        }
    }
}
