const {ccclass, property} = cc._decorator;

@ccclass
export default class Collider extends cc.Component {
    @property(cc.TiledMap)
    tiledMap: cc.TiledMap = null;

    onLoad() {
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getCollisionManager().enabled = true;

        let objectGroup = this.tiledMap.getObjectGroup('ground'); // 替換為您的 Ground Layer 名稱
        let objects = objectGroup.getObjects();
        this.createColliders(objects);
    }

    createColliders(objects) {
        objects.forEach(obj => {
            cc.log(obj);
            let colliderNode = new cc.Node();
            this.node.addChild(colliderNode);
            colliderNode.name = 'Ground';

            // 設置位置
            colliderNode.setPosition(obj.x, obj.y);

            // 添加 RigidBody 組件
            let rigidBody = colliderNode.addComponent(cc.RigidBody);
            rigidBody.type = cc.RigidBodyType.Kinematic; // 設置為 Kinematic

            // 根據對象形狀創建對應的碰撞體
            let collider: cc.Collider = null;
            if(obj.width && obj.height) {
                // 如果是矩形
                let boxCollider = colliderNode.addComponent(cc.PhysicsBoxCollider);
                boxCollider.offset = cc.v2(obj.width / 2, -obj.height / 2);
                boxCollider.size = cc.size(obj.width, obj.height);
                collider = boxCollider;
            }
            else if(obj.points) {
                // 如果是多邊形
                let polygonCollider = colliderNode.addComponent(cc.PhysicsPolygonCollider);
                let points = obj.points.map(point => cc.v2(point.x, point.y));
                cc.log(points);
                polygonCollider.points = points;
                collider = polygonCollider;
            }
            // 啟用碰撞體
            collider.apply();
        });
    }


    
    onCollisionEnter(event) {
        let other = event.otherCollider;
        let self = event.selfCollider;
        // 處理碰撞事件
        console.log('Collision detected between', self.node.name, 'and', other.node.name);
    }
}

