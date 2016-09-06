function Collision (_one, _two){
    this.entityOne = _one;
    this.entityTwo = _two;
	if(this.checkCollisionTags()){
		this.checkCollisionAABB();
	};
};
Collision.prototype.entityOne = null;
Collision.prototype.entityTwo = null;
Collision.prototype.penetration = 0;
Collision.prototype.normal = Vector2D.zero;
Collision.prototype.aabbIntersect = false;
Collision.prototype.intersection = false;
Collision.prototype.collisionPoint;
Collision.prototype.checkCollisionTags = function(){
	var first = false;
	for(var i = 0; i < this.entityOne.tags.length; i++){
		for(var j = 0; j < this.entityTwo.collisionTags.length; j++){
			first = first || 
			(this.entityOne.tags[i] == this.entityTwo.collisionTags[j]);
		};
	};
	// this.entityOne.tags.forEach(function(_fx){
		// this.entityTwo.collisionTags.forEach(function(_fy){
			// first = first || (_fx == _fy);
		// });
	// });
	if(first){ return true; };
	var second = false;
	for(var i = 0; i < this.entityTwo.tags.length; i++){
		for(var j = 0; j < this.entityOne.collisionTags.length; j++){
			first = first || 
			(this.entityTwo.tags[i] == this.entityOne.collisionTags[j]);
		};
	};
	// this.entityTwo.tags.forEach(function(_sx){
		// this.entityOne.collisionTags.forEach(function(_sy){
			// second = second || (_sx == _sy);
		// });
	// });
	if(second){ return true; };
	return false;
};
Collision.prototype.checkCollisionAABB = function(){
    this.aabbIntersect = Entity2D.checkAABBCollision(this.entityOne,this.entityTwo);
    //this.checkAABBvsAABBIntersection();
    //Entity2D.checkAABBCollision(this.entityOne,this.entityTwo);
    if(this.aabbIntersect){
	//test the collision type for intersection
	switch(this.entityOne.collisionType * 4 + this.entityTwo.collisionType){
	case 15: /* polygon vs polygon */ break;
	case 14: /* polygon vs line segment */ break;
	case 13: /* polygon vs circle*/ break;
	case 12: /* polygon vs AABB */ 	break;
	case 11: /* line segment vs polygon */ break;
	case 10: /* line segment vs line segment */ this.intersection = this.checkLinevsLineIntersection(); break;
	case 9: /* line segment vs circle */ this.intersection = this.checkCirclevsLineIntersection(false); break;
	case 8: /* line segment vs AABB */ this.intersection = this.checkAABBvsLineIntersection(false); break;
	case 7: /* circle vs polygon */	break;
	case 6: /* circle vs line segment */ this.intersection = this.checkCirclevsLineIntersection(true); break;
	case 5: /* circle vs circle */ this.intersection = this.checkCirclevsCircleIntersection(); break;
	case 4: /* circle vs AABB */ this.intersection = this.checkAABBvsCircleIntersection(false); break;
	case 3: /* AABB vs polygon */ break;
	case 2: /* AABB vs line segment */ this.intersection = this.checkAABBvsLineIntersection(true); break;
	case 1: /* AABB vs circle */ this.intersection = this.checkAABBvsCircleIntersection(true); break;
	case 0: /* AABB vs AABB */ this.intersection = true; break;
	default: this.intersection = false; break;
	}
    }
};
Collision.prototype.checkLinevsLineIntersection = function(){
    var result = LineSegment.intersect( this.entityOne.getCOFrom(), this.entityOne.getCOTo(), 
					this.entityTwo.getCOFrom(), this.entityTwo.getCOTo());
	return result.intersect && result.crossFir && result.crossSec;
};
Collision.prototype.checkCirclevsLineIntersection = function(_bool){
    var result;
    var linSeg;
    var dot;
    var point;
    if(_bool){
	linSeg = this.entityOne.getCOPos();
    	linSeg.subtractEquals(this.entityTwo.getCOFrom());
	dot = linSeg.dot(this.entityTwo.getCOVec().normal());
    	point = this.entityTwo.getCOFrom();
    	point.addEquals(this.entityTwo.getCOVec().normal().multiply(dot));

	Pfrom = this.entityTwo.getCOFrom();
	Pto = this.entityTwo.getCOTo();
	

	var resLine = (this.entityOne.contains(point, new Vector2D(0,0))&& 
		 point.x > Math.min(Pfrom.x, Pto.x) &&
		 point.x < Math.max(Pfrom.x, Pto.x) &&
		 point.y > Math.min(Pfrom.y, Pto.y) &&
		 point.y < Math.max(Pfrom.y, Pto.y) ); //FIX THIS
	var resTo = this.entityOne.contains(this.entityTwo.getCOTo(), new Vector2D(0,0));
	var resFrom = this.entityOne.contains(this.entityTwo.getCOFrom(), new Vector2D(0,0));
	if(resFrom){
	    this.collisionPoint = Pfrom;
	}else if(resTo){
	    this.collisionPoint = Pto;
	}else if (resLine){
	    this.collisionPoint = point;
	}
	result =  resTo || resFrom || resLine;
    }else{
	linSeg = this.entityTwo.getCOPos();
    	linSeg.subtractEquals(this.entityOne.getCOFrom());
	dot = linSeg.dot(this.entityOne.getCOVec().normal());
    	point = this.entityOne.getCOFrom();
    	point.addEquals(this.entityOne.getCOVec().normal().multiply(dot));

	Pfrom = this.entityOne.getCOFrom();
	Pto = this.entityOne.getCOTo();
	

	var resLine = (this.entityTwo.contains(point, new Vector2D(0,0))&& 
		 point.x > Math.min(Pfrom.x, Pto.x) &&
		 point.x < Math.max(Pfrom.x, Pto.x) &&
		 point.y > Math.min(Pfrom.y, Pto.y) &&
		 point.y < Math.max(Pfrom.y, Pto.y) ); //FIX THIS
	var resTo = this.entityTwo.contains(this.entityOne.getCOTo(), new Vector2D(0,0));
	var resFrom = this.entityTwo.contains(this.entityOne.getCOFrom(), new Vector2D(0,0));
	if(resFrom){
	    this.collisionPoint = Pfrom;
	}else if(resTo){
	    this.collisionPoint = Pto;
	}else if (resLine){
	    this.collisionPoint = point;
	}
	result =  resTo || resFrom || resLine;
/*
	linSeg = this.entityTwo.getCOPos();
    	linSeg.subtractEquals(this.entityOne.getCOFrom());
    	dot = linSeg.dot(this.entityOne.getCOVec().normal());
    	point = this.entityOne.getCOFrom();
    	point.addEquals(this.entityOne.getCOVec().normal().multiply(dot));

	result = this.entityTwo.contains(this.entityOne.getCOTo())   || 
	         this.entityTwo.contains(this.entityOne.getCOFrom()) || 
	         this.entityTwo.contains(point);
*/
    }
    return result;
};
Collision.prototype.checkAABBvsLineIntersection = function(_bool){
    //create line segments for each side of the AABB
    if(_bool){
	return this.entityOne.AABBcontains(this.entityTwo.getCOTo()) || 
	       this.entityOne.AABBcontains(this.entityTwo.getCOFrom());
    }else{
	return this.entityTwo.AABBcontains(this.entityOne.getCOTo()) || 
	       this.entityTwo.AABBcontains(this.entityOne.getCOFrom());
    }
};
Collision.prototype.checkCirclevsCircleIntersection = function(){
	var dist = this.entityOne.getCOPos();
	dist.subtractEquals(this.entityTwo.getCOPos());

	var rad = this.entityOne.collisionObject.radius;
	rad += this.entityTwo.collisionObject.radius;
	if(dist.magnitudeSquared() < Math.pow(rad,2)){
		return true;
	}
	return false;
};
Collision.prototype.checkAABBvsAABBIntersection = function(){
	if(this.entityOne.position.x + this.entityOne.aabb.getLeft() 		>= 
		this.entityTwo.position.x + this.entityTwo.aabb.getRight())		{ return false; }
	if(this.entityOne.position.x + this.entityOne.aabb.getRight() 		<= 
		this.entityTwo.position.x + this.entityTwo.aabb.getLeft())		{ return false; }
	if(this.entityOne.position.y + this.entityOne.aabb.getTop()			>= 
		this.entityTwo.position.y + this.entityTwo.aabb.getBottom())	{ return false; }
	if(this.entityOne.position.y + this.entityOne.aabb.getBottom()		<= 
		this.entityTwo.position.y + this.entityTwo.aabb.getTop())		{ return false; }
	return true;
};
Collision.prototype.checkAABBvsCircleIntersection = function(_bool){
    if(!_bool){
	if(this.entityTwo.position.x + this.entityTwo.aabb.getLeft() 	>= 
	   this.entityOne.position.x + this.entityOne.aabb.getRight())	{ return false; }
	if(this.entityTwo.position.x + this.entityTwo.aabb.getRight() 	<= 
	   this.entityOne.position.x + this.entityOne.aabb.getLeft())	{ return false; }
	if(this.entityTwo.position.y + this.entityTwo.aabb.getTop()	>= 
	   this.entityOne.position.y + this.entityOne.aabb.getBottom())	{ return false; }
	if(this.entityTwo.position.y + this.entityTwo.aabb.getBottom()	<= 
	   this.entityOne.position.y + this.entityOne.aabb.getTop())	{ return false; }
	
	if( this.entityOne.contains(this.entityTwo.getAABBTopLeft())	    ||	
	    this.entityOne.contains(this.entityTwo.getAABBTopRight())	    ||
	    this.entityOne.contains(this.entityTwo.getAABBBottomLeft())	    ||
	    this.entityOne.contains(this.entityTwo.getAABBBottomRight())    ){
	    return true;
	}
	return true;
    }else{
	if(this.entityOne.position.x + this.entityOne.aabb.getLeft() 	>= 
	   this.entityTwo.position.x + this.entityTwo.aabb.getRight())	{ return false; }
	if(this.entityOne.position.x + this.entityOne.aabb.getRight() 	<= 
	   this.entityTwo.position.x + this.entityTwo.aabb.getLeft())	{ return false; }
	if(this.entityOne.position.y + this.entityOne.aabb.getTop()	>= 
	   this.entityTwo.position.y + this.entityTwo.aabb.getBottom())	{ return false; }
	if(this.entityOne.position.y + this.entityOne.aabb.getBottom()	<= 
	   this.entityTwo.position.y + this.entityTwo.aabb.getTop())	{ return false; }
	
	if( this.entityTwo.contains(this.entityOne.getAABBTopLeft())	    ||	
	    this.entityTwo.contains(this.entityOne.getAABBTopRight())	    ||
	    this.entityTwo.contains(this.entityOne.getAABBBottomLeft())	    ||
	    this.entityTwo.contains(this.entityOne.getAABBBottomRight())    ){
	    return true;
	}
	return true;
    }
};
Collision.prototype.checkCollisionType = function(){
    //check the collision type of each entity and select the apporpriate collision resolving test;
    switch(this.entityOne.collisionType * 4 + this.entityTwo.collisionType){
    case 15: /* polygon vs polygon */ break;
    case 14: /* polygon vs line segment */ break;
    case 13: /* polygon vs circle*/ break;
    case 12: /* polygon vs AABB */ break;
    case 11: /* line segment vs polygon */ break;
    case 10: /* line segment vs line segment */	this.calculateLinevsLine(); break;
    case 9:  /* line segment vs circle */ this.calculateCirclevsLine(false); break;
    case 8:  /* line segment vs AABB */	this.calculateAABBvsLine(); break;
    case 7:  /* circle vs polygon */ break;
    case 6:  /* circle vs line segment */ this.calculateCirclevsLine(true); break;
    case 5:  /* circle vs circle */ this.calculateCirclevsCircle(); break;
    case 4:  /* circle vs AABB */ this.calculateAABBvsCircle(); break;
    case 3:  /* AABB vs polygon */ break;
    case 2:  /* AABB vs line segment */	this.calculateAABBvsLine(); break;
    case 1:  /* AABB vs circle */ this.calculateAABBvsCircle(); break;
    case 0:  /* AABB vs AABB */ this.calculateAABBvsAABB(); break;
    default: /* AABB vs AABB */ this.calculateAABBvsAABB(); break;
    };
    this.resolveCollision();
};
Collision.prototype.calculateLinevsLine = function(){
    if(this.entityTwo.getCOVec().cross(this.entityOne.getCOVec()) < 0){
	this.normal = this.entityTwo.getCOVec().perpendicularCW();
    }else{
	this.normal = this.entityTwo.getCOVec().perpendicularCCW();
    }
};
Collision.prototype.calculateCirclevsLine = function(_bool){
    //find the closest point on the line to the center of the circle
    //use this.collisionPoint from the collision check
    //this.normal = this.entityTwo.position.subtract(this.entityOne.position);
    if(_bool){
	this.normal = this.entityOne.position.subtract(this.collisionPoint);
	this.normal.negativeEquals();
    }else{
	this.normal = this.entityTwo.position.subtract(this.collisionPoint);
	//this.normal.negativeEquals();
    }
};
Collision.prototype.calculateAABBvsLine = function(){
    this.normal = this.entityTwo.position.subtract(this.entityOne.position);
};
Collision.prototype.calculateCirclevsCircle = function() {
    this.normal = this.entityTwo.position.subtract(this.entityOne.position);
};
Collision.prototype.calculateAABBvsCircle = function(){
    this.normal = this.entityTwo.position.subtract(this.entityOne.position);
}
Collision.prototype.calculateAABBvsAABB = function(){
    var aabbOne = this.entityOne.aabb;
    var aabbTwo = this.entityTwo.aabb;
    //find the normal
    this.normal = this.entityTwo.position.subtract(this.entityOne.position);
    
    //calculate the over lap
    var xOverlap = aabbOne.getHalfWidth() + aabbTwo.getHalfWidth() - Math.abs(this.normal.x);
    var yOverlap = aabbOne.getHalfHeight() + aabbTwo.getHalfHeight() - Math.abs(this.normal.y);
    
    if(xOverlap > yOverlap){
	if(this.normal.y > 0){
	    this.normal = new Vector2D(0,1);
	}else{
	    this.normal = new Vector2D(0,-1);
	}
	this.penetration = yOverlap;
	return;
    }else{
	if(this.normal.x > 0){
	    this.normal = new Vector2D(1,0);
	}else{
	    this.normal = new Vector2D(-1,0);
	}
	this.penetration = xOverlap;
	return;
    }
};
Collision.prototype.resolveCollision = function(){
    this.intersection = false;
    var relVel = this.entityTwo.velocity.subtract(this.entityOne.velocity);
    var velDotNor = relVel.dot(this.normal.normal());
    if(velDotNor > 0){
	return;
    }
    var colRes = Math.min(this.entityOne.restitution,this.entityTwo.restitution);
    var j = -(1 + colRes) * velDotNor;
    j /= 1/this.entityOne.mass + 1/this.entityTwo.mass;
    
    var impulse = this.normal.normal();
    impulse.multiplyEquals(j);
    this.entityOne.velocity.subtractEquals(impulse.multiply(1/this.entityOne.mass) );
    this.entityTwo.velocity.addEquals(impulse.multiply(1/this.entityTwo.mass) );
};