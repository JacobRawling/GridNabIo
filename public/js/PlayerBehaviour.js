/*
 * Brief: A Class to handle the player
 *
 * Author: Jacob rawling
 * Date: 06/2016
 * Email: Rawling.Jacob@gmail.com
 */

//The Player Object
//A  square in position space
var Vector2 = function(x,y){
  this.x = x;
  this.y = y;

  function magnitude(){
    return Math.sqrt( this.x*this.x + this.y*this.y);
  }
  function squareMagnitude(){
    return  (this.x*this.x + this.y*this.y);
  }
}
var PlayerBehavior = function (cellWidth,ctx,canvasWidth,canvasHeight) {
  this.cellWidth = cellWidth;
  this.ctx = ctx;
  this.cWidth = canvasWidth;this.cHeight = canvasHeight;
  this.CreatePlayer();
}
cd
Player.prototype.CreatePlayer = function(){
  delete cells;

  this.cells = [];
  this.direction = "right";
  this.cells.push({x: 0, y:0});
}

Player.prototype.Paint = function(){
  for(var i = 0; i < this.cells.length; i++)
  {
    this.PaintCell(this.cells[i].x,this.cells[i].y);
  }
}

Player.prototype.ManageLogic = function(){
  if(this.direction == "right") this.Move(1,0);
  else if (this.direction == "left") this.Move(-1,0);
  else if (this.direction == "up") this.Move(0,-1);
  else if (this.direction == "down") this.Move(0,1);

}
Player.prototype.ManageMovement = function(key){
  var dir = this.direction;
  //Prevent heading back onitself
  if(key == "37" && dir != "right") this.direction = "left";
  else if(key == "38" && dir != "down") this.direction  = "up";
  else if(key == "39" && dir != "left") this.direction = "right";
  else if(key == "40" && dir != "up") this.direction = "down";
}

Player.prototype.isCollides = function(x,y){
  for(var i = 0; i < this.cells.length; i++){
    if(this.cells[i].x == x && this.cells[i].y == y)
      return true;
  }
  return false;
}

Player.prototype.BoundaryCheck = function(x,y){
    head = this.cells[0];
    if(x == -1 || y == -1 || x == Math.floor(this.cWidth/this.cellWidth )|| y == Math.floor(this.cHeight/this.cellWidth))
      return true;
    return false;
}

//Move by x units in the X dir and Y units in the Y
Player.prototype.Move = function(x,y){
    newX = this.cells[0].x + x;
    newY = this.cells[0].y + y;
    if(this.BoundaryCheck(newX,newY) || this.isCollides(newX,newY)){
      this.CreatePlayer();
      return;
    }

    var tail = this.cells.pop();
    tail.x = newX; tail.y = newY;
    this.cells.unshift(tail);
}
