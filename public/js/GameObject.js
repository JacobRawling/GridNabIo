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
      camera.DrawCircle(that.position.x, that.position.y,that.fullInfomation.ShapeInfo,that.fullInfomation.DisplayInfo);
      break;
  }
}
