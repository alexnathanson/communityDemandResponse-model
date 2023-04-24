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
document.getElementById('system').href = document.getElementById('system').href + qString

document.getElementById('timeframe').innerHTML = testSettings['timeperiod']

//instantiate new model
let model = new Model()
model.setupModel(testSettings);


let viz = new ModelVisualization(model,250,70);
/*********visualization stuff*********/

let img, weather;
let imgX = 1713;
let imgY = 964;
let imgRatio = imgY/imgX;
//let infoBarY = 70
//let sideBarX = 250
let canvasX, canvasY, ibY;

let partC, batC, alertC,timeC, elapsedTimeC, autoC, manuC,normalC,eventC;

let testMonth = 8;

let eventSH;

let ds = 1; // drop shadow offset

function preload() {
  img = loadImage('assets/crownheights-googlemaps-bw.png');

  weather = loadTable('data/nyc-weather-aug2022-cleaned.csv', 'csv', 'header');

  let c = window.document.getElementById('p5-canvas')
  canvasX = c.clientWidth
  canvasY=c.clientHeight

  //set top of info bar
  ibY = canvasY-viz.infoBarY;
}

function setup() {
  //canvasX = windowWidth-20;
  //canvasY = canvasX* imgRatio;

  //createCanvas(canvasX,canvasY+viz.infoBarY);
  let canvas = createCanvas(canvasX,canvasY);
  canvas.parent('p5-canvas');

  background(255)
  img.resize(canvasX,canvasY-viz.infoBarY)

  //place circles
  for (let p =0;p<model.participants.length;p++){
    model.participants[p].location = [Math.floor(random(canvasX-50-viz.sideBarX))+25+viz.sideBarX,Math.floor(random(canvasY-viz.infoBarY-50))+25];
  }

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

  eventFlag = model.alertNow;

  eventNow= model.eventNow;

  image(img, 0,0);

  //day light overlay
  fill(0,0,0,map(min(abs(12-model.elapsedHours%24),6),0,6,50,120));
  rect(0,0,canvasX,canvasY);


  //draw participants
  for(let p=0; p < Math.min(model.participants.length,15);p++){
    drawP(model.participants[p],eventFlag, eventNow);
  }

  viz.drawInfoBar(model.getEventStartHours());

  viz.drawClock(canvasX-(viz.infoBarY*.5),ibY+(viz.infoBarY*.5), model.elapsedHours, model.eventNow);

  viz.drawKey(model);

}

function drawKey(){
  let kY = 15;
  let kH = 25;
  let kX = 15;
  let kW = viz.sideBarX-(kX*2);

  fill(220,240,255)
  rect(0,0,viz.sideBarX,ibY);

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
    stroke(eventC);
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

    textStyle(BOLD)
    textSize(16)
    text("Aggregation Stats",kX+kW*.5, kY + (kH *7));

    textStyle(NORMAL)
    textSize(13);
    text("Total CSRP: " + model.participants[0].csrp.participationRateAvg,kX+kW*.5, kY + (kH *8));
    textStyle(NORMAL);
    text("Automated Replacement: " + model.participants[0].csrp.automatedReplacementHistoryAvg,kX+kW*.5, kY + (kH *9));
    text("Manual Curtailment: " + model.participants[0].csrp.manualCurtailmentHistoryAvg,kX+kW*.5, kY + (kH *10));

    text("Total DLRP: " + model.participants[0].dlrp.participationRateAvg,kX+kW*.5, kY + (kH *12));
    textStyle(NORMAL);
    text("Automated: " + model.participants[0].dlrp.automatedReplacementHistoryAvg,kX+kW*.5, kY + (kH *13));
    text("Manual: " + model.participants[0].dlrp.manualCurtailmentHistoryAvg,kX+kW*.5, kY + (kH *14));


    text("Solar Energy Produced: NaN",kX+kW*.5, kY + (kH *16));
    text("Estimated Cost of Hardware: $NaN",kX+kW*.5, kY + (kH *17));
    text("Income from Utility: $NaN",kX+kW*.5, kY + (kH *18));
    text("Prediction Accuracy: " + model.predictionAccuracyRate,kX+kW*.5, kY + (kH *19));
    /*stroke(200,200,200);
    line(kX,kY + (kH *6),kX+kW,kY + (kH *6));*/
    /*fill(0);
    noStroke();*/
  
  pop()
}

/*function drawInfoBar(){
//progress bar parent box

  textSize(16);

  bW = canvasX-viz.infoBarY;

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
    //circle(int(s.startTotHour*(dW/24)),canvasY+viz.infoBarY-20,15);
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

  
}*/

/*function drawWeather(dW){

  push()

    let eD = int(model.elapsedHours /24) 
    let tMin = 80;
    let tMax = 100
    
    for (let d = 0; d < eD; d++){

      let startDayNumber =Math.floor(model.startDay.getTime()/1000/60/60/24) - Math.floor(new Date("1/1/2022").getTime()/1000/60/60/24)

      
      stroke(0);
      fill(map(model.weather[d+startDayNumber]['Max T'],tMin,tMax,0,255),0,map(model.weather[d+startDayNumber]['Max T'],tMin,tMax,255,0))
      rect(d*dW,map(model.weather[d+startDayNumber]['Max T'],tMin,tMax,canvasY,canvasY-45), dW,canvasY)
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
    //line(0,canvasY+viz.infoBarY-45,10,canvasY+viz.infoBarY-45)
    text("TEMP", 5,canvasY-25);
    text(tMin + "F", 5,canvasY-5);
  pop();
}*/

/*function drawClock(cX,cY,c,eF){
  fillColor()
  stroke(0)
  rect(canvasX-viz.infoBarY,canvasY - viz.infoBarY,canvasX,canvasY);

  fill(0,100)
  rect(canvasX-viz.infoBarY,canvasY - viz.infoBarY,canvasX,canvasY);

  fill(timeC);
  circle(cX,cY,60);

  //change to red if event is upcoming/ongoing
  fillColor()
  arc(cX,cY, viz.infoBarY-10, viz.infoBarY-10, -HALF_PI, (((c% 24)/24)*TWO_PI)-HALF_PI);
}*/

/*function fillColor(){
    if(model.eventNow){
      fill(eventC)
    } else if(model.alertNow){
      fill(alertC)
    } else {
      fill(normalC);
    }
}*/

function drawP(p){
  push();

    //draw P with drop shadow
    fill(255);
    //circle(this.location[0],this.location[1],this.batStat * 15);
    textAlign(CENTER,CENTER);
    textStyle(BOLD);
    fill(0);
    textSize(16);

    let pT = 'P';
    if(model.eventNow){
      /*fill(255);
      circle(this.location[0],this.location[1], 30,30)*/
      pT = "!";
    }
    text(pT,p.location[0]+1,p.location[1]+1)
    
    viz.fillColor();

    text(pT,p.location[0],p.location[1])
    
    //draw info bars
    strokeWeight(5);

    //bat
    noFill();
    stroke(batC)
    arc(p.location[0],p.location[1], 30,30, -HALF_PI, percToRad(p.package.batState)-HALF_PI);

    //DLRP participation
    noFill();
    stroke(autoC)
    arc(p.location[0],p.location[1], 45,45, -HALF_PI, percToRad(p.overallAutoReplacement)-HALF_PI);

    //CSRP participation
    noFill();
    stroke(manuC)
    arc(p.location[0],p.location[1], 60,60, -HALF_PI, percToRad(p.overallManualCurtailment)-HALF_PI);

    //tot participation
    noFill();
    stroke(partC)
    arc(p.location[0],p.location[1], 75,75, -HALF_PI, percToRad(p.overallParticipation)-HALF_PI);
  pop();
}

function percToRad(p){
    return p * TWO_PI;
  }