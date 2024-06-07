const { ccclass, property } = cc._decorator;

@ccclass
export default class CameraController extends cc.Component {
    @property(cc.Camera)
    camera: cc.Camera = null;

    @property([cc.Node])
    objects: cc.Node[] = [];

    @property()
    moveSpeed: number = 5;

    @property(cc.Node)
    backButton: cc.Node = null;

    @property(cc.Node)
    nextButton: cc.Node = null;

    private targetPosition: cc.Vec3 = null;
    private isMoving: boolean = false;
    private targetSceneName: string = "";

    loadNextScene() {
        cc.director.loadScene(this.targetSceneName);
    }

    loadBackScene() {
        cc.director.loadScene("ChooseRoleScene");
    }

    onLoad() {
        this.camera = this.camera || this.getComponent(cc.Camera);
    
        if (this.objects.length > 0) {
            this.moveToTarget(this.objects[0]);
        }
    
        this.objects.forEach((object, index) => {
            object.on('click', () => this.moveToTarget(object), this);
        });
    
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    onDestroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    update(dt: number) {
        if (this.isMoving && this.targetPosition) {
            const currentPosition = this.camera.node.position;
            const newPosition = cc.v3(
                cc.misc.lerp(currentPosition.x, this.targetPosition.x, dt * this.moveSpeed),
                cc.misc.lerp(currentPosition.y, this.targetPosition.y, dt * this.moveSpeed),
                currentPosition.z || 0 // Assuming we don't want to change z-axis position
            );

            this.camera.node.setPosition(newPosition);

            if (cc.Vec3.distance(newPosition, this.targetPosition) < 0.1) {
                this.camera.node.setPosition(this.targetPosition);
                this.isMoving = false;
            }
        }
    }

    moveToTarget(target: cc.Node) {
        this.targetPosition = target.position;
        this.isMoving = true;
        this.targetSceneName = `Stage${target.getChildByName("Label").getComponent(cc.Label).string}`;
    }

    onKeyDown(event: cc.Event.EventKeyboard) {
        if (event.keyCode == cc.macro.KEY.enter) {
            this.loadNextScene();
        }
        else {
            const keyCode = event.keyCode - cc.macro.KEY['1' as keyof typeof cc.macro.KEY];
            if (keyCode >= 0 && keyCode < this.objects.length) {
                const targetObject = this.objects[keyCode];
                this.moveToTarget(targetObject);
            }
        }
    }
}
