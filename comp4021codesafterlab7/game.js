// The point and size class used in this program
function Point(x, y) {
    this.x = (x)? parseFloat(x) : 0.0;
    this.y = (y)? parseFloat(y) : 0.0;
}

function randomPoint(x, y) {
    var point = new Point()
    point.x = Math.floor(Math.random()* x );
    point.y = Math.floor(Math.random()* y );
    return point; 
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

Player.prototype.collidePortal = function(position) {

    
    var portal1 = svgdoc.getElementById("portal0");
    
    var x1 =  parseFloat(portal1.getAttribute("x"));
    var y1 =  parseFloat(portal1.getAttribute("y"));
    var w = 20;
    var h = 40;
    var pos1 = new Point(x1, y1);
    var size = new Size(w, h);

    var portal2 = svgdoc.getElementById("portal1");
    var x2 =  parseFloat(portal2.getAttribute("x"));
    var y2 =  parseFloat(portal2.getAttribute("y"));
    var pos2 = new Point(x2, y2);


    if (portal_active && intersect(position, PLAYER_SIZE, pos1, size)) {
        portal_active = false
        setTimeout("portal_active = true", PORTAL_INTERVAL);
       position.x = x2 + w +1 ; 
       position.y = y2 + h - PLAYER_SIZE.h;
    }
    if (portal_active && intersect(position, PLAYER_SIZE, pos2, size)) {
        portal_active = false
        setTimeout("portal_active = true", PORTAL_INTERVAL);
       position.x = x2 + w +1 ; 
       position.x = x1 + w +1;
       position.y = y1 + h - PLAYER_SIZE.h;
    }
}

Player.prototype.collideStar = function(position) {
    var stars = svgdoc.getElementById("stars");
    for (var i = 0; i < stars.childNodes.length; i++) {
        var node = stars.childNodes.item(i);
        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = 20;
        var h = 20;
        var pos = new Point(x, y);
        var size = new Size(w, h);

        if (intersect(position, PLAYER_SIZE, pos, size)) {
            score += 10 + (zoom_mode *20);      // bonus points for zoom mode
            svgdoc.getElementById("score").firstChild.data = score;

            stars.removeChild(node); 
       }
    }
    if (stars.childNodes.length == 0 ){
        //<use id="portal0" x = "560" y = "460" xlink:href = "#exit"/>
        var exit = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
        exit.setAttribute("x", 560);
        exit.setAttribute("y", 460);
        exit.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#exit");
        svgdoc.getElementById("exits").appendChild(exit);

    }
}

Player.prototype.collideExit = function(position) {
    var exits = svgdoc.getElementById("exits");
    if (exits.childNodes.length==0) {
        return;
    }

    var node = exits.firstChild;
    var x = 560;
    var y = 460;
    var w = 40;
    var h = 80;
    var pos = new Point(x, y);
    var size = new Size(w, h);

    if (intersect(position, PLAYER_SIZE, pos, size)) {
        score += level_num *100 + (zoom_mode *100);      // bonus points for zoom mode
        //update score
        score += time_left + (zoom_mode *time_left); 

        svgdoc.getElementById("score").firstChild.data = score;
        level_num ++;
        svgdoc.getElementById("level").firstChild.data = level_num;

        startNextLevel(position);
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
var PORTAL_INTERVAL = 500.0;                 // The period when portal is disabled

var MONSTER_SIZE = new Size(40, 60);        

var STAR_SIZE = new Size(40,40);

var MOVING_PLATFORM_TOP = 460;              // Y axis moving range of the moving platform
var MOVING_PLATFORM_DOWN = 520;

var TIME_LIMIT = 60;


// flags 
var canShoot = true;                        // A flag indicating whether the player can shoot a bullet
var portal_active = true;



//
// Variables in the game
//
var player_name = "Anonymous";
var motionType = {NONE:0, LEFT:1, RIGHT:2}; // Motion enum
var movingPlatformDirection = "UP";         // save the movement direction of the moving platform

var svgdoc = null;                          // SVG root document node
var player = null;                          // The player object
var gameInterval = null;                    // The interval
var zoom = 1.0;                             // The zoom level of the screen
var score = 0;                              

var level_num = 1;

var bullets_left = 8;                       // store numbers of bullets left to shoot
var bullets_directions = [];                // store bullets directions   

var monster_count;
var monster_max_amount;
var monsters_destination = [];
var monster_speed;

var star_max_amount = 6;

var zoom_mode = false;
var cheat_mode = false;

var game_timer;
var time_left;
var start = false;

//
// The load function for the SVG document
//
function load(evt) {



    // Set the root node to the global variable
    svgdoc = evt.target.ownerDocument;

    // Attach keyboard events
    svgdoc.documentElement.addEventListener("keydown", keydown, false);
    svgdoc.documentElement.addEventListener("keyup", keyup, false);

    svgdoc.getElementById("startScreen").setAttribute("style","visibility:hidden");

    // Remove text nodes in the 'platforms' group
    cleanUpGroup("platforms", true);

    // Create the player
    player = new Player();



    initGameVar();

    // get player name
    player_name =  prompt("What is your name?", "")
    if(player_name == "") {
        player_name = "Anonymous";
    }
    svgdoc.getElementById("player_name").firstChild.data = player_name;

    // Create the monsters
    createMonsters();

    // create stars
    createStars();

    // Start the game interval
    gameInterval = setInterval("gamePlay()", GAME_INTERVAL);

    //start game timer
    game_timer = setInterval("updatetime()", 1000);
}

function startNextLevel(position) {
    zoom = 1;
    updateScreen();
    // new level
    clearInterval(gameInterval);
    clearInterval(game_timer);
    cleanUpGroup("platforms", true);

    player.position = PLAYER_INIT_POS;
    position.x = PLAYER_INIT_POS.x;
    position.y = PLAYER_INIT_POS.y;
    
    level_num ++;
   
    time_left = TIME_LIMIT;
    bullets_left = 8;
    bullets_directions = [];
    
    zoom_mode = false;
    cheat_mode = false;

    clearMonsters();
    monster_count=0;
    monster_max_amount++;
    monsters_destination = [];
    monster_speed +=0.5;

    // Create the monsters
    createMonsters();

    // create stars
    createStars();

    // Start the game interval
    gameInterval = setInterval("gamePlay()", GAME_INTERVAL);
    //start game timer
    game_timer = setInterval("updatetime()", 1000);

}


// called every one second, end game when no time left
function updatetime() {
    time_left --;
    svgdoc.getElementById("time_left").firstChild.data = time_left + "sec";
    if(time_left==0){
        gameEnd();
    }

    // update the green bar's width( relate to time left)
    var green_bar = svgdoc.getElementById("time_bar");
    var bar_width = parseFloat(green_bar.getAttribute("width"));
    green_bar.setAttribute("width", 140 * ( time_left / TIME_LIMIT)) ;

}

// initialize game variable when load
function initGameVar(){
    time_left = TIME_LIMIT;
    score = 0;

    bullets_left = 8;
    bullets_directions = [];
    
    zoom_mode = false;
    cheat_mode = false;

    monster_count=0;
    monster_max_amount = 6;
    monster_speed=0.5;
    monsters_destination = [];
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


function clearMonsters() {
    var monsters = svgdoc.getElementById("monsters");
    for (var i = 0; i < monsters.length; i++) {
        monsters.removeChild(monsters[i]);
    }
}


function createMonsters(){
    for (var i = 0; i < monster_max_amount; i++) {
        var pt = randomPoint( SCREEN_SIZE.w - MONSTER_SIZE.w, 
        SCREEN_SIZE.h - MONSTER_SIZE.h);
        if( pt.x < PLAYER_INIT_POS.x + 100 ||
            pt.y > PLAYER_INIT_POS.y -100 ) {
            i--;
            continue;
        }
        createOneMonster(pt);
   }
}


//
// This function creates the monsters in the game
//
function createOneMonster(point) {
    var monster = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    var id = "mosnter" + monster_count;
    monster.setAttribute("x", point.x);
    monster.setAttribute("y", point.y);
    monster.setAttribute("id", id);
    monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
    svgdoc.getElementById("monsters").appendChild(monster);

    // set destination
    monsters_destination[id] = randomPoint( SCREEN_SIZE.w - MONSTER_SIZE.w, 
        SCREEN_SIZE.h - MONSTER_SIZE.h);
    monster_count++;
}


function createStars() {
    for (var i=0; i < star_max_amount; i++){
        var point = randomPoint(SCREEN_SIZE.w - STAR_SIZE.w, 
        SCREEN_SIZE.h - STAR_SIZE.h);
        
        if(starCollidePlatform(point)) {
            i--;
            continue;
        }

        var star = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
        star.setAttribute("x", point.x);
        star.setAttribute("y", point.y);
        star.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#star");
        svgdoc.getElementById("stars").appendChild(star);
    }
    
}


function starCollidePlatform(position) {
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

        if (intersect(position, STAR_SIZE, pos, size)) {
            return true;
        }
    }
    var node = svgdoc.getElementById("moving_platform");

    var x = parseFloat(node.getAttribute("x"));
    var y = parseFloat(node.getAttribute("y"));
    var w = parseFloat(node.getAttribute("width"));
    var h = parseFloat(node.getAttribute("height"));
    var pos = new Point(x, y);
    var size = new Size(w, h);

    if (intersect(position, PLAYER_SIZE, pos, size)) {
        return true;
    }
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
            gameEnd();
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

                score += 10 + (zoom_mode *30) ;      // bonus points for zoom mode
                svgdoc.getElementById("score").firstChild.data = score;
            }
        }
    }
}

// This function end the game and displat the highscore table
//
function gameEnd() {
// exit zoom mode
    zoom = 1;
    updateScreen();
    // game end
    clearInterval(gameInterval);
    clearInterval(game_timer);

    table = getHighScoreTable();

    var name = player_name; //change
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

function moveMonsters() {
    // Go through all monster
    var monster = svgdoc.getElementById("monsters");
    for (var i = 0; i < monster.childNodes.length; i++) {
        var node = monster.childNodes.item(i);

        // Update the position of the bullet
        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var id = node.getAttribute("id");

        if (monsters_destination[id].x < x) {
            node.setAttribute("x", x - monster_speed);
        } else  if (monsters_destination[id].x > x) { 
            node.setAttribute("x", x + monster_speed);
            // node.setAttribute("transform", "translate(" + MONSTER_SIZE.w + ", 0) scale(-1, 1)");        

        } 
        
        if (monsters_destination[id].y < y) {
            node.setAttribute("y", y - monster_speed);
        } else if (monsters_destination[id].y > y){ 
            node.setAttribute("y", y + monster_speed);
        } 

        if ((monsters_destination[id].y == y) && (monsters_destination[id].x == x))
         monsters_destination[id] = randomPoint( SCREEN_SIZE.w - MONSTER_SIZE.w, 
        SCREEN_SIZE.h - MONSTER_SIZE.h);
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

    // Check collision with portal
    player.collidePortal(position);
    player.collideStar(position);
    player.collideExit(position);


    // Set the location back to the player object (before update the screen)
    player.position = position;

    // Move the bullets
    moveBullets();

    moveMonsters();

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

    //update name position
    var name_tag = svgdoc.getElementById("player_name");
    name_tag.setAttribute("x", player.position.x);
    name_tag.setAttribute("y", player.position.y);

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