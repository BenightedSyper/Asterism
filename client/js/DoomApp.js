var lastTime;
var canvas;
var ctx;

var socket;

var canvasWidth;
var canvasHeight;

var player;

// A cross-browser requestAnimationFrame
// See https://hacks.mozilla.org/2011/08/animating-with-javascript-from-setinterval-to-requestanimationframe/
var requestAnimFrame = (function(){
    return window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();
function Page_OnResize(){
    //canvas.width = window.innerWidth*0.95;
    //canvas.height = window.innerHeight*0.9;
}
function Page_OnLoad(){
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");
    canvasWidth = window.innerWidth;
    canvas.width = canvasWidth;
    canvasHeight = window.innerHeight*0.95;
    canvas.height = canvasHeight;
    document.body.appendChild(canvas);
    
	socket = io();
	socket.on(ClientUpdatePosition, function(date){
		
	});
	/*socket.emit('test', {
		message:"this is the message"
	});*/
	
    //player = new Player();

    lastTime = Date.now();
    lastShot = lastTime;
    main();
};

function main(){
	var now = Date.now();
	var dt = (now - lastTime) / 1000.0;

	update(dt);
	render();

	lastTime = now;
	requestAnimFrame(main);
};

function update(dt){
    handleInput(dt);
};
function handleInput(_dt){

};
function render(){
    //clear screen
    ctx.save();
    ctx.fillStyle ="rgba(0,0,0,1)";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    //
    //send the player and the map to something that will draw.

    ctx.restore();
};