var can, ctx, cam, canSize;
var nodes=[];
var connections=[];
var keyStatuses=[];
var deltaTimer=performance.now()
var deltaTime = 0;
var frameTime = 0;
var mouseX=0;
var mouseY=0;
var fps = 60;
var NodeSize=3;
var conSize=2;
var zMin = 0.5;
var zMax = 3;
var sped = 5;
var keys="wasd";
var mOffsetX = 0;
var mOffsetY = 0;
var boundX = 500
var boundY = 500
var ratio = 16/9;
var canSizeMod = 100;
var gridSize = 100;
var fpsFont = "30px arial";


var nodeInfo=[
    0,0,5,
    10,10,10,
    -50,20,5,
    -100,-100,3,
    500,200,50
]

var connectionsInfo=[
    1,2,
    1,3,
    1,5,
    2,3,
    3,4
]

class node{
    constructor(x,y, thicc){
        this.connections=[];
        this.x=x;
        this.y=y;
        this.thicc=thicc;
        this.color="green";
    }
}

class connection{
    constructor(n1,n2) {
        this.node1=n1;
        this.node2=n2;
    }
}

class camera{
    constructor() {
        this.x=0;
        this.y=0;
        this.zoom=1;
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
}

function mousem(event){
    mouseX=event.clientX+mOffsetX;
    mouseY=event.clientY+mOffsetY;
}

function mousel(event){
    nodes[nodes.length] = new node(nodes[0].x,nodes[0].y, 10)
}

function mouser(event){
    
}

function pointerUpdate(){
    nodes[0].x=mouseX-cam.x;
    nodes[0].y=mouseY-cam.y;
}

function camMovement(){
    if(getKey("w")==1){
        cam.y+=sped/cam.zoom;
    }
    if(getKey("s")==1){
        cam.y-=sped/cam.zoom;
    }
    if(getKey("a")==1){
        cam.x+=sped/cam.zoom;
    }
    if(getKey("d")==1){
        cam.x-=sped/cam.zoom;
    }
    cam.x=Math.min(Math.max(cam.x,-boundX),boundX);
    cam.y=Math.min(Math.max(cam.y,-boundY),boundY);
    pointerUpdate();
}

function fixCanSize(){
    canSize=Math.min(window.innerWidth/ratio,window.innerHeight);
    canSize+canSizeMod;
    can.width=canSize*ratio;
    can.height=canSize;
    mOffsetX=-can.offsetWidth*0.5
    mOffsetY=-can.offsetHeight*0.5
}

function render(){
    ctx.clearRect(0,0,can.width,can.height);
    ctx.font=fpsFont;
    ctx.fillText("FPS: "+Math.round(fps),10,30)
    ctx.fillText("Usage%: "+Math.round(100*frameTime/deltaTime),10,60)
    ctx.strokeStyle="gray";
    ctx.beginPath()
    for(let i=-can.width+cam.x*cam.zoom;i<can.width*0.5;i+=gridSize*cam.zoom){
        ctx.moveTo(i+can.width*0.5, 0);
        ctx.lineTo(i+can.width*0.5, can.height);
    }
    ctx.stroke()
    for(let i=0;i<nodes.length;i++){
        let n=nodes[i];
        ctx.fillStyle=n.color;
        ctx.fill(circle(n, cam));
    }
}

function load(){
    can = document.getElementsByTagName("canvas")[0];
    ctx = can.getContext("2d");
    cam = new camera();
    document.addEventListener('resize', fixCanSize);
    document.addEventListener('keydown', keyd);
    document.addEventListener('keyup', keyu);
    can.addEventListener('mousemove', mousem);
    can.addEventListener('click', mousel);
    can.addEventListener('contextmenu', mouser);
    can.addEventListener("wheel", function(e) {
        cam.zoom-=0.1*Math.sign(e.deltaY);
        cam.zoom=Math.min(zMax,Math.max(zMin, cam.zoom))
    });
    for(let i=0; i<nodeInfo.length/NodeSize;i++){
        nodes[i]=new node(nodeInfo[i*NodeSize],nodeInfo[i*NodeSize+1],nodeInfo[i*NodeSize+2])
    }
    for(let i=0; i<connectionsInfo.length/conSize;i++){
        connections[i]= new connection(nodes[connectionsInfo[i*conSize]],nodes[connectionsInfo[i*conSize+1]])
    }
    for(let i=0; i<keys.length;i++){
        keyStatuses[i*2]=keys[i];
        keyStatuses[i*2+1]=0;
    }
    fixCanSize();
    frame();
}

function frame(){
    deltaTime= performance.now()-deltaTimer;
    fps = fps*0.9+100/deltaTime;
    deltaTimer=performance.now()
    camMovement();
    render();
    frameTime=performance.now()-deltaTimer
    requestAnimationFrame(frame);
}