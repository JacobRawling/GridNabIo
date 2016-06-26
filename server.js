//Initialize node.js objects
var express = require('express');
var app  = express();
var http = require('http').Server(app);
var io   = require('socket.io')(http); //for interating with users
var util = require("util");			     	// Utility resources (logging, object inspection, etc)
var p2   = require('p2');              //the physics engine
var world;

var players = [];
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
	util.log("New player has connected:");

  initPlayer();

  //this.broadcast.emit("new player", players[players.len-1].fullInfomation);

  this.emit("set id", {id: playerSeed-1});
  console.log("New player created");

  // Listen for client disconnected
	socket.on("disconnect", onClientDisconnect);

	// Listen for new player message
	socket.on("new player", onNewPlayer);

	// Listen for move player message
	socket.on("move player", onMovePlayer);
}

// Socket client has disconnected
onClientDisconnect = function() {
};

initPlayer = function(){
  var newPlayer = new GameObject(0,0,5,"circle",35, "green",playerSeed);
  world.addBody(newPlayer.body);
  players.push(newPlayer);
  playerSeed++;
}
// New player has joined
onNewPlayer = function(data) {

};

// Player has moved
onMovePlayer = function(data){
  len = Math.sqrt(data.x*data.x+data.y*data.y);
  var dir = [data.x/len, data.y/len];
  //circleBody.applyImpulseLocal(dir);
};

initPhysics = function(){
  // Create a physics world, where bodies and constraints live
  world = new p2.World({
    gravity:[0, -9.82]
  });

  initPlayer();

  // Create an infinite ground plane.
  var groundBody = new p2.Body({
      mass: 0 ,// Setting mass to 0 makes the body static
      position: [0, -200]
  });
  var groundShape = new p2.Plane();
  groundBody.addShape(groundShape);
  world.addBody(groundBody);
  // To get the trajectories of the bodies,
  // we must step the world forward in time.
  // This is done using a fixed time step size.
  timeStep = 1 / 60; // seconds
  console.log("Initialized the physics engine.")
};

getJSONWorld = function(){
    var JSONworld = []
    for(var i = 0; i < players.length;i ++ ){
      JSONworld.push(
      {x: players[i].body.position[0],
       y: players[i].body.position[1],
      id: players[i].fullInfomation.PlayerID});
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
