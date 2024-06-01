const {ccclass, property} = cc._decorator;

import MultiPlayerController from './MultiPlayerController';

@ccclass
export default class PlayerCamera extends cc.Component {

    @property
    yAxisValid = false;
    
    @property(cc.Node)
    multiPlayerControllerNode: cc.Node = null;

    @property
    leftBoundary: number = 0;

    @property
    rightBoundary: number = 5760; 

    private multiPlayerController: MultiPlayerController = null;
    
    onLoad() {
        this.multiPlayerController = this.multiPlayerControllerNode.getComponent(MultiPlayerController);
    }
    
    update() {
        let target = this.multiPlayerController.getLeadingPlayer();
        if (target) {
            let tar_pos = target.getPosition();
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
