function Camera(X,Y,scaleFactor,Canvas){
  this.canvas = Canvas;
  this.ctx    = this.canvas.getContext("2d");
  this.backgroundImg = new Image();
    this.backgroundImg.src = "img/grid.gif";
  this.x = 0;
  this.y = 0;

  this.width = this.canvas.width;
  this.height = this.canvas.height;
  this.maxScale = 0.8;
  this.maxScale = 0.25;
  this.scale = scaleFactor;
}

Camera.prototype.ZoomOut = function(amount){
  if(amount < 0){
    if(this.scale  >  this.minScale)
      this.scale += amount;
  }else {
     if(this.scale  <  this.maxScale)
      this.scale += amount;

  }
}

Camera.prototype.DrawBackground = function(){
  //(image,  dx, dy, dw, dh)
  var width = 5*this.scale*this.backgroundImg.width;
  var height = 5*this.scale*this.backgroundImg.height;
  this.ctx.drawImage(this.backgroundImg,this.width/2+this.x-width,this.height/2+this.y, width, height);
  this.ctx.drawImage(this.backgroundImg,this.width/2+this.x-width,this.height/2+this.y-height, width, height);
  this.ctx.drawImage(this.backgroundImg,this.width/2+this.x,this.height/2+this.y, width, height);
  this.ctx.drawImage(this.backgroundImg,this.width/2+this.x,this.height/2+this.y-height, width, height);
}
Camera.prototype.DrawCircle = function (x,y,r,color,name) {
  var prevFill = this.ctx.fillStyle;
  this.ctx.beginPath();
  this.ctx.fillStyle = color;
  this.ctx.arc(this.width/2+this.x+x*this.scale,this.height/2+this.y+y*this.scale,r*this.scale,0,2*Math.PI);
  this.ctx.fill();
  this.ctx.stroke();

  this.ctx.fillStyle = "black";
  var font = "bold " + r*this.scale +"px serif";
  this.ctx.font = font;
  // Move it down by half the text height and left by half the text width
  var width = this.ctx.measureText(name).width;
  var height = this.ctx.measureText("w").width; // this is a GUESS of height
  this.ctx.fillText(name, this.width/2+this.x+x*this.scale- (width/2) ,this.height/2+this.y+y*this.scale  + (height/2));

  this.ctx.fillStyle =prevFill;
};
Camera.prototype.DrawRect = function (x,y,shapeInfo,angle,color,name) {
  this.ctx.save();
  var prevFill = this.ctx.fillStyle;
  var w = shapeInfo.width, h = shapeInfo.height;

  this.ctx.beginPath();
  this.ctx.fillStyle = color;

  this.ctx.translate( this.width/2+this.x+x*this.scale,this.height/2+this.y+y*this.scale);
  this.ctx.rotate( angle );
//  this.ctx.translate( 0, h*this.scale );
  this.ctx.rect(0,0,    w*this.scale,h*this.scale);
  this.ctx.fill();
  this.ctx.stroke();
  this.ctx.restore();
};
Camera.prototype.CentreOn = function (x,y) {
  this.x = -x*this.scale;
  this.y = -y*this.scale;
};
Camera.prototype.ToScreenCoords = function(x,y){
  return [this.width/2+this.x+x*this.scale,this.height/2+this.y+y*this.scale];
}
Camera.prototype.ToWorldCoords = function(x,y){
  return [(-this.width/2-this.x+x)/this.scale,(-this.height/2-this.y+y)/this.scale];
}
