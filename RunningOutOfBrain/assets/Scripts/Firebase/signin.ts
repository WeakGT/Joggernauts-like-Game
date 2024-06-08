import userinfor = require("./User");

const {ccclass, property} = cc._decorator;

@ccclass
export default class LoginScript extends cc.Component {
    @property(cc.EditBox)
    emailEditBox: cc.EditBox = null;

    @property(cc.EditBox)
    passwordEditBox: cc.EditBox = null;

    @property(cc.Button)
    signinButton: cc.Button = null;

    @property(cc.SceneAsset)
    nextScene: cc.SceneAsset = null;  

    start() {
        this.signinButton.node.on(cc.Node.EventType.TOUCH_END, this.onLoginButtonClick, this);
    }

    onLoginButtonClick() {
        cc.log(this.nextScene.name);
        const email = this.emailEditBox.string;
        const password = this.passwordEditBox.string;
        const self = this;
        
        firebase.auth().signInWithEmailAndPassword(email , password).then(function(user){
            if(user){
                let _user = firebase.auth().currentUser;
                cc.log("Login Success!")
                var user_ref = firebase.database().ref('username').child(_user.uid);
                user_ref.once('value').then(function (snapshot) {
                    cc.log('Get data');
                    //cc.log(snapshot);
                    var childData = snapshot.val();
                    cc.log(childData);       
                    userinfor.username = childData.username;
                    userinfor.score = childData.score;
                }).then(function () {
                    if (self.nextScene) {
                        cc.director.loadScene(self.nextScene.name);  
                    }
                });
            }
        }).catch(function(error){
            alert('Login error: ' + error.message);
            cc.log("Login Error!")
        });
    }
}
