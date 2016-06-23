

/********************************
 *       Game functions         *
 ********************************/
 function GameServer(){
   var that = this;

   //Initialize node.js objects
   var express = require('express');
   var app  = express();
   var http = require('http').Server(app);
   var io   = require('socket.io')(http); //for interating with users
   var util = require("util");			     	// Utility resources (logging, object inspection, etc)
   var p2   = require('p2');              //the physics engine
   var world;

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

    // Listen for client disconnected
  	socket.on("disconnect", this.onClientDisconnect);

  	// Listen for new player message
  	socket.on("new player", this.onNewPlayer);

  	// Listen for move player message
  	socket.on("move player", this.onMovePlayer);
  }

  // Socket client has disconnected
  onClientDisconnect = function() {
  };

  // New player has joined
  onNewPlayer = function(data) {
  /*
    // Create a new player
  	var newPlayer = new Player(data.x, data.y);
  	newPlayer.id = this.id;

  	// Broadcast new player to connected socket clients
  	this.broadcast.emit("new player", {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY()});

  	// Send existing players to the new player
  	var i, existingPlayer;
  	for (i = 0; i < players.length; i++) {
  		existingPlayer = players[i];
  		this.emit("new player", {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY()});
  	};

  	// Add new player to the players array
  	players.push(newPlayer);*/
  };

  // Player has moved
  onMovePlayer = function(data){
    /*
  	// Find player in array
  	var movePlayer = playerById(this.id);

  	// Player not found
  	if (!movePlayer) {
  		util.log("Player not found: "+this.id);
  		return;
  	};

  	// Update player position
  	movePlayer.setX(data.x);
  	movePlayer.setY(data.y);

  	// Broadcast updated position to connected socket clients
  	this.broadcast.emit("move player", {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY()});*/
  };


  initPhysics = function(){
    // Create a physics world, where bodies and constraints live
    var world = new p2.World({
      gravity:[0, -9.82]
    });

    // Create an empty dynamic body
    var circleBody = new p2.Body({
        mass: 5,
        position: [0, 100]
    });

    // Create an empty dynamic body
    var circleBod2y = new p2.Body({
        mass: 5,
        position: [0.2, 80]
    });

    // Add a circle shape to the body.
    var circleShape = new p2.Circle({ radius: 1 });
    var circleShape2 = new p2.Circle({ radius: 1.5 });
    circleBody.addShape(circleShape);
    circleBod2y.addShape(circleShape2);
    // ...and add the body to the world.
    // If we don't add it to the world, it won't be simulated.
    world.addBody(circleBody);
    world.addBody(circleBod2y);
    // Create an infinite ground plane.
    var groundBody = new p2.Body({
        mass: 0 // Setting mass to 0 makes the body static
    });
    var groundShape = new p2.Plane();
    groundBody.addShape(groundShape);
    world.addBody(groundBody);
    this.bodies = [groundBody,circleBody,circleBod2y];

    // To get the trajectories of the bodies,
    // we must step the world forward in time.
    // This is done using a fixed time step size.
    this.timeStep = 1 / 60; // seconds
    console.log("Initialized the physics engine.")
  };

  getJSONWorld = function(){
      var JSONworld = []
      for(var i = 0; i < this.bodies.length;i ++ ){
        JSONworld.push(
        {x: this.bodies[i].position[0],
         y: this.bodies[i].position[1] });
      }
      return JSONworld;
  };

  this.GameLoop = function(){
    // The step method moves the bodies forward in time.
  //  world.step(this.timeStep);

    // Print the circle position to console.
    // Could be replaced by a render call.

    //Convert world to JSON
    io.emit('update', getJSONWorld());
  }

  init();
}

GameServer.prototype.Start = function() {
  var that = this;
};
var game = new GameServer();
game.Start();
setInterval( function(){game.GameLoop();}, game.timeStep );
