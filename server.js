//Initialize node.js objects
var express = require('express');
var app  = express();
var http = require('http').Server(app);
var io   = require('socket.io')(http); //for interating with users
var util = require("util");			     	// Utility resources (logging, object inspection, etc)
var p2   = require('p2');              //the physics engine
var world;

var players = {};
var sockets = {};
var playerSeed = 0;


function GameObject(posX,posY,mass, shape, shapeInfo,displayInfo,playerID){
  //When updating clients about GameObjects the creation of this Object
  // Full infomation will be sent
  this.fullInfomation = {
    x: posX,
    y: posY,
    Mass: mass,
    Shape: shape,
    ShapeInfo: shapeInfo,
    DisplayInfo: displayInfo,
    PlayerID: playerID
  }
  // When sending a
  this.position = {
    x: 0,
    y: 0
  }

  this.body = new p2.Body({
      mass: mass,
      position: [posX, posY]
  });

  this.body.applyDamping(0);
  this.CreateShape = function(shape,shapeInfo){
    switch(shape){
      default:
      case "circle":
         var shape = new p2.Circle({ radius: shapeInfo });
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



init = function(){
   //Add the public directory to the request path for users
   app.use(express.static(__dirname + '/public'));

  //Display the webpage on connection
  app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/index.html');
  });

  initPhysics();

  //Set Event handlers
  io.on('connection', onSocketConnection);

  //Listen
  http.listen(3000, function(){
    console.log('listening on *:3000');
  });
}

onSocketConnection = function(socket){
	util.log("[INFO] New player has connected...");

  initPlayer(socket);

  //update all players about the new player
  socket.broadcast.emit("new player", players[ playerSeed-1].fullInfomation);

  // Listen for client disconnected
	socket.on("disconnect", onClientDisconnect);

	// Listen for new player message
	socket.on("new player", onNewPlayer);

	// Listen for move player message
	socket.on("move player", onMovePlayer);
}

// Socket client has disconnected
onClientDisconnect = function() {
  //need to keep track of who has disconnected and remove them from the server I gues
  //so introduce heartbeats to player class.

};
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
initPlayer = function(socket){
  var newPlayer = new GameObject(getRandomArbitrary(-10,10),getRandomArbitrary(0,250),5,"circle",35, getRandomColor(),playerSeed);
  world.addBody(newPlayer.body);
  players[playerSeed]  = newPlayer;
  util.log("[INFO] Created player object: " + playerSeed);
  playerSeed = playerSeed+1;

  //now tell the client about the ID + other players
  socket.emit("set id", {id: playerSeed-1, DisplayInfo: newPlayer.fullInfomation.DisplayInfo});
  for(var key in players){
    if(key != playerSeed-1){
      socket.emit("new player", players[key].fullInfomation);
    }
  }
}
// New player has joined
onNewPlayer = function(data) {

};

// Player has moved
onMovePlayer = function(data){
  var moveStrength = 4;
  var len = Math.sqrt(data.x*data.x+data.y*data.y);

  var dir = [moveStrength*data.x/len,moveStrength*data.y/len];
  if(players[data.id]){
    players[data.id].body.applyImpulseLocal(dir);
  }
};

initPhysics = function(){
  // Create a physics world, where bodies and constraints live
  world = new p2.World({
    gravity:[0,0]
  });
  var worldHalfSize = 500;
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
  var leftWallShape = new p2.Plane();
  var rightWallShape = new p2.Plane();
  var ceillingShape = new p2.Plane();
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
  console.log("Initialized the physics engine.")
};

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

getJSONWorld = function(){
    var JSONworld = []
    for(var key in players ){
      JSONworld.push(
      {x: players[key].body.position[0],
       y: players[key].body.position[1],
      id: players[key].fullInfomation.PlayerID});
    }
    return JSONworld;
};

update = function(){
  // The step method moves the bodies forward in time.
  world.step(timeStep);
  //Convert world to JSON
  io.emit("update", getJSONWorld());
}

init();
setInterval( update,1/60.0);
