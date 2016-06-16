/*
 * Brief: Tools for managing the UI
 *
 * Author: Jacob rawling
 * Date: 06/2016
 * Email: Rawling.Jacob@gmail.com
 */
//GameManager class
function GameManager(bgColor){
	this.canvas = $("#canvas")[0];
	this.ctx = canvas.getContext("2d");

  //Resize the canvas to occupy the full page
  this.canvas.width  = window.innerWidth;
  this.canvas.height = window.innerHeight;

	this.canvasWidth  = $("#canvas").width();
	this.canvasHeight = $("#canvas").height();
  this.bgColor = bgColor;

	//create a container for the players
	this.players = [];
	this.players.push(new Player(10, this.ctx, this.canvasWidth ,this.canvasHeight));

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
  this.PaintCanvas();

	for( i = 0; i < this.players.length; i++){
		this.players[i].Update();
	}

};

GameManager.prototype.KeyPress = function(key){
	for( i = 0; i < this.players.length; i++){
		this.players[i].ManageMovement(key);
	}
};

$(document).ready(function(){
  var gameManager = new GameManager("#FF0000");

  function Update(){
    gameManager.Update();
  }

  $(document).keydown(function(e){
    key = e.which;
    gameManager.KeyPress(key);
  })

  //every 60ms render the frame
  game_loop =setInterval(Update, 60);
})
