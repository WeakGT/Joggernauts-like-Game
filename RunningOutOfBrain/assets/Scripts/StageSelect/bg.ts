const { ccclass, property } = cc._decorator;

@ccclass
export default class SpaceSimulation extends cc.Component {
  @property(cc.Node)
  private spaceObjectNode: cc.Node = null;

  private spaceObject: SpaceObject;

  onLoad() {
    const velocityX = this.getRandomNumber(-200, 200); // 隨機速度在 -200 到 200 之間
    const velocityY = this.getRandomNumber(-200, 200); // 隨機速度在 -200 到 200 之間
    const anim = this.spaceObjectNode.getComponent(cc.Animation); // 從 spaceObjectNode 中獲取動畫組件
    const clipIndex = this.getRandomNumber(0, 3); // 隨機選擇動畫片段索引在 0 到 2 之間

    this.spaceObject = new SpaceObject(0, 0, velocityX, velocityY, anim, clipIndex);
    
    this.spaceObject.playAnimation();
  }

  update(dt: number) {
    const position = this.spaceObject.getPosition();

    if (position.x >= 450 || position.x <= -450) {
        this.spaceObject.velocityX *= -1;
    } else if (position.y >= 280 || position.y <= -280) {
        this.spaceObject.velocityY *= -1;
    }

    if ((this.spaceObject.velocityX < 0 && this.spaceObjectNode.scaleX > 0) || (this.spaceObject.velocityX > 0 && this.spaceObjectNode.scaleX < 0)) {
        this.spaceObjectNode.scaleX *= -1;
    }

    this.spaceObject.update(dt);
    const newPosition = this.spaceObject.getPosition(); 
    this.spaceObjectNode.setPosition(newPosition.x, newPosition.y);
  }

  getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

class SpaceObject {
  private x: number;
  private y: number;
  public velocityX: number;
  public velocityY: number;
  private anim: cc.Animation;
  private clipIndex: number;

  constructor(x: number, y: number, velocityX: number, velocityY: number, anim: cc.Animation, clipIndex: number) {
    this.x = x;
    this.y = y;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.anim = anim;
    this.clipIndex = clipIndex;
  }

  update(dt: number) {
    this.x += this.velocityX * dt;
    this.y += this.velocityY * dt;
  }

  getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  playAnimation() {
    if (this.anim && this.anim.getClips().length > this.clipIndex) {
        this.anim.play(this.anim.getClips()[this.clipIndex].name); // 播放随机选择的动画片段
    }
  }
}
