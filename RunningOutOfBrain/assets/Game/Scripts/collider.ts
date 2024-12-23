const {ccclass, property, disallowMultiple} = cc._decorator;

@ccclass
@disallowMultiple
export default class Collider extends cc.Component {
    @property(cc.TiledMap)
    tiledMap: cc.TiledMap = null;

    onLoad() {
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getCollisionManager().enabled = true;

        if(!this.tiledMap) this.tiledMap = new cc.TiledMap();
        let objectGroup = this.tiledMap.getObjectGroup('ground'); // 替換為您的 Ground Layer 名稱
        if(!objectGroup) objectGroup = new cc.TiledObjectGroup();
        let objects = objectGroup.getObjects() || [];
        this.createColliders(objects);
    }

    createColliders(objects) {
        objects.forEach(obj => {
            let colliderNode = new cc.Node();
            this.node.addChild(colliderNode);
            colliderNode.name = 'Ground';

            // 設置位置
            colliderNode.setPosition(obj.x, obj.y);
            cc.log(obj.x, obj.y);

            // 添加 RigidBody 組件
            let rigidBody = colliderNode.addComponent(cc.RigidBody);
            rigidBody.type = cc.RigidBodyType.Kinematic; // 設置為 Kinematic

            // 根據對象形狀創建對應的碰撞體
            let collider: cc.PhysicsCollider = null;   
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
                polygonCollider.points = points;
                collider = polygonCollider;
            }
            // 啟用碰撞體
            collider.apply();
        });
    }
}

