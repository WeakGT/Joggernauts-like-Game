const {ccclass, property, disallowMultiple} = cc._decorator;

import { PlayerController } from './PlayerController';

@ccclass
@disallowMultiple
export class Shield extends cc.Component {
    @property(cc.AnimationClip)
    defaultAnimation: cc.AnimationClip = null;

    @property(cc.AudioClip)
    crystalEffect: cc.AudioClip = null;

    public invincibleTime: number = 5;

    private anim: cc.Animation = null;
    private protectingPlayer: cc.Node = null;

    onLoad() {
        this.anim = this.addComponent(cc.Animation);
        this.anim.addClip(this.defaultAnimation);
    }

    update() {
        if (!this.anim.getAnimationState(this.defaultAnimation.name).isPlaying) {
            this.anim.play(this.defaultAnimation.name);
        }
        if(this.protectingPlayer) {
            this.node.setParent(this.protectingPlayer);
            this.node.setPosition(this.node.width/2, -this.node.height/3);
        }
    }

    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        let otherNode = otherCollider.node;
        let playerController = otherNode.getComponent(PlayerController);

        if (playerController && !this.protectingPlayer) {
            this.protectingPlayer = otherCollider.node;
            playerController.invincibleTime = this.invincibleTime;
            this.scheduleOnce(()=>{ this.node.destroy() }, playerController.invincibleTime);
            // effect
            cc.audioEngine.playEffect(this.crystalEffect, false);
        }
    }
}

