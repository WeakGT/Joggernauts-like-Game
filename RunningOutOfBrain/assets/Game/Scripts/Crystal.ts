import userinfor = require("../../Scripts/Firebase/User");

const {ccclass, property, disallowMultiple} = cc._decorator;

import { PlayerController } from './PlayerController';

@ccclass
@disallowMultiple
export class Crystal extends cc.Component {
    @property(cc.AnimationClip)
    defaultAnimation: cc.AnimationClip = null;

    @property(cc.AudioClip)
    crystalEffect: cc.AudioClip = null;

    private anim: cc.Animation = null;

    onLoad() {
        this.anim = this.addComponent(cc.Animation);
        this.anim.addClip(this.defaultAnimation);
    }

    update() {
        if (!this.anim.getAnimationState(this.defaultAnimation.name).isPlaying) {
            this.anim.play(this.defaultAnimation.name);
        }
    }

    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        let otherNode = otherCollider.node;
        let playerController = otherNode.getComponent(PlayerController);

        if (playerController) {
            if (otherNode.name === this.node.name) {
                userinfor.score += 5;
                playerController.performance.collected++;
            }
            cc.audioEngine.playEffect(this.crystalEffect, false);
            this.node.destroy();
        }
    }
}

