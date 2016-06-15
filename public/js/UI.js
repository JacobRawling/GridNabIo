/*
 * Brief: Tools for managing the UI 
 *
 * Author: Jacob rawling
 * Date: 06/2016
 * Email: Rawling.Jacob@gmail.com
 */

function initilaizeCanvas(){
  // Get the canvas element form the page
  var canvas = document.getElementById("canvas");

  //Resize the canvas to occupy the full page
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "#FF0000";
  ctx.fillRect(0,0,window.innerWidth,window.innerHeight);
}
