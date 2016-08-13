function ViewPort(_viewPortPos, _viewPortHyp){
	this.setViewPort(_viewPortPos, _viewPortHyp);

	this.targetObject = null;
	this.followed = null;
};
ViewPort.prototype.viewPortAABB = new AABB(new Vector2D(0,0), new Vector2D(1,1));
ViewPort.prototype.setViewPort = function(_pos, _hyp) {
	this.viewPortAABB = new AABB(_pos, _hyp);
};
ViewPort.prototype.getViewPort = function() {
	return this.viewPortAABB;
};
ViewPort.prototype.getPosition = function(){
	return this.viewPortAABB.getPosition();
};
ViewPort.prototype.world = new AABB(new Vector2D(0,0), new Vector2D(10,10));
ViewPort.prototype.setWorld = function(_worldWidth, _worldHeight){
	this.world = new AABB(new Vector2D(0,0), new Vector2D(_worldWidth, _worldHeight));
};
ViewPort.prototype.getWorld = function() {
	return this.world;
};
//gameObject needs to have "x" and "y" properties (as world(or room) position)
ViewPort.prototype.follow = function(_gameObject, _xDeadZone, _yDeadZone){
	this.targetObject = _gameObject;
	this.xDeadZone = _xDeadZone;
	this.yDeadZone = _yDeadZone;
}
ViewPort.prototype.getFollow = function(){
	return this.followed;
}
ViewPort.prototype.update = function(_dt){
	//keep following the player (or other desired object)
	
	if(this.targetObject != null){
		this.followed = this.targetObject.position;
		//console.log("" + this.followed.x + " - " + this.viewPortAABB.x + " + " + this.xDeadZone + " > " + this.viewPortAABB.getWidth());
		//moves camera on horizontal axis based on followed object position
		if(this.followed.x - this.viewPortAABB.position.x + this.xDeadZone > this.viewPortAABB.getWidth() ){
			this.viewPortAABB.position.x = this.followed.x - (this.viewPortAABB.getWidth() - this.xDeadZone);
		}else{
			if(this.followed.x - this.xDeadZone < this.viewPortAABB.position.x){
				this.viewPortAABB.position.x = this.followed.x - this.xDeadZone;
			}
		}
		//moves camera on vertical axis based on followed object position
		if(this.followed.y - this.viewPortAABB.position.y + this.yDeadZone > this.viewPortAABB.getHeight() ){
			this.viewPortAABB.position.y = this.followed.y - (this.viewPortAABB.getHeight() - this.yDeadZone);
		}else{
			if(this.followed.y - this.yDeadZone < this.viewPortAABB.position.y){
				this.viewPortAABB.position.y = this.followed.y - this.yDeadZone;
			}
		}
	}
	/*
	//don't let camera leaves the world's boundary
	if(!AABB.intersect(this.getViewPort(), this.getWorld())){
		if(this.viewPortAABB.getLeft() < this.world.getLeft()){
			this.viewPortAABB.setPosition(new Vector2D(this.world.getLeft(),this.viewPortAABB.position.y));
		}
		if(this.viewPortAABB.getTop() < this.world.getTop()){
			this.viewPortAABB.setPosition(new Vector2D(this.viewPortAABB.position.x, this.world.getTop()));
		}
		if(this.viewPortAABB.getRight() > this.world.getRight()){
			this.viewPortAABB.setHypotenuse(new Vector2D(this.world.getRight(),this.viewPortAABB.hypotenuse.y))
		}
		if(this.viewPortAABB.getBottom() > this.world.getBottom()){
			this.viewPortAABB.setHypotenuse(new Vector2D(this.viewPortAABB.hypotenuse.x,this.world.getBottom()));
		}
	}*/
};
ViewPort.prototype.render = function(_ctx) {
	_ctx.save();
	_ctx.strokeStyle = "rgba(0,0,255,1)";
    _ctx.beginPath();
   	_ctx.moveTo(this.viewPortAABB.position.x, this.viewPortAABB.position.y);
   	_ctx.lineTo(this.viewPortAABB.position.x + this.viewPortAABB.hypotenuse.x, this.viewPortAABB.position.y);
    _ctx.lineTo(this.viewPortAABB.position.x + this.viewPortAABB.hypotenuse.x, this.viewPortAABB.position.y  + this.viewPortAABB.hypotenuse.y);
    _ctx.lineTo(this.viewPortAABB.position.x, this.viewPortAABB.position.y  + this.viewPortAABB.hypotenuse.y);
    _ctx.closePath();
    _ctx.lineWidth = 5;
    _ctx.stroke();
	_ctx.restore();
};