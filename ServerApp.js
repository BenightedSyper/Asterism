const Vector2D = require('./server/Vector2D');
const Circle = require('./server/ServerCircle');
const AABB = require('./server/ServerAABB');
const ViewPort = require('./server/ServerViewPort');
const Entity2D = require('./server/ServerEntity2D');
const Ship = require('./server/ServerShip');
const Collision = require('./server/ServerCollision');
const StarParallax = require('./server/ServerStarParallax');
const CelestialObject = require('./server/ServerCelestialObject');
const express = require('express');
const fs = require('fs');
const app = express();
const serv = require('http').Server(app);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));

serv.listen(666);
console.log("The Server has been Started.");

const SECTOR_FILE_PATH = './server/Sectors/';

var SOCKETID = 0;
var TOTALSOCKETS = 0;
var PROJNUM = 0;
var SOCKET_LIST = [];
var PLAYER_LIST = [];
var PROJECTILE_LIST = [];
var SHIP_COLLISIONS = [];
var SECTORS = [];

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
	console.log('currently connections: ' + TOTALSOCKETS);
	
	socket.on('disconnect',function(){
		var idTemp = socket.id
		console.log('socket ' + idTemp + ' disconnected');
		disconnectSocket(socket.id);
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
		};
	});
	socket.on('ServerFireWeapon', function(data){
		PLAYER_LIST[socket.id].ship.fire(PROJECTILE_LIST, data.x, data.y, PROJNUM++);
	});
	socket.on('ServerLogIn', function(data){
		//mysql lookup userName and check the hashed userPass
		//grab information for ship number from userInfo
		//store player ship information under the PLAYER_LIST
		//send ship information back to client under 'ClientSpawnShip'
		if(data.userName == "test" && data.userPass == "password"){
			PLAYER_LIST[socket.id].ship = new Ship(new Vector2D(50,50));
			var temp = JSON.stringify({
				position: new Vector2D(50,50),
				entity: null,
				hue: PLAYER_LIST[socket.id].ship.getHue()
			});
			checkForSector(0,0, socket);
			//var stars = JSON.stringify();
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
	for(var i = 0; i < PLAYER_LIST.length - 1; i++) {
		for(var j = i + 1; j < PLAYER_LIST.length; j++){
			if((PLAYER_LIST[i] != null && PLAYER_LIST[j] != null) && 
			   (PLAYER_LIST[i].ship != null && PLAYER_LIST[j].ship != null)){
				SHIP_COLLISIONS.push(new Collision(PLAYER_LIST[i].ship.entity, PLAYER_LIST[j].ship.entity));
			};
		};
    };
	SHIP_COLLISIONS = SHIP_COLLISIONS.filter(function(value){return value.intersection;});
	for(var i = 0; i < SHIP_COLLISIONS.length; i++) {
        SHIP_COLLISIONS[i].checkCollisionType();
    };
	SHIP_COLLISIONS = [];
};
function generateUnique(_x, _y){
	var phi = _x >= 0 ? _x * 2 : (_x * -2) - 1;
	var psy = _y >= 0 ? _y * 2 : (_y * -2) - 1;
	return 0.5 * (phi + psy) * (phi + psy + 1) + psy;
};
function checkForSector(_x, _y, _sock){
	var currFile = SECTOR_FILE_PATH + generateUnique(_x, _y) +".txt";
	fs.access(currFile, (err) => {
		if(!err){//exists
			fs.readFile(currFile, 'utf8',(err, data) => {
				if(!err){
					SECTORS[generateUnique(_x, _y)] = {stars: StarParallax.fromJSON(JSON.parse(data)), celobj: CelestialObject.fromJSON(JSON.parse(data))};
					_sock.emit('ClientUpdateSectorStars',{ x : _x,
														   y : _y,
														   stars: data });
					//console.log(SECTORS[generateUnique(_x, _y)]);
					_sock.emit('ClientUpdateCelestialObjects', SECTORS[generateUnique(_x, _y)].celobj);
				}else{
					throw err;
				};
			});
		}else{//does not exist
			generateSector(_x, _y);
			fs.writeFile(currFile, JSON.stringify(getSector(_x, _y)), (err) => {
				if(err){
					throw err;
				};
			});
			checkForSector(_x,_y,_sock);
		};
	});
};
function getSector(_x, _y){
	return SECTORS[generateUnique(_x, _y)];
};
function generateSector(_x, _y){
	var uni = generateUnique(_x, _y);
	console.log("generating sector "+uni+" ("+_x+":"+_y+")");
	SECTORS[uni] = {stars: new StarParallax(new Vector2D(_x,_y), uni),
					celobj: [] };
	SECTORS[uni].stars.calculateStars();
	if(_x == 0 && _y == 0){
		SECTORS[uni].celobj.push(new CelestialObject(new Vector2D(200,200)));
		//add objects to build the field
		//new CelestrialObject();
		//array of entities
		//wall wall wall wall wall wall ball
	};
	//console.log(SECTORS[uni]);
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
		};
	};
	for(var sock in SOCKET_LIST){
		var socket = SOCKET_LIST[sock];
		socket.emit('ClientUpdatePosition', pack);
		socket.emit('ClientDeleteProjectiles', delPack);
		socket.emit('ClientUpdateProjectiles',proPack);
	};
}, 1000/60);