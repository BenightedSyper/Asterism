var Vector2D = require('./server/Vector2D');
var Circle = require('./server/ServerCircle');
var AABB = require('./server/ServerAABB');
var ViewPort = require('./server/ServerViewPort');
var Entity2D = require('./server/ServerEntity2D');
var Ship = require('./server/ServerShip');
var Collision = require('./server/ServerCollision');
var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

serv.listen(666);
console.log("The Server has been Started.");

var SOCKETID = 0;
var TOTALSOCKETS = 0;
var PROJNUM = 0;
var SOCKET_LIST = [];
var PLAYER_LIST = [];
var PROJECTILE_LIST = [];
var SHIP_COLLISIONS = [];

var d = new Date();
var last = d.getTime();

function Player(_id){
	this.position = new Vector2D(0,0);
	this.velocity = new Vector2D(0,0);
	this.acceleration = new Vector2D(0,0);
	this.maxAccel = 10;
	this.id = _id;
	this.ship = null;
};
Player.prototype.updatePosition = function(_dt){
	if(this.ship != null){//should be redundant b/c the check in update
		//console.log(PLAYER_LIST[this.id].ship.getPosition());
		PLAYER_LIST[this.id].ship.update(_dt);
	};
};
function deleteProjectile(_id){
	delete PROJECTILE_LIST[_id];
};
function disconnectSocket(_id){
	delete SOCKET_LIST[_id];
	delete PLAYER_LIST[_id];
	for(var sock in SOCKET_LIST){
		//console.log(sock);
		var socket = SOCKET_LIST[sock];
		socket.emit('ClientDisconnect', _id);
	};
};
var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	socket.id = SOCKETID++;
	TOTALSOCKETS++;
    console.log('socket ' + socket.id + ' connected');
	SOCKET_LIST[socket.id] = socket;
	PLAYER_LIST[socket.id] = new Player(socket.id);
	//PLAYER_LIST[socket.id].position.setVec(100,50);
	//console.log("player position" + PLAYER_LIST[socket.id].position.x + ":" + PLAYER_LIST[socket.id].position.y);
	console.log('currently connections: ' + TOTALSOCKETS);
	
	socket.on('disconnect',function(){
		var idTemp = socket.id
		console.log('socket ' + idTemp + ' disconnected');
		disconnectSocket(socket.id);
		//delete SOCKET_LIST[idTemp];
		//delete PLAYER_LIST[idTemp];
		TOTALSOCKETS--;
		console.log('currently connections: ' + TOTALSOCKETS);
	});
	socket.on('ServerColorChange', function(data){
		PLAYER_LIST[socket.id].ship.changeHue(data);
	});
	socket.on('ServerDebug',function(data){
			console.log(data);
	});
	socket.on('ServerMovementUpdate',function(data){
		if(PLAYER_LIST[socket.id].ship != null){
			PLAYER_LIST[socket.id].ship.setInputAccel(data.x, data.y);
			//console.log(PLAYER_LIST[socket.id].ship.getInputAccel());
		};
	});
	socket.on('ServerFireWeapon', function(data){
		//console.log("Player " + socket.id + " has fired in the direction of (" + data.x + " " + data.y + ").");
		PLAYER_LIST[socket.id].ship.fire(PROJECTILE_LIST, data.x, data.y, PROJNUM++);
		//console.log(PROJECTILE_LIST.length);
	});
	socket.on('ServerLogIn', function(data){
		//mysql lookup userName and check the hashed userPass
		//grab information for ship number from userInfo
		//store player ship information under the PLAYER_LIST
		//send ship information back to client under 'ClientSpawnShip'
		if(data.userName == "test" && data.userPass == "password"){
			PLAYER_LIST[socket.id].ship = new Ship(new Vector2D(50,50));
			//console.log(PLAYER_LIST[socket.id].ship);
			var temp = JSON.stringify({
				position: new Vector2D(50,50),
				entity: null,
				hue: PLAYER_LIST[socket.id].ship.getHue()
			});
			socket.emit('ClientSpawnShip', {
				id: socket.id, 
				ship: temp
				});
		};
	});
});
function checkCollisions(_dt){
	//check collisions between ships
	//create collision objects for each pair of ships.
	for(var i = 0; i < PLAYER_LIST.length; i++) {
		for(var j = i; j < PLAYER_LIST.length - 1; j++){
			if(PLAYER_LIST[i].ship != null && PLAYER_LIST[i+1].ship != null){
				SHIP_COLLISIONS.push(new Collision(PLAYER_LIST[i].ship.entity, PLAYER_LIST[i + 1].ship.entity));
			};
		};
    };
	SHIP_COLLISIONS = SHIP_COLLISIONS.filter(function(value){return value.intersection;});
	//console.log(SHIP_COLLISIONS.length);
	for(var i = 0; i < SHIP_COLLISIONS.length; i++) {
        SHIP_COLLISIONS[i].checkCollisionType();
    };
	SHIP_COLLISIONS = [];
};
setInterval(function(){
	d = new Date();
	var curr = d.getTime();
	var dt = (curr - last)/ 1000.0;
	//console.log(dt);
	last = curr;
	
	checkCollisions(dt);
	
	var pack = [];
	for(var play in PLAYER_LIST){
        var playr = PLAYER_LIST[play];
		if(playr.ship != null){
			playr.updatePosition(dt);
			var myPos = playr.ship.getPosition();
			var myDir = playr.ship.getDirection();
			var myHue = playr.ship.getHue();
			pack.push({
				id: playr.id,
				posX: myPos.x,
				posY: myPos.y,
				dirX: myDir.x,
				dirY: myDir.y,
				hue: myHue
			});
		};
    };
	var proPack = [];
	var delPack = [];
	for(var pro in PROJECTILE_LIST){
		var proj = PROJECTILE_LIST[pro];
		proj.update(dt);
		if(proj.active){
			var myPos = proj.getPosition();
			var myDir = proj.getDirection();
			var myHue = proj.getHue();
			proPack.push({
				id: proj.id,
				posX: myPos.x,
				posY: myPos.y,
				dirX: myDir.x,
				dirY: myDir.y,
				hue: myHue
			});
		}else{
			delPack.push({id:proj.id});
			deleteProjectile(proj.id);
			//console.log("delete projectile " + pro);
			//socket.emit('ClientDeleteProjectile', proj.id);
			//delete PROJECTILE_LIST[pro];
			//console.log(PROJECTILE_LIST.length);
		};
	};
	//console.log("filtering projectiles");
	//PROJECTILE_LIST = PROJECTILE_LIST.filter(function(value){return value.active;});
	//console.log(PROJECTILE_LIST.length);
	for(var sock in SOCKET_LIST){
		var socket = SOCKET_LIST[sock];
		socket.emit('ClientUpdatePosition', pack);
		socket.emit('ClientDeleteProjectiles', delPack);
		socket.emit('ClientUpdateProjectiles',proPack);
	};
}, 1000/60);