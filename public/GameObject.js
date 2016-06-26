/*
 *
 *
 * Author: Jacob Rawling (Rawling.Jacob@gmail.com)
 * Date: 06/2016
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
     x: 0,
     y: 0
   }

   this.body = new p2.Body({
       mass: mass,
       position: [posX, posY]
   });
   function CreateShape(shape,shapeInfo){
     switch(shape){
       default:
       case "circle":
          var shape = new p2.Circle({ radius: shapeInfo });
          this.body.addShape(shape);
          break;
      case "plane":
         var shape = new p2.Plane();
         this.body.addShape(shape);
         break;
     }
   }
   CreateShape(shape,shapeInfo);
 }

GameObject.prototype.Update = function(camera){
  var that = this;
  switch(shape){
    default:
    case "circle":
      camera.DrawCircle(that.position.x, that.position.y,that.shapeInfo);
      break;
  }
}
