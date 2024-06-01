const {ccclass, property} = cc._decorator;

import { PlayerController } from './PlayerController';

@ccclass
export default class MultiPlayerController extends cc.Component {

    @property([cc.Prefab])
    playerPrefabs: cc.Prefab[] = [];

    @property([cc.Node])
    respawnNodes: cc.Node[] = [];

    private players: PlayerController[] = [];

    onLoad() {
        this.spawnPlayers(this.playerPrefabs.length);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    onDestroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    spawnPlayers(playerCount: number) {
        for (let i = 0; i < playerCount; i++) {
            let playerNode = cc.instantiate(this.playerPrefabs[i]);
            playerNode.parent = this.node;

            if (this.respawnNodes[i]) {
                playerNode.position = this.respawnNodes[i].position;
            } else {
                playerNode.position = cc.v2(0, 0);
            }

            let playerController = playerNode.getComponent(PlayerController);
            this.players.push(playerController);
        }
    }

    onKeyDown(event: cc.Event.EventKeyboard) {
        switch(event.keyCode) {
            // jump
            case cc.macro.KEY.up:
                if (this.players[0]) this.players[0].playerJump(600);
                break;
            case cc.macro.KEY.w:
                if (this.players[1]) this.players[1].playerJump(600);
                break;
            case cc.macro.KEY.t:
                if (this.players[2]) this.players[2].playerJump(600);
                break;
            case cc.macro.KEY.i:
                if (this.players[3]) this.players[3].playerJump(600);
                break;
            //switch
            case cc.macro.KEY.right:
                this.switchWithLeadingPlayer(0);
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
        }
    }

    getLeadingPlayer(): cc.Node {
        let leadingPlayer = null;
        let maxX = -Infinity;

        for (let player of this.players) {
            if (player.node.x > maxX) {
                maxX = player.node.x;
                leadingPlayer = player.node;
            }
        }

        return leadingPlayer;
    }

    switchWithLeadingPlayer(playerIndex: number) {
        if (playerIndex >= this.players.length) {
            return;
        }

        let leadingPlayerNode = this.getLeadingPlayer();
        let currentPlayerNode = this.players[playerIndex].node;

        if (leadingPlayerNode && currentPlayerNode !== leadingPlayerNode) {
            let tempPosition = currentPlayerNode.position;
            currentPlayerNode.position = leadingPlayerNode.position;
            leadingPlayerNode.position = tempPosition;
        }
    }
}
