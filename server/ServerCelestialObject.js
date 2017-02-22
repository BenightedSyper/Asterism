var Vector2D = require('./Vector2D');
var Circle = require('./ServerCircle');
var ViewPort = require('./ServerViewPort');
var LineSegment = require('./ServerLineSegment');
var Entity2D = require('./ServerEntity2D');
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
	this.orbit = false;
	this.orbitRadius = 0;
	this.orbitPeriod = 0;
	this.orbitOffset = 0;
	this.orbitStep = 0;
	this.orbitCurrent = 0;
	this.orbitTarget = this.entity.position;
};
CelestialObject.prototype.setOrbit = function(_rad, _per, _off){
	this.orbit = true;
	this.orbitRadius = _rad;
	this.orbitPeriod = _per;
	this.orbitOffset = _off;
	this.orbitStep = Math.PI * 2 / this.orbitPeriod;
	this.orbitCurrent = this.orbitOffset;
	this.clampOrbit();
};
CelestialObject.prototype.clampOrbit = function(){
	if(this.orbitCurrent > this.orbitPeriod){
		this.orbitCurrent -= this.orbitPeriod;
	};
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
	if(this.orbit){
		this.orbitCurrent += _dt;
		this.clampOrbit();
		var orbX = Math.sin(this.orbitCurrent * this.orbitStep) + this.orbitTarget.x;
		var orbY = Math.cos(this.orbitCurrent * this.orbitStep) + this.orbitTarget.y;
		this.entity.position = new Vector2D(orbX, orbY);
	};
	//cos(0) = 1 = y
	//sin(0) = 0 = x
};
CelestialObject.fromJSON = function(_json){
	var jsonCel = _json.celobj;
	var co = [];
	for(var i = 0; i < jsonCel.length; i++){
		co.push(new CelestialObject(new Vector2D(0,0)));
		co[i].entity = Entity2D.fromJSON(jsonCel[i].entity);
		co[i].hue = jsonCel[i].hue;
		if(jsonCel[i].orbit){
			co[i].orbit = true;
			co[i].orbitRadius = jsonCel[i].orbit;
			co[i].orbitPeriod = jsonCel[i].orbitPeriod;
			co[i].orbitOffset = jsonCel[i].orbitOffset;
			co[i].orbitStep = Math.PI * 2 / jsonCel[i].orbitPeriod;
			co[i].orbitCurrent = jsonCel[i].orbitOffset;
		};
	};
	//var co = new CelestialObject(new Vector2D(0,0));
	//co.entity = Entity2D.fromJSON(jsonCel.entity);
	//co.hue = jsonCel.hue;
	return co;
};
module.exports = CelestialObject;