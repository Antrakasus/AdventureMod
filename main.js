var can, ctx, cam, canSize;
var nodes=[];
var connections=[];
var keyStatuses=[];
var selectedNodes=[];
var deltaTimer=performance.now()
var toolSelected = 0;
var deltaTime = 0;
var frameTime = 0;
var mouseX=0;
var mouseY=0;
var selectX=0;
var selectY=0;
var fps = 60;
var usage = 0.1;
var NodeSize=3;
var conSize=3;
var zMin = 0.5;
var zMax = 3;
var sped = 5;
var mOffsetX = 0;
var mOffsetY = 0;
var boundX = 500
var boundY = 500
var ratio = 16/9;
var canSizeMod = -100;
var gridSize = 25;
var fpsFont = "30px arial";
var cursorColor = "red"
var selectedOutlineThiccness = 2;
var selectedOutlineColour = "#85c9e9";
var selectorColor = "#8888ff55";
var clearColor = "darkgray";
var gridColor = "gray";
var gridWidth = 2;
var lineScale = 0.1;
var contextBackground = "black";
var contextSeparator = "gray";
var contextWidth = 300;
var contextTextOffsetL=10;
var toolHeight = 30;
var contextFont = "20px arial";
var contextFontColour = "gray";
var toolIgnoreIndex=3;


var tools=[
    "Nothing",
    "Select",
    "Menu",
    "Add",
    "Move",
    "Delete",
    "Resize",
    "Link",
    "Edit"
];

var keys=["w","a","s","d",
    "f","e","q",
    "ArrowUp","ArrowLeft","ArrowDown","ArrowRight"];

var nodeInfo=[
    0,0,5,
    10,10,10,
    -50,20,5,
    -100,-100,3,
    500,200,50
];

var connectionsInfo=[
    1,2,3,
    1,3,2,
    1,4,1,
    2,2,4,
    3,3,2
];

class node{
    constructor(x,y, thicc){
        this.x=x;
        this.y=y;
        this.thicc=thicc;
        this.color="green";
    }
}

class connection{
    constructor(n1,n2,t) {
        this.node1=n1;
        this.node2=n2;
        this.thicc=t;
    }
}

class camera{
    constructor() {
        this.x=0;
        this.y=0;
        this.zoom=1;
    }
}

function generateNodes(){
    let o=nodes.length;
    for(let i=0; i<nodeInfo.length/NodeSize;i++){
        nodes[o+i]=new node(nodeInfo[i*NodeSize],nodeInfo[i*NodeSize+1],nodeInfo[i*NodeSize+2])
    }
    o=connections.length;
    for(let i=0; i<connectionsInfo.length/conSize;i++){
        connections[o+i]= new connection(nodes[connectionsInfo[i*conSize]],nodes[connectionsInfo[i*conSize+1]],connectionsInfo[i*conSize+2])
    }
}

function getKey(key){
    return keyStatuses[keys.indexOf(key)+1];
}

function circle(node, camera){
    circ = new Path2D()
    circ.arc((node.x+camera.x)*camera.zoom+can.width*0.5,(node.y+camera.y)*camera.zoom+can.height*0.5,node.thicc*camera.zoom,0,2*Math.PI);
    return circ;
}

function keyu(event){
    if(keys.includes(event.key)){
        keyStatuses[keys.indexOf(event.key)+1]=0;
    }
}

function keyd(event){
    if(keys.includes(event.key)){
        keyStatuses[keys.indexOf(event.key)+1]=1;
    }
    if(event.key="f"&&selectedNodes.length<4){

    }
}

function mousem(event){
    mouseX=event.clientX+mOffsetX;
    mouseY=event.clientY+mOffsetY;
    if(event.buttons%8>=4){
        cam.x+=event.movementX/cam.zoom;
        cam.y+=event.movementY/cam.zoom;
        camMovement();
    }
}

function moused(event){
    if(event.button==0){
        if(!event.shiftKey){
            selectedNodes=[];
        }
        toolSelected=tools.indexOf("Select");
        selectX=nodes[0].x;
        selectY=nodes[0].y;
    }

    if(event.button==2){
        if(toolSelected==0){
            toolSelected=tools.indexOf("Menu");
            selectX=event.clientX;
            selectY=event.clientY;
        }else{
            toolSelected=0;
        }
    }
}

function mouseu(event){
    if(event.button==0){
        if(toolSelected==tools.indexOf("Select")){
            for(let i=1; i<nodes.length;i++){
                if(intersects(nodes[i],(nodes[0].x+selectX)*0.5,(nodes[0].y+selectY)*0.5,Math.abs(nodes[0].x-selectX),Math.abs(nodes[0].y-selectY))){
                    selectedNodes[selectedNodes.length]=nodes[i]
                }
            }
        }
        toolSelected=0;
    }
    
    if(event.button==2){
        
    }
    
}

function intersects(circle, rectx, recty, rectw, recth)
{
    let circleDistancex = Math.abs(circle.x - rectx);
    let circleDistancey = Math.abs(circle.y - recty);

    if (circleDistancex > (rectw/2 + circle.thicc)) { return false; }
    if (circleDistancey > (recth/2 + circle.thicc)) { return false; }

    if (circleDistancex <= (rectw/2)) { return true; } 
    if (circleDistancey <= (recth/2)) { return true; }

    let cornerDistance_sq = (circleDistancex - rectw/2)^2 +
                         (circleDistancey - recth/2)^2;

    return (cornerDistance_sq <= (circle.thicc^2));
}

function pointerUpdate(){
    nodes[0].x=mouseX/cam.zoom-cam.x;
    nodes[0].y=mouseY/cam.zoom-cam.y;
}

function camMovement(){
    if(getKey("ArrowUp")==1){
        cam.y+=sped/cam.zoom;
    }
    if(getKey("ArrowDown")==1){
        cam.y-=sped/cam.zoom;
    }
    if(getKey("ArrowLeft")==1){
        cam.x+=sped/cam.zoom;
    }
    if(getKey("ArrowRight")==1){
        cam.x-=sped/cam.zoom;
    }
    cam.x=Math.min(Math.max(cam.x,-boundX),boundX);
    cam.y=Math.min(Math.max(cam.y,-boundY),boundY);
    pointerUpdate();
}

function fixCanSize(){
    canSize=Math.min(window.innerWidth/ratio,window.innerHeight);
    canSize+=canSizeMod;
    can.width=canSize*ratio;
    can.height=canSize;
    mOffsetX=-can.offsetWidth*0.5
    mOffsetY=-can.offsetHeight*0.5
}

function render(){
    ctx.rect(0,0,can.width,can.height);
    ctx.fillStyle=clearColor;
    ctx.fill();
    ctx.strokeStyle=gridColor;
    ctx.beginPath();
    for(let i=0; i<=can.width/gridSize/cam.zoom*2;i++){
        let x;
        if(i%2==0){
            x = i*gridSize*cam.zoom;
        }else{
            x = -(i+1)*gridSize*cam.zoom;
        }
        ctx.moveTo(x+can.width*0.5+cam.x*cam.zoom, 0);
        ctx.lineTo(x+can.width*0.5+cam.x*cam.zoom, can.height);
    }
    for(let i=0; i<=can.height/gridSize/cam.zoom*2;i++){
        let y;
        if(i%2==0){
            y = i*gridSize*cam.zoom;
        }else{
            y = -(i+1)*gridSize*cam.zoom;
        }
        ctx.moveTo(0, y+can.height*0.5+cam.y*cam.zoom);
        ctx.lineTo(can.width, y+can.height*0.5+cam.y*cam.zoom);
    }
    ctx.stroke();
    ctx.fillStyle=selectedOutlineColour;
    for(let i=0; i<selectedNodes.length;i++){
        let n=selectedNodes[i];
        n=new node(n.x,n.y,n.thicc+selectedOutlineThiccness);
        ctx.fill(circle(n, cam));
    }
    ctx.strokeStyle="black"
    for(let i=0;i<connections.length;i++){
        let c=connections[i];
        ctx.beginPath();
        ctx.moveTo((cam.x+c.node1.x)*cam.zoom+can.width*0.5,(cam.y+c.node1.y)*cam.zoom+can.height*0.5);
        ctx.lineTo((cam.x+c.node2.x)*cam.zoom+can.width*0.5,(cam.y+c.node2.y)*cam.zoom+can.height*0.5);
        ctx.lineWidth=(c.node1.thicc+c.node2.thicc)*cam.zoom*lineScale;
        ctx.stroke();
    }
    
    for(let i=1;i<nodes.length;i++){
        let n=nodes[i];
        ctx.fillStyle=n.color;
        ctx.fill(circle(n, cam));
    }
    if(toolSelected==tools.indexOf("Select")){
        ctx.fillStyle=selectorColor;
        ctx.rect(Math.min((selectX+cam.x)*cam.zoom,mouseX)+can.width*0.5,Math.min((selectY+cam.y)*cam.zoom,mouseY)+can.height*0.5,Math.abs(mouseX-(selectX+cam.x)*cam.zoom),Math.abs(mouseY-(selectY+cam.y)*cam.zoom));
        ctx.fill();
    }
    ctx.font=fpsFont;
    ctx.fillStyle="darkblue";
    ctx.fillText("FPS: "+Math.round(fps),10,30)
    ctx.fillText("Usage%: "+Math.round(100*usage),10,60)
    if(toolSelected==tools.indexOf("Menu")){
        ctx.fillStyle=contextBackground;
        ctx.fillRect((selectX+cam.x)*cam.zoom,(selectY-cam.y)*cam.zoom+can.width*0.5,contextWidth, toolHeight*tools.length);
        ctx.stroke();
        ctx.font=contextFont;
        ctx.fillStyle=contextFontColour;
        for(let i=0;i<tools.length-toolIgnoreIndex;i++){
            ctx.fillText(tools[i+toolIgnoreIndex],(selectX-cam.x)*cam.zoom+can.width*0.5+contextTextOffsetL,(selectY+cam.y+i*toolHeight)*cam.zoom);
        }
    }
    
    ctx.fillStyle=cursorColor;
    ctx.fill(circle(nodes[0], cam));
}

function load(){
    can = document.getElementsByTagName("canvas")[0];
    ctx = can.getContext("2d");
    cam = new camera();
    window.addEventListener("beforeunload", (event) => {
        event.returnValue = true;
      });
    window.addEventListener('resize', fixCanSize);
    window.addEventListener('keydown', keyd);
    window.addEventListener('keyup', keyu);
    window.addEventListener('mousemove', mousem);
    can.addEventListener('mousedown', moused);
    can.addEventListener('mouseup', mouseu);
    can.addEventListener("wheel", function(e) {
        cam.zoom-=0.1*Math.sign(e.deltaY);
        cam.zoom=Math.min(zMax,Math.max(zMin, cam.zoom))
    });
    generateNodes();
    for(let i=0; i<keys.length;i++){
        keyStatuses[i*2]=keys[i];
        keyStatuses[i*2+1]=0;
    }
    nodes[0].color="red"
    fixCanSize();
    frame();
}

function frame(){
    if(fps>6000||usage>1){
        fps=60;
        usage=0.1;
    }
    deltaTime= performance.now()-deltaTimer;
    fps = fps*0.9+100/deltaTime;
    usage = usage*0.9+frameTime/deltaTime*0.1;
    deltaTimer=performance.now()
    camMovement();
    render();
    frameTime=performance.now()-deltaTimer
    requestAnimationFrame(frame);
}