//Initialize node.js objects
var express = require('express');
var app  = express();
var http = require('http').Server(app);
var io   = require('socket.io')(http); //for interating with users
var util = require("util");			     	// Utility resources (logging, object inspection, etc)
var p2   = require('p2');              //the physics engine
var world;
//
var aiCounter= 10, nBots = 0, maxBots = 50;
var players = {};
var sockets = {};
var bullets = {};
var playerSeed = 0;
var bulletSeed = 0;
var nPlayers = 0;
var shotDelay =  1000;
var worldHalfSize = 2500;
var shootSpeed = 80;
var maxMoveStrength = 8;
var startingMoveStrength = 2;
var bulletLife = 8000; //in milliseconds
var PLAYER = Math.pow(2,1);
var BULLET = Math.pow(2,2);
var GROUND = Math.pow(2,3);

function GetCollisionGroup(type){
  switch(type){
    case "bullet":
      return BULLET;
      break;
    case "player":
      return PLAYER;
      break;
    default:
    case "ground":
      return GROUND;
      break;
  }
}
function GetCollisionMask(type){
  switch(type){
    case "bullet":
      return PLAYER | GROUND | BULLET ;
      break;

    case "player":
      return PLAYER | GROUND | BULLET;
      break;

    default:
    case "ground":
      return PLAYER | GROUND | BULLET;
      break;
  }
}
function GameObject(posX,posY,mass, shape, shapeInfo,displayInfo,playerID,type){
  //When updating clients about GameObjects the creation of this Object
  // Full infomation will be sent
  this.fullInfomation = {
    x: posX,
    y: posY,
    Mass: mass,
    Shape: shape,
    ShapeInfo: shapeInfo,
    DisplayInfo: displayInfo,
    id: playerID,
    PlayerID: playerID,
    LastShot: 0,
    Type: type,
    score: 0
  }
  // When sending a
  this.position = {
    x: posX,
    y: posY
  }
  this.body = new p2.Body({
      mass: mass,
      position: [posX, posY],
      id: playerID
  });

  this.target = {
    x: 1,
    y: 1
  }
  this.setPlayerID = function(id){
    this.fullInfomation.PlayerID = id;
  }
  this.moveStrength = 4;
  this.update = function(){
    var len = Math.sqrt(this.target.x*this.target.x+this.target.y*this.target.y);

    var moveLength = ( len == 0 ? 0.0 : this.moveStrength/len);
    var dir = [moveLength*this.target.x,moveLength*this.target.y];

    this.body.applyImpulse(dir);
  }
  if(type === "bullet")
    this.fullInfomation.startTime = new Date().getTime();

  this.CreateShape = function(shape,shapeInfo){
    switch(shape){
      default:
      case "circle":
         var shape = new p2.Circle({ radius: shapeInfo  });
         shape.collisionGroup = GetCollisionGroup(type);
         shape.collisionMask = GetCollisionMask(type);
         if(type === "bullet"){
           shape.sensor = true;
         }
         this.body.addShape(shape);
         break;
     case "plane":
        var shape = new p2.Plane();
        this.body.addShape(shape);
        break;
    }
  }
  this.CreateShape(shape,shapeInfo);
};

function AIObject(posX,posY,mass, shape, shapeInfo,displayInfo,playerID,type,playerList){

  this.fullInfomation = {
    x: posX,
    y: posY,
    Mass: mass,
    Shape: shape,
    ShapeInfo: shapeInfo,
    DisplayInfo: displayInfo,
    id: playerID,
    PlayerID: playerID,
    LastShot: 0,
    Type: type,
    score: 0
  }
  // When sending a
  this.position = {
    x: posX,
    y: posY
  }
  this.isBot = true;
  this.body = new p2.Body({
      mass: mass,
      position: [posX, posY],
      id: playerID
  });

  this.target = {
    x: 1,
    y: 1
  }
  this.setPlayerID = function(id){
    this.fullInfomation.PlayerID = id;
  }
  this.moveStrength = 3;

  if(type === "bullet")
    this.fullInfomation.startTime = new Date().getTime();

  this.CreateShape = function(shape,shapeInfo){
    switch(shape){
      default:
      case "circle":
         var shape = new p2.Circle({ radius: shapeInfo  });
         shape.collisionGroup = GetCollisionGroup(type);
         shape.collisionMask = GetCollisionMask(type);
         if(type === "bullet"){
           shape.sensor = true;
         }
         this.body.addShape(shape);
         break;
     case "plane":
        var shape = new p2.Plane();
        this.body.addShape(shape);
        break;
    }
  }
  this.CreateShape(shape,shapeInfo);
  this.playerList = playerList;
  this.targetId = -1;
  this.MoveTarget  = {x:  getRandomArbitrary(-worldHalfSize,worldHalfSize),
                     y: getRandomArbitrary(-worldHalfSize,worldHalfSize)};
  this.shootTarget = {x:  getRandomArbitrary(-worldHalfSize,worldHalfSize),
                      y: getRandomArbitrary(-worldHalfSize,worldHalfSize)};
  this.startTime = new Date().getTime();
  this.lastMovedTime = new Date().getTime();

  this.AquireTarget = function(){

    keyList = getSortedKeysByScore(players);
    if(keyList.length < 1) return;

    var chosenKey = Math.floor((Math.random() * (keyList.length-1) ));
    this.targetId = keyList[chosenKey];
    if(this.targetId ==this.fullInfomation.PlayerID) return;

    if(this.playerList[this.targetId]){

      this.lastMovedTime = new Date().getTime();
      this.target = {
        x: this.playerList[this.targetId].position.x,
        y: this.playerList[this.targetId].position.y
      }
      this.shootTarget = this.target;
      this.MoveTarget  = {x:  getRandomArbitrary(-worldHalfSize,worldHalfSize),
                         y: getRandomArbitrary(-worldHalfSize,worldHalfSize)};

    }
  }

  this.update = function(){
    if(!this.playerList[this.targetId] || new Date().getTime() -   this.lastMovedTime > 10000){
      this.AquireTarget();
    }else{
      var len = Math.sqrt(this.target.x*this.target.x+this.target.y*this.target.y);

      var moveLength = ( len == 0 ? 0.0 : this.moveStrength/len);
      var dir = [moveLength*this.target.x,moveLength*this.target.y];

      this.body.applyImpulse(dir);
      var time = new Date().getTime();
      if(time - this.fullInfomation.LastShot > shotDelay && time - this.startTime > 2*shotDelay){
          var tempTarg = this.shootTarget;
          this.target =  {
            x:this.shootTarget.x + getRandomArbitrary(-100,100),
            y:this.shootTarget.y + getRandomArbitrary(-100,100)
          }
        //  shootBullet({			id: this.fullInfomation.PlayerID});

          this.target = this.MoveTarget;
      }
    }
  }

  this.AquireTarget();

};


init = function(){
   //Add the public directory to the request path for users
   app.use(express.static(__dirname + '/public'));

  //Display the webpage on connection
  app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/index.html');
  });


  initPhysics();
  for(var i = 0; i < maxBots; i++)
    initBots();

  //Set Event handlers
  io.on('connection', onSocketConnection);

  //Listen
  http.listen(process.env.PORT ||3000, function(){
    console.log('listening on *:3000');
  });


}

onSocketConnection = function(socket){
	util.log("[INFO] New player has connected...");


  socket.on("start play", onStartPlay);

  // Listen for client disconnected
	socket.on("disconnect", onClientDisconnect);

	// Listen for new player message
	socket.on("new player", onNewPlayer);

	// Listen for move player message
	socket.on("move player", onMovePlayer);

  // Listen for shoot message
	socket.on("shoot", shootBullet);
}

//
onStartPlay = function(data){
  util.log("[INFO] Player " + data.name + " has connected.");
  initPlayer(this, data.name);
  //update all players about the new player
  nPlayers++;
  if(players[aiCounter-1]){
    world.removeBody(players[aiCounter-1].body);
    nBots--;
    initBots();
    delete players[aiCounter-1];
    io.emit("player disconnected", {id: aiCounter-1});
  }
  this.broadcast.emit("new player", players[ this.id ].fullInfomation);
  //also update the leaderboard incase the new player automakes it onto the leaderboard
  io.emit("scoreboard", getLeaderBoard());

}
// Socket client has disconnected
onClientDisconnect = function(socket) {
	if(players[this.id]){
    world.removeBody(players[this.id].body);
		delete players[this.id];
  }
  nPlayers--;
  initBots();
  io.emit("player disconnected", {id: this.id});
  io.emit("scoreboard", getLeaderBoard());
};
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

initPlayer = function(socket, playerName){
  var newPlayer = new GameObject(getRandomArbitrary(-worldHalfSize,worldHalfSize),getRandomArbitrary(-worldHalfSize,worldHalfSize),30,"circle",75,
                              {color: getRandomColor(),
                               name: playerName},
                               socket.id, "player");
  world.addBody(newPlayer.body);
  players[socket.id]  = newPlayer;

  //now tell the client about the ID + other players
  socket.emit("set id", {id: socket.id, DisplayInfo: newPlayer.fullInfomation.DisplayInfo});

  for(var key in players){
    if(key != socket.id){
      socket.emit("new player", players[key].fullInfomation);
    }
  }
}
// New player has joined
onNewPlayer = function(data) {

};

// Player has moved
onMovePlayer = function(data){
  if(players[data.id]){
    players[data.id].target.x = data.x;
    players[data.id].target.y = data.y;
  }
};
initBots = function(){
  if(nBots + nPlayers >= maxBots) return;
  var newBot = new AIObject(getRandomArbitrary(-worldHalfSize,worldHalfSize),getRandomArbitrary(-worldHalfSize,worldHalfSize),30,"circle",75,
                              {color: getRandomColor(),
                               name: "Bot"},
                               aiCounter, "player", players);
  world.addBody(newBot.body);
  players[aiCounter]  = newBot;
  //now tell the client about the ID + other players;
  io.emit("new player", players[aiCounter].fullInfomation);

  aiCounter++;nBots++;
}
initPhysics = function(){
  // Create a physics world, where bodies and constraints live
  world = new p2.World({
    gravity:[0,0]
  }); //2500
  // Create an infinite ground plane.
  var groundBody = new p2.Body({
      mass: 0 ,// Setting mass to 0 makes the body static
      position: [0, worldHalfSize],
      angle: Math.PI
  });

  var ceillingBody = new p2.Body({
      mass: 0 ,// Setting mass to 0 makes the body static
      position: [0, -worldHalfSize],
  });

  var leftWall = new p2.Body({
      mass: 0 ,// Setting mass to 0 makes the body static
      position: [worldHalfSize, 0],
      angle: Math.PI/2
  });
  var rightWall = new p2.Body({
      mass: 0 ,// Setting mass to 0 makes the body static
      position: [-worldHalfSize, 0],
      angle: -Math.PI/2
  });
  var groundShape = new p2.Plane();
  groundShape.collisionGroup = GetCollisionGroup("ground");
  groundShape.collisionMask  = GetCollisionMask("ground");
  var leftWallShape = new p2.Plane();
  leftWallShape.collisionGroup = GetCollisionGroup("ground");
  leftWallShape.collisionMask  = GetCollisionMask("ground");
  var rightWallShape = new p2.Plane();

  rightWallShape.collisionGroup = GetCollisionGroup("ground");
  rightWallShape.collisionMask  = GetCollisionMask("ground");
  var ceillingShape = new p2.Plane();
  ceillingShape.collisionGroup = GetCollisionGroup("ground");
  ceillingShape.collisionMask  = GetCollisionMask("ground");

  groundBody.addShape(groundShape);
  leftWall.addShape(leftWallShape);
  rightWall.addShape(rightWallShape);
  ceillingBody.addShape(ceillingShape);

  world.addBody(groundBody);
  world.addBody(leftWall);
  world.addBody(rightWall);
  world.addBody(ceillingBody);
  // To get the trajectories of the bodies,
  // we must step the world forward in time.
  // This is done using a fixed time step size.
  timeStep = 1 / 60; // seconds

  //create collision handlers
  world.on("beginContact",function(evt){
    var bodyA = evt.bodyA,
        bodyB = evt.bodyB;

    //Check to see if a player has collided with something
    if( (bodyA.shapes[0].collisionGroup == PLAYER || bodyB.shapes[0].collisionGroup == PLAYER ) ){

      var playerBody = bodyA.shapes[0].collisionGroup == PLAYER ? bodyA : bodyB,
          otherBody = bodyB==playerBody ? bodyA : bodyB;

      if( otherBody.shapes[0].collisionGroup == BULLET )
        HandlePlayerBulletCollison(playerBody,otherBody);
      if( otherBody.shapes[0].collisionGroup == PLAYER )
        HandlePlayerPlayerCollison(playerBody,otherBody);

    }
    if( (bodyA.shapes[0].collisionGroup == BULLET || bodyB.shapes[0].collisionGroup == BULLET ) ){
      var bulletBody = bodyA.shapes[0].collisionGroup == BULLET ? bodyA : bodyB,
          otherBody  = bodyB==bulletBody ? bodyA : bodyB;

      if( otherBody.shapes[0].collisionGroup == GROUND )
        HandleBulletGroundCollison(bulletBody);

    }

  });
  console.log("Initialized the physics engine.")
};

function HandlePlayerBulletCollison(playerBody,bulletBody){

  if(players[playerBody.id] &&  bullets[bulletBody.id] &&
     bullets[bulletBody.id].fullInfomation &&
     bullets[bulletBody.id].fullInfomation.PlayerID != playerBody.id){
    world.removeBody(players[playerBody.id].body);
    if(players[playerBody.id].isBot){
        nBots--;
        initBots();

    }
    delete players[playerBody.id];


    var shootingPlayer = bullets[bulletBody.id].fullInfomation.PlayerID;
    if(!players[shootingPlayer]){
      util.log("[ERROR!] Player " + shootingPlayer + " shot but no info found..");
      return;
    }
    players[shootingPlayer].fullInfomation.score += 10;

    io.emit("player disconnected", {id: playerBody.id});
    io.emit("remove bullet",  {id: bulletBody.id});
    io.emit("increase score", {id: shootingPlayer, amount: 10});
    io.emit("scoreboard", getLeaderBoard());

    world.removeBody(bullets[bulletBody.id].body);
    delete bullets[bulletBody.id];
  }
}

function HandlePlayerPlayerCollison(player1Body,player2Body){

}
function HandleBulletGroundCollison(bulletBody){
  util.log("BULLET HIT THE GROUND");
  io.emit("remove bullet", {id: bulletBody.id});
  world.removeBody(bullets[bulletBody.id].body);
  delete bullets[bulletBody.id];
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
function shootBullet( data ){
  //return;
  playerID = data.id;

  //can shoot once per second
  if(players[playerID] &&
  (new Date().getTime() - players[playerID].fullInfomation.LastShot > shotDelay)){
    //create the gameobject to store the body and add it to the physics engine
    var newBullet = new GameObject(
      players[playerID].body.position[0],
      players[playerID].body.position[1],
      0,"circle",10,
      players[playerID].fullInfomation.DisplayInfo,
      "b"+bulletSeed, "bullet");

    newBullet.setPlayerID(playerID);
    world.addBody(newBullet.body);
    bullets["b"+bulletSeed] = newBullet;

    //shoot in the direction the player is aiming
    /*
    var len = Math.sqrt(players[playerID].target.x*players[playerID].target.x+players[playerID].target.y*players[playerID].target.y);
    var velLength = ( len == 0 ? 0.0 : shootSpeed/len);
    newBullet.body.velocity[0] = velLength*players[playerID].target.x;
    newBullet.body.velocity[1] = velLength*players[playerID].target.y;
*/
    //keep track of the bullets fired and who fired what
    bulletSeed++;
    players[playerID].fullInfomation.LastShot = new Date().getTime();

    //update all players about a bullet being fired
    io.emit("bullet fired", newBullet.fullInfomation);
  }
}

function getSortedKeysByScore(obj) {
    var keys = []; for(var key in obj) keys.push(key);
    return keys.sort(function(a,b){return obj[a].fullInfomation.score-obj[b].fullInfomation.score});
}
function getLeaderBoard(){
	var scoreBoardKeys = getSortedKeysByScore(players);
  var scoreBoard = [];
  for(var i = 0; i < (scoreBoardKeys.length < 5 ? scoreBoardKeys.length :  5);i++){
      scoreBoard.push( {
        name:  players[scoreBoardKeys[i]].fullInfomation.DisplayInfo.name,
        id:    players[scoreBoardKeys[i]].fullInfomation.id,
        score: players[scoreBoardKeys[i]].fullInfomation.score
      });
  }

  return scoreBoard;
}

update = function(){
  // The step method moves the bodies forward in time.
  world.step(timeStep);

  var JSONworld = []

  for(var key in players ){
    JSONworld.push(
      {x: players[key].body.position[0],
       y: players[key].body.position[1],
      id: players[key].fullInfomation.id,
      type: "player"} );

    players[key].update();
  }
  for(var id in bullets){
    JSONworld.push(
    {x: bullets[id].body.position[0],
     y: bullets[id].body.position[1],
    id: bullets[id].fullInfomation.id,
    type: "bullet"} );
    if(players[bullets[id].fullInfomation.PlayerID]){
      bullets[id].body.position[0] = players[bullets[id].fullInfomation.PlayerID].body.position[0];
      bullets[id].body.position[1] = players[bullets[id].fullInfomation.PlayerID].body.position[1];
    }else{
      io.emit("remove bullet", {id: id});
      world.removeBody(bullets[id].body);
      delete bullets[id];
      continue;
    }

    if(new Date().getTime() - bullets[id].fullInfomation.startTime > bulletLife){
      io.emit("remove bullet", {id: id});
      world.removeBody(bullets[id].body);
      delete bullets[id];
    }
  }
  //Convert world to JSON
  io.emit("update", JSONworld);
}

init();
setInterval( update,1/25.0);
