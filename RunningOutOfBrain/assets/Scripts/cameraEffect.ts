const { ccclass, property } = cc._decorator;

@ccclass('CameraEffect')
export class CameraEffect extends cc.Component {
    @property(cc.Camera)
    public camera: cc.Camera = null;

    private isBlack: boolean = true;
    private duration: number = 0.5;

    start () {
        this.schedule(this.toggleColor, this.duration);
    }

    toggleColor () {
        if (this.isBlack) {
            this.camera.backgroundColor = cc.Color.WHITE;
        } else {
            this.camera.backgroundColor = cc.Color.BLACK;
        }
        this.isBlack = !this.isBlack;
    }
}


// const { ccclass, property } = cc._decorator;

// @ccclass('CameraEffect')
// export class CameraEffect extends cc.Component {
//     @property(cc.Camera)
//     public camera: cc.Camera = null;

//     @property(cc.Node)
//     public maskNode: cc.Node = null;  // 遮罩层节点

//     private isBlack: boolean = true;
//     private duration: number = 0.5;

//     start () {
//         this.schedule(this.toggleColor, this.duration);
//     }

//     toggleColor () {
//         if (this.isBlack) {
//             this.maskNode.color = cc.Color.WHITE;
//         } else {
//             this.maskNode.color = cc.Color.BLACK;
//         }
//         this.isBlack = !this.isBlack;
//     }
// }
