/*
 * Brief: Tools for managing the UI
 *
 * Author: Jacob rawling
 * Date: 06/2016
 * Email: Rawling.Jacob@gmail.com
 */
//GameManager class
var socket = io();
var gameManager = 0;

socket.on("update", function(msg){
	physicsWorld = msg;
	for( var  i = 0 ; i < msg.length; i++){
		if(gameManager.players[msg[i].id]){
			gameManager.players[msg[i].id].position.x = msg[i].x;
			gameManager.players[msg[i].id].position.y = msg[i].y;
		}
	}
});

socket.on("new player", function(msg){
	gameManager.players[msg.playerID] =  new GameObject(0,0,5,"circle", 25,"green", -1);
	gameManager.players[msg.playerID].fullInfomation = msg;
	gameManager.players.SetPosition(msg.x,msg.y);
});

socket.on("set id", function(msg){
	console.log("Setting id: " +msg.id);
	gameManager.currentPlayer.fullInfomation.PlayerID = msg.id;
	gameManager.playerID  = msg.id;
	gameManager.players[gameManager.playerID] = gameManager.currentPlayer;
});

function GameManager(bgColor){
	this.canvas = $("#canvas")[0];
	this.ctx = canvas.getContext("2d");
	this.camera = new Camera(0,0,0.25,this.canvas);
	console.log(this.camera)
  //Resize the canvas to occupy the full page
  this.canvas.width  = window.innerWidth;
  this.canvas.height = window.innerHeight;

	this.canvasWidth  = $("#canvas").width();
	this.canvasHeight = $("#canvas").height();
  this.bgColor = bgColor;

	//create a container for the players
	this.players = {};
	this.playerID = -1;
	this.currentPlayer = new GameObject(0,0,5,"circle", 25,"green", -1);
 }


GameManager.prototype.RenderFrame = function(){
    this.PaintCanvas();
};

GameManager.prototype.PaintCanvas = function(){
  this.ctx.fillStyle = this.bgColor;
  this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasWidth);
  this.ctx.strokeStyle = "black";
  this.ctx.strokeRect(0, 0, this.canvasWidth, this.canvasWidth);
};

GameManager.prototype.Update = function(){
	//clear the
  this.ctx.clearRect(0,0, this.canvas.width,this.canvas.height);

	//move the camera to the player
	if(this.players[this.playerID]){
//		this.camera.CentreOn(this.players[this.playerID].x,												 this.players[this.playerID].y);
	}else{
		console.log("Failed to find playerID: " + this.playerID);
		console.log("Players: " + Object.keys(this.players).length + " " + Object.keys(this.players)[0]);
	}

	//update the other players
	var i = 2;
	for( var key in this.players){
		this.players[key].Update(this.camera);
	  this.ctx.fillText("px: " + 	this.players[key].position.x + " py: " + this.players[key].position.y,10,i*50);
		i++
		//console.log(this.players[key]);
	}


	this.ctx.font = "30px Arial";
  this.ctx.fillText("x: " + this.camera.x + " y: " + this.camera.y,10,50);
  this.ctx.fillText("berge: " + this.camera.y,10,150);

};

GameManager.prototype.KeyPress = function(key){
/*	for( i = 0; i < this.players.length; i++){
		this.players[i].ManageMovement(key);
	}*/
};

$(document).ready(function(){
	//create the manager
  gameManager = new GameManager("#FFFFFF");

	//add onclick behaviour to the game
	$("#canvas")[0].addEventListener('click', function(event) {
		var xPosition = -event.clientX -  physicsWorld[0].x/gameManager.camera.scale;
		var yPosition = -event.clientY +   physicsWorld[0].y/gameManager.camera.scale;

		socket.emit("move player",{
			x: xPosition,
			y: yPosition
		});

	 }, false);

	function Update(){
	 gameManager.Update();
	}

  //every 60ms render the frame
 	game_loop =setInterval(Update, 60);
});
