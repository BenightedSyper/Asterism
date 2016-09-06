var Vector2D = require('./Vector2D');
var StarParallax = function (_pos, _seed){
	this.size = 100;
	this.pos = _pos;
	this.seed = _seed;
	this.stars = [];
	//this.calculateStars();
};
StarParallax.prototype.setStars = function(_stars){
	this.stars = _stars;
};
StarParallax.prototype.setJSONStars = function(_json){
	//console.log(_json);
	for(var st in _json){
		this.stars.push({
			pos: new Vector2D(_json[st].pos.x, _json[st].pos.y),
			dis: _json[st].dis,
			hue: _json[st].hue
		});
	};
};
StarParallax.prototype.calculateStars = function(){
	for(var i = 0; i < this.size; i++){
		this.stars.push({
			pos: new Vector2D(1000 * Math.random(),
							  1000 * Math.random()),
			//sat: saturation stuff,
			dis: Math.floor(Math.random() * 11) + 90,
			hue: Math.floor(Math.random() * 361)
		});
	};
};
StarParallax.prototype.render = function(_ctx, _viewPort){
    var xOffset = _viewPort.position.x;
    var yOffset = _viewPort.position.y;
	
	_ctx.save();
	for(var i = 0; i < this.size; i++){
		_ctx.fillStyle = "hsl("+ this.stars[i].hue +",40%,"+ this.stars[i].dis +"%)";
		_ctx.fillRect(this.stars[i].pos.x - (xOffset * (100 / this.stars[i].dis)), 
					  this.stars[i].pos.y - (yOffset * (100 / this.stars[i].dis)) ,
					  2,2);// size based on distance
	};
	_ctx.restore();
};
StarParallax.fromJSON = function(_json){
	var jsonStars = _json.stars;
	var sp = new StarParallax(jsonStars.pos, jsonStars.seed);
	sp.setJSONStars(jsonStars.stars);
	return sp;
};
module.exports = StarParallax