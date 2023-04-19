let img, weather;
let imgX = 1713;
let imgY = 964;
let imgRatio = imgY/imgX;
let infoBarY = 70
let sideBarX = 200
let canvasX, canvasY, ibY;

let partC, batC, alertC,timeC, elapsedTimeC, autoC, manuC;

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

  //place circles
  for (let p =0;p<amtP;p++){
    participants.push(new Participant(int(random(canvasX-50-sideBarX))+25+sideBarX,int(random(canvasY-infoBarY-50))+25));
  }

  partC = participants[0].partC;
  autoC =  participants[0].autoC;
  batC = participants[0].batC;
  alertC = participants[0].alertC;
  manuC = participants[0].manuC;

  timeC = color(150,150,255);
  elapsedTimeC = color(255,255,100);

  //instantiate events
  for (e of event21){
    events.push(new Event(e,15,4,21));
  }
  for (e of event2){
    events.push(new Event(e,15,4,2));
  }
  
  //print(weather.getColumn('Avg_Temp'));
}

function draw(){

  predictionLoop()
  /*//100ms viz = 1 hour irl
  clock = millis()/200 - clockOffset;
  //new Date(year,month,day,hours)
  //console.log(1+int(clock/23));
  day = int(clock/24)+1;
  //hour = clock% 24;*/

  let eventFlag = false;

  if(day<=daysInMonth[testMonth-1]){

    tempPrediction()

    date = new Date(2022,testMonth-1,day, int(clock% 24)).toLocaleString();

    //check for eventsignal
    for (let s of events){
      if (s.isUpcoming(int(clock))==true){
        eventFlag = true;
      }
    }

    //check for ongoing event
    let eF = false;
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
    }
    eventNow= eF;

    /**** COMMENT OUT FOR WHITE BACKGROUND***/
    if(eventFlag){
      background(alertC);
    } else {
      background(200);
    }

    image(img, 0,0);

    //day light overlay
    fill(0,0,0,map(min(abs(12-clock%24),6),0,6,50,120));
    rect(0,0,canvasX,canvasY);

    /*** END COMMENT OUT FOR WHITE BACKGROUND ***/

    /*** COMMENT IN FOR WHITE BACKGROUND ***/
    //background(255);

    //hourly activity
    if(int(clock) != prevHour){
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
      
    }


    for(let p=0; p < participants.length;p++){
      participants[p].drawP(eventFlag, eventNow);
    }

    drawInfoBar(eventFlag);

    drawClock(canvasX-(infoBarY*.5),ibY+(infoBarY*.5), clock, eventFlag);

  } else {
    //reset clock to 0 at end of month
    if(loopIt){
      clockOffset = clock + clockOffset;
    }
  }

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
  rect(0,ibY,bW,canvasY);

  //progress bar
  if(evF){
    fill(alertC)
  } else {
    fill(elapsedTimeC)
  }
  stroke(0)
  rect(0,ibY,(clock/24)*(bW/(daysInMonth[testMonth-1])),canvasY);

  //day ticks
  stroke(0)
  for (let t = 1; t <= daysInMonth[testMonth-1]; t++){
    tX = t*dW;
    line(tX, canvasY,tX,canvasY-20);
  }

  //TEXT
  noStroke();
  fill(0);
  text(date, 60, ibY+25);
  //text("TIME: " + (millis()/1000), 100,canvasY+25);

  text("Average Network Participation Rate: " + getTotAvgParticipation() + "% ($" + getAvgIncome() + " per participant)", 400, ibY+25);

  //draw event flag
  //check for past events
  for (let s of events){
    if (clock > s.startTotHour){
    //circle(int(s.startTotHour*(dW/24)),canvasY+infoBarY-20,15);
    push();
      textAlign(CENTER,CENTER);
      textSize(24);
      textStyle(BOLD);
      text("!",int(s.startTotHour*(dW/24)),canvasY-20);
    pop();
    }
  }

  drawWeather(dW);
  
}

function getTotAvgParticipation(){
  let aP = 0;
  for (let p of participants){
    aP = aP + p.participationRateAvg
  }

  return round((aP/participants.length)*100,2)
}

function getAvgIncome(){
  let aP = 0;
  for (let p of participants){
    aP = aP + p.participationRateAvg
  }

  //avg participation * 18/kW * .5kW * 2 programs
  return round((aP/participants.length) * 18 * 0.5 * 2,2)
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
  arc(cX,cY, infoBarY-10, infoBarY-10, -HALF_PI, (((clock% 24)/24)*TWO_PI)-HALF_PI);
}