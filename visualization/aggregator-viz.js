let img, weather;
let imgX = 1713;
let imgY = 964;
let imgRatio = imgY/imgX;
let infoBarY = 70
let canvasX = 1000;
let canvasY = canvasX* imgRatio;

let amtP  = 15;
let participants = [];

let daysInMonth = [31,28,31,30,31,30,31,31,30,31,30,31];
//run test for August
let testMonth = 8;

let date, clock, day
let prevHour = -1;

let events = [];
let event21=[3,4,8,12,30]; //days events occur with 21 hr advanced notice
let event2=[5,6,25]; //days events occur with 2 hr advanced notice

let eventNow = false;

let partC, batC, alertC,timeC, elapsedTimeC, autoC, manuC;

//low T, high T,sky (100 = clear, 0 = rain)
let augTemp22 = [[72,75,.7],[73,88,1.0],[79,86,1.0],[77,90,1.0],[81,90,.75],[79,86,.2]]

let clockOffset = 0;

let loopIt = false;

//modes for battery charging: grid, solar
let mode = 'solar';

function preload() {
  img = loadImage('assets/crownheights-googlemaps.png');

  weather = loadTable('data/nyc-weather-aug2022-cleaned.csv', 'csv', 'header');
}

function setup() {

  partC = color(0,255,0);
  autoC = color(255,150,255);
  batC = color(0,255,255);
  alertC = color(255,100,0);
  timeC = color(150,150,255);
  elapsedTimeC = color(255,255,100);
  manuC = color(100,150,255);

  createCanvas(canvasX,canvasY+infoBarY);
  background(255)
  img.resize(canvasX,canvasY)

  //place circles
  for (let p =0;p<amtP;p++){
    participants.push(new Participant(int(random(canvasX-50))+25,int(random(canvasY-50))+25));
  }

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

  //100ms viz = 1 hour irl
  clock = millis()/50 - clockOffset;
  //new Date(year,month,day,hours)
  //console.log(1+int(clock/23));
  day = int(clock/24)+1;
  //hour = clock% 24;

  let eventFlag = false;

  if(day<=daysInMonth[testMonth-1]){
    /*if(day == 1){
      saveFrames('out', 'png', 1, 25);
    }*/

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
        for(let p=0; p < participants.length;p++){
          participants[p].updateEnergyDraw();
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

    drawClock(canvasX-(infoBarY*.5),canvasY+(infoBarY*.5), clock, eventFlag);

  } else {
    //reset clock to 0 at end of month
    if(loopIt){
      clockOffset = clock + clockOffset;
    }
  }

  drawKey();

}

function outputFrames(){
  saveFrames('out', 'png', 1, 25);
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
  text(date, 20, canvasY+25);
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

  //drawWeather(dW);
  
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
  //loop through all elapsed days
  for (let d = 1; d <= int(day); d++){
    /*//check for past events
    for (let s of events){
      if ((d * 24) - 24 > s.startTotHour && (d * 24) - 24 < s.startTotHour + 24){
        circle((d*dW)-(dW*.5),canvasY+infoBarY-20,15);
      }
    }*/
    if(d>=1){
      wT = weather.getColumn('Max_Temp');
      stroke(0);
      line((d-1)*dW,map(wT[d-2],0,100,canvasY+infoBarY,canvasY+infoBarY-45),
        (d*dW),map(wT[d-1],0,100,canvasY+infoBarY,canvasY+infoBarY-45));
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

class Participant{
  constructor(pX,pY){
    this.batPerc = 1.0;
    this.participationRateAvg = 1.0;//total participation (auto + manual)
    this.participationHistory = [];//total participation (auto + manual)
    this.automatedReplacementHistory = [];
    this.automatedReplacementHistoryAvg = 1.0;
    this.manualCurtailmentHistory = [];
    this.manualCurtailmentHistoryAvg = 1.0;
    this.location = [pX,pY];
    this.loadW = 500;
    this.batWh = 1000/*int(random(600,800));*/
    this.chargeW = int(this.batWh /6); //full charge within 6 hrs
    this.participationHistory = [];
    this.reservationW=500;
    this.eventDuration = 4; //this should be fed in from events
    this.reservationWh = this.reservationW * this.eventDuration
    this.eventStartTime = this.getStartTime(); //not currently in use
    this.manualParticipationRate = random(0.15,0.5);
    //communication methods
    this.phone = true;
    this.sms = true;
    this.email = true;
    this.iot = true;
    this.interfaceIndicator = true;
  }

  updateEnergyDraw(){
    //update power draw
    this.batPerc = max(this.batPerc - (this.loadW/this.batWh),0.0);
  }

  updateEnergyChargePV(){
    let h= int(clock%24);

    let c = false;
    if(mode == 'grid'){
      //grid at cheapest time of day
      if(h > 20 || h < 5){
        c= true;
      }
    } else if (mode == 'solar'){
      //peak sun hours
      if(h > 9 && h < 15){
        c=true;
      }
    }

    if(c){
      this.batPerc = min(this.batPerc + (this.chargeW/this.batWh),1.0);
    }
  }

  //this needs work
  updateParticipation(){
    let autoP = min((this.batPerc * this.batWh)/this.reservationWh,1.0);
    //let manuP = (1 - autoP) * this.manualParticipationRate;
    this.updateAutoReplacement(autoP);
    let manuP = this.updateManualCurtailment(autoP)

    this.participationHistory.push(min(autoP+manuP,1.0));

    let a = 0;
    for(let p of this.participationHistory){
      a = a + p;
    }
    this.participationRateAvg = a/this.participationHistory.length;

    //console.log([this.automatedReplacementHistoryAvg,this.manualCurtailmentHistoryAvg, this.participationRateAvg])
  }

  updateAutoReplacement(p){
    //console.log(this.batPerc * this.batWh);
    this.automatedReplacementHistory.push(p)

    let a = 0;
    for(let p of this.automatedReplacementHistory){
      a = a + p;
    }
    this.automatedReplacementHistoryAvg = a/this.automatedReplacementHistory.length;
  }

  updateManualCurtailment(p){
    
    let s = 0;

    //every hour (remaining after auto replacement) random chance of participating
    //once the stop participating they are done for the remainder of the event
    for (let i =0;i < int(1-(this.eventDuration*p));i++){
      if(random() < this.manualParticipationRate){
        s = s + (1/this.eventDuration);
      } else {
        break;
      }
    }

    this.manualCurtailmentHistory.push(s);

    this.updateManualCurtailmentAvg();

    return s;
  }

  updateManualCurtailmentAvg(){

    let a = 0;
    for(let p of this.manualCurtailmentHistory){
      a = a + p;
    }
    this.manualCurtailmentHistoryAvg = a/this.manualCurtailmentHistory.length;
  }

  getStartTime(){
    let eventStartOptions = [11,14,16,19];

    return random(eventStartOptions);
  }

  drawP(evFuture,evNow){
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
      text(pT,this.location[0]+1,this.location[1]+1)
      if(evFuture){
        fill(alertC)
      } else {
        fill(255,255,0);
      }
      text(pT,this.location[0],this.location[1])
      
      //draw info bars
      strokeWeight(5);

      //bat
      noFill();
      stroke(batC)
      arc(this.location[0],this.location[1], 30,30, -HALF_PI, this.percToRad(this.batPerc)-HALF_PI);

      //auto participation
      noFill();
      stroke(autoC)
      arc(this.location[0],this.location[1], 45,45, -HALF_PI, this.percToRad(this.automatedReplacementHistoryAvg)-HALF_PI);

      //manual participation
      noFill();
      stroke(manuC)
      arc(this.location[0],this.location[1], 60,60, -HALF_PI, this.percToRad(this.manualCurtailmentHistoryAvg)-HALF_PI);

      //tot participation
      noFill();
      stroke(partC)
      arc(this.location[0],this.location[1], 75,75, -HALF_PI, this.percToRad(this.participationRateAvg)-HALF_PI);
    pop();
  }

  percToRad(p){
    return p * TWO_PI;
  }

}

class Event{
 constructor(day, hour, duration, alert){
  this.day = day; //the day of the event
  this.startHour = hour; //the time it starts
  this.startTotHour = this.getEventStart_TotHour(this.day, this.startHour); //the start time converted to total elapsed hours in the month
  this.eventDuration = duration; //the length of the event (h)
  this.alert = alert; //the amount of hours prior to the event that the alert is sent to participants
  this.alertTotHour = this.getAlert_TotHour(this.startTotHour, this.alert); //event alert time converted to total elapsed hours in the month
  this.upcoming = false; //flag raised between when alert is sent and when event ends
  this.now = false;
  //this.participationRate = 100; //percentage of total participation
 }

  //get to hours elapsed since beginning of the month
  getEventStart_TotHour(d, h){
    return ((d * 24) - 24) + h;
  }

  getAlert_TotHour(sT, a){
    return sT - a;
  }

  //flags if time between alert and end of event
  isUpcoming(tH){
    let isIt;
    if (tH > this.alertTotHour && tH <= this.startTotHour + this.eventDuration){
      isIt = true;
    } else {
      isIt = false;
    }
    this.upcoming = isIt;
    return isIt;
  }

  //check if event is ongoing
  isNow(tH){
    let isIt;
    if (tH >= this.startTotHour && tH < this.startTotHour + this.eventDuration){
      isIt = true;
    } else {
      isIt = false;
    }
    this.now = isIt;
    return isIt;
  }

  percToRGB(){
    g = map(this.participationRate,0,100,0,255)
    r = map(this.participationRate,0,100,255,0)

    return color(r,g,0);
  }
}