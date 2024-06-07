const {ccclass, property, disallowMultiple} = cc._decorator;

import { DataManager } from "./../../Scripts/DataManager";

@ccclass
@disallowMultiple
export class PlayerAnimator extends cc.Component {
    private walkAnimation: cc.AnimationClip = null;
    private jumpAnimation: cc.AnimationClip = null;
    private deadAnimation: cc.AnimationClip = null;

    public tracking: cc.Node = null;
    public trackingSpeed: number = 1000;

    start() {}

    update(dt: number) {
        if(this.tracking === null) return;
        const vec = this.tracking.getPosition().sub(this.node.getPosition());
        const mag = this.trackingSpeed * DataManager.getInstance().gameSpeed * dt;
        if(vec.mag() <= mag) this.node.setPosition(this.tracking.getPosition());
        else this.node.setPosition(this.node.getPosition().add(vec.normalize().mul(mag)));
    }

    trackNode(tracking: cc.Node, trackingSpeed: number) {
        this.tracking = tracking;
        this.trackingSpeed = trackingSpeed;
    }

    setWalkClip(clip: cc.AnimationClip) {
        this.walkAnimation = clip;
        this.getComponent(cc.Animation).addClip(this.walkAnimation);
    }

    setJumpClip(clip: cc.AnimationClip) {
        this.jumpAnimation = clip;
        this.getComponent(cc.Animation).addClip(this.walkAnimation);
    }

    setDeadClip(clip: cc.AnimationClip) {
        this.deadAnimation = clip;
        this.getComponent(cc.Animation).addClip(this.walkAnimation);
    }

    isPlayingDead() {
        return this.isPlaying(this.deadAnimation.name);
    }

    isPlayingWalk() {
        return this.isPlaying(this.walkAnimation.name);
    }

    isPlayingJump() {
        return this.isPlaying(this.jumpAnimation.name);
    }

    isPlaying(animation: string) {
        const state = this.getComponent(cc.Animation).getAnimationState(animation);
        return (state && state.isPlaying);
    }

    playDead() {
        this.play(this.deadAnimation.name);
    }

    playWalk() {
        this.play(this.walkAnimation.name);
    }

    playJump() {
        this.play(this.jumpAnimation.name);
    }

    play(animation: string) {
        this.getComponent(cc.Animation).play(animation);
    }

    stop() {
        this.getComponent(cc.Animation).stop();
    }
}
