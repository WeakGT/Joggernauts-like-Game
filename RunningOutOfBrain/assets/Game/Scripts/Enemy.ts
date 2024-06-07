const {ccclass, property, disallowMultiple} = cc._decorator;

import { DataManager } from "./../../Scripts/DataManager";

import { PlayerController } from './PlayerController';

@ccclass
@disallowMultiple
export class Enemy extends cc.Component {
    @property()
    Speed: number = 0;

    @property(cc.AnimationClip)
    defaultAnimation: cc.AnimationClip = null;

    private anim: cc.Animation = null;

    onLoad() {}

    start() {
        this.anim = this.getComponent(cc.Animation);
        this.anim.addClip(this.defaultAnimation);
    }

    update(dt: number) {
        this.node.x += this.Speed * DataManager.getInstance().gameSpeed * dt;
        if (!this.anim.getAnimationState(this.defaultAnimation.name).isPlaying) {
            this.anim.play(this.defaultAnimation.name);
        }
    }

    onBeginContact(contact, selfCollider, otherCollider) {
        let otherNode = otherCollider.node;
        let playerController = otherNode.getComponent(PlayerController);

        if(playerController) {
            if(playerController.invincibleTime > 0 || otherNode.name === this.node.name) {
                contact.disabled = true;
                this.node.destroy();
                // this.scheduleOnce(() => {
                //     this.node.active = false;
                // }, 0.05);
            }
            else {
                contact.disabled = true;
                playerController.die();
            }
        }
        else if(otherNode.name === "bullet") {
            if(otherNode.parent && otherNode.parent.name === this.node.name) {
                contact.disabled = true;
                this.node.destroy();
                otherNode.destroy();
                // this.scheduleOnce(() => {
                //     this.node.active = false;
                //     otherNode.active = false;
                // }, 0.05);
            }
            else {
                otherNode.destroy();
                // this.scheduleOnce(() => {
                //     otherNode.active = false;
                // }, 0.05);
            }
        }
    }

    /*
    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        let isBullet = (otherCollider.node.name === "bullet");
        let potentialPlayerNode = isBullet ? otherCollider.node.parent : otherCollider.node;
        let playerController = potentialPlayerNode.getComponent(PlayerController);

        if (playerController) {
            if (otherNode.name === this.node.name) {
                contact.disabled = true;
                this.dying = true;
                this.scheduleOnce(() => {
                    this.node.active = false;
                    this.die();
                }, 0.05);
            } else {
                contact.disabled = true;
                playerController.die();
            }
        }
        else if(otherNode.name === "bullet") {
            if(otherNode.parent && otherNode.parent.name === this.node.name) {
                contact.disabled = true;
                this.dying = true;
                this.scheduleOnce(() => {
                    this.node.active = false;
                    this.die();
                    otherNode.active = false;
                }, 0.05);
            }
            else {
                this.scheduleOnce(() => {
                    otherNode.active = false;
                }, 0.05);
            }
        }
    }
    */
}

