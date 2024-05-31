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

    @property(cc.SpriteFrame)
    default_sprite: cc.SpriteFrame = null;

    private moveDir = 0;
    private leftDown: boolean = false;
    private rightDown: boolean = false;
    private physicManager: cc.PhysicsManager = null;
    private fallDown: boolean = false;
    private anim: cc.Animation = null;
    private dying: boolean = false;
    private timer = 100;
    private sprite: cc.Sprite = null;
    private small: boolean = true;
    private invincible: boolean = false;

    onLoad(){
        this.physicManager = cc.director.getPhysicsManager();
        this.physicManager.enabled = true;
        this.physicManager.gravity = cc.v2 (0, -400);

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);

        this.sprite = this.getComponent(cc.Sprite);
    }

    start (){
        this.anim = this.getComponent(cc.Animation);
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

    onKeyDown(event)
    {
        switch(event.keyCode)
        {
            case cc.macro.KEY.up:
                this.playerJump(600);
                break;
        }
    }

    onBeginContact(contact, selfCollider, otherCollider) {
    }

    public die() {
    }

    public playerAnimation(){
        if(this.getComponent(cc.PhysicsCollider).enabled === false) {
            this.anim.play("big_die");
        }
        else if(this.fallDown == true){
            if(!this.anim.getAnimationState("jump").isPlaying)
                this.anim.play("jump")
        }
        else{
            if(!this.anim.getAnimationState("big_walk").isPlaying)
                this.anim.play("big_walk");
        }
    }

    public playerJump(velocity: number)
    {
        if(!this.fallDown) {
            this.node.getComponent(cc.RigidBody).linearVelocity = cc.v2(0, velocity);
            this.playEffect(this.Jump);
        }
    }

    public reborn(rebornPos: cc.Vec3)
    {
        this.node.position = rebornPos;
        this.getComponent(cc.RigidBody).linearVelocity = cc.v2();
    }

    playEffect(clip: cc.AudioClip) {
        this.audioID = cc.audioEngine.playEffect(clip, false);
    }
}
