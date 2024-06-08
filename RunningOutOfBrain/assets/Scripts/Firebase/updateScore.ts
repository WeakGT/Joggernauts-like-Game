import userinfor = require("./User");
const {ccclass, property} = cc._decorator;
export function updateScore(callback: Function) {
    let user = firebase.auth().currentUser;
    if (user) {
        let userRef = firebase.database().ref('username').child(user.uid);
        userRef.once('value').then((snapshot) => {
            // let userData = snapshot.val();
            let newScore = userinfor.score; // 直接从 User.ts 中获取当前游戏分数
            // let newScore = userData.score + currentScore;
            userRef.update({ score: newScore }).then(() => {
                if (callback) {
                    callback();
                }
            });
        });
    }
}


