var express = require('express');
var app  = express();
var http = require('http').Server(app);
var io   = require('socket.io')(http);
var util = require("util");				// Utility resources (logging, object inspection, etc)
var p2   = require('p2');
app.use(express.static(__dirname + '/public'));

/********************************
 *       Game functions         *
 ********************************/
var init = function(){
  //Display the webpage on connection
  app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/index.html');
  });

  //Set Event handlers
  io.on('connection', onSocketConnection);

  //Listen
  http.listen(3000, function(){
    console.log('listening on *:3000');
  });
}

function onSocketConnection(socket){
	util.log("New player has connected:");

  // Listen for client disconnected
	socket.on("disconnect", onClientDisconnect);

	// Listen for new player message
	socket.on("new player", onNewPlayer);

	// Listen for move player message
	socket.on("move player", onMovePlayer);
}

// Socket client has disconnected
function onClientDisconnect() {

};

// New player has joined
function onNewPlayer(data) {
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
function onMovePlayer(data) {
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


// Create a physics world, where bodies and constraints live
var world = new p2.World({
    gravity:[0, -9.82]
});

// Create an empty dynamic body
var circleBody = new p2.Body({
    mass: 5,
    position: [0, 100]
});

// Add a circle shape to the body.
var circleShape = new p2.Circle({ radius: 1 });
circleBody.addShape(circleShape);

// ...and add the body to the world.
// If we don't add it to the world, it won't be simulated.
world.addBody(circleBody);


// Create an infinite ground plane.
var groundBody = new p2.Body({
    mass: 0 // Setting mass to 0 makes the body static
});
var groundShape = new p2.Plane();
groundBody.addShape(groundShape);
world.addBody(groundBody);
var bodies = [groundBody,circleBody]
// To get the trajectories of the bodies,
// we must step the world forward in time.
// This is done using a fixed time step size.
var timeStep = 1 / 60; // seconds

getJSONWorld = function(){
    var JSONworld = []
    for(var i = 0; i < bodies.length;i ++ ){
      JSONworld.push(
      {x: bodies[i].position[0],
       y: bodies[i].position[1] });
    }
    return JSONworld;
};
// The "Game loop". Could be replaced by, for example, requestAnimationFrame.
setInterval(function(){

    // The step method moves the bodies forward in time.
    world.step(timeStep);

    // Print the circle position to console.
    // Could be replaced by a render call.

    //Convert world to JSON
    io.emit('update', getJSONWorld());

}, 1000 * timeStep);

/*
 * Start the game
 */
 init();
