let img;
let imgX = 1713;
let imgY = 964;
let imgRatio = imgY/imgX;
let infoBarY = 70
let canvasX = 1000;
let canvasY = canvasX* imgRatio;

let posPV = { x: 50, y: 100};
let posBatX = 425
let posGridX = 750

let pvWire,gridWire, loadWire;

let clock, timeC

function preload() {
  img = loadImage('assets/crownheights-googlemaps.png');
}

function setup() {

  createCanvas(canvasX,canvasY+infoBarY);
  background(255)
  img.resize(canvasX,canvasY)

  pv = new PVModule(posPV.x,posPV.y,2);

  outlet = new EdisonOutlet(posGridX,pv.center.y, 2);
  outlet.centerY(pv.center.y)

  bat = new Battery(posBatX,pv.center.y, 2);
  bat.centerY(pv.center.y)

  load = new Load(100,100, 2);
  load.centerX(outlet.center.x)

  pvWire = new Wire(pv.center.x,pv.center.y,bat.center.x,bat.center.y,-1);
  gridWire = new Wire(outlet.center.x,outlet.center.y,bat.center.x,bat.center.y,-1);
  loadWire = new Wire(outlet.center.x,outlet.center.y,load.center.x,load.center.y,-1);
  //loadWire.animate = 2

  timeC = color(150,150,255);

}

function draw(){

  //100ms viz = 1 hour irl
  clock = millis()/500;
  //new Date(year,month,day,hours)
  //console.log(1+it(clock/23));
  day = int(clock/24)+1;
  //hour = clock% 24;

  //background(200)

  image(img, 0,0);

  //day light overlay
  fill(0,0,0,map(min(abs(12-clock%24),6),0,6,50,120));
  rect(0,0,canvasX,canvasY);

  pvWire.draw()
  gridWire.draw()
  loadWire.draw()

  pv.draw()
  bat.draw()

  outlet.draw();

  load.draw();

  drawClock(canvasX-50,canvasY-50)

}

function drawKey(){
  let kY = 15;
  let kH = 25;
  let kX = 15;
  let kW = 145;

  push()
    textSize(14);
    strokeWeight(20);
    stroke(partC);
    line(kX,kY,kX+kW,kY);
    stroke(manuC);
    line(kX,kY+kH,kX+kW,kY+kH);
    stroke(autoC);
    line(kX,kY + (kH *2),kX+kW,kY + (kH *2));
    stroke(batC);
    line(kX,kY + (kH *3),kX+kW,kY + (kH *3));
    stroke(alertC);
    line(kX,kY + (kH *4),kX+kW,kY + (kH *4));
    stroke(alertC);
    line(kX,kY + (kH *5),kX+kW,kY + (kH *5));
    
    textStyle(NORMAL);
    textAlign(CENTER, CENTER);
    fill(0);
    noStroke();
    text("Tot Avg Participation Rate", kX+kW*.5, kY);
    text("Avg Manual Curtailment", kX+kW*.5, kY + kH);
    text("Avg Auto Replacement", kX+kW*.5, kY + (kH *2));
    text("Battery Percentage",kX+kW*.5, kY + (kH *3));
    text("Upcoming Event",kX+kW*.5, kY + (kH *4));
    text("! = Event Occurance",kX+kW*.5, kY + (kH *5));

    stroke(200,200,200);
    line(kX,kY + (kH *6),kX+kW,kY + (kH *6));
    fill(0);
    noStroke();
    if(predictMode){
      
      text("Prediction Mode On",kX+kW*.5, kY + (kH *6));
    } else {
      text("Prediction Mode Off",kX+kW*.5, kY + (kH *6));
    }
  pop()
}

function drawInfoBar(evF){
//progress bar parent box
  textSize(16);

  bW = canvasX-infoBarY;

  //width of each day within box
  dW = bW/daysInMonth[testMonth-1];

  fill(timeC);
  rect(0,canvasY,bW,canvasY+infoBarY);

  //progress bar
  if(evF){
    fill(alertC)
  } else {
    fill(elapsedTimeC)
  }
  stroke(0)
  rect(0,canvasY,(clock/24)*(bW/(daysInMonth[testMonth-1])),canvasY+infoBarY);

  //day ticks
  stroke(0)
  for (let t = 1; t <= daysInMonth[testMonth-1]; t++){
    tX = t*dW;
    line(tX, canvasY+infoBarY,tX,canvasY+infoBarY-20);
  }

  //TEXT
  noStroke();
  fill(0);
  text(date, 60, canvasY+25);
  //text("TIME: " + (millis()/1000), 100,canvasY+25);

  text("Average Network Participation Rate: " + getTotAvgParticipation() + "% ($" + getAvgIncome() + " per participant)", 400, canvasY+25);

  //draw event flag
  //check for past events
  for (let s of events){
    if (clock > s.startTotHour){
    //circle(int(s.startTotHour*(dW/24)),canvasY+infoBarY-20,15);
    push();
      textAlign(CENTER,CENTER);
      textSize(24);
      textStyle(BOLD);
      text("!",int(s.startTotHour*(dW/24)),canvasY+infoBarY-20);
    pop();
    }
  }

  drawWeather(dW);
  
}

function drawClock(cX,cY){
  push()
    stroke(0);
    fill(200);
    circle(cX,cY,60);
    fill(timeC);
    arc(cX,cY, 50, 50, -HALF_PI, (((clock% 24)/24)*TWO_PI)-HALF_PI);
  pop();
}



/**** NEW STUFF ***/
class Component{
  constructor(x,y,s){
    this.x = x;
    this.y = y;
    this.scale = s;
    this.w = 100 * this.scale;
    this.h = 100 * this.scale;
    this.center = this.setCenter();
    this.color = color(int(random(255)),int(random(255)),int(random(255)), 255);
  }

  centerX(x){
    this.x = this.x + (x - this.center.x)
    this.center = this.setCenter()
  }

  centerY(y){
    this.y = this.y + (y - this.center.y)
    this.center = this.setCenter()
  }

  setCenter(){
    return { x: this.x + (this.w * .5), y: this.y + (this.h * .5)};
  }

}

class PVModule extends Component{
  constructor(x,y,s){
    super(x,y,s)
    this.w = 100*this.scale;
    this.h = 210*this.scale;
    this.pvAmtX = 5;
    this.pMarginX = 2 * this.scale;
    this.pFrame = 3;
    this.pD = (this.w-(this.pMarginX*(this.pvAmtX+1))) / this.pvAmtX
    this.pvAmtY = int(this.h/this.pD);
    this.pMarginY = (this.h - (this.pD*this.pvAmtY))/(this.pvAmtY+1);
    this.center = this.setCenter();
  }

  draw(){
    push();
      translate(this.x,this.y)
      fill(200,200,255);
      rect(this.pFrame* -1,this.pFrame* -1, this.w + this.pFrame*2, this.h + this.pFrame * 2);
      fill(this.color)
      rect(0,0,this.w,this.h);

      fill(0,0,200)
      for (let x = 0; x < this.pvAmtX ;x++){
        for(let y = 0; y<this.pvAmtY;y++){

          let cellX =(x*this.pD)+(this.pMarginX*(x+1))
          let cellY = (y*this.pD)+(this.pMarginY*(y+1))
          rect(cellX,cellY,this.pD,this.pD,5); 

        }
      }

    pop();
  }
}

class Battery extends Component{
  constructor(x,y,s){
    super(x,y,s);
    this.w = 75 * this.scale;
    this.h = 50 * this.scale;
    //this.center =  { x: this.x + (this.w * .5), y: this.y + (this.h * .5)};
    this.center = this.setCenter();

  }

  draw(){

    push();
      translate(this.x,this.y)
      fill(this.color);
      rect(0,0,this.w,this.h);

      fill(230,230,255)
      //terminal 1
      let t1X = 5 * this.scale
      rect(t1X,0,t1X+(5*this.scale),-7*this.scale)

      //terminal 2
      let t2X = this.w-t1X
      rect(t2X,0,t1X*-2,-7*this.scale)
    pop();
  }

}

class Load extends Component{
  constructor(x,y,s){
    super(x,y,s);
    /*this.scale = scale;
    this.loadX = loadX;
    this.loadY = loadY;
    this.center = { x: this.x + (this.w * .5), y: this.y + (this.h * .5)};*/
    this.w = 25 * this.scale;
    this.h = 40 * this.scale;
    this.center = this.setCenter();

  }

  draw(){
    push();
      fill(this.color);
      noStroke();
      translate(this.x,this.y)
      rect(0,0,this.w,this.h*.1,5);

      circle(this.w*.5,this.h*-.4, this.h,this.h);
      strokeWeight(14)
      stroke(200,200,255)
      line(10,16,this.w-10,16)
      line(12,31,this.w-12,31)
      line(20,46,this.w-20,46)


    pop();
  }
}


class EdisonOutlet extends Component{
  constructor(x,y,s){
    super(x,y,s)
    this.w = 30 * this.scale;
    this.h = 50 * this.scale;
    //this.center = { x: this.x + (this.w * .5), y: this.y + (this.h * .5)};
    this.center = this.setCenter();

  }

  draw(){
    push()
      translate(this.x,this.y)

      fill(this.color);
      rect(0,0,this.w,this.h);

      rectMode(CENTER);
      fill(0);
      rect(this.w*.3,this.h*.3,this.w*.1,this.h*.25)
      rect(this.w*.7,this.h*.3,this.w*.1,this.h*.2)

      //circle(eW*.5, eH * .7,eW*.4)
      let p1 = { x: this.w*.35, y: this.h * .7 };
      let p2 = { x: this.w*.35, y: this.h * .7 - (this.h* .2) };
      let p3 = { x: this.w*.65, y: this.h * .7 - (this.h* .2) };
      let p4 = { x: this.w*.65, y: this.h * .7 };

      bezier(p1.x,p1.y,p2.x,p2.y,p3.x,p3.y,p4.x,p4.y)

      line(p1.x,p1.y,p4.x,p4.y )

      noFill();
      strokeJoin(ROUND)
      rect(this.w*.5,this.h*.5 -(this.h* .05),this.w*.7,p4.y, 15)
    pop()
  }
  
}

class Wire{
  constructor(sX,sY,eX,eY, dir){
    this.startX = sX;
    this.startY = sY;
    this.endX = eX;
    this.endY = eY;
    //1 is left to right, -1 is right to left
    this.direction = dir;
    this.wireThickness = 15;
    this.wireColor = color(0,0,0,255);
    this.distance=dist(this.startX,this.startY,this.endX,this.endY);
    this.animate = 1;
  }

  draw(){
    push()
      //wire under shadow
      strokeWeight(this.wireThickness+2);
      stroke(255);
      line(this.startX,this.startY,this.endX,this.endY);

      strokeWeight(this.wireThickness);
      stroke(this.wireColor);
      line(this.startX,this.startY,this.endX,this.endY);

      strokeWeight(this.wireThickness*.1)
      stroke(255,0,0)
      fill(255,255,0)


      let xUnit = (this.endX - this.startX )/10

      let tD = this.wireThickness * .3

      for (let a = 0; a < 10;a++){
        let pointX=this.startX + (xUnit*a);
        let pointY=this.startY + ((this.endY - this.startY)/10)*a;


        if(int(clock/2) % 2 == 0 ){
          pointX = pointX + ((this.startX - this.endX) *.05);
          pointY = pointY + ((this.startY - this.endY) *.05);
        }
        

        triangle(pointX, pointY, pointX+(tD* this.direction), pointY+tD,pointX+(tD* this.direction), pointY-tD)
      }
    pop();
  }



}