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
		if(msg[i].type == "player"){
			if(gameManager.players[msg[i].id]){
				gameManager.players[msg[i].id].position.x = msg[i].x;
				gameManager.players[msg[i].id].position.y = msg[i].y;
			}
		}
		if(msg[i].type == "bullet"){
			if(gameManager.bullets[msg[i].id]){
				gameManager.bullets[msg[i].id].position.x = msg[i].x;
				gameManager.bullets[msg[i].id].position.y = msg[i].y;
			}
		}
	}
});

//Server tells client there is a new player entered
socket.on("new player", function(msg){
	gameManager.players[msg.PlayerID] =  new GameObject(0,0,5,"circle", 60,"black", msg.playerID);
	gameManager.players[msg.PlayerID].fullInfomation = msg;
	gameManager.players[msg.PlayerID].SetPosition(msg.x,msg.y);

	console.log(" New player info recieved col: " + msg.DisplayInfo );
//	console.log(	gameManager.players[msg.playerID].fullInfomation);
//	console.log( gameManager.players )
});

socket.on("set id", function(msg){
	console.log("Setting id: " +msg.id);
	gameManager.currentPlayer.fullInfomation.PlayerID = msg.id;
	gameManager.currentPlayer.fullInfomation.DisplayInfo = msg.DisplayInfo;
	gameManager.playerID  = msg.id;
	gameManager.players[gameManager.playerID] = gameManager.currentPlayer;
});


socket.on("bullet fired", function(msg){
	console.log("[INFO] Bullet shot");
		console.log(msg);
	gameManager.bullets[msg.PlayerID] =  new GameObject(
		msg.x,msg.y,
		0,"circle",10,
		msg.DisplayInfo,
		msg.PlayerID, "bullet");
	gameManager.bullets[msg.PlayerID].fullInfomation = msg;
	gameManager.bullets[msg.PlayerID].SetPosition(msg.x,msg.y);
});

//Server tells client there is another player has disconnected
socket.on("player disconnected", function(msg){
	if(gameManager.players[msg.id])
		delete gameManager.players[msg.id];
});
function GameManager(bgColor){
	this.canvas = $("#canvas")[0];
	this.ctx = canvas.getContext("2d");
	this.mousePos = [];
	this.moveDir = [0,0];
  //Resize the canvas to occupy the full page
  this.canvas.width  = window.innerWidth;
  this.canvas.height = window.innerHeight;

	this.canvasWidth  = $("#canvas").width();
	this.canvasHeight = $("#canvas").height();
  this.bgColor = bgColor;
	this.camera = new Camera(0,0,0.3,this.canvas);

	//create a container for the players
	this.players = {};
	this.bullets = {};
	this.playerID = -1;
	this.currentPlayer = new GameObject(0,0,5,"circle", 75,"green", -1);
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
GameManager.prototype.SetMousePos = function(mousePos){
	if(	gameManager.players[gameManager.playerID] ){
		var xPosition =  mousePos[0] - 	gameManager.players[gameManager.playerID].position.x;
		var yPosition =  mousePos[1] - 	gameManager.players[gameManager.playerID].position.y;
		this.moveDir = [xPosition,yPosition];
	}
}
GameManager.prototype.Update = function(){
	//clear the
  //this.ctx.clearRect(0,0, this.canvas.width,this.canvas.height);
	this.camera.DrawBackground();
	//move the camera to the player
	if(this.players[this.playerID]){
		this.camera.CentreOn(this.players[this.playerID].position.x,
										 	   this.players[this.playerID].position.y);
	}

	//update the other players
	for( var key in this.players){
		this.players[key].Update(this.camera);
	}
	for( var key in this.bullets){
		this.bullets[key].Update(this.camera);
	}
	this.ctx.font = "30px Arial";
  this.ctx.fillText("Players:" + Object.keys(this.players).length,350,50);

};

GameManager.prototype.StartGame = function(){
	var playerName = $('#nameBox').val();
	console.log(playerName);
	$('#connectBox').hide();
	socket.emit("start play", {name: playerName});
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
	$("#canvas")[0].addEventListener('mousemove', function(event) {
		var mousePos = gameManager.camera.ToWorldCoords(event.clientX,event.clientY);
		gameManager.SetMousePos( mousePos );
		var xDir = event.clientX - $("canvas")[0].width/2;
		var yDir = event.clientY - $("canvas")[0].height/2;


		socket.emit("move player",{
			x: xDir,
			y: yDir,
			id: gameManager.playerID
		});

	 }, false);

 	$("#canvas")[0].addEventListener('click', function(event) {
		socket.emit("shoot",{			id: gameManager.playerID		});
 	});
	function Update(){
	 gameManager.Update();
	}

  //every 60ms render the frame
 	game_loop =setInterval(Update, 30);
});
