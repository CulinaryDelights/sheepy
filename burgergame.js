var context = document.querySelector('canvas').getContext('2d');
context.canvas.width = 500;
context.canvas.height = 500;

var playerColorPicker = document.getElementById("playerColorPicker");
var playerExample = document.getElementById("playerExample");
var playerSavedColor = [];

class Entity {
    constructor(position,size,color,tag,type) {
        this.position = position;
        this.size = size;
        this.color = color;
        this.tag = tag;
        this.type = type;
    }

    Start() {

    }

    Update() {

    }
}

const entity_types = {
    RECTANGLE: "rectangle",
    HIDDEN: "hidden",
    TEXT: "text",
    IMAGE: "image",
};

function CollisionDetection(x,y,w,h,x2,y2,w2,h2) {
    if(x - w2 < x2 && x + w > x2 && y - h2 < y2 && y + h > y2) {
        return true;
    }
    return false;
}

//Checks where in an array a given entity is
function CheckArrayEntity(array,entity) {
    for(var i = 0; i < array.length; i++) {
        entityOn = array[i];
        if(entityOn == entity) {
            return i;
        }
    }
}

function RemoveEntity(entity) {
    entities.forEach(element => {
        if(element == entity) {
            entities.splice(CheckArrayEntity(entities,entity),1);
        }
    });
}

function AddEntity(entity,arrayPosition) {
    entity.Start();
    arrayPosition = arrayPosition || 0;
    entities.splice(arrayPosition, 0, entity);
}

entities = [];

function GameUpdate(progress) {
    entities.forEach(element => {
        element.Update()
    });
}

function GameRender() {
    context.fillStyle = "#202020";
    context.fillRect(0,0,canvas.width,canvas.height);   
    entities.forEach(element => {
        if(element.type == entity_types.RECTANGLE) {
            context.fillStyle = element.color;
            context.fillRect(element.position.x,element.position.y, element.size.x, element.size.y);
        }
        else if(element.type == entity_types.HIDDEN) {

        }
        else if(element.type == entity_types.TEXT) {
            context.font = String(element.fontSize) +  " " + element.font;
            context.fillStyle = element.textColor
            context.textAlign = element.textAlign;
            context.fillText(element.text,element.position.x,element.position.y);
        }
        else {
            console.error("Give " + element.constructor.name + " a type")
        }
    });
}

//Checks an array for 1 thing with a specific tag and returns it
function CheckArrayTag(array,tag) {
    for(var i = 0; i < array.length; i++) {
        entity = array[i];
        if(entity.tag == tag) {
            return entity;
        }
    }
}

//Checks an array for things with a specific tag and returns them in an array
function CheckArrayTags(array,tag) {
    entityList = [];

    for(var i = 0; i < array.length; i++) {
        entity = array[i];
        if(entity.tag == tag) {
            entityList.push(entity);
        }
    }
    return entityList;
}

class Vector2 {
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
}

class Player extends Entity {
    constructor(position) {
        super(position);
        this.size = new Vector2(30,30);
        this.color = JSON.parse(localStorage.getItem("playerColor")) || "blue";
        this.tag = "player";
        this.type = entity_types.RECTANGLE;
        this.speed = (this.size.x + this.size.y) / 20;
        this.horizontalDirection = 0
        this.verticalDirection = 0;
        this.growSpeed = 1.15;
        this.burgerList = [];
    }

    Update() {
        //Move
        this.position.x += this.horizontalDirection * this.speed;        
        this.position.y += this.verticalDirection * this.speed;  
        
        this.burgerList = CheckArrayTags(entities,"burger");

        this.burgerList.forEach(element => {  
            if(CollisionDetection(this.position.x,this.position.y,this.size.x,this.size.y,element.position.x,element.position.y,element.size.x,element.size.y)) {
                RemoveEntity(element);

                this.size.x *= this.growSpeed;
                this.size.y *= this.growSpeed;
            }
        });

        if(this.size.x >= context.canvas.width && this.size.y >= context.canvas.height) {
            CheckArrayTag(entities,"winscreen").type = entity_types.RECTANGLE;
        }
    }
}

class Text extends Entity {
    constructor(text, fontSize, textColor, font, textAlign, position) {
        super(position);
        this.type = entity_types.TEXT;
        this.fontSize = fontSize;
        this.tag = "text";
        this.text = text;
        this.textColor = textColor;
        this.textAlign = textAlign;
        this.font = font;
        this.textArray = CheckArrayTags(entities,"text");
    }

    Update() {
        
    }
}

class Burger extends Entity {
    constructor(position) {
        super(position);
        this.size = new Vector2(20,20);
        this.color = "tan";
        this.tag = "burger";
        this.type = entity_types.RECTANGLE;
    }
}

class Spawner extends Entity {
    constructor(position) {
        super(position);
        this.tag = "spawner";
        this.type = entity_types.HIDDEN;
    }

    Start() {
        setInterval(function() {
            AddEntity(new Burger(new Vector2(Math.floor(Math.random() * 500),Math.floor(Math.random() * 500))));
        }, 3000)
    }

    Update() {

    }
}

class WinScreen extends Entity {
    constructor(position) {
        super(position);
        this.size = new Vector2(context.canvas.width,context.canvas.height);
        this.tag = "winscreen";
        this.color = "goldenrod";
        this.type = entity_types.HIDDEN;
        this.addedText = false;
    }

    Start() {
        
    }

    Update() {
        if(this.type != entity_types.HIDDEN && this.addedText == false) {
            AddEntity(new Text("You Win!","5rem","black","Arial","center",new Vector2(250,250)),entities.length);
            this.addedText = true;
        }
    }
}

AddEntity(new WinScreen(new Vector2(0,0)),entities.length - 1);
AddEntity(new Player(new Vector2(200,200)));
AddEntity(new Spawner(new Vector2(0,0)));

function loop(timestamp) {
    var progress = timestamp - lastRender;

    GameUpdate(progress);
    GameRender();

    lastRender = timestamp;
    window.requestAnimationFrame(loop);
}
var lastRender = 0;
window.requestAnimationFrame(loop);

window.addEventListener('keydown',function(event) {
    var player = CheckArrayTag(entities,"player");
    if(event.key == "d") {
        player.horizontalDirection = 1;
    }
    if(event.key == "a") {
        player.horizontalDirection = -1;
    }
    if(event.key == "w") {
        directionPressed = "up";
        player.verticalDirection = -1;
    }
    if(event.key == "s") {
        player.verticalDirection = 1;
    }
});

window.addEventListener('keyup',function(event) {
    var player = CheckArrayTag(entities,"player");
    if(event.key == "d" || event.key == "a") {
        player.horizontalDirection = 0;
    }
    if(event.key == "s" || event.key == "w") {
        player.verticalDirection = 0;
    }
});


//HTML Stuff
playerExample.style.background = playerColorPicker.value;

playerColorPicker.oninput = function() {
    playerExample.style.background = playerColorPicker.value;
    playerSavedColor.splice(0,1);
    playerSavedColor.push(playerColorPicker.value);
}

playerSavedColor.splice(0,1);
playerSavedColor.push(playerColorPicker.value);

playerColorPicker.value = JSON.parse(localStorage.getItem("playerColor"));
playerExample.style.background = playerColorPicker.value;

function SavePlayerColor() {
    localStorage.setItem("playerColor",JSON.stringify(playerSavedColor));
    CheckArrayTag(entities,"player").color = JSON.parse(localStorage.getItem("playerColor"));
}