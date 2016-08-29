/*
 */
 function GameObject(posX,posY,mass, shape, shapeInfo,displayInfo, playerID,type){
   //When updating clients about GameObjects the creation of this Object
   // Full infomation will be sent
   this.fullInfomation = {
     x: posX,
     y: posY,
     Mass: mass,
     Shape: shape,
     ShapeInfo: shapeInfo,
     DisplayInfo: displayInfo,
     PlayerID: playerID,
     LastShot: 0,
     Type: type,
     score: 0
   }
   // When sending a
   this.position = {
     x: posX,
     y: posY
   }



}
GameObject.prototype.SetPosition = function(X,Y){
 this.previousPosition = this.position;
  this.position.x = X;
  this.position.y = Y;
  this.fullInfomation.x = X;
  this.fullInfomation.y = Y;
};
GameObject.prototype.Update = function(camera){
  var that = this;
  switch(that.Shape){
    default:
    case "circle":
    
      camera.DrawCircle(that.position.x, that.position.y,
        that.fullInfomation.ShapeInfo,
        that.fullInfomation.DisplayInfo.color,
        ( that.fullInfomation.type == "bullet" ? "" : that.fullInfomation.DisplayInfo.name));
      break;
  }
}
GameObject.prototype.IsDead = function(){
  if(  this.previousPosition === this.position)
    return true;
  return false;
}
