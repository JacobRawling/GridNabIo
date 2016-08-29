# GridNabIo

TODO:
  - Implement a ping pong system for messages
    >Death messages are require confimrations 

  - Fix Scoreboard that broke..??
  - Add rooms to server
    - Add new layer per room
    - Start with one room
    - GameObject stores what room they are server side
    - GameManager keeps rooms at 50 ppl



  - Design game a bit more:
    =Eat players in some capacity:
      -  Shoot claws instead of bullets?
      - players get gold, health function of gold


  - Add player side sprite display
    - i.e Sprite classes from previous projects use these to display nice ships + bullets

  - Add client side physics engine
      -Reduce how many times emit full world
      -Move over to a server written in Java netty-socketio seems to be apprioate

  - Handle player deaths a bit better
  ===Starship game====
  - So players are shooting each other > Means health
  - Gain different attacks:
    - Shot gun attack
    - Large Bullet attack
  - Or grow in size?
  - Different move peeds?
  - Different
  - Think they will be cute ships (look at free assets )

NOT WORKING:
  - Remove bullets when they hit the play area borders

DONE:
  - Add ability for ships to get destroyed  
  - Add points for players
  - Remove bullets after set time  (limits range )
  - Scoreboard
  - Add AI ships to server
