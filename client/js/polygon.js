function polygon(_pos){
    this.position = _pos;
    this.edges = new Array();
    this.vertices = new Array();
};
polygon.prototype.addVertecies = function(_v){
    _v.forEach(this.addVert);
};
polygon.prototype.addVert = function(_el, _in, _ar){
    this.addVertex(_el);
};
polygon.prototype.addVertex = function(_vert){
    this.vertices.push(_vert);
};