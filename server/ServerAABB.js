var AABB = function (_pos, _hyp){
	this.setAABB(_pos,_hyp);
};
//AABB.prototype.position = new Vector2D(0,0);
AABB.prototype.setPosition = function(_pos) {
	this.position = _pos;
};
AABB.prototype.getPosition = function() {
	return this.position;
};
//AABB.prototype.hypotenuse = new Vector2D(1,1);
AABB.prototype.setHypotenuse = function(_hyp) {
	this.hypotenuse = _hyp;
};
AABB.prototype.getHypotenuse = function() {
	return this.hypotenuse;
};
AABB.prototype.getWidth = function() {
	return this.hypotenuse.x;
};
AABB.prototype.getHalfWidth = function() {
	return this.hypotenuse.x / 2;
};
AABB.prototype.getHeight = function() {
	return this.hypotenuse.y;
};
AABB.prototype.getHalfHeight = function() {
	return this.hypotenuse.y/2;
};
AABB.prototype.getLeft = function() {
	return this.position.x;
};
AABB.prototype.getRight = function() {
	return (this.position.x + this.hypotenuse.x);
};
AABB.prototype.getTop = function() {
	return this.position.y;
};
AABB.prototype.getBottom = function() {
	return (this.position.y + this.hypotenuse.y);
};
AABB.prototype.getTopLeft = function(){
	return new Vector2D(this.getLeft(), this.getTop() );
};
AABB.prototype.getTopRight = function(){
	return new Vector2D(this.getRight(), this.getTop() );
};
AABB.prototype.getBottomRight = function(){
	return new Vector2D(this.getRight(), this.getBottom() );
};
AABB.prototype.getBottomLeft = function(){
	return new Vector2D(this.getLeft(), this.getBottom() );
};
AABB.intersect = function(_a, _b) {
	if(_a.getLeft() 	>= _b.getRight()){ return false; }
	if(_a.getRight() 	<= _b.getLeft()){ return false; }
	if(_a.getTop() 		>= _b.getBottom()){ return false; }
	if(_a.getBottom()	<= _b.getTop()){ return false; }
	return true;
};
AABB.prototype.setAABB = function(_pos, _hyp){
	this.setPosition(_pos);
	this.setHypotenuse(_hyp);
};
AABB.prototype.contains = function(_point, _offset){
	if( _point.x - _offset.x > this.getLeft() && 
		_point.x - _offset.x < this.getRight() && 
		_point.y - _offset.y < this.getBottom() && 
		_point.y - _offset.y > this.getTop() ){
		return true;
	}
	return false;
};
module.exports = AABB;