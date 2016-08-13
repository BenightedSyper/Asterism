function StarParalax(_pos, _seed){
	this.size = 10;
	this.pos = _pos;
	this.seed = _seed;
	this.stars = [];
	this.calculateStars();
};
StarParalax.prototype.calculateStars = function(){
	for(var i = 0; i < this.size; i++){
		this.stars.push([]);
		for(var j = 0; j < this.size; j++){
			this.stars[i].push({
				pos: new Vector2D(i * 1000 * Math.random(),
								  j * 1000 * Math.random()),
				//sat: saturation stuff,
				dis: Math.floor(Math.random() * 11) + 90,
				hue: Math.floor(Math.random() * 361)
			});
		};
	};
};
StarParalax.prototype.render = function(_ctx, _viewPort){
    var xOffset = _viewPort.position.x;
    var yOffset = _viewPort.position.y;
	
	_ctx.save();
	for(var i = 0; i < this.size; i++){
		for(var j = 0; j < this.size; j++){
			_ctx.fillStyle = "hsl("+ this.stars[i][j].hue +",30%,"+ this.stars[i][j].dis +"%)";
			_ctx.fillRect(this.stars[i][j].pos.x - (xOffset * (100 / this.stars[i][j].dis)), 
						  this.stars[i][j].pos.y - (yOffset * (100 / this.stars[i][j].dis)) ,
						  2,2);// size based on distance
		};
	};
	_ctx.restore();
	
};