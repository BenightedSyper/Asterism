var CelestialObject = function(_pos){
    //this.acceleration = 5;
    //this.rotationVelocity = 3;
    //this.xAccel = 0;
    //this.yAccel = 0;
    this.entity = new Entity2D(1);
    this.entity.position = _pos;
    this.entity.points = [new Vector2D(0,100)];
    this.entity.segments = [];
	this.Hue = 0;
    //this.setRandomHue();
    this.entity.calcAABB();
	this.entity.addTag("Planet");
	//this.entity.addCollisionTag("Player");
};
CelestialObject.prototype.setPosition = function(_pos){
    this.entity.position = _pos;
};
CelestialObject.prototype.getPosition = function(){
    return this.entity.position;
};
CelestialObject.prototype.setDirection = function(_dir){
    this.entity.direction = _dir;
};
CelestialObject.prototype.getDirection = function(){
    return this.entity.direction;
};
CelestialObject.prototype.setAcceleration = function(_acc){
	this.entity.acceleration = _acc;
};
CelestialObject.prototype.getAcceleration = function(){
	return this.entity.acceleration;
};
CelestialObject.prototype.setInputAccel = function(_x, _y){
	this.xAccel = _x;
	this.yAccel = _y;
};
CelestialObject.prototype.getInputAccel = function(){
	return this.xAccel + " " + this.yAccel;
};
CelestialObject.prototype.update = function(_dt){
    //this.entity.update(_dt);
};
CelestialObject.prototype.render = function(_ctx, _viewPort){
    //this.entity.render(_ctx, _viewPort);
	var xOffset = _viewPort.position.x;
    var yOffset = _viewPort.position.y;
	
	_ctx.beginPath();
    _ctx.arc(this.entity.position.x - xOffset, this.entity.position.y - yOffset, 200, 0, 2 * Math.PI, false);
    _ctx.fillStyle = "hsl(" + this.Hue + ",100%,50%)";
    _ctx.fill();
};
CelestialObject.fromJSON = function(_json){
	var jsonCel = _json;
	var co = [];
	for(var i = 0; i < jsonCel.length; i++){
		co.push(new CelestialObject(new Vector2D(0,0)));
		co[i].entity = Entity2D.fromJSON(jsonCel[i].entity);
		co[i].hue = jsonCel[i].hue;
	};
	//var co = new CelestialObject(new Vector2D(0,0));
	//co.entity = Entity2D.fromJSON(jsonCel.entity);
	//co.hue = jsonCel.hue;
	return co;
};