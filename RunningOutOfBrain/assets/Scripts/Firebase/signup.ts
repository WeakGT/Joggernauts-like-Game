import userinfor = require("./User");

const {ccclass, property} = cc._decorator;

@ccclass
export default class Signin extends cc.Component {
    @property(cc.EditBox)
    emailEditBox: cc.EditBox = null;

    @property(cc.EditBox)
    passwordEditBox: cc.EditBox = null;

    @property(cc.Button)
    signupButton: cc.Button = null;

    @property(cc.SceneAsset)
    nextScene: cc.SceneAsset = null;  

    start() {
        this.signupButton.node.on(cc.Node.EventType.TOUCH_END, this.onSignupButtonClick, this);
    }

    onSignupButtonClick() {
        const email = this.emailEditBox.string;
        const password = this.passwordEditBox.string;
        const self = this;
        
        firebase.auth().createUserWithEmailAndPassword(email , password).then(function(result){
            cc.log("create successfully");
            let str = email.split('@');
            let username = str[0];
            cc.log(username);
            var data = {
                username : username,
                score : 0
            }
            userinfor.username = username;
            var ref = firebase.database().ref('username').child(result.user.uid);
            ref.set(data);
            cc.log('push ' + username);
            if (self.nextScene) {
                cc.director.loadScene(self.nextScene.name);  
            }
        }).catch(function (error) {
            alert('Create error: ' + error.message);
            cc.log('create error');
        });
    }
}
