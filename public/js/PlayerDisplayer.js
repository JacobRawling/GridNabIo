/*
 * Brief: A Class to handle the player
 *
 * Author: Jacob rawling
 * Date: 06/2016
 * Email: Rawling.Jacob@gmail.com
 */

//The Player Object
var PlayerDisplayer = function(){

}

Player.prototype.PaintCell = function(x,y){
  this.ctx.fillStyle = "blue";
	this.ctx.fillRect(x*this.cellWidth, y*this.cellWidth, this.cellWidth, this.cellWidth);
	this.ctx.strokeStyle = "white";
	this.ctx.strokeRect(x*this.cellWidth, y*this.cellWidth, this.cellWidth, this.cellWidth);
}
Player.prototype.Update = function(){
  this.ManageLogic();
}
