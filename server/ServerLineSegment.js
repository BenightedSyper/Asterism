var Vector2D = require('./Vector2D');
var ACCURACY = 0.1;
var LineSegment = function(_from, _to, _hue){
	this.from = _from;
	this.to = _to;
	this.hue = _hue;
	this.vector = this.to.subtract(this.from);
};
LineSegment.prototype.vector = new Vector2D(1,1);
LineSegment.prototype.from = new Vector2D(0,0);
LineSegment.prototype.to = new Vector2D(1,1);
LineSegment.prototype.hue = 0;
LineSegment.prototype.saturation = 100;
LineSegment.prototype.luminosity = 50;
LineSegment.prototype.width = 3;

LineSegment.prototype.render = function(_ctx, _viewPort){
    var xOffset = _viewPort.position.x;
    var yOffset = _viewPort.position.y;

    _ctx.save();
    _ctx.strokeStyle = "hsl(" + this.hue + "," + this.saturation + "%," + this.luminosity + "%)";
    _ctx.beginPath();
    _ctx.moveTo(this.from.x - xOffset, this.from.y - yOffset);
    _ctx.lineTo(this.to.x - xOffset, this.to.y - yOffset);
    _ctx.lineWidth = this.width;
    _ctx.stroke();
    _ctx.restore();
};
LineSegment.prototype.contains = function(_point, _offset){
    if(_point.x - _offset.x > Math.max(this.from.x, this.to.x) ||
       _point.x - _offset.x < Math.min(this.from.x, this.to.x) ||
       _point.y - _offset.y > Math.max(this.from.y, this.to.y) ||
       _point.y - _offset.y < Math.min(this.from.y, this.to.y) ){
	   return false;
    };
    //m = y2-y1/x2-x1
    var m = (this.from.y - this.to.y) / (this.from.x - this.to.x);
    var b = this.from.y - (this.from.x * m);
    var testNum = ((_point.x - _offset.x) * m) + b
    testNum = Math.abs(_point.y - _offset.y - testNum);
    if(testNum < (0 + ACCURACY) && testNum > (0 - ACCURACY)){
	return true;
    }else{
	return false;
    }
};
LineSegment.intersect = function (_firFrom, _firTo, _secFrom, _secTo){
    //(Px,Py) = ( (x1y2-y1x2)(x3-x4)-(x1-x2)(x3y4-y3x4)/(x1-x2)(y3-y4)-(y1-y2)(x3-x4) , 
    //   	  (x1y2-y1x2)(y3-y4)-(y1-y2)(x3y4-y3x4)/(x1-x2)(y3-y4)-(y1-y2)(x3-x4) )
    var result = {
	intersect: false,
	x: null,
	y: null,
	crossFir: false,
	crossSec: false,
    };
    var den = ((_firFrom.x - _firTo.x) * (_secFrom.y - _secTo.y)) - ((_firFrom.y - _firTo.y) * (_secFrom.x - _secTo.x));
    if(den == 0){
	return result;
    }else{
	result.intersect = true;
    }
    var phi = ((_firFrom.x * _firTo.y) - (_firFrom.y * _firTo.x));
    var psi = ((_secFrom.x * _secTo.y) - (_secFrom.y * _secTo.x));
    var xNum = (phi * (_secFrom.x - _secTo.x)) - ((_firFrom.x - _firTo.x) * psi);
    var yNum = (phi * (_secFrom.y - _secTo.y)) - ((_firFrom.y - _firTo.y) * psi);
    
    result.x = xNum / den;
    result.y = yNum / den;
    
    //phi = xNum / den;
    //psi = yNum / den;
    
    //result.x = _firFrom.x + (phi * (_firTo.x - _firFrom.x));
    //result.y = _firFrom.y + (psi * (_firTo.y - _firFrom.y));
    if(new LineSegment(_firFrom, _firTo).contains(new Vector2D(result.x, result.y), new Vector2D(0,0) ) ){
	result.crossFir = true;
    }
    if(new LineSegment(_secFrom, _secTo).contains(new Vector2D(result.x, result.y), new Vector2D(0,0) ) ){
	result.crossSec = true;
    }
    return result;
};
module.exports = LineSegment;