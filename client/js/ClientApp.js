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
	socket.on('ClientUpdatePosition', function(data){
		for(var i = 0 ; i < data.length; i++){
			//console.log(data[i].id);
			if(data[i].id == Player.id){
				//my ship
				//console.log(data[i].posX + " " + data[i].posY);
				PlayerShip.setPosition(new Vector2D(data[i].posX, data[i].posY));
				PlayerShip.setDirection(new Vector2D(data[i].dirX, data[i].dirY));
				PlayerShip.setHue(data[i].hue);
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
	socket.on('ClientDeleteProjectiles', function(data){
		for(var i = 0 ; i < data.length; i++){
			delete projectiles[data[i].id];
		};
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
	socket.emit('ServerLogIn',{
		userName:"test",
		userPass:"password",
		userInfo:1
	});
	socket.on('ClientSpawnShip',function(data){
		Player.id = data.id
		PlayerShip = Ship.fromJSON(JSON.parse(data.ship));
		viewPort.follow(PlayerShip.entity,canvasWidth/8,canvasHeight/8);
	});
	socket.on('ClientDisconnect', function(data){
		//console.log(data);
		delete allShips[data];
	});
	
	StarPar = new StarParalax(new Vector2D(0,0), 0);
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

	StarPar.render(ctx, viewPort.getViewPort());
	
    //viewPort.render(ctx);
    //lineSeg.render(ctx, viewPort.getViewPort());
    if(PlayerShip != null){
		PlayerShip.render(ctx, viewPort.getViewPort());
	};
	renderAllShips(ctx);
	

    //wallEnt.render(ctx, viewPort.getViewPort());

    for(var i = enemies.length - 1; i >= 0; i--){
        //enemies[i].render(ctx, viewPort.getViewPort());
    };
    
    for(var i = projectiles.length - 1; i >= 0; i--){
		if(projectiles[i] != null){
			projectiles[i].render(ctx, viewPort.getViewPort());
		};
    };
	if(DEBUGLINE != null){
		DEBUGLINE.render(ctx, viewPort.getViewPort());
	};
};
function renderAllShips(_ctx){
	//console.log(allShips.length);
	allShips.forEach(function(_el, _in, _ar){
		//console.log(_el);
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