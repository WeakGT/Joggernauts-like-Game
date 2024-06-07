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

        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log('User signed up:', user);
                cc.director.loadScene(this.nextScene.name); 
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error('Sign up error:', errorCode, errorMessage);
            });
    }
}
