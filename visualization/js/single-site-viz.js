//get model settings from query string
const urlParams = new URLSearchParams(location.search);
let testSettings = {};

let qString = '?';
for (const [key, value] of urlParams.entries()) {
  if(qString != '?'){
    qString = qString + "&";
  }
  testSettings[key]=value;
  qString=qString + key + '=' + value
}

//rewrite nav links
document.getElementById('network').href = document.getElementById('network').href + qString
document.getElementById('settings').href = document.getElementById('settings').href + qString
document.getElementById('single').href = document.getElementById('single').href + qString

//instantiate new model
let model = new Model()
model.setupModel(testSettings);

//let viz = new ModelVisualization();

/*********visualization stuff*********/

let img;
/*let imgX = 1713;
let imgY = 964;
let imgRatio = imgY/imgX;*/
let canvasX, canvasY;
let sideBarX;
let posPV, posBatX, posGridX,posCcX, posInvX
let infoBarY = 70
let iBy

let partC, batC, alertC,timeC, elapsedTimeC, autoC, manuC,normalC,eventC;

let pvWire,gridWire, loadWire, loadWireB, batWire, invWire, relayWire

let weather

let showLabel = true;

//this is based on a 1000x562 (16:9) pixel window
let scaleIconsX, scaleIconsY;
let scaleIcons = 1;

let ds = 1; // drop shadow offset

let clock;

let eventSH
function preload() {
  img = loadImage('assets/seinfeld.jpg');
}

function setup() {
  let c = window.document.getElementById('p5-canvas')
  canvasX = c.clientWidth
  canvasY= c.clientHeight

  scaleIconsX = canvasX/1000;
  scaleIconsY = canvasY/562;

  scaleIcons = scaleIconsX;
  console.log(scaleIcons)

  posPV = { x: canvasX * .35, y: canvasY*.5};
  posCcX= canvasX * .5;
  posBatX = canvasX * .6;
  posInvX = canvasX * .7;
  posGridX = canvasX * .9;


  //set top of info bar
  ibY = canvasY-infoBarY;

  sideBarX = .2 * canvasX;

  let canvas = createCanvas(canvasX, canvasY);
  canvas.parent('p5-canvas');

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
  pvWire = new MultiWire([{x:pv.center.x,y:pv.center.y},{x:cc.center.x,y:cc.center.y}],scaleIcons);
  //from CC to Bat
  batWire = new MultiWire([{x:cc.center.x,y:cc.center.y},{x:bat.center.x,y:bat.center.y}],scaleIcons);
  //from Bat to Inv
  invWire = new MultiWire([{x:bat.center.x,y:bat.center.y},{x:inv.center.x,y:inv.center.y}],scaleIcons)
  //grid to relay
  //loadWire = new MultiWire([{x:outlet.center.x,y:outlet.center.y},{x:relay.center.x,y:relay.center.y}],scaleIcons);
  //inv to load
  loadWireB = new MultiWire([{x:inv.center.x,y:inv.center.y},{x:relay.center.x,y:relay.center.y}], scaleIcons);
  //loadWire.animate = 2
  relayWire = new MultiWire([{x:relay.center.x,y:relay.center.y},{x:load.center.x,y:load.center.y}],scaleIcons)


  gridWire = new MultiWire([{x:outlet.center.x,y:outlet.center.y},{x:outlet.center.x,y:outlet.center.y+100},{x:cc.center.x,y:cc.center.y+100},{x:cc.center.x,y:cc.center.y}],scaleIcons)
  console.log(gridWire.allPoints)

   //colors for energy viz
  partC = color(0,255,0);
  autoC =  color(255,150,255);
  batC = color(0,255,255);
  manuC = color(100,150,255);

  //background of timeline and clock
  timeC = color(150,150,255);

  //these colors change based on event status and prediction
  eventC = color(255,0,0); //red
  alertC = color(255,255,0); //yellow (r valued scale to prediction)
  normalC = color(0,255,0);//green

  eventSH = model.getEventStartHours();

}

function draw(){
  clock = model.elapsedHours
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
  //loadWire.draw()
  loadWireB.draw()
  relayWire.draw()

  pv.draw()
  bat.status = model.participants[0].package.batState
  bat.draw()
  cc.draw();
  outlet.draw();
  inv.draw();
  relay.draw();
  load.on = !model.participants[0].curtailment
  load.draw();

  drawClock(canvasX-50,canvasY-50)

  drawInfoBar();

}

function drawClock(cX,cY,c,eF){
  push();
    fillColor()
    stroke(0)
    rect(canvasX-infoBarY,canvasY - infoBarY,canvasX,canvasY);

    fill(0,100)
    rect(canvasX-infoBarY,canvasY - infoBarY,canvasX,canvasY);

    fill(timeC);
    circle(cX,cY,60);

    //change to red if event is upcoming/ongoing
    fillColor()
    arc(cX,cY, infoBarY-10, infoBarY-10, -HALF_PI, (((c% 24)/24)*TWO_PI)-HALF_PI);
    pop();
  }

function  fillColor(){
    if(model.eventNow){
      fill(eventC)
    } else if(model.alertNow){
      fill(alertC)
    } else {
      fill(normalC);
    }
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

/*function drawInfoBar(evF){
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
  
}*/


function drawInfoBar(){
//progress bar parent box
  push()
      stroke(0)

    textSize(16);

    bW = canvasX-infoBarY;

    let totDays = ((model.endDay.getTime()-model.startDay.getTime())/1000/60/60/24)
    let currentHour = (model.nowMS-model.startDay.getTime())/1000/60/60

    //width of each day within box
    dW = bW/(totDays+1);

    fill(timeC);
    rect(0,ibY,bW,canvasY);

    //progress bar
    fillColor()

    stroke(0)
    rect(0,ibY, currentHour*(dW/24),canvasY);

    drawWeather(dW);

    //day ticks
    stroke(0)
    for (let t = 1; t <= totDays; t++){
      tX = t*dW;
      line(tX, canvasY,tX,canvasY-20);
    }

    //TEXT
    noStroke();
    fill(0);
    text(new Date(model.nowMS), 60, ibY+25);
    //text("TIME: " + (millis()/1000), 100,canvasY+25);

    //text("Average Network Participation Rate: " + getTotAvgParticipation() + "% ($" + getAvgIncome() + " per participant)", 400, ibY+25);

    //draw event flag
    //check for past events
    let sH = model.startDay.getTime() / 1000 /60/ 60
    let hDelta = (model.endDay.getTime() / 1000 /60/ 60) - sH

    //console.log(model.elapsedHours)
    for (let s of eventSH){
      if ((model.elapsedHours + sH) > s){
      //circle(int(s.startTotHour*(dW/24)),canvasY+infoBarY-20,15);
      push();
        textAlign(CENTER,CENTER);
        textSize(24);
        textStyle(BOLD);
        //console.log(((s-sH)/hDelta)*bW)
        fill(255);
        text("!",int(((s-sH)/hDelta)*bW)+ds,canvasY-20+ds);
        fill(0)
        text("!",int(((s-sH)/hDelta)*bW),canvasY-20);
      pop();
      }
    }

  pop();
}

function drawWeather(dW){

  push()

    let eD = int(model.elapsedHours /24) 
    let tMin = 80;
    let tMax = 100
    
    for (let d = 0; d < eD; d++){

      let startDayNumber =Math.floor(model.startDay.getTime()/1000/60/60/24) - Math.floor(new Date("1/1/2022").getTime()/1000/60/60/24)

      
      stroke(0);
      fill(map(model.weather[d+startDayNumber]['Max T'],tMin,tMax,0,255),0,map(model.weather[d+startDayNumber]['Max T'],tMin,tMax,255,0))
      rect(d*dW,map(model.weather[d+startDayNumber]['Max T'],tMin,tMax,canvasY,canvasY-45), dW,canvasY)

      /*
        dWH = dW * .5;
        line((d)*dW +dWH,map(model.weather[d+startDayNumber]['Max T'],50,100,canvasY,canvasY-45),
        ((d+1)*dW)+dWH,map(model.weather[d+startDayNumber+1]['Max T'],50,100,canvasY,canvasY-45));*/
    }

    noStroke()
    fill(255)
    textSize(12);
    textAlign(LEFT, CENTER);
    text(tMax + "F", 5+ds,canvasY-45 +ds);
    text("TEMP", 5+ds,canvasY-25+ds);
    text(tMin + "F", 5+ds,canvasY-5+ds);
    
    fill(0)
    text(tMax + "F", 5,canvasY-45);
    //line(0,canvasY+infoBarY-45,10,canvasY+infoBarY-45)
    text("TEMP", 5,canvasY-25);
    text(tMin + "F", 5,canvasY-5);
  pop();
}

/*function drawClock(cX,cY,c,eF){
  fillColor()
  stroke(0)
  rect(canvasX-infoBarY,canvasY - infoBarY,canvasX,canvasY);

  fill(0,100)
  rect(canvasX-infoBarY,canvasY - infoBarY,canvasX,canvasY);

  fill(timeC);
  circle(cX,cY,60);

  //change to red if event is upcoming/ongoing
  fillColor()
  arc(cX,cY, infoBarY-10, infoBarY-10, -HALF_PI, (((c% 24)/24)*TWO_PI)-HALF_PI);
}*/


