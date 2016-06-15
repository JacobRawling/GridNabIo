/*
 * Brief: Tools for managing the UI
 *
 * Author: Jacob rawling
 * Date: 06/2016
 * Email: Rawling.Jacob@gmail.com
 */

//GameManager class
var GameManager = function(){
 };

GameManager.prototype.initilaizeCanvas = function(){
  // Get the canvas element form the page
  var canvas = document.getElementById("canvas");

  //Resize the canvas to occupy the full page
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "#FF0000";
  ctx.fillRect(0,0,window.innerWidth,window.innerHeight);
}

GameManager.prototype.RenderFrame = function(){
    PaintCanvas();
    snake.Update();
}

GameManager.prototype.PaintCanvas = function(){
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "black";
  ctx.strokeRect(0, 0, w, h);
}
$(document).ready(function(){
	var canvas = $("#canvas")[0];
	var ctx = canvas.getContext("2d");
	var w = $("#canvas").width();
	var h = $("#canvas").height();
  var key;
  var snake = new Snake(5,10,ctx,w,h);

  function PaintCanvas(){
  	ctx.fillStyle = "white";
  	ctx.fillRect(0, 0, w, h);
  	ctx.strokeStyle = "black";
  	ctx.strokeRect(0, 0, w, h);
  }
  function RenderFrame(){
    PaintCanvas();
    snake.Update();
  }
  $(document).keydown(function(e){
    key = e.which;
    snake.ManageMovement(key);
  })

  //every 60ms render the frame
  game_loop =setInterval(RenderFrame, 60);
})
