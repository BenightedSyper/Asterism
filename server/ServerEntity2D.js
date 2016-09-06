var Vector2D = require('./Vector2D');
var Circle = require('./ServerCircle');
var AABB = require('./ServerAABB');
var LineSegment = require('./ServerLineSegment');
var Entity2D = function(_colType){
    this.collisionType = _colType;
    this.position = new Vector2D(20,20);
    this.velocity = new Vector2D(0,0);
    this.acceleration = new Vector2D(0,0);
    this.direction = new Vector2D(0,1);
    this.rotationVelocity = 0;
    this.points = [];//rename verticies
    this.segments = [];//rename edges
    this.aabb = new AABB(new Vector2D(0,0), new Vector2D(10,10));
    this.restitution = 1;
    this.mass = 1;
    this.drag = 0.98;
	this.tags = [];
	this.collisionTags = [];
};
Entity2D.fromJSON = function(_json){
	console.log(_json);
	var e = new Entity2D(_json.collisionType);
	e.position = new Vector2D(_json.position.x, _json.position.y);
	e.velocity = new Vector2D(_json.velocity.x, _json.velocity.y);
	e.acceleration = new Vector2D(_json.acceleration.x, _json.acceleration.y);
	e.direction = new Vector2D(_json.direction.x, _json.direction.y);
	e.rotationVelocity = _json.rotationVelocity;
	for(var i = 0; i < _json.points.length; i++){
		e.points.push(new Vector2D(_json.points[i].x, _json.points[i].y));
	};
	for(var i = 0; i < _json.segments.length; i++){
		e.segments.push(new LineSegment(new Vector2D(_json.segments[i].to.x,   _json.segments[i].to.y), 
										new Vector2D(_json.segments[i].from.x, _json.segments[i].from.y)));
	};
	e.calcAABB();
	e.restitution = _json.restitution;
	e.mass = _json.mass;
	e.drag = _json.drag;
	for(var i = 0; i < _json.tags.length; i++){
		e.tags.push(_json.tags[i]);
	};
	for(var i = 0; i < _json.collisionTags.length; i++){
		e.collisionTags.push(_json.collisionTags[i]);
	};
	return e;
};
Entity2D.prototype.addCollisionTag = function(_tag){
	this.collisionTags.push(_tag);
};
Entity2D.prototype.addTag = function(_tag){
	this.tags.push(_tag);
};
Entity2D.prototype.getHue = function(){
	return this.segments[0].hue;
};
Entity2D.prototype.calcAABB = function(){
    var maxDis = 0;
    var tempDis = 0;
    for(var i = 0; i < this.points.length; i++){
        //for each point in points calc the distance away from center and use that as the aabb limits
        tempDis = this.points[i].magnitudeSquared();
        if(tempDis > maxDis){
            maxDis = tempDis;
        }
    }
    //set the AABB to fit the new maxDis
    maxDis = Math.sqrt(maxDis);
    this.aabb = new AABB(new Vector2D(-maxDis, -maxDis), new Vector2D(2*maxDis,2*maxDis));
    switch(this.collisionType){
        default://AABB
        case 0://AABB
            break;
        case 1://circle
            this.collisionObject = new Circle(new Vector2D(0,0), maxDis);
            break;
        case 2://line segment
            this.collisionObject = new LineSegment(this.segments[0].to, this.segments[0].from);
            this.collisionObject.luminosity = 100;
            this.collisionObject.lineWidth = 5;
            break;
        case 3://Regular Polygon
			this.collisionObject = new Circle(new Vector2D(0,0), maxDis);
	    break;
    };
};
Entity2D.prototype.update = function(_dt){
    this.position.addEquals(this.velocity);
	//console.log(this.velocity);
    if(this.acceleration.x == 0 && this.acceleration.y == 0){
        this.velocity.multiplyEquals(this.drag);
        if(this.velocity.magnitudeSquared() < 0.1){
            this.velocity = new Vector2D(0,0);
        };
    };
};
Entity2D.prototype.setSegments = function(_seg){
	this.segments = _seg;
};
Entity2D.prototype.getSegments = function(){
	return this.segments;
};
Entity2D.checkAABBCollision = function(_ent1, _ent2){
	//console.log(_ent1.position + " " + _ent2.position);
    return AABB.intersect(  new AABB(_ent1.aabb.position.add(_ent1.position), _ent1.aabb.hypotenuse), 
                            new AABB(_ent2.aabb.position.add(_ent2.position), _ent2.aabb.hypotenuse));
};
Entity2D.prototype.getAABBPos = function(){
    return this.position.add(this.aabb.position);
};
Entity2D.prototype.getAABBTopLeft = function(){
    return this.position.add(this.aabb.getTopLeft());
};
Entity2D.prototype.getAABBTopRight = function(){
    return this.position.add(this.aabb.getTopRight());
};
Entity2D.prototype.getAABBBottomRight = function(){
    return this.position.add(this.aabb.getBottomRight());
};
Entity2D.prototype.getAABBBottomLeft = function(){
    return this.position.add(this.aabb.getBottomLeft());
};
Entity2D.prototype.getCOPos = function(){
    return this.position.add(this.collisionObject.position);
};
Entity2D.prototype.getCOTo = function(){
    return this.position.add(this.collisionObject.to.rotate(this.direction.radiansRotation()));
};
Entity2D.prototype.getCOFrom = function(){
    return this.position.add(this.collisionObject.from.rotate(this.direction.radiansRotation()));
};
Entity2D.prototype.getCOVec = function(){
    return this.collisionObject.vector.rotate(this.direction.radiansRotation());
};
Entity2D.prototype.contains = function(_point){
    return this.collisionObject.contains(_point, this.position);
};
Entity2D.prototype.AABBcontains = function(_point){
    return this.aabb.contains(_point, this.position);
};
function RegularPolygon(_sides, _radius){
    var regpol = new Entity2D(3);
    regpol.sides = _sides < 3 ? 3 : _sides;
    var radius = _radius < 0 ? 1 : _radius;
    //calculate the verts
    for(var i = 0; i < regpol.sides; i++){
	var vert = new Vector2D(0,1);
	vert.rotateEquals(i * 2 * Math.PI / regpol.sides);
	this.points.push(vert);
    };
    for(var i = 0; i < regpol.sides; i++){
	//to from hue
	//from i to i+1%sides
	var linseg = new LineSegment(this.points[i], this.points[(i+1)%regpol.sides], 0);
	this.segments.push(linseg);
    };
    regpol.render = function(_ctx, _offset){
	_ctx.save();
	_ctx.strokeStyle = "hsl(0,100%,100%)";
	_ctx.beginPath();
	_ctx.lineWidth = 1;
	this.segments.forEach(function(_el,_in,_ar){
	    _el.render(_ctx, _offset);
	});
	_ctx.stroke();
	_ctx.restore();
    };
};
module.exports = Entity2D;