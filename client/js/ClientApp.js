var lastTime;
var canvas;
var ctx;
var Player = {};
var PlayerShip = null;
var projectiles = [];
var enemies = [];
var wallEnt;
var viewPort;

var lineSeg;
var polygon;

var canvasWidth;
var canvasHeight;

var mousePosition = new Vector2D(0,0);

var lastShot = 0;
var shotRate = 150;

var allShips = [];
var enemyCollisions = [];
var projectileCollisions = [];
var StarPar;
var SECTORS = [];
var CelesObjs = [];

var DEBUGLINE;

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
function sectorFromSector(_sec){
	var sector = {
		StarPar : _sec.StarPar,
		CelesObjs : _sec.celobj,
		x : _sec.x,
		y : _sec.y
		};
	return sector;
};
function Page_OnLoad(){
    canvas = document.createElement("canvas");
	canvas.position = 'absolute';
    ctx = canvas.getContext("2d");
    canvasWidth = window.innerWidth;
    canvas.width = canvasWidth;
    canvasHeight = window.innerHeight*0.95;
    canvas.height = canvasHeight;
    canvas.addEventListener('mousemove', mouseMoveEvent, false);
    canvas.addEventListener('mousedown', mouseDownEvent, true);
    viewPort = new ViewPort(new Vector2D(0,0), new Vector2D(canvasWidth, canvasHeight));
	
    document.body.appendChild(canvas);

	socket = io();
	socket.emit('ServerLogIn',{
		userName:"test",
		userPass:"password",
		userInfo:1
	});
	socket.on('ClientSpawnShip',function(data){
		Player.id = data.id
		Player.localSectors = {N: {StarPar:null, celobj:null}, 
							   NE:{StarPar:null, celobj:null}, 
							   E: {StarPar:null, celobj:null}, 
							   SE:{StarPar:null, celobj:null}, 
							   S: {StarPar:null, celobj:null}, 
							   SW:{StarPar:null, celobj:null}, 
							   W: {StarPar:null, celobj:null}, 
							   NW:{StarPar:null, celobj:null}, 
							   Curr:{StarPar:null, celobj:null} 
							   };
		PlayerShip = Ship.fromJSON(JSON.parse(data.ship));
		viewPort.follow(PlayerShip.entity,canvasWidth/8,canvasHeight/8);
	});
	socket.on('ClientUpdatePosition', function(data){
		for(var i = 0 ; i < data.length; i++){
			
			if(data[i].id == Player.id){
				//my ship
				//console.log(data[i].posX + " " + data[i].posY);
				PlayerShip.setPosition(new Vector2D(data[i].posX, data[i].posY));
				PlayerShip.setDirection(new Vector2D(data[i].dirX, data[i].dirY));
				PlayerShip.setHue(data[i].hue);
				Player.mySector = data[i].sector;
				if(data[i].sectorChange){
					//console.log(data[i].sectorChange);
					//console.log(data[i].localSectors);
					var temp = JSON.parse(data[i].localSectors);
					//console.log(temp);
					try{
						Player.localSectors.NW.StarPar = StarParallax.fromStarParallax(temp.NW.StarPar);//make new starpars from this
						Player.localSectors.N.StarPar  = StarParallax.fromStarParallax(temp.N.StarPar);
						Player.localSectors.NE.StarPar = StarParallax.fromStarParallax(temp.NE.StarPar);
						Player.localSectors.E.StarPar  = StarParallax.fromStarParallax(temp.E.StarPar);
						Player.localSectors.SE.StarPar = StarParallax.fromStarParallax(temp.SE.StarPar);
						Player.localSectors.S.StarPar  = StarParallax.fromStarParallax(temp.S.StarPar);
						Player.localSectors.SW.StarPar = StarParallax.fromStarParallax(temp.SW.StarPar);
						Player.localSectors.W.StarPar  = StarParallax.fromStarParallax(temp.W.StarPar);
						Player.localSectors.Curr.StarPar = StarParallax.fromStarParallax(temp.Curr.StarPar);
					}catch(error){
						console.log(temp);
						console.log(error);
						//retry to grab sectors that failed
					};
				};
				
				//Player.near = data[i].near;
			}else{
				//other ships
				if(allShips[data[i].id] == null){
					//console.log("new ship");
					allShips[data[i].id] = new Ship(new Vector2D(data[i].posX, data[i].posY));
					allShips[data[i].id].setHue(data[i].hue);
					//console.log(allShips[data.id]);
				}else{
					allShips[data[i].id].setPosition(new Vector2D(data[i].posX, data[i].posY));
					allShips[data[i].id].setDirection(new Vector2D(data[i].dirX, data[i].dirY));
					allShips[data[i].id].setHue(data[i].hue);
				};
				
			};
			//console.log(data[i].pos.x);
		};
	});
	socket.on('ClientUpdateSectors', function(data){
		//console.log(data);
		Player.localSectors = data;
	});
	socket.on('ClientDeleteProjectiles', function(data){
		for(var i = 0 ; i < data.length; i++){
			delete projectiles[data[i].id];
		};
	});
	socket.on('ClientUpdateSectorStars', function(data){
		if(SECTORS[data.uni] != null){
			SECTORS[data.uni].StarPar = StarParallax.fromJSON(JSON.parse(data.StarPar));
		}else{
			SECTORS[data.uni] = {
			StarPar : StarParallax.fromJSON(JSON.parse(data.StarPar)),
			CelesObjs : null,
			x : data.x,
			y : data.y
			};
		}
	});
	socket.on('ClientUpdateCelestialObjects', function(data){//TODO currently doesnt use JSON
		if(SECTORS[data.uni] != null){
			SECTORS[data.uni].CelesObjs = CelestialObject.fromJSON(/*JSON.parse(*/data.sector/*)*/);
		}else{
			SECTORS[data.uni] = {
			StarPar : null,
			CelesObjs : CelestialObject.fromJSON(/*JSON.parse(*/data.sector/*)*/),
			x : data.x,
			y : data.y
			};
		}
	});
	socket.on('ClientUpdateProjectiles', function(data){
		for(var i = 0 ; i < data.length; i++){
			if(projectiles[data[i].id] == null){
				//console.log("client added projectile " + data[i].id);
				projectiles[data[i].id] = new Projectile(
				new Vector2D(data[i].posX, data[i].posY),
				new Vector2D(data[i].dirX, data[i].dirY),
				[new LineSegment(new Vector2D(0,5), new Vector2D(0,-5), data[i].hue)],
				data[i].id
				);
				//console.log(projectiles[data[i].id]);
			}else{
				if(projectiles[data[i].id].active){
					projectiles[data[i].id].setPosition(new Vector2D(data[i].posX, data[i].posY));
					projectiles[data[i].id].setDirection(new Vector2D(data[i].dirX, data[i].dirY));
					projectiles[data[i].id].setHue(data[i].hue);
				};
			};
			
		};
		//console.log(projectiles);
	});
	socket.on('ClientDebug',function(data){
			console.log(data);
	});
	
	
	socket.on('ClientDisconnect', function(data){
		//console.log(data);
		delete allShips[data];
	});
	
	//StarPar = new StarParallax(new Vector2D(0,0), 0);
    //PlayerShip = new Ship(new Vector2D(canvas.width/2, canvas.height/2));
    //PlayerShip.entity.collisionType = 1;
    //PlayerShip.entity.calcAABB(); 

    //var tempShip = new Ship(new Vector2D(canvas.width/4, canvas.height/4) );
    //tempShip.entity.collisionType = 1;
    //tempShip.entity.calcAABB();

    //enemies.push(tempShip);
    //viewPort.follow(PlayerShip,canvasWidth/8,canvasHeight/8);

    //polygon = new Entity2D(2);

    //wallEnt = new Entity2D(2);
    //wallEnt.collisionType = 2;
    //wallEnt.position = new Vector2D(canvas.width/3, canvas.height/3);
    //wallEnt.points = [new Vector2D(0,30), new Vector2D(0,-30)];
    //wallEnt.segments = [new LineSegment(new Vector2D(0,30), new Vector2D(0,-30), Math.floor((Math.random() * 360) + 1) )];
    //wallEnt.direction = new Vector2D(-1,1);
    //wallEnt.calcAABB();
    //wallEnt.mass = 1;

    lastTime = Date.now();
    lastShot = lastTime;
    main();
}

function main() {
    var now = Date.now();
    var dt = (now - lastTime) / 1000.0;
    
    update(dt);
    render();
    
    lastTime = now;
    requestAnimFrame(main);
};

function update(dt){
    handleInput(dt);
    checkCollisions(dt);
    updateEntities(dt);
	viewPort.update(dt);
};

function render(){
    //clear screen
    ctx.save();
    ctx.fillStyle ="rgba(0,0,0,1)";
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.restore();

	
	if(Player.mySector != null){
		//console.log(PlayerShip.getPosition());
		ctx.font="30px Arial";
		ctx.fillText(PlayerShip.getPosition(),10,50);
		SECTORS[Player.mySector].StarPar.render(ctx, viewPort.getViewPort());//needs to be replaced with localSectors.Curr
		for(var i = 0; i < SECTORS[Player.mySector].CelesObjs.length; i++){
			SECTORS[Player.mySector].CelesObjs[i].render(ctx, viewPort.getViewPort());
		}
	};
	
	if(Player.localSectors != null){
		//console.log(Player.localSectors);
		if(Player.localSectors.N != null){
			if(Player.localSectors.NW.StarPar != null){
				//console.log(Player.localSectors.NW);
				Player.localSectors.NW.StarPar.render(ctx, viewPort.getViewPort());
			};
			if(Player.localSectors.N.StarPar != null){
				Player.localSectors.N.StarPar.render(ctx, viewPort.getViewPort());
			};
			if(Player.localSectors.NE.StarPar != null){
				Player.localSectors.NE.StarPar.render(ctx, viewPort.getViewPort());
			};
			if(Player.localSectors.E.StarPar != null){
				Player.localSectors.E.StarPar.render(ctx, viewPort.getViewPort());
			};
			if(Player.localSectors.SE.StarPar != null){
				Player.localSectors.SE.StarPar.render(ctx, viewPort.getViewPort());
			};
			if(Player.localSectors.S.StarPar != null){
				Player.localSectors.S.StarPar.render(ctx, viewPort.getViewPort());
			};
			if(Player.localSectors.SW.StarPar != null){
				Player.localSectors.SW.StarPar.render(ctx, viewPort.getViewPort());
			};
			if(Player.localSectors.W.StarPar != null){
				Player.localSectors.W.StarPar.render(ctx, viewPort.getViewPort());
			};
		};
		
		//console.log(SECTORS);
		//SECTORS[Player.mySector].StarPar.render(ctx, viewPort.getViewPort());
		//for(var i = 0; i < SECTORS[Player.mySector].CelesObjs.length; i++){
		//	SECTORS[Player.mySector].CelesObjs[i].render(ctx, viewPort.getViewPort());
		//}
	};
	
	
	/*if(StarPar != null){//needs filtering by viewport
		StarPar.render(ctx, viewPort.getViewPort());
	};*/
	
	/*for(var i = 0; i < CelesObjs.length; i++){
		CelesObjs[i].render(ctx, viewPort.getViewPort());
	};*/
	
	for(var i = projectiles.length - 1; i >= 0; i--){
		if(projectiles[i] != null){
			projectiles[i].render(ctx, viewPort.getViewPort());
		};
    };
	
    if(PlayerShip != null){
		PlayerShip.render(ctx, viewPort.getViewPort());
	};
	renderAllShips(ctx);

    //for(var i = enemies.length - 1; i >= 0; i--){
        //enemies[i].render(ctx, viewPort.getViewPort());
    //};
    
	
	
	if(DEBUGLINE != null){
		DEBUGLINE.render(ctx, viewPort.getViewPort());
	};
};
function renderAllShips(_ctx){
	allShips.forEach(function(_el, _in, _ar){
		_el.render(_ctx, viewPort.getViewPort());
	});
};
function handleInput(_dt){
	var PlayerAccel = new Vector2D(0,0);
	if(input.isDown('s') || input.isDown('w')){
        if(input.isDown('s')){
            PlayerAccel.y = 1;
        }else{
            PlayerAccel.y = -1;
        };
    };
    if(input.isUp('w') && input.isUp('s')){
    	PlayerAccel.y = 0;
    };
    if(input.isDown('a') || input.isDown('d')){
        if(input.isDown('a')){
            PlayerAccel.x = -1;
        }else{
            PlayerAccel.x = 1;
        };
    };
    if(input.isUp('d') && input.isUp('a')){
        PlayerAccel.x = 0;
    };
	if(input.isDown('o')){
		socket.emit('ServerColorChange',  1);
	};
	if(input.isDown('p')){
		socket.emit('ServerColorChange', -1);
	};
	if(PlayerShip != null){
		PlayerShip.setInputAccel(PlayerAccel.x, PlayerAccel.y);
		socket.emit('ServerMovementUpdate',PlayerAccel);
	};
	
};
function mouseMoveEvent(_evt){
    mousePosition.x = _evt.clientX;
    mousePosition.y = _evt.clientY;
};
function mouseDownEvent(_evt){
    if(_evt.button == 0){//left mouse = 0, middle = 1, right = 2;
		//emit to server with direction of fire
		// var tarVec = PlayerShip.getPosition();
		// tarVec = new Vector2D(tarVec.x, tarVec.y)
		// tarVec.addEquals(viewPort.getPosition());
		// tarVec = mousePosition.subtract(tarVec);
		tarVec = new LineSegment(PlayerShip.getPosition(),mousePosition.add(viewPort.getPosition()), 0);
		socket.emit('ServerFireWeapon', { x: tarVec.vector.x, y: tarVec.vector.y});
		//DEBUGLINE = new LineSegment(PlayerShip.getPosition(),mousePosition.add(viewPort.getPosition()), 0);
		//PlayerShip.fire(projectiles, viewPort.getViewPort());
        //lineSeg.hue = Math.floor((Math.random() * 360) + 1);
    };
    //_evt.pageX
    //_evt.pageY
};
function updateEntities(_dt){
    if(PlayerShip != null){
		//PlayerShip.update(_dt);
	};

    //wallEnt.update(_dt);
    /*
	for(var i = enemies.length - 1; i >= 0; i--) {
        enemies[i].update(_dt);
    };
	*/
	/*
	projectiles = projectiles.filter(function(value){return value.active;});
    for(var i = projectiles.length - 1; i >= 0; i--) {
		projectiles[i].update(_dt);
    };
    projectiles = projectiles.filter(function(value){return value.active;});
	*/
};
function checkCollisions(_dt){
    //check collisions between player ship and all enemies
    /*
	for(var i = enemies.length - 1; i >= 0; i--) {
        enemyCollisions.push(new Collision(PlayerShip.entity, enemies[i].entity));
    };
    //enemyCollisions.push(new Collision(PlayerShip.entity, wallEnt));
	enemyCollisions = enemyCollisions.filter(function(value){return value.intersection;});
    for(var i = enemyCollisions.length - 1; i >= 0; i--) {
        enemyCollisions[i].checkCollisionType();
    };
    for(var i = projectiles.length - 1; i >= 0; i--) {
        for (var j = enemies.length - 1; j >= 0; j--) {
           projectileCollisions.push(new Collision(projectiles[i].entity, enemies[j].entity));
        };
        projectileCollisions.push(new Collision(projectiles[i].entity, wallEnt));
    };
    projectileCollisions = projectileCollisions.filter(function(value){return value.intersection;});
    for (var i = projectileCollisions.length - 1; i >= 0; i--) {
        projectileCollisions[i].checkCollisionType();
    };
	*/
};