function Entity2D(_colType){
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
Entity2D.prototype.render = function(_ctx, _viewPort){
    //debug AABB
    var xOffset = _viewPort.position.x;
    var yOffset = _viewPort.position.y;

    var tempVec;

    //segment drawing
    _ctx.save();
    for(var i = 0; i < this.segments.length; i++){
        _ctx.beginPath();
        _ctx.strokeStyle = "hsl(" + this.segments[i].hue + "," + this.segments[i].saturation + "%," + this.segments[i].luminosity + "%)";
        _ctx.lineWidth = this.segments[i].width;

        tempVec = new Vector2D(this.segments[i].from.x, this.segments[i].from.y);
        tempVec.rotateEquals(this.direction.radiansRotation());
        _ctx.moveTo(tempVec.x + this.position.x - xOffset, tempVec.y + this.position.y - yOffset);

        tempVec = new Vector2D(this.segments[i].to.x, this.segments[i].to.y);
        tempVec.rotateEquals(this.direction.radiansRotation());
        _ctx.lineTo(tempVec.x + this.position.x - xOffset, tempVec.y + this.position.y - yOffset);
        _ctx.stroke();
    }
    _ctx.restore();

    //collision box draw for debug
    _ctx.save();
    _ctx.strokeStyle = "hsl(0,100%,100%)";
    _ctx.beginPath();
    _ctx.lineWidth = 1;
    switch(this.collisionType){
        default://AABB
        case 0://AABB       
            _ctx.moveTo(this.aabb.position.x + this.position.x - xOffset, this.position.y + this.aabb.position.y - yOffset);
            _ctx.lineTo(this.aabb.position.x + this.aabb.hypotenuse.x + this.position.x - xOffset, this.position.y + this.aabb.position.y - yOffset);
            _ctx.lineTo(this.aabb.position.x + this.aabb.hypotenuse.x + this.position.x - xOffset, this.position.y + this.aabb.position.y + this.aabb.hypotenuse.y - yOffset);
            _ctx.lineTo(this.aabb.position.x + this.position.x - xOffset, this.position.y + this.aabb.position.y + this.aabb.hypotenuse.y - yOffset);
            _ctx.closePath();
            break;
        case 1://circle   
            _ctx.arc(this.position.x + this.collisionObject.position.x - xOffset, this.position.y + this.collisionObject.position.y - yOffset, this.collisionObject.radius, 0,2*Math.PI, true);
            break;
        case 2://line segment
            _ctx.strokeStyle = "hsl(0,100%,100%)";
            _ctx.lineWidth = 1;
            tempVec = this.getCOFrom();
            _ctx.moveTo(tempVec.x - xOffset, tempVec.y - yOffset);
            tempVec = this.getCOTo();
            _ctx.moveTo(tempVec.x - xOffset, tempVec.y - yOffset);        
            break;
        case 3://polygon
	    break;
    };
    _ctx.stroke();
    _ctx.restore();
};
Entity2D.prototype.update = function(_dt){
    this.position.addEquals(this.velocity);
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