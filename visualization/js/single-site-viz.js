let img;
/*let imgX = 1713;
let imgY = 964;
let imgRatio = imgY/imgX;*/
let canvasX, canvasY;
let sideBarX;
let posPV, posBatX, posGridX,posCcX, posInvX

let pvWire,gridWire, loadWire, loadWireB, batWire, invWire, relayWire

let timeC

let weather

let showLabel = true;

//this is based on a 1000x562 (16:9) pixel window
let scaleIconsX, scaleIconsY;
let scaleIcons = 1;

function preload() {
  img = loadImage('assets/seinfeld.jpg');

  //move this to prediction script
  weather = loadTable('data/nyc-weather-aug2022-cleaned.csv', 'csv', 'header');
}

function setup() {
  let c = window.document.getElementById('p5-canvas')
  canvasX = c.clientWidth
  canvasY= c.clientHeight

  scaleIconsX = canvasX/1000;
  scaleIconsY = canvasY/562;

  scaleIcons = scaleIconsX;
  console.log(scaleIcons)

  posPV = { x: canvasX * .35, y: canvasY*.66};
  posCcX= canvasX * .5;
  posBatX = canvasX * .6;
  posInvX = canvasX * .7;
  posGridX = canvasX * .9;
  sideBarX = .2 * canvasX;

  let canvas = createCanvas(canvasX, canvasY);
  canvas.parent('p5-canvas');

  predictionSetup()

  //background(255)
  img.resize(canvasX-sideBarX,canvasY)

  pv = new PVModule(posPV.x,posPV.y,scaleIcons);
  pv.centerX(posPV.x);
  pv.centerY(posPV.y)
  pv.label = 'solar panel'

  outlet = new EdisonOutlet(posGridX,pv.center.y, scaleIcons);
  outlet.centerX(posGridX)
  outlet.centerY(pv.center.y)
  outlet.label = 'outlet'
  outlet.showLabelPosition="right"

  cc = new ChargeController(posCcX,pv.center.y, scaleIcons);
  cc.centerX(posCcX)
  cc.centerY(pv.center.y)
  cc.label = 'charge controller'
  cc.showLabelPosition = 'top'

  bat = new Battery(posBatX,pv.center.y, scaleIcons);
  bat.centerX(posBatX)
  bat.centerY(pv.center.y)
  bat.label = 'battery'

  inv = new Inverter(posInvX,pv.center.y, scaleIcons);
  inv.centerX(posInvX)
  inv.centerY(pv.center.y)
  inv.label='inverter'

  load = new Load(100,100, scaleIcons);
  load.centerX((inv.center.x + outlet.center.x) * .5);
  load.label = 'electrical load'
  load.showLabelPosition = 'right';

  relay = new Relay(100, 100, scaleIcons)
  relay.centerY((load.center.y+outlet.center.y)*.5)
  relay.centerX(load.center.x);
  relay.label = 'switch'
  relay.showLabelPosition='right'

  //from PV to CC
  pvWire = new Wire(pv.center.x,pv.center.y,cc.center.x,cc.center.y,-1,scaleIcons);
  //from CC to Bat
  batWire = new Wire(cc.center.x,cc.center.y,bat.center.x,bat.center.y,-1,scaleIcons);
  //from Bat to Inv
  invWire = new Wire(bat.center.x,bat.center.y,inv.center.x,inv.center.y,-1,scaleIcons)
  //grid to relay
  loadWire = new Wire(outlet.center.x,outlet.center.y,relay.center.x,relay.center.y,1,scaleIcons);
  //inv to load
  loadWireB = new Wire(inv.center.x,inv.center.y,relay.center.x,relay.center.y,-1, scaleIcons);
  loadWire.animate = 2
  relayWire = new Wire(relay.center.x,relay.center.y,load.center.x,load.center.y,1,scaleIcons)


  gridWire = new MultiWire({x:outlet.center.x,y:outlet.center.y},{x:cc.center.x,y:cc.center.y},[{x:outlet.center.x,y:outlet.center.y+100},{x:cc.center.x,y:cc.center.y+100}],1,scaleIcons)
  console.log(gridWire.allPoints)

  timeC = color(150,150,255);

}

function draw(){

  predictionLoop()
  //clock = millis()/500;
  //day = int(clock/24)+1;

  //background(200)

  image(img, sideBarX,0);

  //day light overlay
  //fill(0,0,0,map(min(abs(12-clock%24),6),0,6,50,120));
  fill(255,255,255,100);
  rect(sideBarX,0,canvasX,canvasY);

  //sidebar
  fill(150,100,200);
  rect(0,0,sideBarX,canvasY);

  /*if(participants[0].batPerc == 0){
    loadWireB.state = false
  } else {
    loadWireB.state = true
  }*/

  pvWire.draw()
  batWire.draw()
  invWire.draw()
  gridWire.draw()
  loadWire.draw()
  loadWireB.draw()
  relayWire.draw()

  pv.draw()
  bat.draw()
  cc.draw();
  outlet.draw();
  inv.draw();
  relay.draw();
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
    this.label = 'component'
    this.showLabel = true;
    this.showLabelPosition = 'bottom';//possible values are botton, top, left,right
    this.cost = 100;//dollar cost
    this.lifespan = 5; //life span in years
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

  get centerT(){
    return this.center;
  }

  drawLabel(){
    push()

      if(this.showLabel){
        noStroke();
        textSize(14* this.scale)
        textStyle(BOLD)
        if(this.showLabelPosition=='bottom'){
          textAlign(CENTER,TOP)
          for(let d=1; d>=0;d--){
            fill(255*d)
            text(this.label, this.w*.5+(d*1),this.h+10+(d*1))
          }
          
        } else if(this.showLabelPosition=='top'){
          textAlign(CENTER,BOTTOM)
          for(let d=1; d>=0;d--){
            fill(255*d)
            text(this.label, this.w*.5+(d*1),-10 + (d*1))
          }
          //text(this.label, this.w*.5,10)
        }  else if(this.showLabelPosition=='left'){
          textAlign(RIGHT,CENTER)
          for(let d=1; d>=0;d--){
            fill(255*d)
            text(this.label, -10+(d*1),this.h*.5+(d*1))
          }
          //text(this.label, -10,this.h*.5)
        }  else if(this.showLabelPosition=='right'){
          textAlign(LEFT,CENTER)
          for(let d=1; d>=0;d--){
            fill(255*d)
            text(this.label, this.w+10*.5+(d*1),this.h*.5+(d*1))
          }
          //text(this.label, this.w+10,this.h*.5)
        } 
      }
    pop();
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
    this.backSheetColor = color(255);
  }

  draw(){
    push();
      translate(this.x,this.y)

      //frame
      fill(200,200,255);
      rect(this.pFrame* -1,this.pFrame* -1, this.w + this.pFrame*2, this.h + this.pFrame * 2);
      //backsheet
      fill(this.backSheetColor)
      rect(0,0,this.w,this.h);

      //cells
      fill(0,0,200)
      for (let x = 0; x < this.pvAmtX ;x++){
        for(let y = 0; y<this.pvAmtY;y++){

          let cellX =(x*this.pD)+(this.pMarginX*(x+1))
          let cellY = (y*this.pD)+(this.pMarginY*(y+1))
          rect(cellX,cellY,this.pD,this.pD,5); 

        }
      }

      this.drawLabel();

    pop();
  }
}

class ChargeController extends Component{
  constructor(x,y,s){
    super(x,y,s);
    this.w = 50 * this.scale;
    this.h = 75 * this.scale;
    //this.center =  { x: this.x + (this.w * .5), y: this.y + (this.h * .5)};
    //this.center = this.setCenter();
    this.color = color(200)
  }

  draw(){

    push();
      translate(this.x,this.y)
      fill(this.color);
      rect(0,0,this.w,this.h);

      fill(50);
      rect(10,10,this.w-20,this.h*.25);

      for(let i=1;i<=6;i++){
        circle(i*(this.w/7),this.h-10,5)
      }

      this.drawLabel();

    pop();
  }

}

class Relay extends Component{
  constructor(x,y,s){
    super(x,y,s);
    this.w = 20 * this.scale;
    this.h = 30 * this.scale;
    //this.center =  { x: this.x + (this.w * .5), y: this.y + (this.h * .5)};
    //this.center = this.setCenter();
    this.color = color(50,200,50)
    this.state = false
  }

  draw(){

    push();
      translate(this.x,this.y)
      if(this.state){
        fill(this.color);
      } else {
        fill(200,50,50);
      }
      rect(0,0,this.w,this.h);

      if(this.state){
        textAlign(CENTER,BOTTOM);
        stroke(0);
        fill(200,200,200)
        rect(2,5,this.w-4,(this.h-10)*.5,2);
        stroke(0)
        text("I", this.w*.5, 5+(this.h*.5 -5))

      } else {
              textAlign(CENTER,TOP);

        stroke(0);
        fill(200,200,200)
        rect(2,this.h*.5,this.w-4,(this.h-10)*.5,2);
        stroke(0)
        text("O", this.w*.5, 5+(this.h*.5 -5))
      }
      this.drawLabel();
      
    pop();
  }

}

class Inverter extends Component{
  constructor(x,y,s){
    super(x,y,s);
    this.w = 75 * this.scale;
    this.h = 30 * this.scale;
    //this.center =  { x: this.x + (this.w * .5), y: this.y + (this.h * .5)};
    this.center = this.setCenter();
    this.color = color(100,255,100)
  }

  draw(){

    push();
      translate(this.x,this.y)
      fill(this.color);
      rect(0,0,this.w,this.h);

      fill(255,100,100)
      let tY =5*this.scale
      //terminal 1
      let t1Y = 2 * this.scale
      rect(-10,t1Y,10,tY)

      //terminal 2
      fill(120)
      let t2Y = this.h-t1Y-tY
      rect(-10,t2Y,10,tY)

      stroke(0)
      noFill();
      textAlign(CENTER,CENTER)
      text('DC/AC',this.w*.5,this.h*.5)
      this.drawLabel();

    pop();
  }

}

class Battery extends Component{
  constructor(x,y,s){
    super(x,y,s);
    this.w = 75 * this.scale;
    this.h = 50 * this.scale;
    this.status = 1.0
    this.color = color(200);
    this.statusColor = color(255,255,0);
  }

  draw(){

    push();
      translate(this.x,this.y)
      fill(this.color);
      rect(0,0,this.w,this.h);

      //status
      fill(this.statusColor);
      rect(3,this.h * (1-this.status),this.w-6,this.h * this.status -3)

      fill(230,230,255)
      //terminal 1
      let t1X = 5 * this.scale
      rect(t1X,0,t1X+(5*this.scale),-7*this.scale)

      //terminal 2
      let t2X = this.w-t1X
      rect(t2X,0,t1X*-2,-7*this.scale)
      this.drawLabel();
    pop();
  }

}

class SolarGenerator extends Battery{
  constructor(x,y,s){
    super(x,y,s);
    this.w = 100 * this.scale;
    this.h = 100 * this.scale;
  }

  draw(){

    push();
      translate(this.x,this.y)
      fill(this.color);
      rect(0,0,this.w,this.h);

      //status
      fill(255,255,0)
      rect(3,this.h * (1-this.status),this.w-6,this.h * this.status -3)

      fill(230,230,255)
      //terminal 1
      let t1X = 5 * this.scale
      rect(t1X,0,t1X+(5*this.scale),-7*this.scale)

      //terminal 2
      let t2X = this.w-t1X
      rect(t2X,0,t1X*-2,-7*this.scale)
      this.drawLabel();
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
    //this.center = this.setCenter();
    this.on = true;
    this.color = this.setColor();

  }

  draw(){
    
    this.setColor();

    push();

      translate(this.x,this.y)

      strokeWeight(5*this.scale)
      stroke(200,200,255)
      line(5*this.scale,6.5*this.scale,this.w-(5*this.scale),5*this.scale)
      line(5.5*this.scale,12*this.scale,this.w-(5.5*this.scale),10.5*this.scale)
      line(7*this.scale,17.5*this.scale,this.w-(7*this.scale),16*this.scale)

      fill(this.color);
      noStroke();

      circle(this.w*.5,this.h*-.4,this.h);
      
      fill(255)
      rect(0,0,this.w,this.h*.09,5);


      this.drawLabel();

    pop();
  }

  setColor(){
    if(this.on){
      this.color = color (255,255,0,230)
    } else {
      this.color = color(255,200)
    }
  }
}


class EdisonOutlet extends Component{
  constructor(x,y,s){
    super(x,y,s)
    this.w = 30 * this.scale;
    this.h = 50 * this.scale;
    //this.center = { x: this.x + (this.w * .5), y: this.y + (this.h * .5)};
    //this.center = this.setCenter();
    this.color = color (200,255,200)
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
      this.drawLabel();
    pop()
  }
  
}

class Wire{
  constructor(sX,sY,eX,eY, dir,scale){
    this.startX = sX;
    this.startY = sY;
    this.endX = eX;
    this.endY = eY;
    this.scale = scale;
    //1 is start to end, -1 is end to start
    this.direction = dir;
    this.wireThickness = Math.max(10 * this.scale,0);
    this.wireColor = color(0,0,0,255);
    this.distance=dist(this.startX,this.startY,this.endX,this.endY);
    this.height = this.startY - this.endY
    this.width = this.startX - this.endX
    this.state = true;
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

      if(this.state){
        for (let a = 0; a < 10;a++){
          let pointX=this.startX + (xUnit*a);
          let pointY=this.startY + ((this.endY - this.startY)/10)*a;


          if(int(clock/2) % 2 == 0 ){
            pointX = pointX + ((this.startX - this.endX) *.05);
            pointY = pointY + ((this.startY - this.endY) *.05);
          }
          
          push()
            translate(pointX, pointY)
            rotate(this.getRotation())
            //triangle(pointX, pointY, pointX+(tD* this.direction), pointY+tD,pointX+(tD* this.direction), pointY-tD)
            triangle(0,0, (tD* this.direction), tD,(tD* this.direction), -tD)
          pop()
        }
      }
      
    pop();
  }

  getRotation(){
    let a = this.height/this.distance

    if (this.width < 0){
      a = a * -1;
    }
    return a;
  }

}

class MultiWire extends Wire{
  constructor(s,e, mArray, dir,scale){
    super(s.x,s.y,e.x,e.y, dir,scale)
    this.start = { x: s.x, y: s.y}; //start point
    this.end = { x: e.x, y: e.y}; //end point
    this.midPoints = mArray;//all mid points
    this.allPoints = [this.start].concat(this.midPoints,[this.end]);
  }

  draw(){
    push()
      
      let tD = this.wireThickness * .3

      for (let mm=0;mm<this.allPoints.length-1; mm++){
        let sectionDist = dist(this.allPoints[mm].x,this.allPoints[mm].y,this.allPoints[mm+1].x,this.allPoints[mm+1].y);
        let sectionLength = abs(this.allPoints[mm].x - this.allPoints[mm+1].x)
        let sectionHeight = abs(this.allPoints[mm].y - this.allPoints[mm+1].y)

        let xDir, yDir

        if(this.allPoints[mm].x - this.allPoints[mm+1].x <= 0){
          xDir = 1;
        } else {
          xDir = -1;
        }

        if(this.allPoints[mm].y - this.allPoints[mm+1].y <= 0){
          yDir = 1;
        } else {
          yDir = -1;
        }

        //wire under shadow
        strokeWeight(this.wireThickness+2);
        stroke(255);
        line(this.allPoints[mm].x,this.allPoints[mm].y,this.allPoints[mm+1].x,this.allPoints[mm+1].y);

        strokeWeight(this.wireThickness);
        stroke(this.wireColor);
        line(this.allPoints[mm].x,this.allPoints[mm].y,this.allPoints[mm+1].x,this.allPoints[mm+1].y);

        strokeWeight(this.wireThickness*.1)
        stroke(255,0,0)
        fill(255,255,0)
      
      
        let arrowDist = 15
        let amtArrows = sectionDist/arrowDist

        if(this.state){
          for (let a = 0; a < sectionDist/arrowDist;a++){
            let pointX=this.allPoints[mm].x + xDir * ((sectionDist/amtArrows)*a);
            let pointY=this.allPoints[mm].y + yDir * ((sectionHeight/amtArrows)*a);
            //let pointY=this.allPoints[mm].y + ((this.allPoints[mm+1].y - this.allPoints[mm].y)/arrowDist)*a;


            if(int(clock/2) % 2 == 0 ){
              pointX=this.allPoints[mm].x + (xDir * ((sectionDist/amtArrows)*(a+.5)));
              pointY=this.allPoints[mm].y + (yDir * ((sectionHeight/amtArrows)*(a+.5)));
              /*pointX = pointX + ((this.startX - this.endX) *.05);
              pointY = pointY + ((this.startY - this.endY) *.05);*/
            }
            
            push()
              translate(pointX, pointY)
              rotate(this.getRotation(this.allPoints[mm],this.allPoints[mm+1]))
              //triangle(pointX, pointY, pointX+(tD* this.direction), pointY+tD,pointX+(tD* this.direction), pointY-tD)
              triangle(0,0, (tD* this.direction), tD,(tD* this.direction), -tD)
            pop()
          }
        }
      }
      
    pop();
  }

  getRotation(s,e){
    let sD = dist(s.x,s.y,e.x,e.y)

    let a = abs(s.y-e.y)/sD

    if (abs(s.x-e.x) < 0){
      a = a * -1;
    }
    return a;
  }
}