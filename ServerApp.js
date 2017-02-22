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
			
			var ShipPos = PLAYER_LIST[socket.id].ship.getPosition();
			PLAYER_LIST[socket.id].sector = getPlayerSector(ShipPos);
			checkForSectorCluster(Math.floor(ShipPos.x / 1000), Math.floor(ShipPos.y / 1000), socket);
			//checkForSectorCluster(Math.floor(ShipPos.x / 1000), Math.floor(ShipPos.y / 1000));
			//emitSectorCluster(Math.floor(ShipPos.x / 1000), Math.floor(ShipPos.y / 1000), socket);
			//emitSector(Math.floor(ShipPos.x / 1000), Math.floor(ShipPos.y / 1000), socket);
			socket.emit('ClientSpawnShip', {
				id: socket.id, 
				sector : PLAYER_LIST[socket.id].sector,
				ship: temp
				});
		};
	});
});
function getPlayerSector(_vec){
	return generateUnique(Math.floor(_vec.x / 1000), Math.floor(_vec.y / 1000));
};
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
function updateSectors(_dt){
	for(var i = 0; i < SECTORS.length; i++){
		//update all celestial objects in the sector
		//console.log(SECTORS[i]);
		if(SECTORS[i] != null){
			for(var j = 0; j < SECTORS[i].celobj.length; j++){	
				SECTORS[i].celobj[j].update(_dt);
			};
		};
	};
};
function generateUnique(_x, _y){
	var phi = _x >= 0 ? _x * 2 : (_x * -2) - 1;
	var psy = _y >= 0 ? _y * 2 : (_y * -2) - 1;
	return parseInt( 0.5 * (phi + psy) * (phi + psy + 1) + psy);
};
function checkForSectorCluster(_x, _y, _s){
	console.log("checking for sector cluster: (" + _x + "," + _y +")");
	//check for sector and all sectors around 
	checkForSector(_x + 0, _y + 0, _s); //current Sector
	checkForSector(_x + 0, _y + 1, _s); //North sector
	checkForSector(_x + 1, _y + 1, _s); //North East Sector
	checkForSector(_x + 1, _y + 0, _s); //East Sector
	checkForSector(_x + 1, _y - 1, _s); //South East Sector
	checkForSector(_x + 0, _y - 1, _s); //South Sector
	checkForSector(_x - 1, _y - 1, _s); //South West Sector
	checkForSector(_x - 1, _y + 0, _s); //West Sector
	checkForSector(_x - 1, _y + 1, _s); //North West Sector
};
function checkSector(_x, _y){
	if(SECTORS[generateUnique(_x, _y)] != null){
		return;
	}else{
		var currFile = SECTOR_FILE_PATH + generateUnique(_x, _y) +".txt";
		fs.access(currFile, (err) => {
			if(!err){
				fs.readFile(currFile, 'utf8',(err, data) => {
					if(!err){
						try{
						SECTORS[generateUnique(_x, _y)] = {
							StarPar: StarParallax.fromJSON(JSON.parse(data)), 
							celobj: CelestialObject.fromJSON(JSON.parse(data))
							};
						}catch (x){
							console.log(x);
							throw x;
						}finally{
							console.log("good test");
						};
					}else{
						console.log("there was an error reading " + currFile);
						throw err;
					};
				});
			}else{
				generateSector(_x, _y);
				fs.writeFile(currFile, JSON.stringify(getSector(_x, _y)), (err) => {
					if(err){
						console.log("there was an error writing sector " + currFile);
						throw err;
					};
				});
			};
		});
	};
	
};
function emitSectorCluster(_x, _y, _s){
	//console.log("emitting sector cluster: (" + _x + "," + _y +") to socket " _s.id);
	//emit sector and all sectors around 
	emitSector(_x + 0, _y + 0, _s); //current Sector
	emitSector(_x + 0, _y + 1, _s); //North sector
	emitSector(_x + 1, _y + 1, _s); //North East Sector
	emitSector(_x + 1, _y + 0, _s); //East Sector
	emitSector(_x + 1, _y - 1, _s); //South East Sector
	emitSector(_x + 0, _y - 1, _s); //South Sector
	emitSector(_x - 1, _y - 1, _s); //South West Sector
	emitSector(_x - 1, _y + 0, _s); //West Sector
	emitSector(_x - 1, _y + 1, _s); //North West Sector
};
function emitSector(_x, _y, _sock){
	if(SECTORS[generateUnique(_x, _y)] === undefined || SECTORS[generateUnique(_x, _y)] == null){
		console.log("Sector " + generateUnique(_x, _y) + " is undefined. " + SECTORS[generateUnique(_x, _y)]);
		return;
	}
	_sock.emit('ClientUpdateSectorStars',{ 
		uni : generateUnique(_x, _y),
		x : _x,
		y : _y,
		StarPar: JSON.stringify(SECTORS[generateUnique(_x, _y)].StarPar) 
		});
	//add to array to send as packet
	_sock.emit('ClientUpdateCelestialObjects', {
		uni : generateUnique(_x, _y),
		x : _x,
		y : _y,
		sector : SECTORS[generateUnique(_x, _y)].celobj
		});//TODO needs to send with JSON
};
function checkForSector(_x, _y, _sock){ // need to remove the socket emits in this function
	var currFile = SECTOR_FILE_PATH + generateUnique(_x, _y) +".txt";
	//console.log(currFile);
	//console.log(SECTORS);
	fs.access(currFile, (err) => {
		//console.log(SECTORS);
		if(!err){//exists
			fs.readFile(currFile, 'utf8',(err, data) => {
				//console.log(SECTORS);
				//console.log(data);
				if(!err){
					try{
					SECTORS[generateUnique(_x, _y)] = {StarPar: StarParallax.fromJSON(JSON.parse(data)), celobj: CelestialObject.fromJSON(JSON.parse(data))};
					}catch(error){
						console.log(error);
						throw error;
					}finally{
						_sock.emit('ClientUpdateSectorStars',{ 
							uni : generateUnique(_x, _y),
							x : _x,
							y : _y,
							StarPar: data 
						}); //TODO needs to send with JSON
						//console.log(SECTORS[generateUnique(_x, _y)]);
						//add to array to send as packet
						_sock.emit('ClientUpdateCelestialObjects', {
							uni : generateUnique(_x, _y),
							x : _x,
							y : _y,
							sector : SECTORS[generateUnique(_x, _y)].celobj
						});//TODO needs to send with JSON
					}
				}else{
					console.log("there was an error reading " + currFile);
					throw err;
				};
			});
			//console.log(SECTORS);
		}else{//does not exist
			generateSector(_x, _y);
			fs.writeFile(currFile, JSON.stringify(getSector(_x, _y)), (err) => {
				if(err){
					console.log("there was an error writing sector " + currFile);
					throw err;
				};
			});
			checkForSector(_x,_y,_sock);
		};
	});
};
function getSector(_x, _y){
	//if(SECTORS[generateUnique(_x, _y)] != null){
		//console.log(SECTORS[generateUnique(_x, _y)]);
		return SECTORS[generateUnique(_x, _y)];
	//}
	//return null;
};
function generateSector(_x, _y){ //probably should return the generated sector.
	var uni = generateUnique(_x, _y);
	console.log("generating sector " +uni+ ": ("+_x+","+_y+")");
	SECTORS[uni] = {StarPar: new StarParallax(new Vector2D(_x,_y), uni),
					celobj: [],
					x: _x,
					y: _y,
					hasChanged: true };
	SECTORS[uni].StarPar.calculateStars();
	if(_x == 0 && _y == 0){
		SECTORS[uni].celobj.push(new CelestialObject(new Vector2D(200,200)));
		SECTORS[uni].celobj[0].setOrbit(100,10000,0);
	};
	//console.log(SECTORS[uni]);
};
function getLocalSectors(_secX, _secY){
	var secs = {};
	try{
	secs.SW = getSector(_secX - 1, _secY - 1);
	secs.W  = getSector(_secX - 1, _secY + 0);
	secs.NW = getSector(_secX - 1, _secY + 1);
	secs.S  = getSector(_secX + 0, _secY - 1);
	secs.Curr = getSector(_secX + 0, _secY + 0);
	secs.N  = getSector(_secX + 0, _secY + 1);
	secs.SE = getSector(_secX + 1, _secY - 1);
	secs.E  = getSector(_secX + 1, _secY + 0);
	secs.NE = getSector(_secX + 1, _secY + 1);
	
	}catch(error){
		console.log(error);
		throw error;
	}finally{
		return JSON.stringify(secs);
	}
	console.log("shouldnt get here...");
	return JSON.stringify(secs);
};
setInterval(function(){
	d = new Date();
	var curr = d.getTime(); 
	var dt = (curr - last)/ 1000.0;
	//console.log(dt);
	last = curr;

	checkCollisions(dt);
	//update Sectors, set flag false. set ticker to only update every other frame
	updateSectors(dt);
	var pack = [];
	var locSectors = null;
	var secChange = false;
	for(var play in PLAYER_LIST){
        var playr = PLAYER_LIST[play];
		if(playr.ship != null){
			playr.updatePosition(dt);
			//check player location
			var myPos = playr.ship.getPosition();
			var secX = Math.floor(myPos.x / 1000); //sector width
			var secY = Math.floor(myPos.y / 1000); //sector height
			var mySector = generateUnique(secX, secY);
			if(mySector != playr.sector){
				secChange = true;
				checkForSectorCluster(secX, secY, SOCKET_LIST[playr.id]);
				locSectors = getLocalSectors(secX, secY);
				playr.sector = mySector;
			}
			
			var myDir = playr.ship.getDirection();
			var myHue = playr.ship.getHue();
			pack.push({
				id : playr.id,
				sector : mySector,
				sectorChange : secChange,
				localSectors : locSectors,
				posX : myPos.x,
				posY : myPos.y,
				dirX : myDir.x,
				dirY : myDir.y,
				hue : myHue
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
		//find the sector current ship is in, send the surrounding sector information
		var socket = SOCKET_LIST[sock];
		//socket.emit('ClientUpdateSectors', locSectors);
		socket.emit('ClientUpdatePosition', pack);
		socket.emit('ClientDeleteProjectiles', delPack);
		socket.emit('ClientUpdateProjectiles', proPack);
	};
	
}, 1000/60);