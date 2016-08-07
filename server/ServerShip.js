var Vector2D = require('./Vector2D');
var Circle = require('./ServerCircle');
var ViewPort = require('./ServerViewPort');
var LineSegment = require('./ServerLineSegment');
var Entity2D = require('./ServerEntity2D');
var Projectile = require('./ServerProjectile');
var Ship = function(_pos){
    this.acceleration = 5;
    this.rotationVelocity = 3;
    this.xAccel = 0;
    this.yAccel = 0;
    this.entity = new Entity2D(1);
    this.entity.position = _pos;
    this.entity.points = [new Vector2D(0,-10), new Vector2D(-15,-15), new Vector2D(0,20), new Vector2D(15,-15)];
    this.entity.segments = [new LineSegment(new Vector2D(0,-10), new Vector2D(-15,-15)),
                            new LineSegment(new Vector2D(-15,-15), new Vector2D(0,20)),
                            new LineSegment(new Vector2D(0,20), new Vector2D(15,-15)),
                            new LineSegment(new Vector2D(15,-15), new Vector2D(0,-10))];
    this.setRandomHue();
    this.entity.calcAABB();
};
Ship.prototype.setRandomHue = function(){//FIX ME
	var temp = Math.floor((Math.random() * 360) + 1)
	this.entity.segments[0].hue = temp;
    this.entity.segments[1].hue = temp;
    this.entity.segments[2].hue = temp;
    this.entity.segments[3].hue = temp;
};
Ship.prototype.setHue = function(_hue){//FIX ME
	if(_hue < 0|| _hue > 360){
		_hue = 0;
	}else{
		this.entity.segments[0].hue = _hue;
		this.entity.segments[1].hue = _hue;
		this.entity.segments[2].hue = _hue;
		this.entity.segments[3].hue = _hue;
	};
};
Ship.prototype.changeHue = function(_x){
	var myHue = this.getHue();
	myHue += _x;
	if(myHue > 360){
		myHue = 0;
	};
	if(myHue < 0){
		myHue = 360;
	};
	this.setHue(myHue);
};
Ship.prototype.getHue = function(){
	return this.entity.getHue();
};
Ship.prototype.setPosition = function(_pos){
    this.entity.position = _pos;
};
Ship.prototype.getPosition = function(){
    return this.entity.position;
};
Ship.prototype.setDirection = function(_dir){
    this.entity.direction = _dir;
};
Ship.prototype.getDirection = function(){
    return this.entity.direction;
};
Ship.prototype.setAcceleration = function(_acc){
	this.entity.acceleration = _acc;
};
Ship.prototype.getAcceleration = function(){
	return this.entity.acceleration;
};
Ship.prototype.setInputAccel = function(_x, _y){
	this.xAccel = _x;
	this.yAccel = _y;
};
Ship.prototype.getInputAccel = function(){
	return this.xAccel + " " + this.yAccel;
};
Ship.prototype.update = function(_dt){
    var accelVec = new Vector2D(this.xAccel, this.yAccel);
    accelVec.multiplyEquals(this.acceleration * _dt);
    this.entity.velocity.addEquals(accelVec);
    if(accelVec.x != 0 || accelVec.y != 0){
        this.entity.direction = new Vector2D(this.entity.velocity.x,this.entity.velocity.y);
        this.entity.direction.normalize();
    }
    this.entity.acceleration = accelVec;
    this.entity.update(_dt);
};
Ship.prototype.fire = function(_container, _x, _y, _id){
    var tarVec = new Vector2D(_x, _y);
	tarVec.normalize();
    tarVec.multiplyEquals(10);
    var tempPro = new Projectile(
            new Vector2D(this.entity.position.x, this.entity.position.y), 
            new Vector2D(tarVec.x, tarVec.y),
            [new LineSegment(new Vector2D(0,5), new Vector2D(0,-5), Math.floor((Math.random() * 360) + 1) ) ],
			_id);
	_container.push(tempPro);
};
module.exports = Ship;