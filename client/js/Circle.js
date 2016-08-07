function Circle(_pos, _rad){
	this.position = _pos;
	this.radius = _rad;
};
Circle.prototype.getLeft = function(){
	return this.position.x - this.radius;
};
Circle.prototype.getRight = function(){
	return this.position.x + this.radius;
};
Circle.prototype.getTop = function(){
	return this.position.y + this.radius;
};
Circle.prototype.getBottom = function(){
	return this.position.y - this.radius;
};
Circle.prototype.contains = function(_point, _offset){
	var temp = 0;
	temp = new Vector2D(_offset.x, _offset.y);
	temp.addEquals(this.position);
	temp.subtractEquals(_point);
	if(temp.magnitudeSquared() < Math.pow(this.radius, 2)){
		return true;
	};
	return false;
};