initialPosition = {x:0, y:0};
updatedPosition = {x:0, y:0};
pan = {x:0, y:0};
lastDrawPan = {x:0, y:0};

url = window.location.origin +"/light";
pixels = [];
size = 100;
isClicked = false;
isDragging = false;

borderSize = 5;
pixelSize = 10;

// TAB DEFAULTS
tabColors = ["#000000","#888888","#FFFFFF","#F94144","#F3722C","#F9C74F","#90BE6D","#43AA8B","#577590","#390099"]
tabCount = tabColors.length;
tabSelected = 0;
tabHovered = -1;
tabDefaultHeight = 50;
tabDefaultWidth = 80;
tabDefualtSpacing = 20;
tabDefualtCorner = 20;

// TAB LIVES
tabHeight = tabDefaultHeight;
tabWidth = tabDefaultWidth;
tabSpacing = tabDefualtSpacing;
tabCorner = tabDefualtCorner;

lastPixelTimestamp = 0;
delay = 2000;

//events
const evtSource = new EventSource("/light/updates");

function myFunction() {
    document.getElementById("demo").innerHTML = "Paragraph changed.";
}

function init() {
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");

    resizeCanvas();

    canvas.style.border = "5px solid black";

    canvas.addEventListener("mousedown",mouseDown);
    canvas.addEventListener("mouseup",mouseUp);
    canvas.addEventListener("mousemove",mouseMove);
    canvas.addEventListener("mouseout",mouseOut);
    window.addEventListener("resize", resizeCanvas);

    

    evtSource.onmessage = (event) => console.log(event.data);

    evtSource.addEventListener("pixel", (event) => {
        
        let data = JSON.parse(event.data);

        pixels[data.x][data.y] = data.color;        
    }) 


    initCanvas();
    fillCanvas();
}

function resizeCanvas(){
    canvas.width = window.innerWidth - 20;
    canvas.height = window.innerHeight - 20;

    tabHeight = tabDefaultHeight;
    tabWidth = tabDefaultWidth;
    tabSpacing = tabDefualtSpacing;
    tabCorner = tabDefualtCorner;

    if((tabSpacing+tabHeight)*tabCount > canvas.height){
        tabHeight = tabDefaultHeight/2;
        tabWidth = tabDefaultWidth/2;
        tabSpacing = tabDefualtSpacing/2;
        tabCorner = tabDefualtCorner/2;
    }
}

function initCanvas() {
    for(var i = 0; i < size; i++){
        let lst = []
        for(var ii = 0; ii < size; ii++){
            //No server data yet
            lst[ii] = "#000000";
        }
        pixels[i] = lst;
    }


    fetch(url+"/canvas", {
        method: "GET",
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then((response) => response.json())
    .then((json) => {
        pixels = json.grid;
        size = json.size;

        pan.x = canvas.width/2 - (size * pixelSize)/2;
        pan.y = canvas.height/2 - (size * pixelSize)/2;
    });
}

function clearCanvas() {
    context.fillStyle = "#EEEEEE";
    context.fillRect(0,0,canvas.width,canvas.height);
}

function fillCanvas() {
    clearCanvas();

    for(var i = 0; i < size; i++){
        for(var ii = 0; ii < size; ii++){
            context.fillStyle = pixels[i][ii];
            context.fillRect(pan.x + pixelSize*i, pan.y + pixelSize*ii,pixelSize,pixelSize);
        }
    }
    
}

function mouseDown(event) {
    console.log("mouse down");
    
    evtSource.close();

    initialPosition.x = event.clientX;
    initialPosition.y = event.clientY;
    updatedPosition.x = event.clientX;
    updatedPosition.y = event.clientY;

    isClicked = true;
    isDragging = false;
}

function mouseUp(event) {
    console.log("mouse up");

    if(isClicked){
        if(tabHovered != -1 && tabHovered >= 0 && tabHovered < tabCount) { //check if UI is in the way
            tabSelected = tabHovered;
        } else if(lastPixelTimestamp+delay <= Date.now()){ //process as a grid click
            let boundingRect = canvas.getBoundingClientRect();
        
            let mouseX = event.clientX - (pan.x + boundingRect.left + borderSize);
            let mouseY = event.clientY - (pan.y + boundingRect.top + borderSize);
            
            let gridX = Math.floor(mouseX / pixelSize);
            let gridY = Math.floor(mouseY / pixelSize);

            let paintColor = tabColors[tabSelected];

            if(gridX >= 0 && gridX < size && gridY >= 0 && gridY < size){
                
                pixels[gridX][gridY] = paintColor;

                
                fetch(url + "/canvas", {
                    method: "POST",
                    body: JSON.stringify({
                        x: gridX,
                        y: gridY,
                        color: paintColor
                    }),
                    headers: {
                        "Content-type": "application/json; charset=UTF-8"
                    }
                })
                .then((response) => response.json())
                .then((json) => {
                    pixels = json.grid;
                });
                

                lastPixelTimestamp = Date.now();
            }
        }
        
    }
    

    isDragging = false;
    isClicked = false;
}

function clampPan(){
    
    let cW = canvas.width;
    let cH = canvas.height;
    let gW = size * pixelSize * 0.5;
    let gH = size * pixelSize * 0.5;

    pan.x = Math.max(pan.x, 0 - gW);
    pan.x = Math.min(pan.x, cW - gW);

    pan.y = Math.max(pan.y, 0 - gH);
    pan.y = Math.min(pan.y, cH - gH);
}
function mouseMove(event) {
    let boundingRect = canvas.getBoundingClientRect();

    let mouseX = event.clientX - boundingRect.left + borderSize;
    let mouseY = event.clientY - boundingRect.top + borderSize;

    //console.log(event)
    if(isClicked){
        if(Math.abs(event.clientX - initialPosition.x) > 5 || Math.abs(event.clientY - initialPosition.y) > 5){
            isClicked = false;
            isDragging = true;
        }
    }
    if(isDragging){
        pan.x += event.clientX - updatedPosition.x;
        pan.y += event.clientY - updatedPosition.y;

        updatedPosition.x = event.clientX;
        updatedPosition.y = event.clientY;

        clampPan();
    }

    if(!isClicked && !isDragging){
        
        if(mouseY % (tabSpacing+tabHeight) >= tabSpacing && mouseX > (canvas.width - tabWidth)){
            
            tabHovered = Math.floor(mouseY / (tabSpacing+tabHeight));
        } else {
            tabHovered = -1;
        }
    }
}

function mouseOut(event) {
    console.log("mouse out");
    isDragging = false;
    isClicked = false;
}


function draw(){
    if(lastDrawPan.x != pan.x || lastDrawPan.y != pan.y){
        fillCanvas();

        for(var i = 0; i < tabCount; i++){
            let yPos = (tabSpacing + tabHeight) * i + tabSpacing;
            
            let shadowDrop = 0;
            let lightLift = 5;
            let lightShrink = 0;
            let dropperShrink = 2;

            let heightModifier = 0;
            let widthModifier = 0;
            if(i == tabHovered){
                shadowDrop = 2;
                lightLift += 3;
                lightShrink = 2;
            }
            if(i == tabSelected){
                yPos -= 5;
                heightModifier = 10;
                widthModifier = 10;
            }
            
            
            drawTab(yPos + shadowDrop, tabHeight+heightModifier,tabWidth+widthModifier,tabCorner,"#222222");
            drawTab(yPos - lightLift, tabHeight+heightModifier,tabWidth-lightShrink +widthModifier,tabCorner,"#666666");
            drawTab(yPos - (lightLift-dropperShrink),tabHeight-dropperShrink*2 + heightModifier,tabWidth-(dropperShrink+lightShrink) + widthModifier,tabCorner-2, tabColors[i]);
        }
        
    }

    drawTimer();

    window.requestAnimationFrame(draw);
}

function drawTab(yPos,height,width,corner,color){
    

    let outerX = canvas.width-width;
    let innerX = outerX+corner;
    
    let bottom = yPos + height;

    context.fillStyle = color;
    context.beginPath();
    context.moveTo(canvas.width,bottom);
    context.lineTo(innerX,bottom);
    context.arc(innerX,bottom-corner,corner, 0.5 * Math.PI, Math.PI);
    context.lineTo(outerX,yPos+corner);
    context.arc(innerX,yPos+corner,corner, Math.PI, 1.5 * Math.PI);
    context.lineTo(canvas.width,yPos);
    context.fill();
    //context.stroke();
}

function drawTimer(){
    let size = 50;
    let radius = 10;
    let sideLength = size - radius*2;
    let timePercent = -1;
    let xBase = 10;
    let yBase = 10;

    function drawBox(color,xPos,yPos){
        context.fillStyle = color;
        context.beginPath();
        context.moveTo(xPos+radius,yPos);
        context.lineTo(xPos+size-radius,yPos)
        context.arc(xPos+size-radius,yPos+radius,radius, 1.5 * Math.PI, 0);

        context.lineTo(xPos+size,yPos+size-radius);
        context.arc(xPos+size-radius,yPos+size-radius,radius, 0, 0.5 * Math.PI);

        context.lineTo(xPos+radius,yPos+size);
        context.arc(xPos+radius,yPos+size-radius,radius, 0.5 * Math.PI, 1 * Math.PI);

        context.lineTo(xPos,yPos+radius);
        context.arc(xPos+radius,yPos+radius,radius, 1 * Math.PI, 1.5 * Math.PI);
        context.fill();
    }
    

    
    if(lastPixelTimestamp+delay > Date.now()){
        timePercent = (lastPixelTimestamp+delay - Date.now()) / delay;
    }

    drawBox("#000000",xBase-1,yBase+3);
    drawBox("#00AAAA",xBase,yBase);

    context.fillStyle = "#000000";

    if(timePercent != -1){
        context.beginPath();
        context.moveTo(xBase+size/2,yBase+size/2);
        context.arc(xBase+size/2,yBase+size/2,15, 1.5 * Math.PI, (2*timePercent - 0.5) * Math.PI);
        context.fill();
    }
    
}
window.requestAnimationFrame(draw);
init();