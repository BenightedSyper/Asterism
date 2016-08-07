function Vector2D(_x, _y) {
    if ( arguments.length > 1 ) {
        this.setVec(_x, _y);
    };
};
Vector2D.prototype.setVec = function(_x, _y) {
    this.x = _x;
    this.y = _y;
};
Vector2D.prototype.magnitude = function() {
    return Math.sqrt(this.x*this.x + this.y*this.y);
};
Vector2D.prototype.magnitudeSquared = function(){
    return this.x * this.x + this.y * this.y;
};
Vector2D.prototype.dot = function(_vec) {
    return this.x*_vec.x + this.y*_vec.y;
};
Vector2D.prototype.cross = function(_vec) {
    return (this.x*_vec.y - this.y*_vec.x);
};
Vector2D.prototype.normal = function() {
    return this.divide( this.magnitude() );
};
Vector2D.prototype.normalize = function() {
    this.divideEquals( this.magnitude() );
    return this;
};
Vector2D.prototype.add = function(_vec) {
    return new Vector2D(this.x + _vec.x, this.y + _vec.y);
};
Vector2D.prototype.addEquals = function(_vec) {
    this.x += _vec.x;
    this.y += _vec.y;
    return this;
};
Vector2D.prototype.subtract = function(_vec) {
    return new Vector2D(this.x - _vec.x, this.y - _vec.y);
};
Vector2D.prototype.subtractEquals = function(_vec) {
    this.x -= _vec.x;
    this.y -= _vec.y;
    return this;
};
Vector2D.prototype.multiply = function(_scalar) {
    return new Vector2D(this.x * _scalar, this.y * _scalar);
};
Vector2D.prototype.multiplyEquals = function(_scalar) {
    this.x *= _scalar;
    this.y *= _scalar;
    return this;
};
Vector2D.prototype.divide = function(_scalar) {
    return new Vector2D(this.x / _scalar, this.y / _scalar);
};
Vector2D.prototype.divideEquals = function(_scalar) {
    this.x /= _scalar;
    this.y /= _scalar;
    return this;
};
Vector2D.prototype.perpendicularCW = function() {
    return new Vector2D(this.y, -this.x);
};
Vector2D.prototype.perpendicularCWEquals = function() {
    this.setVec(-this.y, this.x);
    return this;
};
Vector2D.prototype.perpendicularCCW = function() {
    return new Vector2D(-this.y, this.x);
};
Vector2D.prototype.perpendicularCCWEquals = function() {
    this.setVec(this.y, -this.x);
    return this;
};
Vector2D.prototype.negative = function() {
    return new Vector2D(-this.x,-this.y);
};
Vector2D.prototype.negativeEquals = function() {
    this.setVec(-this.x,-this.y);
    return this;
};
Vector2D.prototype.project = function(_vec) {
    var percent = this.dot(_vec) / _vec.dot(_vec);

    return _vec.multiply(percent);
};
Vector2D.prototype.toString = function() {
    return "" + this.x + "," + this.y;
};
Vector2D.prototype.rotate = function(_deg){
    //x' = x cos(theta) - y sin(theta)
    //y' = x sin(theta) + y cos(theta)
    var _x = this.x;
    var _y = this.y;
    return new Vector2D(_x * Math.cos(_deg) - _y * Math.sin(_deg), _x * Math.sin(_deg) + _y * Math.cos(_deg) );
};
Vector2D.prototype.rotateEquals = function(_deg){
    //x' = x cos(theta) - y sin(theta)
    //y' = x sin(theta) + y cos(theta)
    var _x = this.x;
    var _y = this.y;
    this.x = _x * Math.cos(_deg) - _y * Math.sin(_deg);
    this.y = _x * Math.sin(_deg) + _y * Math.cos(_deg);
    return this;
};
Vector2D.fromPoints = function(_p1, _p2) {
    return new Vector2D(
        _p2.x - _p1.x,
        _p2.y - _p1.y
    );
};
Vector2D.prototype.radiansRotation = function(){
    return -Math.atan2(this.x, this.y);
};
Vector2D.zero =     (function(){new Vector2D(0,0);})();
Vector2D.up =       (function(){new Vector2D(0,1);})();
Vector2D.down =     (function(){new Vector2D(0,-1);})();
Vector2D.left =     (function(){new Vector2D(-1,0);})();
Vector2D.right =    (function(){new Vector2D(1,0);})();