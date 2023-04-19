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

document.getElementById('timeframe').innerHTML = testSettings['timeperiod']

//instantiate new model
let model = new Model()
model.setupModel(testSettings);


/*********visualization stuff*********/

let img, weather;
let imgX = 1713;
let imgY = 964;
let imgRatio = imgY/imgX;
let infoBarY = 70
let sideBarX = 200
let canvasX, canvasY, ibY;

let partC, batC, alertC,timeC, elapsedTimeC, autoC, manuC;

let testMonth = 8;

function preload() {
  img = loadImage('assets/crownheights-googlemaps.png');

  weather = loadTable('data/nyc-weather-aug2022-cleaned.csv', 'csv', 'header');

  let c = window.document.getElementById('p5-canvas')
  canvasX = c.clientWidth
  canvasY=c.clientHeight

  //set top of info bar
  ibY = canvasY-infoBarY;
}

function setup() {
  //canvasX = windowWidth-20;
  //canvasY = canvasX* imgRatio;

  //createCanvas(canvasX,canvasY+infoBarY);
  let canvas = createCanvas(canvasX,canvasY);
  canvas.parent('p5-canvas');

  background(255)
  img.resize(canvasX,canvasY-infoBarY)

  console.log(model.participants.length)
  //place circles
  while(model.participants.length = 0){
    
  }
  for (let p =0;p<model.participants.length;p++){
    console.log('???')
    model.participants[p].location = [Math.floor(random(canvasX-50-sideBarX))+25+sideBarX,Math.floor(random(canvasY-infoBarY-50))+25];
  }

  partC = color(0,255,0);
  autoC =  color(255,150,255);
  batC = color(0,255,255);
  alertC = color(255,100,0);
  manuC = color(100,150,255);
  timeC = color(150,150,255);
  elapsedTimeC = color(255,255,100);

  //instantiate events
  /*for (e of event21){
    events.push(new Event(e,15,4,21));
  }
  for (e of event2){
    events.push(new Event(e,15,4,2));
  }*/
  
  //print(weather.getColumn('Avg_Temp'));
}

function draw(){

  //predictionLoop()


  //let eventFlag = false;

  /*if(day<=model.daysInMonth[testMonth-1]){

    tempPrediction()

    date = new Date(2022,testMonth-1,day, int(clock% 24)).toLocaleString();

    //check for eventsignal
    for (let s of events){
      if (s.isUpcoming(int(clock))==true){
        eventFlag = true;
      }
    }*/

    eventFlag = model.alertNow;

    //check for ongoing event
    /*let eF = false;
    for (let s of events){
      if (s.isNow(int(clock))==true){
        //check if the event is just starting
        if (eventNow== false){
          //console.log("NEW EVENT!")
          for(let p=0; p < participants.length;p++){
            participants[p].updateParticipation();
          }
        }

        eventNow = true;
        eF = true;
        break;
      }
    }*/
    eventNow= model.eventNow;

    /**** COMMENT OUT FOR WHITE BACKGROUND***/
    if(eventFlag){
      background(alertC);
    } else {
      background(200);
    }

    image(img, 0,0);

    //day light overlay
    fill(0,0,0,map(min(abs(12-model.elapsedHours%24),6),0,6,50,120));
    rect(0,0,canvasX,canvasY);

    /*** END COMMENT OUT FOR WHITE BACKGROUND ***/

    /*** COMMENT IN FOR WHITE BACKGROUND ***/
    //background(255);

    //hourly activity
    /*if(int(clock) != prevHour){
      prevHour = int(clock);
      
      //update energy consumption if event is not anticipated
      if(eventFlag == false || eventNow == true){
        if(eventLikely == false){
          for(let p=0; p < participants.length;p++){
            participants[p].updateEnergyDraw();
          }
        }
      }

      //update energy production
      for(let p=0; p < participants.length;p++){
        participants[p].updateEnergyChargePV();
      }
      
    }*/


    for(let p=0; p < model.participants.length;p++){
      drawP(model.participants[p],eventFlag, eventNow);
    }

    drawInfoBar();

    drawClock(canvasX-(infoBarY*.5),ibY+(infoBarY*.5), model.elapsedHours, model.eventNow);

  /*} else {
    //reset clock to 0 at end of month
    if(loopIt){
      clockOffset = clock + clockOffset;
    }
  }*/

  drawKey();

}

function drawKey(){
  let kY = 15;
  let kH = 25;
  let kX = 15;
  let kW = sideBarX-(kX*2);

  fill(220,240,255)
  rect(0,0,sideBarX,ibY);

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
  
  pop()
}

function drawInfoBar(){
//progress bar parent box

  textSize(16);

  bW = canvasX-infoBarY;

  let totDays = ((model.endDay.getTime()-model.startDay.getTime())/1000/60/60/24)
  let currentHour = (model.nowMS-model.startDay.getTime())/1000/60/60

  //width of each day within box
  dW = bW/(totDays+1);

  fill(timeC);
  rect(0,ibY,bW,canvasY);

  //progress bar
  if(model.eventNow){
    fill(alertC)
  } else if(model.alertNow){
    fill(0,255,0)
  } else {
    fill(elapsedTimeC)
  }
  stroke(0)
  rect(0,ibY, currentHour*(dW/24),canvasY);

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

  text("Average Network Participation Rate: " + getTotAvgParticipation() + "% ($" + getAvgIncome() + " per participant)", 400, ibY+25);

  //draw event flag
  //check for past events
  /*for (let s of events){
    if (model.elapsedHours > s.startTotHour){
    //circle(int(s.startTotHour*(dW/24)),canvasY+infoBarY-20,15);
    push();
      textAlign(CENTER,CENTER);
      textSize(24);
      textStyle(BOLD);
      text("!",int(s.startTotHour*(dW/24)),canvasY-20);
    pop();
    }
  }*/

  drawWeather(dW);
  
}

function getTotAvgParticipation(){
  let aP = 0;
  for (let p of model.participants){
    aP = aP + p.participationRateAvg
  }

  return round((aP/model.participants.length)*100,2)
}

function getAvgIncome(){
  let aP = 0;
  for (let p of model.participants){
    aP = aP + p.participationRateAvg
  }

  //avg participation * 18/kW * .5kW * 2 programs
  return round((aP/model.participants.length) * 18 * 0.5 * 2,2)
}

function drawWeather(dW){
  //fix this...
  dWH = dW * .5;

  push()
    textSize(12);
    textAlign(LEFT, CENTER);
    text("100F", 5,canvasY-45);
    //line(0,canvasY+infoBarY-45,10,canvasY+infoBarY-45)
    text("TEMP", 5,canvasY-25);
    text("70F", 5,canvasY-5);
    //line(0,canvasY+infoBarY-2,10,canvasY+infoBarY-2)
  pop();
  //loop through all elapsed days
  for (let d = 0; d < int(day)-1; d++){
    /*//check for past events
    for (let s of events){
      if ((d * 24) - 24 > s.startTotHour && (d * 24) - 24 < s.startTotHour + 24){
        circle((d*dW)-(dW*.5),canvasY+infoBarY-20,15);
      }
    }*/
    
      wT = weather.getColumn('Max_Temp');
      stroke(0);
      line((d)*dW +dWH,map(wT[d],70,100,canvasY,canvasY-45),
        ((d+1)*dW)+dWH,map(wT[d+1],70,100,canvasY,canvasY-45));
  }
}

function tempPrediction(){
  eventLikely = false;

  wT = weather.getColumn('Max_Temp');

  //let avgMaxT = (wT[day-1] + wT[day-2])*.5;

  if (predictMode){
    if (wT[day-1] >tThresh || wT[day] > tThresh){
      eventLikely = true;
    }
  }

}

function drawClock(cX,cY,c,eF){
  stroke(0);
  fill(timeC);
  circle(cX,cY,60);

  //change to red if event is upcoming/ongoing
  if(eF){
    fill(alertC)
  } else {
    fill(elapsedTimeC)
  }
  arc(cX,cY, infoBarY-10, infoBarY-10, -HALF_PI, (((c% 24)/24)*TWO_PI)-HALF_PI);
}


function drawP(p, evFuture,evNow){
  push();

    //draw P with drop shadow
    fill(255);
    //circle(this.location[0],this.location[1],this.batStat * 15);
    textAlign(CENTER,CENTER);
    textStyle(BOLD);
    fill(0);
    textSize(16);

    let pT = 'P';
    if(evNow){
      /*fill(255);
      circle(this.location[0],this.location[1], 30,30)*/
      pT = "!";
    }
    text(pT,p.location[0]+1,p.location[1]+1)
    if(evFuture){
      fill(alertC)
    } else {
      fill(255,255,0);
    }
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
    arc(p.location[0],p.location[1], 45,45, -HALF_PI, percToRad(p.dlrp.participationRateAvg)-HALF_PI);

    //CSRP participation
    noFill();
    stroke(manuC)
    arc(p.location[0],p.location[1], 60,60, -HALF_PI, percToRad(p.csrp.participationRateAvg)-HALF_PI);

    //tot participation
    noFill();
    stroke(partC)
    arc(p.location[0],p.location[1], 75,75, -HALF_PI, percToRad(2/(p.dlrp.participationRateAvg+p.csrp.participationRateAvg))-HALF_PI);
  pop();
}

function percToRad(p){
    return p * TWO_PI;
  }