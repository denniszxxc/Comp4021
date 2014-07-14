// The point and size class used in this program
function Point(x, y) {
    this.x = (x)? parseFloat(x) : 0.0;
    this.y = (y)? parseFloat(y) : 0.0;
}

function Size(w, h) {
    this.w = (w)? parseFloat(w) : 0.0;
    this.h = (h)? parseFloat(h) : 0.0;
}

// Helper function for checking intersection between two rectangles
function intersect(pos1, size1, pos2, size2) {
    return (pos1.x < pos2.x + size2.w && pos1.x + size1.w > pos2.x &&
            pos1.y < pos2.y + size2.h && pos1.y + size1.h > pos2.y);
}


// The player class used in this program
function Player() {
    this.node = svgdoc.getElementById("player");
    this.position = PLAYER_INIT_POS;
    this.motion = motionType.NONE;
    this.verticalSpeed = 0;
    this.face_direction = "RIGHT";
}

Player.prototype.isOnPlatform = function() {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));

        if (((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) ||
             ((this.position.x + PLAYER_SIZE.w) == x && this.motion == motionType.RIGHT) ||
             (this.position.x == (x + w) && this.motion == motionType.LEFT)) &&
            this.position.y + PLAYER_SIZE.h == y) return true;
    }

    if (this.position.y + PLAYER_SIZE.h == SCREEN_SIZE.h) return true;

    return false;
}

Player.prototype.isOnMovingPlatform = function() {
     // check moving platform
    var node = svgdoc.getElementById("moving_platform");

    var x = parseFloat(node.getAttribute("x"));
    var y = parseFloat(node.getAttribute("y"));
    var w = parseFloat(node.getAttribute("width"));
    var h = parseFloat(node.getAttribute("height"));

    if (((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) ||
         ((this.position.x + PLAYER_SIZE.w) == x && this.motion == motionType.RIGHT) ||
         (this.position.x == (x + w) && this.motion == motionType.LEFT)) &&
            ((this.position.y + PLAYER_SIZE.h == y + VERTICAL_DISPLACEMENT) ||
            (this.position.y + PLAYER_SIZE.h == y - VERTICAL_DISPLACEMENT) ||
            (this.position.y + PLAYER_SIZE.h == y )) ) return true; 
            // check platform future Y position 
}

Player.prototype.collidePlatform = function(position) {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;
        if (node.getAttribute("id") == "moving_platform") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);

        if (intersect(position, PLAYER_SIZE, pos, size)) {
            position.x = this.position.x;
            if (intersect(position, PLAYER_SIZE, pos, size)) {
                if (this.position.y >= y + h)
                    position.y = y + h;
                else
                    position.y = y - PLAYER_SIZE.h;
                this.verticalSpeed = 0;
            }
        }
    }
}

Player.prototype.collideMovePlatform = function(position) {
    var node = svgdoc.getElementById("moving_platform");

    var x = parseFloat(node.getAttribute("x"));
    var y = parseFloat(node.getAttribute("y"));
    var w = parseFloat(node.getAttribute("width"));
    var h = parseFloat(node.getAttribute("height"));
    var pos = new Point(x, y);
    var size = new Size(w, h);

    if (intersect(position, PLAYER_SIZE, pos, size)) {
        if(movingPlatformDirection == "UP"){
            position.y -= VERTICAL_DISPLACEMENT;
        } else {
            position.y += VERTICAL_DISPLACEMENT;
        }
        if (intersect(position, PLAYER_SIZE, pos, size)) {
            position.x = this.position.x;
        }
        if (intersect(position, PLAYER_SIZE, pos, size)) {
            if (this.position.y >= y + h)
                position.y = y + h;
            else
                position.y = y - PLAYER_SIZE.h;
            this.verticalSpeed = 0;
        }
    } 

}



Player.prototype.collideScreen = function(position) {
    if (position.x < 0) position.x = 0;
    if (position.x + PLAYER_SIZE.w > SCREEN_SIZE.w) position.x = SCREEN_SIZE.w - PLAYER_SIZE.w;
    if (position.y < 0) {
        position.y = 0;
        this.verticalSpeed = 0;
    }
    if (position.y + PLAYER_SIZE.h > SCREEN_SIZE.h) {
        position.y = SCREEN_SIZE.h - PLAYER_SIZE.h;
        this.verticalSpeed = 0;
    }
}


//
// Below are constants used in the game
//
var PLAYER_SIZE = new Size(40, 75);         // The size of the player
var SCREEN_SIZE = new Size(600, 560);       // The size of the game screen
var PLAYER_INIT_POS  = new Point(0, 420);   // The initial position of the player

var MOVE_DISPLACEMENT = 5;                  // The speed of the player in motion
var JUMP_SPEED = 15;                        // The speed of the player jumping
var VERTICAL_DISPLACEMENT = 1;              // The displacement of vertical speed

var GAME_INTERVAL = 25;                     // The time interval of running the game

var BULLET_SIZE = new Size(10, 10);         // The speed of a bullet
var BULLET_SPEED = 10.0;                    // The speed of a bullet
                                            //  = pixels it moves each game loop
var SHOOT_INTERVAL = 200.0;                 // The period when shooting is disabled
var canShoot = true;                        // A flag indicating whether the player can shoot a bullet

var MONSTER_SIZE = new Size(40, 60);        // The speed of a bullet

var MOVING_PLATFORM_TOP = 460;              // Y axis moving range of the moving platform
var MOVING_PLATFORM_DOWN = 520;

//
// Variables in the game
//
var motionType = {NONE:0, LEFT:1, RIGHT:2}; // Motion enum
var movingPlatformDirection = "UP";         // save the movement direction of the moving platform

var svgdoc = null;                          // SVG root document node
var player = null;                          // The player object
var gameInterval = null;                    // The interval
var zoom = 1.0;                             // The zoom level of the screen
var score = 0;                              

var bullets_left = 8;                       // store numbers of bullets left to shoot
var bullets_directions = [];                // store bullets directions   

var zoom_mode = false;
var cheat_mode = false;

//
// The load function for the SVG document
//
function load(evt) {
    // Set the root node to the global variable
    svgdoc = evt.target.ownerDocument;

    // Attach keyboard events
    svgdoc.documentElement.addEventListener("keydown", keydown, false);
    svgdoc.documentElement.addEventListener("keyup", keyup, false);

    // Remove text nodes in the 'platforms' group
    cleanUpGroup("platforms", true);

    // Create the player
    player = new Player();

    // Create the monsters
    createMonster(200, 15);
    createMonster(500, 500);

    // Start the game interval
    gameInterval = setInterval("gamePlay()", GAME_INTERVAL);
}


//
// This function removes all/certain nodes under a group
//
function cleanUpGroup(id, textOnly) {
    var node, next;
    var group = svgdoc.getElementById(id);
    node = group.firstChild;
    while (node != null) {
        next = node.nextSibling;
        if (!textOnly || node.nodeType == 3) // A text node
            group.removeChild(node);
        node = next;
    }
}


//
// This function creates the monsters in the game
//
function createMonster(x, y) {
    var monster = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    monster.setAttribute("x", x);
    monster.setAttribute("y", y);
    monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
    svgdoc.getElementById("monsters").appendChild(monster);
}


//
// This function shoots a bullet from the player
//
function shootBullet() {
    // disable shooting when no bullets left
    if ( !cheat_mode && bullets_left <=0 ){
        return;
    }

    // Disable shooting for a short period of time
    canShoot = false;
    setTimeout("canShoot = true", SHOOT_INTERVAL);

    // Create the bullet using the use node
    var bullet = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    bullet.setAttribute("x", player.position.x + PLAYER_SIZE.w / 2 - BULLET_SIZE.w / 2);
    bullet.setAttribute("y", player.position.y + PLAYER_SIZE.h / 2 - BULLET_SIZE.h / 2);
    bullet.setAttribute("id", "bullet"+ (bullets_left-8));

    bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");
    svgdoc.getElementById("bullets").appendChild(bullet);

    // store moving direction
    bullets_directions["bullet"+ (bullets_left-8)] = player.face_direction;

    //update bullets left
    bullets_left -=1;
    svgdoc.getElementById("bullets_left").firstChild.data = bullets_left;

}


//
// This is the keydown handling function for the SVG document
//
function keydown(evt) {
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "A".charCodeAt(0):
            player.motion = motionType.LEFT;
            player.face_direction = "LEFT";
            break;

        case "D".charCodeAt(0):
            player.motion = motionType.RIGHT;
            player.face_direction = "RIGHT";
            break;

        case "W".charCodeAt(0):
            if (player.isOnPlatform() || player.isOnMovingPlatform()) {
                player.verticalSpeed = JUMP_SPEED;
            }
            break;
        case "C".charCodeAt(0):
            cheat_mode = true;
            svgdoc.getElementById("bullets_left").firstChild.data = "Cheat mode";
            break;
        case "V".charCodeAt(0):
            cheat_mode = false;
            if(bullets_left >= 0){
                svgdoc.getElementById("bullets_left").firstChild.data = bullets_left;
            } else {
                svgdoc.getElementById("bullets_left").firstChild.data = 0;   

            }
            break;

        case 32:
            if (canShoot) shootBullet();
            break;
    }
}


//
// This is the keyup handling function for the SVG document
//
function keyup(evt) {
    // Get the key code
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "A".charCodeAt(0):
            if (player.motion == motionType.LEFT) player.motion = motionType.NONE;
            break;

        case "D".charCodeAt(0):
            if (player.motion == motionType.RIGHT) player.motion = motionType.NONE;
            break;
    }
}


//
// This function checks collision
//
function collisionDetection() {
    // Check whether the player collides with a monster
    var monsters = svgdoc.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {
        var monster = monsters.childNodes.item(i);
        var x = parseInt(monster.getAttribute("x"));
        var y = parseInt(monster.getAttribute("y"));

        // player die
        if (!cheat_mode && intersect(new Point(x, y), MONSTER_SIZE, player.position, PLAYER_SIZE)) {
            // exit zoom mode
            zoom = 1;
            updateScreen();
            // game end
            clearInterval(gameInterval);

            table = getHighScoreTable();

            var name = prompt("What is your name?", ""); //change
            var record = new ScoreRecord(name, score);

            var pos = table.length;
            for (var i = 0; i < table.length; i++) {
				if (record.score > table[i].score) {
					pos = i;
					break;
				}
			}
			table.splice(pos, 0, record);

			setHighScoreTable(table);
			showHighScoreTable(table);
			return;
        }
    }

    // Check whether a bullet hits a monster
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var bullet = bullets.childNodes.item(i);
        var x = parseInt(bullet.getAttribute("x"));
        var y = parseInt(bullet.getAttribute("y"));

        for (var j = 0; j < monsters.childNodes.length; j++) {
            var monster = monsters.childNodes.item(j);
            var mx = parseInt(monster.getAttribute("x"));
            var my = parseInt(monster.getAttribute("y"));

            if (intersect(new Point(x, y), BULLET_SIZE, new Point(mx, my), MONSTER_SIZE)) {
                monsters.removeChild(monster);
                j--;
                bullets.removeChild(bullet);
                i--;

                score += 10 * (zoom_mode *2) ;      // bonus points for zoom mode
                svgdoc.getElementById("score").firstChild.data = score;
            }
        }
    }
}


//
// This function updates the position of the bullets
//
function moveBullets() {
    // Go through all bullets
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var node = bullets.childNodes.item(i);

        // Update the position of the bullet
        var x = parseInt(node.getAttribute("x"));
        var id = node.getAttribute("id");
        if (bullets_directions[id] == "RIGHT") {
            node.setAttribute("x", x + BULLET_SPEED);
        } else if (bullets_directions[id] == "LEFT"){
            node.setAttribute("x", x - BULLET_SPEED);
        }

        // If the bullet is not inside the screen delete it from the group
        if (x > SCREEN_SIZE.w || x < 0 ) {
            bullets.removeChild(node);
            delete bullets_directions[i];
            for(var k = i; k < bullets_directions.length; k++){
                bullets_directions[k] = bullets_directions[k + 1]; 
            }
            i--;
        }
    }
}

// This function update tht position of the moving platform
function movePlatform(position) {
    var platform = svgdoc.getElementById("moving_platform");
    var y = parseInt(platform.getAttribute("y"));
    
    if(movingPlatformDirection=="UP"){
        // move up 
        platform.setAttribute("y",y - VERTICAL_DISPLACEMENT);
        //move player if ontop
        if(player.isOnMovingPlatform()){
            position.y -= VERTICAL_DISPLACEMENT;
        }
    } else if (movingPlatformDirection == "DOWN") {
        // move down
        platform.setAttribute("y",y + VERTICAL_DISPLACEMENT);
        //move player if ontop
        if(player.isOnMovingPlatform()){
            position.y += VERTICAL_DISPLACEMENT;
        }
    }

    if ( y < MOVING_PLATFORM_TOP) {
        movingPlatformDirection = "DOWN";
    }

    if ( y > MOVING_PLATFORM_DOWN) {
        movingPlatformDirection = "UP";
    }

}


//
// This function updates the position and motion of the player in the system
//
function gamePlay() {
    // Check collisions
    collisionDetection();

    // Check whether the player is on a platform
    var isOnPlatform = player.isOnPlatform();

    // Update player position
    var displacement = new Point();

    // Move left or right
    if (player.motion == motionType.LEFT)
        displacement.x = -MOVE_DISPLACEMENT;
    if (player.motion == motionType.RIGHT)
        displacement.x = MOVE_DISPLACEMENT;

    // Fall
    if (!isOnPlatform && player.verticalSpeed <= 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
    }

    // Jump
    if (player.verticalSpeed > 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
        if (player.verticalSpeed <= 0)
            player.verticalSpeed = 0;
    }

    // Get the new position of the player
    var position = new Point();
    position.x = player.position.x + displacement.x;
    position.y = player.position.y + displacement.y;

    // Check collision with platforms and screen
    player.collidePlatform(position);
    player.collideScreen(position);
    player.collideMovePlatform(position);

    // Set the location back to the player object (before update the screen)
    player.position = position;

    // Move the bullets
    moveBullets();

    movePlatform(player.position);

    updateScreen();
}


//
// This function updates the position of the player's SVG object and
// set the appropriate translation of the game screen relative to the
// the position of the player
//
function updateScreen() {
    // Update player face direction and position 
    if (player.face_direction == "LEFT" ) {
        player.node.setAttribute("transform", "translate(" + player.position.x + "," + player.position.y + ")" + "translate("  +PLAYER_SIZE.w + ", 0) scale(-1, 1)");        
    } else {
        player.node.setAttribute("transform", "translate(" + player.position.x + "," + player.position.y + ")");

    }

    // Calculate the scaling and translation factors
    var scale = new Point(zoom, zoom);
    var translate = new Point();

    translate.x = SCREEN_SIZE.w / 2.0 - (player.position.x + PLAYER_SIZE.w / 2) * scale.x;
    if (translate.x > 0)
        translate.x = 0;
    else if (translate.x < SCREEN_SIZE.w - SCREEN_SIZE.w * scale.x)
        translate.x = SCREEN_SIZE.w - SCREEN_SIZE.w * scale.x;

    translate.y = SCREEN_SIZE.h / 2.0 - (player.position.y + PLAYER_SIZE.h / 2) * scale.y;
    if (translate.y > 0)
        translate.y = 0;
    else if (translate.y < SCREEN_SIZE.h - SCREEN_SIZE.h * scale.y)
        translate.y = SCREEN_SIZE.h - SCREEN_SIZE.h * scale.y;

    // Transform the game area
    svgdoc.getElementById("gamearea").setAttribute("transform", "translate(" + translate.x + "," + translate.y + ") scale(" + scale.x + "," + scale.y + ")");
}


//
// This function sets the zoom level to 2
//
function setZoom() {
    zoom = 2.0;
    zoom_mode = true;
}