// Leaderboard.ts
const {ccclass, property} = cc._decorator;

@ccclass
export default class Leaderboard extends cc.Component {
    @property([cc.Node])
    leaderboardItems: cc.Node[] = [];  // 用于存储预先创建的排行榜项节点

    @property(cc.Label)
    UserScore: cc.Label = null;

    onLoad() {
        this.loadLeaderboardData();
        this.loadUserScore();
    }

    loadLeaderboardData() {
        var ref = firebase.database().ref('username').orderByChild('score').limitToLast(5);
        ref.once('value', (snapshot) => {
            let rank = 5;
            let items = [];
            snapshot.forEach((childSnapshot) => {
                let childData = childSnapshot.val();
                items.push({
                    rank: rank,
                    username: childData.username,
                    score: childData.score
                });
                rank--;
            });
            // Reverse the items to show the highest score first
            items.reverse();
            items.forEach((item, index) => {
                if (index < this.leaderboardItems.length) {
                    let listItem = this.leaderboardItems[index];
                    listItem.getChildByName('Rank').getComponent(cc.Label).string = item.rank.toString();
                    listItem.getChildByName('Name').getComponent(cc.Label).string = item.username;
                    listItem.getChildByName('Score').getComponent(cc.Label).string = item.score.toString();
                }
            });
        });
    }

    loadUserScore() {
        let user = firebase.auth().currentUser;
        if (user) {
            let userRef = firebase.database().ref('username').child(user.uid);
            userRef.once('value').then((snapshot) => {
                let userData = snapshot.val();
                if(this.UserScore)
                    this.UserScore.string = userData.score;
            });
        }
    }

    Back() {
        cc.director.loadScene("StartScene");
    }
}
