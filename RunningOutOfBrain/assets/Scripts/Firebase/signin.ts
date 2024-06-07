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
        const email = this.emailEditBox.string;
        const password = this.passwordEditBox.string;

        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log('User signed in:', user);

                if (this.nextScene) {
                    cc.director.loadScene(this.nextScene.name);  
                }
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error('Sign in error:', errorCode, errorMessage);
            });
    }
}
