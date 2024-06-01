// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export class PlayerController extends cc.Component {
    @property()
    playerSpeed: number = 150;

    @property(cc.AnimationClip)
    dieAnimation: cc.AnimationClip = null;

    @property(cc.AnimationClip)
    jumpAnimation: cc.AnimationClip = null;

    @property(cc.AnimationClip)
    walkAnimation: cc.AnimationClip = null;

    private physicManager: cc.PhysicsManager = null;
    private fallDown: boolean = false;
    private anim: cc.Animation = null;
    private dying: boolean = false;
    private invincible: boolean = false;

    onLoad(){
        this.physicManager = cc.director.getPhysicsManager();
        this.physicManager.enabled = true;
        this.physicManager.gravity = cc.v2 (0, -400);
    }

    start (){
        this.anim = this.getComponent(cc.Animation);
        
        this.anim.addClip(this.dieAnimation);
        this.anim.addClip(this.jumpAnimation);
        this.anim.addClip(this.walkAnimation);
    }

    update (dt){
        this.node.x += this.playerSpeed * 1 * dt;
        if(this.getComponent(cc.RigidBody).linearVelocity.y != 0)
            this.fallDown = true;
        else
            this.fallDown = false;

        this.playerAnimation();

        if(this.node.y < -330 && this.dying == false)
            this.die();
    }

    onBeginContact(contact, selfCollider, otherCollider) {
    }

    public die() {
    }
    
    public playerAnimation(){
        if (this.dying === true) {
            this.anim.play(this.dieAnimation.name);
        }
        else if (this.fallDown === true) {
            if (!this.anim.getAnimationState(this.jumpAnimation.name).isPlaying) {
                this.anim.stop();
            }
        }
        else {
            if (!this.anim.getAnimationState(this.walkAnimation.name).isPlaying) {
                this.anim.play(this.walkAnimation.name);
            }
        }
    }

    public playerJump(velocity: number)
    {
        if(!this.fallDown) {
            this.node.getComponent(cc.RigidBody).linearVelocity = cc.v2(0, velocity);
            this.anim.play(this.jumpAnimation.name);
        }
    }

    public reborn(rebornPos: cc.Vec3)
    {
        this.node.position = rebornPos;
        this.getComponent(cc.RigidBody).linearVelocity = cc.v2();
    }
}
