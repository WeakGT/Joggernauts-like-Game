const {ccclass, property, disallowMultiple} = cc._decorator;

import { DataManager } from "./../../Scripts/DataManager";

import { PlayerController } from './PlayerController';

class RandomNumberGenerator {
    private m: number = 0x80000000;
    private a: number = 1103515245;
    private c: number = 2073247261;
    private s: number;

    constructor(seed: number) {
        this.s = seed ? seed : Math.floor(Math.random() * (this.m - 1));
    }

    public random(): number {
        this.s = (this.a * this.s + this.c) % (this.m - 1);
        return this.s;
    }

    public percentage(): number {
        return (this.random()%100);
    }
}

@ccclass("ColorGroup")
class ColorGroup {
    @property()
    groupName: string = "";

    @property(cc.Color)
    reprColor: cc.Color = new cc.Color(0, 0, 0);

    @property(cc.Prefab)
    playerPrefab: cc.Prefab = null;

    @property([cc.Prefab])
    enemyPrefabs: cc.Prefab[] = [];

    @property([cc.Prefab])
    collectablePrefabs: cc.Prefab[] = [];
}

@ccclass("SelectedPlayer")
class SelectedPlayer {
    @property()
    colorName: string = "";
}

@ccclass("CameraProperties")
class CameraProperties {
    @property(cc.Node)
    camera: cc.Node = null;

    @property()
    cameraShiftingSpeed: number = 1000;

    @property()
    cameraOffset: cc.Vec2 = new cc.Vec2(-125, -250);
}

@ccclass("PlayerProperties")
class PlayerProperties {
    @property(cc.Node)
    playerContainer: cc.Node = null;

    @property(cc.Vec2)
    playerInitialPosition: cc.Vec2 = new cc.Vec2(-400, 50);

    @property()
    playerSpeed: number = 150;

    @property()
    playerJumpVel: number = 600;

    @property()
    playerShiftingSpeed: number = 1000;

    @property()
    distBetweenPlayers: number = 100;

    @property()
    bulletSpeed: number = 300;
    
    @property()
    bulletDistance: number = 1000;

    @property([SelectedPlayer])
    selectedPlayers: SelectedPlayer[] = [];
}

@ccclass("EnemyProperties")
class EnemyProperties {
    @property(cc.Node)
    enemyContainer: cc.Node = null;

    @property()
    minDistBetweenEnemy: number = 64;

    @property({ slide: true, min: 0, max: 100, step: 1 })
    enemySpawnProbability: number = 50;
}

@ccclass("CollectableProperties")
class CollectableProperties {
    @property(cc.Node)
    collectableContainer: cc.Node = null;

    @property()
    minDistBetweenCollectable: number = 64;

    @property()
    minDistAboveGround: number = 32;

    @property()
    maxDistAboveGround: number = 96;

    @property({ slide: true, min: 0, max: 100, step: 1 })
    collectableSpawnProbability: number = 50;

    @property(cc.Prefab)
    shieldPrefab: cc.Prefab = null;

    @property({ slide: true, min: 0, max: 100, step: 1 })
    shieldSpawnProbability: number = 5;
}

@ccclass("StageGeneratingProperties")
class StageGeneratingProperties {
    @property(cc.Node)
    colliderContainer: cc.Node = null;

    @property()
    minPlatformWidth: number = 64;

    @property()
    maxPlatformWidth: number = 384;

    @property(cc.SpriteFrame)
    platformSpriteL: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    platformSpriteM: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    platformSpriteR: cc.SpriteFrame = null;

    @property([cc.Vec3], )
    initialPlatforms: cc.Vec3[] = [];
}

@ccclass
@disallowMultiple
export class GameManager extends cc.Component {
    @property()
    stageRandomSeed: number = 117492658;

    @property()
    isInfiniteStage: boolean = false;

    @property(CameraProperties)
    cameraProperties: CameraProperties = new CameraProperties();

    @property(PlayerProperties)
    playerProperties: PlayerProperties = new PlayerProperties();

    @property(EnemyProperties)
    enemyProperties: EnemyProperties = new EnemyProperties();

    @property(CollectableProperties)
    collectableProperties: CollectableProperties = new CollectableProperties();

    @property(StageGeneratingProperties)
    stageGeneratingProperties: StageGeneratingProperties = new StageGeneratingProperties();

    @property([ColorGroup])
    availableColorGroups: ColorGroup[] = [];

    @property(cc.AudioClip)
    rebornEffect: cc.AudioClip = null;

    @property(cc.AudioClip)
    switchEffect: cc.AudioClip = null;

    private cameraSize: cc.Size = null;
    private stageWidth: number = null;
    private players: PlayerController[] = [];
    private gamepads: { [index: number]: Gamepad } = {};
    private lives: number = 5;
    private physicsManager: cc.PhysicsManager = null;
    private canSwitch: boolean = true;
    private stageEnded: boolean = false;

    private random: RandomNumberGenerator = null;

    onLoad() {
        this.random = new RandomNumberGenerator(this.stageRandomSeed);

        this.physicsManager = cc.director.getPhysicsManager();
        this.physicsManager.enabled = true;
        this.physicsManager.gravity = cc.v2(0, -1600);

        this.lives = DataManager.getInstance().playerLives;

        this.stageGeneratingProperties.initialPlatforms.forEach((data:cc.Vec3)=>{
            // here uses cc.Vec3 to store data
            // cc.Vec3.x -> platform position x
            // cc.Vec3.y -> platform position y
            // cc.Vec3.z -> platform width
            this.createNewPlatform(data.x, data.y, data.z);
        });

        this.cameraSize = cc.find("Canvas").getContentSize();
        this.stageWidth = Math.max(...this.stageGeneratingProperties.colliderContainer.children.map(ground=>{
            return ground.getPosition().x + ground.getComponent(cc.PhysicsBoxCollider).size.width;
        }));

        this.spawnPlayers();
        this.spawnEnemies();
        this.spawnCollectables();

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        window.addEventListener("gamepadconnected", this.onGamepadConnected.bind(this));
        window.addEventListener("gamepaddisconnected", this.onGamepadDisconnected.bind(this));
    }

    onDestroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    update(dt: number) {
        this.pollGamepads();
        this.scanDeadPlayer();
        this.cameraFollow(dt);
        if(this.isInfiniteStage) {
            this.generateMorePlatform();
        }
        else if(this.getLeadingPlayer().node.x > this.stageWidth - this.cameraSize.width) {
            this.endStage();
        }
    }

    onKeyDown(event: cc.Event.EventKeyboard) {
        if(this.stageEnded) return;
        switch(event.keyCode) {
            // jump
            case cc.macro.KEY.up:
                if(DataManager.getInstance().userCount === 1) {
                    if(this.players[0] && this.isLeadingPlayer(0)) this.players[0].playerJump();
                    else this.players[1].playerJump();
                }
                else if (this.players[0]) this.players[0].playerJump();
                break;
            case cc.macro.KEY.w:
                if(DataManager.getInstance().userCount === 1) {
                    if(this.players[0] && this.isLeadingPlayer(0)) this.players[1].playerJump();
                    else this.players[0].playerJump();
                }
                else if (this.players[1]) this.players[1].playerJump();
                break;
            case cc.macro.KEY.t:
                if (this.players[2]) this.players[2].playerJump();
                break;
            case cc.macro.KEY.i:
                if (this.players[3]) this.players[3].playerJump();
                break;
            //switch
            case cc.macro.KEY.right:
                if(DataManager.getInstance().userCount === 1 && this.isLeadingPlayer(0)) {
                    this.switchWithLeadingPlayer(1);
                }
                else {
                    this.switchWithLeadingPlayer(0);
                }
                break;
            case cc.macro.KEY.d:
                this.switchWithLeadingPlayer(1);
                break;
            case cc.macro.KEY.h:
                this.switchWithLeadingPlayer(2);
                break;
            case cc.macro.KEY.l:
                this.switchWithLeadingPlayer(3);
                break;
            // shoot
            case cc.macro.KEY.down:
                if(DataManager.getInstance().userCount === 1) {
                    this.getLeadingPlayer().playerShoot();
                }
                else if (this.players[0] && this.isLeadingPlayer(0)) {
                    this.players[0].playerShoot();
                }
                break;
            case cc.macro.KEY.s:
                if (this.players[1] && this.isLeadingPlayer(1) && DataManager.getInstance().userCount >= 2) this.players[1].playerShoot();
                break;
            case cc.macro.KEY.g:
                if (this.players[2] && this.isLeadingPlayer(2)) this.players[2].playerShoot();
                break;
            case cc.macro.KEY.k:
                if (this.players[3] && this.isLeadingPlayer(3)) this.players[3].playerShoot();
                break;
        }
    }

    /* -----
    Camera Section
    ----- */
    cameraFollow(dt: number) {
        const tracking = new cc.Vec2(
            this.getLastPlayer().node.position.x + this.cameraSize.width/2, 
            this.cameraSize.height/2
        ).add(this.cameraProperties.cameraOffset);

        const vec = tracking.sub(this.cameraProperties.camera.getPosition());
        const mag = this.cameraProperties.cameraShiftingSpeed * DataManager.getInstance().gameSpeed * dt;
        if(vec.mag() <= mag) this.cameraProperties.camera.setPosition(tracking);
        else this.cameraProperties.camera.setPosition(this.cameraProperties.camera.getPosition().add(vec.normalize().mul(mag)));

        this.cameraProperties.camera.x = Math.max(0, Math.min(this.cameraProperties.camera.x, this.stageWidth - this.cameraSize.width));
    }


    /* -----
    Stage Section
    ----- */
    endStage() {
        /*
        this should call and load summary UI

        Performance data can be retrieved by:
            - nums of enemy a player killed:
                > this.players[i].performance.kills
            - nums of a player died:
                > this.players[i].performance.deathes
            - nums of collectable a player collected:
                > this.players[i].performance.collected
            - nums of star a player catched:
                > this.players[i].performance.stars
            - total nums of stars catched:
                > this.players.reduce((n, p)=>(n+p.performance.stars), 0)
        */
        if(this.stageEnded) return;
        let availableColorGroupsByName = {};
        for(const group of this.availableColorGroups) {
            availableColorGroupsByName[group.groupName] = group;
        }
        this.stageEnded = true;
        DataManager.getInstance().gameSummary = {}
        for(let i = 0; i < DataManager.getInstance().selectedPlayers.length; i++) {
            let color = DataManager.getInstance().selectedPlayers[i];
            let hex = availableColorGroupsByName[color].reprColor.toHEX();
            for(let j = 0; j < this.players.length; j++) {
                if(this.players[j].node.name !== hex) continue;
                DataManager.getInstance().gameSummary[color] = this.players[j].performance;
            }
        }
        cc.director.loadScene("CompleteScene");
    }

    getRandomColorGroup() {
        let selectedPlayers = DataManager.getInstance().selectedPlayers;
        let colorName = selectedPlayers[this.random.random()%selectedPlayers.length];
        for(const colorGroup of this.availableColorGroups) {
            if(colorGroup.groupName == colorName) return colorGroup;
        }
        throw new Error("Invalid ColorGroup appeared during randomization!!");
    }

    getStagePlatforms(predicate: (value: {x:number, y:number, w:number}, index: number, array: {}[])=>boolean) {
        return this.stageGeneratingProperties.colliderContainer.children.map(ground=>{
            const p = ground.getPosition().add(new cc.Vec2(-this.cameraSize.width/2, -this.cameraSize.height/2));
            const w = ground.getComponent(cc.PhysicsBoxCollider).size.width;
            return {x: p.x, y: p.y, w: w};
        }).filter(predicate).sort((a, b)=>(a.x - b.x));
    }

    generateMorePlatform() {
        if(this.cameraProperties.camera.x < this.stageWidth - this.cameraSize.width) return;

        let lastPlatform = this.stageGeneratingProperties.colliderContainer.children.map(ground=>{
            const p = ground.getPosition();
            const w = ground.getComponent(cc.PhysicsBoxCollider).size.width;
            return {x:p.x, y:p.y, w:w};
        }).sort((a, b)=>((b.x+a.w)-(a.x+a.w)))[0];

        let minPlatformWidth = this.stageGeneratingProperties.minPlatformWidth;
        let maxPlatformWidth = this.stageGeneratingProperties.maxPlatformWidth;

        let platformW = minPlatformWidth + this.random.percentage()/100 * (maxPlatformWidth - minPlatformWidth);
        let platformX = lastPlatform.x + lastPlatform.w + this.random.percentage()/100 * this.getJumpDistance()
        let platformY = lastPlatform.y;

        this.createNewPlatform(platformX, platformY, platformW);
        this.spawnEnemiesOnPlatform(platformX-this.cameraSize.width/2, platformY-this.cameraSize.height/2, platformW);
        this.spawnCollectablesOnPlatform(platformX-this.cameraSize.width/2, platformY-this.cameraSize.height/2, platformW);

        this.stageWidth = platformX + platformW;
    }

    createNewPlatform(x: number, y: number, w: number) {
        let platformSpriteL = this.stageGeneratingProperties.platformSpriteL;
        let platformSpriteM = this.stageGeneratingProperties.platformSpriteM;
        let platformSpriteR = this.stageGeneratingProperties.platformSpriteR;
        if(!platformSpriteL || !platformSpriteM || !platformSpriteR) {
            throw new Error("Missing platform sprite!! Please drag and bind to GameManager!!");
        }

        let tileW = 32, tileH = 640;

        let colCount = Math.ceil(w / tileW);
        let colWidth = w / colCount;

        let platformNode = new cc.Node();
        platformNode.name = "Ground";
        platformNode.setAnchorPoint(new cc.Vec2(0, 1));
        platformNode.setContentSize(new cc.Size(w, tileH));

        let rigidBody = platformNode.addComponent(cc.RigidBody);
        rigidBody.type = cc.RigidBodyType.Kinematic;
        rigidBody.gravityScale = 0;

        let boxCollider = platformNode.addComponent(cc.PhysicsBoxCollider);
        boxCollider.size = new cc.Size(w, tileH);
        boxCollider.offset = new cc.Vec2(w/2, -tileH/2);
        boxCollider.apply();

        for(let i = 0; i < colCount; i++) {
            let spriteNode = new cc.Node();
            spriteNode.setParent(platformNode);
            spriteNode.setAnchorPoint(new cc.Vec2(0, 1));
            spriteNode.setContentSize(new cc.Size(colWidth, tileH));
            spriteNode.setPosition(new cc.Vec2(colWidth*i, 0));
            let sprite = spriteNode.addComponent(cc.Sprite);
            if(i == 0) {
                spriteNode.name = "L";
                sprite.spriteFrame = platformSpriteL;
            }
            else if(i == colCount-1) {
                spriteNode.name = "R";
                sprite.spriteFrame = platformSpriteR;
            }
            else {
                spriteNode.name = "M";
                sprite.spriteFrame = platformSpriteM;
            }
        }

        platformNode.setParent(this.stageGeneratingProperties.colliderContainer);
        platformNode.setPosition(new cc.Vec2(x, y));

        return platformNode;
    }

    getJumpDistance() {
        let v = this.playerProperties.playerJumpVel;
        let g = this.physicsManager.gravity.y;
        let t = 2 * Math.abs(v / g);
        return this.playerProperties.playerSpeed * t / 2;
    }


    /* -----
    Player Section
    ----- */
    restart() {
        // effect
        cc.audioEngine.playEffect(this.rebornEffect, false);

        const currentSceneName = cc.director.getScene().name;
        cc.director.loadScene(currentSceneName, () => {
            console.log(`${currentSceneName} reloaded successfully`);
        });
    }

    respawn() {
        // respawn all players back to last saved check-point
        this.restart();
    }

    spawnPlayers() {
        let availableColorGroupsByName = {};
        for(const group of this.availableColorGroups) {
            availableColorGroupsByName[group.groupName] = group;
        }

        if(DataManager.getInstance().selectedPlayers.some(colorName=>!(colorName in availableColorGroupsByName))) {
            throw new Error("Invalid Color Chosen!");
        }

        DataManager.getInstance().selectedPlayers.reverse().forEach((colorName, index)=>{
            let playerNode = cc.instantiate(availableColorGroupsByName[colorName].playerPrefab);
            let spawnPos = new cc.Vec2(
                this.playerProperties.playerInitialPosition.x + this.playerProperties.distBetweenPlayers*index,
                this.playerProperties.playerInitialPosition.y + playerNode.getComponent(cc.PhysicsBoxCollider).size.height/2
            );
            playerNode.name = availableColorGroupsByName[colorName].reprColor.toHEX();
            playerNode.setParent(this.playerProperties.playerContainer);
            playerNode.setPosition(spawnPos);

            let playerController = playerNode.getComponent(PlayerController);
            this.players.push(playerController);

            playerController.createSprite();
            playerController.playerSpeed = this.playerProperties.playerSpeed;
            playerController.playerJumpVel = this.playerProperties.playerJumpVel;
            playerController.shiftingSpeed = this.playerProperties.playerShiftingSpeed;
            playerController.bulletSpeed = this.playerProperties.bulletSpeed;
            playerController.bulletDistance = this.playerProperties.bulletDistance;
        })
    }

    scanDeadPlayer() {
        let cnt = this.players.filter(p=>p.dying).length;
        if(cnt === 0) return;
        if(this.lives <= cnt) {
            return this.restart();
        }
        this.lives -= cnt;
        for(const player of this.players) {
            if(!player.dying) continue;
            let lastPlayer = this.getLastPlayer();
            let offset = new cc.Vec2((player != lastPlayer)?-100:0, 0);
            player.node.setPosition(lastPlayer.node.getPosition().add(offset));
            player.dying = false;
        }
    }

    isLeadingPlayer(playerIndex: number) {
        if(!this.players[playerIndex]) return false;
        let maxX = Math.round(Math.max(...this.players.map(p=>p.node.x)));
        return Math.round(this.players[playerIndex].node.x) == maxX;
    }

    getLeadingPlayer(): PlayerController {
        let leadingPlayer = null;
        let maxX = -Infinity;

        for (let player of this.players) {
            if (player.node.x > maxX) {
                maxX = player.node.x;
                leadingPlayer = player;
            }
        }

        return leadingPlayer;
    }

    getLastPlayer(): PlayerController {
        let lastPlayer = null;
        let minX = Infinity;

        for (let player of this.players) {
            if (player.node.x < minX) {
                minX = player.node.x;
                lastPlayer = player;
            }
        }

        return lastPlayer;
    }

    switchWithLeadingPlayer(playerIndex: number) {
        if (playerIndex >= this.players.length || !this.canSwitch) return;

        let leadingPlayer = this.getLeadingPlayer();
        let currentPlayer = this.players[playerIndex];

        if (leadingPlayer && currentPlayer !== leadingPlayer) {
            [
                leadingPlayer.node.position, 
                currentPlayer.node.position,
            ] = [
                currentPlayer.node.position, 
                leadingPlayer.node.position,
            ];
        }

        this.canSwitch = false;
        this.scheduleOnce(()=>{ this.canSwitch = true }, 0.2);

        // effect
        cc.audioEngine.playEffect(this.switchEffect, false);
    }


    /* -----
    Enemy Section
    ----- */
    spawnEnemies() {
        // limit the closest distance to spawn so users can react
        let enemyMinX = this.getLeadingPlayer().node.getPosition().x + this.cameraSize.width/2;

        for(const {x, y, w} of this.getStagePlatforms(p=>(p.x+p.w > enemyMinX))) {
            enemyMinX = this.spawnEnemiesOnPlatform(Math.max(x, enemyMinX), y, x+w-Math.max(x, enemyMinX));
        }
    }

    spawnEnemiesOnPlatform(x: number, y: number, w: number) {
        let maxGeneratedX = x;
        for(let i = Math.floor(w / this.enemyProperties.minDistBetweenEnemy) - 1; i >= 0; i--) {
            if(this.random.percentage() > this.enemyProperties.enemySpawnProbability) continue;
            let colorData = this.getRandomColorGroup();
            let spawnNode = cc.instantiate(colorData.enemyPrefabs[this.random.random()%colorData.enemyPrefabs.length]);
            let spawnSize = spawnNode.getComponent(cc.PhysicsBoxCollider).size;
            let posOffset = new cc.Vec2(Math.ceil(spawnSize.width/2), spawnSize.height/2);
            spawnNode.name = colorData.reprColor.toHEX();
            spawnNode.setParent(this.enemyProperties.enemyContainer);
            spawnNode.setPosition(new cc.Vec2(x + i*this.enemyProperties.minDistBetweenEnemy, y).add(posOffset));
            console.log("spawn enemy at", spawnNode.x, spawnNode.y);
            maxGeneratedX = spawnNode.getPosition().x + spawnSize.width;
        }
        return maxGeneratedX;
    }


    /* -----
    Collectable Section
    ----- */
    spawnCollectables() {
        // limit the closest distance to spawn so users can react
        let collectableMinX = this.getLeadingPlayer().node.getPosition().x + this.cameraSize.width/2;

        for(const {x, y, w} of this.getStagePlatforms(p=>(p.x+p.w > collectableMinX))) {
            collectableMinX = Math.max(
                collectableMinX, 
                this.spawnShieldsOnPlatform(Math.max(x, collectableMinX), y, x+w-Math.max(x, collectableMinX)),
                this.spawnCollectablesOnPlatform(Math.max(x, collectableMinX), y, x+w-Math.max(x, collectableMinX)),
            );
        }
    }

    spawnCollectablesOnPlatform(x: number, y: number, w: number) {
        let { minDistAboveGround, maxDistAboveGround } = this.collectableProperties;
        let maxGeneratedX = x;
        for(let i = Math.floor(w / this.collectableProperties.minDistBetweenCollectable) - 1; i >= 0; i--) {
            if(this.random.percentage() > this.collectableProperties.collectableSpawnProbability) continue;
            let colorData = this.getRandomColorGroup();
            let spawnNode = cc.instantiate(colorData.collectablePrefabs[this.random.random()%colorData.collectablePrefabs.length]);
            let spawnSize = spawnNode.getComponent(cc.PhysicsBoxCollider).size;
            let rdOffsetY = minDistAboveGround + this.random.percentage()/100 * (maxDistAboveGround - minDistAboveGround);
            let posOffset = new cc.Vec2(Math.ceil(spawnSize.width/2), spawnSize.height + rdOffsetY);
            spawnNode.name = colorData.reprColor.toHEX();
            spawnNode.setParent(this.collectableProperties.collectableContainer);
            spawnNode.setPosition(new cc.Vec2(x + i*this.collectableProperties.minDistBetweenCollectable, y).add(posOffset));
            maxGeneratedX = spawnNode.getPosition().x + spawnSize.width;
        }
        return maxGeneratedX;
    }

    spawnShieldsOnPlatform(x: number, y: number, w: number) {
        let { minDistAboveGround, maxDistAboveGround } = this.collectableProperties;
        let maxGeneratedX = x;
        for(let i = Math.floor(w / this.collectableProperties.minDistBetweenCollectable) - 1; i >= 0; i--) {
            if(this.random.percentage() > this.collectableProperties.shieldSpawnProbability) continue;
            let spawnNode = cc.instantiate(this.collectableProperties.shieldPrefab);
            let spawnSize = spawnNode.getComponent(cc.PhysicsBoxCollider).size;
            let rdOffsetY = minDistAboveGround + this.random.percentage()/100 * (maxDistAboveGround - minDistAboveGround);
            let posOffset = new cc.Vec2(Math.ceil(spawnSize.width/2), spawnSize.height + rdOffsetY);
            spawnNode.setParent(this.collectableProperties.collectableContainer);
            spawnNode.setPosition(new cc.Vec2(x + i*this.collectableProperties.minDistBetweenCollectable, y).add(posOffset));
            maxGeneratedX = spawnNode.getPosition().x + spawnSize.width;
        }
        return maxGeneratedX;
    }


    /* -----
    Gamepad Section
    ----- */
    pollGamepads() {
        let gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        for (let i = 0; i < gamepads.length; i++) {
            let gamepad = gamepads[i];
            if (gamepad) {
                this.handleGamepadInput(gamepad);
            }
        }
    }

    handleGamepadInput(gamepad: Gamepad) {
        switch (gamepad.index) {
            case 0:
                if(gamepad.buttons[3].pressed) {//jump
                    if(DataManager.getInstance().userCount === 1) {
                        if(this.players[0] && this.isLeadingPlayer(0)) this.players[0].playerJump();
                        else this.players[1].playerJump();
                    }
                    else if (this.players[0]) this.players[0].playerJump();
                }
                if(gamepad.buttons[1].pressed) {//switch
                    if(DataManager.getInstance().userCount === 1 && this.isLeadingPlayer(0)) {
                        this.switchWithLeadingPlayer(1);
                    }
                    else {
                        this.switchWithLeadingPlayer(0);
                    }
                }
                if(gamepad.buttons[0].pressed) {//shoot
                    if(DataManager.getInstance().userCount === 1) {
                        this.getLeadingPlayer().playerShoot();
                    }
                    else if (this.players[0] && this.isLeadingPlayer(0)) {
                        this.players[0].playerShoot();
                    }
                }
                if(gamepad.buttons[12].pressed) {//left player jump
                    if(DataManager.getInstance().userCount === 1) {
                        if(this.players[0] && this.isLeadingPlayer(0)) this.players[1].playerJump();
                        else this.players[0].playerJump();
                    }
                }
                break;
            case 1:
                if(gamepad.buttons[3].pressed) {//jump
                    if (this.players[1]) this.players[1].playerJump();
                }
                if(gamepad.buttons[1].pressed) {//switch
                    this.switchWithLeadingPlayer(1);
                }
                if(gamepad.buttons[0].pressed) {//shoot
                    if (this.players[1] && this.isLeadingPlayer(1)) this.players[1].playerShoot();
                }
                break;
            case 2:
                if(gamepad.buttons[3].pressed) {//jump
                    if (this.players[2]) this.players[2].playerJump();
                }
                if(gamepad.buttons[1].pressed) {//switch
                    this.switchWithLeadingPlayer(2);
                }
                if(gamepad.buttons[0].pressed) {//shoot
                    if (this.players[2] && this.isLeadingPlayer(2)) this.players[2].playerShoot();
                }
                break;
            case 3:
                if(gamepad.buttons[3].pressed) {//jump
                    if (this.players[3]) this.players[3].playerJump();
                }
                if(gamepad.buttons[1].pressed) {//switch
                    this.switchWithLeadingPlayer(3);
                }
                if(gamepad.buttons[0].pressed) {//shoot
                    if (this.players[3] && this.isLeadingPlayer(3)) this.players[2].playerShoot();
                }
                break;
        }
    }

    onGamepadConnected(event: GamepadEvent) {
        let gamepad = event.gamepad;
        this.gamepads[gamepad.index] = gamepad;
        console.log(`Gamepad connected at index ${gamepad.index}: ${gamepad.id}`);
    }

    onGamepadDisconnected(event: GamepadEvent) {
        let gamepad = event.gamepad;
        delete this.gamepads[gamepad.index];
        console.log(`Gamepad disconnected from index ${gamepad.index}: ${gamepad.id}`);
    }
}
