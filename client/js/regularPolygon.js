function RegularPolygon(_pos, _rad, _sid, _star){
    this.star = false; //_star;//needs co-prime eqation to finish star polygon
    this.verticies = new Array();
    this.edges = new Array();
    this.position = _pos;
    this.radius = _rad < 0 ? 1 : _rad;
    this.direction = new Vector2D(0,1);
    this.sides = _sid < 3 ? 3 : _sid;
    this.calculatePolygon();
};
RegularPolygon.prototype.render = function(_ctx, _viewport){
    var posX = this.position.x - _viewport.position.x;
    var posY = this.position.y - _viewport.position.y;

    _ctx.save();
    _ctx.strokeStyle = "hsl(0,100%,100%)";
    _ctx.beginPath();
    _ctx.moveTo(posX + this.verticies[0].x, posY + this.verticies[0].y);
    for(var i = 1; i <= this.verticies.length; i++){
	_ctx.lineTo(posX + this.verticies[i].x, posY + this.verticies[i].y);
    };
    _ctx.lineTo(posX + this.verticies[0].x, posY + this.verticies[0].y);
    //_ctx.lineWidth = 1;
    _ctx.stroke();
    _ctx.restore();
};
RegularPolygon.prototype.calculatePolygon = function(){
    this.calculateVertices();
    this.calculateEdges();
};
RegularPolygon.prototype.calculateVertices = function(){
    for(var i = 0; i < this.sides; i++){
	var vert = new Vector2D(0,1);
	vert.rotateEquals(i * 2 * Math.PI / this.sides);
	this.vertices.push(vert);
    };
};
RegularPolygon.prototype.calculateEdges = function(){
    for(var i = 1; i < this.sides; i++){
	var lin = new LineSegment(this.vertices[i-1], this.vertices[i], 0);
	this.edges.push(lin);
    };
    var lin = new LineSegment(this.vertices[this.sides - 1], this.vertices[0]);
    this.edges.push(lin);
};
RegularPolygon.prototype.contains = function(_point){
    //if the point is to the right?left of all edges return false.
    //LineSegment doesnt have that equations yet
    return false;
};
RegularPolygon.prototype.render = function(_ctx){

};
