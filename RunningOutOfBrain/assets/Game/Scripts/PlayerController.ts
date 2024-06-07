const {ccclass, property, disallowMultiple} = cc._decorator;

import { DataManager } from "./../../Scripts/DataManager";

import { PlayerAnimator } from './PlayerAnimator';
import { Bullet } from './Bullet';

class PlayerPerformance {
    public kills: number = 0;
    public deathes: number = 0;
    public collected: number = 0;
    public stars: number = 0;
}

@ccclass
@disallowMultiple
export class PlayerController extends cc.Component {
    @property(cc.Prefab)
    bulletPrefab: cc.Prefab = null;

    private sprite: cc.Node = null;
    private anim: PlayerAnimator = null;

    @property(cc.AnimationClip)
    walkAnimation: cc.AnimationClip = null;

    @property(cc.AnimationClip)
    jumpAnimation: cc.AnimationClip = null;

    @property(cc.AnimationClip)
    deadAnimation: cc.AnimationClip = null;

    @property(cc.AudioClip)
    shootEffect: cc.AudioClip = null;

    @property(cc.AudioClip)
    jumpEffect: cc.AudioClip = null;

    @property(cc.AudioClip)
    dieEffect: cc.AudioClip = null;

    public performance: PlayerPerformance = new PlayerPerformance();

    public dying: boolean = false;

    public playerSpeed: number = 150;
    public playerJumpVel: number = 600;
    public shiftingSpeed: number = 1000;

    public bulletSpeed: number = 300;
    public bulletDistance: number = 1000;

    public invincibleTime: number = 0;

    public physicsBoxCollider: cc.PhysicsBoxCollider = null;

    private colliderSize: cc.Size = new cc.Size(24, 40);

    private canShoot: boolean = true;
    private isFalling: boolean = false;

    onLoad(){
        this.physicsBoxCollider = this.getComponent(cc.PhysicsBoxCollider);
        this.physicsBoxCollider.size = this.colliderSize;
        this.node.getChildByName("die").active = false;
    }

    start(){}

    createSprite() {
        this.sprite = new cc.Node(`${this.node.name}-sprite`);
        this.sprite.setScale(2, 2);
        this.node.getParent().addChild(this.sprite, this.node.zIndex-1);
        this.sprite.setParent(this.node.getParent());
        this.sprite.setPosition(this.node.getPosition());
        this.sprite.addComponent(cc.Sprite);
        this.sprite.addComponent(cc.Animation);
        this.anim = this.sprite.addComponent(PlayerAnimator);
        this.anim.trackNode(this.node, this.shiftingSpeed);
        this.anim.setWalkClip(this.walkAnimation);
        this.anim.setJumpClip(this.jumpAnimation);
        this.anim.setDeadClip(this.deadAnimation);
        return this.sprite;
    }

    update (dt: number){
        if(this.node.y < -330) {
            this.die();
            return;
        }
        this.node.x += this.playerSpeed * DataManager.getInstance().gameSpeed * dt;

        this.invincibleTime = Math.max(0, this.invincibleTime - dt);

        this.isFalling = (this.getComponent(cc.RigidBody).linearVelocity.y != 0);

        this.playerAnimation();
    }

    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        // ( horizontal collision )  &&  ( feetY lower than floorY )  ==>>  player hit a wall
        if(otherCollider.node.name !== "Ground") return;
        if(contact.getWorldManifold().normal.x != 0) {
            let worldSpaceFeetY = this.node.convertToWorldSpaceAR(new cc.Vec2(0, -this.physicsBoxCollider.size.height/2)).y;
            let worldSpaceFloor = otherCollider.node.convertToWorldSpaceAR(cc.Vec2.ZERO).y;
            if(worldSpaceFeetY < worldSpaceFloor) this.die();
        }
    }

    public die() {
        if (this.dying) return;
        this.dying = true;
        this.performance.deathes++;

        // effect
        cc.audioEngine.playEffect(this.dieEffect, false);

        this.node.getChildByName("die").active = true;
        this.scheduleOnce(() => {
            this.node.getChildByName("die").active = false;
        }, 0.5);
    }
    
    public playerAnimation(){
        if(!this.anim) return;
        if (this.dying === true) {
            // this.anim.playDead();
        }
        else if (this.isFalling === true) {
            if(!this.anim.isPlayingJump()) this.anim.stop();
        }
        else {
            if(!this.anim.isPlayingWalk()) this.anim.playWalk();
        }
    }

    public playerShoot() {
        if(!this.canShoot) return;

        const bullet = cc.instantiate(this.bulletPrefab);
        bullet.name = "bullet";
        bullet.color = cc.Color.fromHEX(bullet.color, this.node.name);
        bullet.setParent(this.node);
        bullet.setPosition(cc.Vec2.ZERO);
        bullet.setScale(0.25, 0.25, 0.25);

        const bulletScript = bullet.getComponent(Bullet);
        bulletScript.bulletSpeed = this.bulletSpeed;
        bulletScript.bulletDistance = this.bulletDistance;

        this.canShoot = false;
        this.scheduleOnce(()=>{ this.canShoot = true }, 0.2);

        // effect
        cc.audioEngine.playEffect(this.shootEffect, false);
    }

    public playerJump() {
        if(!this.isFalling) {
            this.node.getComponent(cc.RigidBody).linearVelocity = cc.v2(0, this.playerJumpVel);
            this.anim.playJump();

            // effect
            cc.audioEngine.playEffect(this.jumpEffect, false);
        }
    }
}
