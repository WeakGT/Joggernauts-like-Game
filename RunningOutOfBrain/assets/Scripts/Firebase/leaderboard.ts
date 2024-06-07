const { ccclass, property } = cc._decorator;

@ccclass
export default class Leaderboard extends cc.Component {
    @property([cc.Label])
    scoreLabels: cc.Label[] = [];

    @property([cc.Label])
    timeLabels: cc.Label[] = [];

    @property([cc.Label])
    emailLabels: cc.Label[] = [];

    start() {
        this.updateLeaderboard();
    }

    updateLeaderboard() {
        const leaderboardRef = firebase.database().ref('leaderboard');

        leaderboardRef.once('value', (snapshot: any) => {
            let leaderboardData: { uid: string, email: string, score: number, dateTime: string }[] = Object.values(snapshot.val() || {});

            leaderboardData.sort((a, b) => {
                if (a.score !== b.score) {
                    return b.score - a.score;
                } else {
                    return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
                }
            });

            for (let i = 0; i < leaderboardData.length; i++) {
                if (i < this.scoreLabels.length) {
                    this.scoreLabels[i].string = leaderboardData[i].score.toString();
                    this.timeLabels[i].string = leaderboardData[i].dateTime;
                    this.emailLabels[i].string = leaderboardData[i].email;
                }
            }
        });
    }

    formatDateTime(dateTime: string): string {
        const date = new Date(dateTime);
        const year = date.getFullYear();
        const month = this.formatNumber(date.getMonth() + 1);
        const day = this.formatNumber(date.getDate());
        const hours = this.formatNumber(date.getHours());
        const minutes = this.formatNumber(date.getMinutes());
        return `${year}/${month}/${day} ${hours}:${minutes}`;
    }

    formatNumber(num: number): string {
        return num < 10 ? '0' + num : num.toString();
    }
}
