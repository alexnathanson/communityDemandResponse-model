let img;
let imgX = 1713;
let imgY = 964;
let imgRatio = imgY/imgX;
let canvasX = 1000;
let canvasY = canvasX* imgRatio;

let amtP  = 10;
let pPos = [];

function preload() {
  img = loadImage('assets/crownheights-googlemaps.png');
}

function setup() {
  createCanvas(canvasX,canvasY+50);
  background(153)
  img.resize(canvasX,canvasY)

  //place circles
   for (let p =0;p<amtP;p++){
    pPos.push([random(canvasX),random(canvasY)]);
  }
}

function draw(){
  background(153);
  image(img, 0,0);

  fill(255);
  for (let p =0;p<amtP;p++){
    circle(pPos[p][0],pPos[p][1],(millis()%10000)*.01);
  }

  //progress bar
  fill(255,0,0)
  rect(0,canvasY,canvasX*.5,canvasY+25);

    fill(0);
  text("DAY: ", 20, canvasY+25);
  text("TIME: " + (millis()/1000), 100,canvasY+25);
  text("AVG Participation Rate: ", 400, canvasY+25);
}