import userinfor = require("./Firebase/User");

import { DataManager } from "./DataManager";

import { PlayerController } from "../Game/Scripts/PlayerController";

const { ccclass, property } = cc._decorator;

@ccclass("CompleteColorGroup")
class CompleteColorGroup {
    @property()
    groupName: string = "";

    @property(cc.Prefab)
    playerPrefab: cc.Prefab = null;

    @property([cc.Prefab])
    enemyPrefabs: cc.Prefab[] = [];
}

@ccclass
export class CompleteScene extends cc.Component {
    @property(cc.Label)
    stageLabel: cc.Label = null;

    @property([cc.Node])
    stars: cc.Node[] = [];

    @property(cc.Node)
    charactorContainer: cc.Node = null;

    @property()
    charactorSpacing: number = 100;

    @property()
    animationDuration: number = 5;

    @property(cc.Node)
    summaryLayer: cc.Node = null;

    @property(cc.Label)
    scoreLabel: cc.Label = null;

    @property(cc.Node)
    scoreBoard: cc.Node = null;

    @property([cc.Node])
    charactorDisplays: cc.Node[] = [];

    @property([CompleteColorGroup])
    availableColorGroups: CompleteColorGroup[] = [];

    private instantiatedPlayerPrefabs: {}[] = [];

    loadBackScene() {
        cc.director.loadScene("StageSelectScene");
    }

    onLoad() {
        this.summaryLayer.active = false;

        this.updateUserScore(() => {
            this.initPlayerPrefabs();
            this.initAnimationLayer();
            this.initSummaryLayer();
            cc.log('User score updated successfully!');
        });
    }

    updateUserScore(callback: Function) {
        let user = firebase.auth().currentUser;
        if (user) {
            let userRef = firebase.database().ref('username').child(user.uid);
            userRef.once('value').then((snapshot) => {
                // let userData = snapshot.val();
                let newScore = userinfor.score; // 获取当前游戏分数
                // let newScore = userData.score + currentScore;
                userRef.update({ score: newScore }).then(() => {
                    // 更新分数完成后调用回调函数
                    if (callback) {
                        callback();
                    }
                });
            });
        }
    }

    initPlayerPrefabs() {
        let availableColorGroupsByName = {};
        for(const group of this.availableColorGroups) {
            availableColorGroupsByName[group.groupName] = group;
        }
        for(let i = 0; i < DataManager.getInstance().selectedPlayers.length; i++) {
            let color = DataManager.getInstance().selectedPlayers[i];
            let player = cc.instantiate(availableColorGroupsByName[color].playerPrefab);
            player.setParent(this.node);
            let playerController = player.getComponent(PlayerController);
            let sprite = playerController.createSprite();
            playerController.playerSpeed = 0;
            cc.director.getPhysicsManager().enabled = false;
            this.instantiatedPlayerPrefabs.push({
                "player": player,
                "sprite": sprite,
                "boxSize": playerController.physicsBoxCollider.size,
            });
        }
    }

    initAnimationLayer() {
        let availableColorGroupsByName = {};
        for(const group of this.availableColorGroups) {
            availableColorGroupsByName[group.groupName] = group;
        }
        let loadingEnemies = DataManager.getInstance().selectedPlayers.reduce((v,c)=>{
            return v.concat(availableColorGroupsByName[c].enemyPrefabs);
        }, []);

        let charactorX = 0;
        for(let i = 0; i < loadingEnemies.length; i++) {
            let node = cc.instantiate(loadingEnemies[i]);
            node.setScale(-2, 2);
            node.setParent(this.charactorContainer);
            node.setPosition(new cc.Vec2(charactorX - node.width, node.height));
            charactorX = charactorX - node.width*2 - this.charactorSpacing;
        }
        for(let i = 0; i < this.instantiatedPlayerPrefabs.length; i++) {
            this.instantiatedPlayerPrefabs[i]["player"].setParent(this.charactorContainer);
            this.instantiatedPlayerPrefabs[i]["sprite"].setParent(this.charactorContainer);
            this.instantiatedPlayerPrefabs[i]["sprite"].setScale(4, 4);
            this.instantiatedPlayerPrefabs[i]["player"].setPosition(
                charactorX - this.instantiatedPlayerPrefabs[i]["boxSize"].width, 
                this.instantiatedPlayerPrefabs[i]["boxSize"].height
            );
            charactorX = charactorX - this.instantiatedPlayerPrefabs[i]["boxSize"].width*2 - this.charactorSpacing;
        }

        let delta = new cc.Vec2(cc.find("Canvas").getContentSize().width-charactorX, 0);
        this.charactorContainer.runAction(cc.moveBy(this.animationDuration, delta));

        let starsGained = DataManager.getInstance().selectedPlayers.reduce((v,c)=>{
            if(!DataManager.getInstance().gameSummary[c]) return v;
            return DataManager.getInstance().gameSummary[c].stars + v;
        }, 0);
        for(let i = 0; i < 3; i++) this.stars[i].active = (i < starsGained);

        this.scheduleOnce(()=>{
            this.scoreBoard.setScale(0, 0);
            this.summaryLayer.active = true;
            let anim = this.scoreBoard.getComponent(cc.Animation);
            anim.play(anim.defaultClip.name);
            for(let i = 0; i < DataManager.getInstance().selectedPlayers.length; i++) {
                this.instantiatedPlayerPrefabs[i]["player"].setParent(this.charactorDisplays[i]);
                this.instantiatedPlayerPrefabs[i]["sprite"].setParent(this.charactorDisplays[i]);
                this.instantiatedPlayerPrefabs[i]["sprite"].setScale(6, 6);
                this.instantiatedPlayerPrefabs[i]["player"].x = 0;
                this.instantiatedPlayerPrefabs[i]["player"].y = this.instantiatedPlayerPrefabs[i]["boxSize"].height * 4;
            }
        }, this.animationDuration);
    }

    initSummaryLayer() {
        this.charactorDisplays.forEach(s=>{ s.active = false });
        let minPlacingX =-540;
        let maxPlacingX = 540;
        let charactorCount = DataManager.getInstance().selectedPlayers.length;
        let frameSpacing = (maxPlacingX-minPlacingX) / (charactorCount + 1);
        for(let i = 0; i < DataManager.getInstance().selectedPlayers.length; i++) {
            this.charactorDisplays[i].active = true;
            this.charactorDisplays[i].setPosition(new cc.Vec2(minPlacingX+frameSpacing*(i+1), 0));
            let performance = DataManager.getInstance().gameSummary[DataManager.getInstance().selectedPlayers[i]];
            if(!performance) continue;
            this.charactorDisplays[i].getChildByName("deathes").getComponent(cc.Label).string = `${performance.deathes}`;
            this.charactorDisplays[i].getChildByName("kills").getComponent(cc.Label).string = `${performance.kills}`;
        }
    }

    playNumberCountAnimation(startValue: number, endValue: number, duration: number) {
        let action = cc.sequence(
            cc.callFunc(() => {
                let interval = endValue / (duration * 60); 
                let currentValue = startValue; 
                this.scoreLabel.string = currentValue.toString();

                this.schedule(() => {
                    currentValue += interval;
                    this.scoreLabel.string = Math.floor(currentValue).toString();
                }, 1 / 60, duration * 60 - 1); 
            }),
            cc.delayTime(duration),
            cc.callFunc(() => {
                this.scoreLabel.string = endValue.toString();
            })
        );
        this.scoreLabel.node.runAction(action);
    }
}
