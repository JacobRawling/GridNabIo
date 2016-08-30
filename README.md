# GridNabIo

TODO:
  - Rewrite the server interaction:
    -Remove all reactionary updates (i.e change of score = ping)
    -Split player base in half
    -Every event loop alterante between each half, sending entire world as JSON objects
    -Client side: Add physics engine and replicate the server side


  - Add rooms to server?? 
    - Add new layer per room
    - Start with one room
    - GameObject stores what room they are server side


DONE:
  - Designed game a bit more, every player can shoot once, costs points to shoot.
  - Add ability for ships to get destroyed  
  - Add points for players
  - Remove bullets after set time  (limits range )
  - Scoreboard
  - Add AI ships to server
