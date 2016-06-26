/*
 */
 function GameObject(posX,posY,mass, shape, shapeInfo,displayInfo, playerID){
   //When updating clients about GameObjects the creation of this Object
   // Full infomation will be sent
   this.fullInfomation = {
     x: posX,
     y: posY,
     Mass: mass,
     Shape: shape,
     ShapeInfo: shapeInfo,
     DisplayInfo: displayInfo,
     PlayerID: playerID
   }
   // When sending a
   this.position = {
     x: posX,
     y: posY
   }
}
GameObject.prototype.SetPosition = function(X,Y){
  this.position.x = x;
  this.position.y = y;
  this.fullInfomation.x = x;
  this.fullInfomation.y = y;
};
GameObject.prototype.Update = function(camera){
  var that = this;
  switch(that.Shape){
    default:
    case "circle":
      camera.DrawCircle(that.position.x, that.position.y,that.shapeInfo);
      break;
  }
}
