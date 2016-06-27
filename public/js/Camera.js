function Camera(X,Y,scaleFactor,Canvas){
  this.canvas = Canvas;
  this.ctx    = this.canvas.getContext("2d");

  this.x = 0;
  this.y = 0;

  this.width = this.canvas.width;
  this.height = this.canvas.height;

  this.scale = scaleFactor;

}

Camera.prototype.DrawCircle = function (x,y,r,color) {
  var prevFill = this.ctx.fillStyle;
  this.ctx.beginPath();
  this.ctx.fillStyle = color;
  this.ctx.arc(this.width/2+this.x+x*this.scale,this.height/2+this.y+y*this.scale,r*this.scale,0,2*Math.PI);
  this.ctx.fill();
  this.ctx.stroke();
  this.ctx.fillStyle =prevFill;
};
Camera.prototype.CentreOn = function (x,y) {
  this.x = x;
  this.y = y;
};
