function Projectile(_pos, _dir, _seg, _id){
	this.id = _id;
    this.entity = new Entity2D(2);
    this.entity.position = _pos;
    this.entity.velocity = new Vector2D(_dir.x, _dir.y);
    this.entity.direction = new Vector2D(_dir.x, _dir.y);
    this.entity.direction.normalize();
    this.entity.segments = _seg;
    this.entity.calcAABB();
    this.entity.restitution = 1;
    this.entity.mass = 0.01;
    this.entity.drag = 1;
	//this.setHue(_hue);
    this.duration = 1;
    this.active = true;
};
Projectile.prototype.getID = function(){
	return this.id;
};
Projectile.prototype.setHue = function(_hue){
	this.entity.segments[0].hue = _hue;
};
Projectile.prototype.getHue = function(){
	return this.entity.getHue();
};
Projectile.prototype.setPosition = function(_pos){
	this.entity.position = _pos;
};
Projectile.prototype.getPosition = function(){
	return this.entity.position;
};
Projectile.prototype.setVelocity = function(_vel){
	this.entity.velocity = _vel;
};
Projectile.prototype.getVelocity = function(){
	return this.entity.velocity;
};
Projectile.prototype.setDirection = function(_dir){
	this.entity.direction = _dir;
};
Projectile.prototype.getDirection = function(){
	return this.entity.direction;
};
Projectile.prototype.setSegments = function(_seg){
	this.entity.setSegments(_seg);
};
Projectile.prototype.getSegments = function(){
	return this.entity.getSegments();
};
Projectile.prototype.render = function(_ctx, _viewPort){
    this.entity.render(_ctx, _viewPort);
};
Projectile.prototype.update = function(_dt){
    if(!this.active){
	return;
    };
    this.entity.direction = this.entity.velocity.normal();
    this.entity.update(_dt);
    this.duration -= _dt; //this could be an issue if there is a lag spike when the projectile ends
    if(this.duration < 0){
        this.deactivate();
    };
};
Projectile.prototype.deactivate = function(){
	this.active = false;
	this.duration = 0;
	this.entity = null;
};