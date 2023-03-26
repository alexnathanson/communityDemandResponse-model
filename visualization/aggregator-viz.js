let img, weather;
let imgX = 1713;
let imgY = 964;
let imgRatio = imgY/imgX;
let infoBarY = 70
let canvasX = 1000;
let canvasY = canvasX* imgRatio;

let amtP  = 10;
let participants = [];

let daysInMonth = [31,28,31,30,31,30,31,31,30,31,30,31];
//run test for August
let testMonth = 8;

let date, clock, day
let prevHour = -1;

let events = [];
let event21=[3,4,8,12]; //days events occur with 21 hr advanced notice
let event2=[5,6,25]; //days events occur with 2 hr advanced notice

let eventNow = false;

let partC, batC, alertC,timeC, elapsedTimeC, autoC;

//low T, high T,sky (100 = clear, 0 = rain)
let augTemp22 = [[72,75,.7],[73,88,1.0],[79,86,1.0],[77,90,1.0],[81,90,.75],[79,86,.2]]

let clockOffset = 0;

let loopIt = false;

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

  createCanvas(canvasX,canvasY+infoBarY);
  background(153)
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
  clock = millis()/100 - clockOffset;
  //new Date(year,month,day,hours)
  //console.log(1+int(clock/23));
  day = int(clock/24)+1;
  //hour = clock% 24;

  let eventFlag = false;

  if(day<=daysInMonth[testMonth-1]){
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
          console.log("NEW EVENT!")
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

    if(eventFlag){
      background(alertC);
    } else {
      background(200);
    }


    //background(150,0,0);
    image(img, 0,0);

    //day light overlay
    fill(0,0,0,map(min(abs(12-clock%24),6),0,6,0,150));
    rect(0,0,canvasX,canvasY);

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

    drawInfoBar(eventFlag);

    for(let p=0; p < participants.length;p++){
      participants[p].drawP(eventFlag, eventNow);
    }

    drawClock(canvasX-(infoBarY*.5),canvasY+(infoBarY*.5), clock, eventFlag);

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
  let kW = 120;

  push()
    textSize(14);
    strokeWeight(20);
    stroke(partC);
    line(kX,kY,kX+kW,kY);
    stroke(autoC);
    line(kX,kY+kH,kX+kW,kY+kH);
    stroke(batC);
    line(kX,kY + (kH *2),kX+kW,kY + (kH *2));
    stroke(alertC);
    line(kX,kY + (kH *3),kX+kW,kY + (kH *3));
    stroke(alertC);
    line(kX,kY + (kH *4),kX+kW,kY + (kH *4));
    
    textStyle(NORMAL);
    textAlign(CENTER, CENTER);
    fill(0);
    noStroke();
    text("Tot Participation Rate", kX+kW*.5, kY);
    text("Auto Replacement ", kX+kW*.5, kY + kH);
    text("Battery Percentage",kX+kW*.5, kY + (kH *2));
    text("Upcoming Event",kX+kW*.5, kY + (kH *3));
    text("! = Event Occurance",kX+kW*.5, kY + (kH *4));
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

  text("Average Network Participation Rate: " + getTotAvgParticipation() + "%", 400, canvasY+25);

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
    this.participationRateAvg = 1.0;
    this.participationHistory = [];
    this.location = [pX,pY];
    this.loadW = int(random(50,100));
    this.batWh = int(random(300,700));
    this.chargeW = int(this.batWh /6); //full charge within 6 hrs
    this.participationHistory = [];
    this.reservationW=500
    this.reservationWh = this.reservationW * 4 //this should be event length variable
  }

  updateEnergyDraw(){
    //update power draw
    this.batPerc = max(this.batPerc - (this.loadW/this.batWh),0.0);
  }

  updateEnergyChargePV(){
    let h= int(clock%24);
    if(h > 9 && h < 15){
      this.batPerc = min(this.batPerc + (this.chargeW/this.batWh),1.0);
    }
  }

  updateParticipation(){
    this.updateAutoReplacement();
  }

  updateAutoReplacement(){
    console.log(this.batPerc * this.batWh);
    this.participationHistory.push(min((this.batPerc * this.batWh)/this.reservationWh,1.0))

    let a = 0;
    for(let p of this.participationHistory){
      a = a + p;
    }
    this.participationRateAvg = a/this.participationHistory.length;
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

      //tot participation
      noFill();
      stroke(autoC)
      arc(this.location[0],this.location[1], 45,45, -HALF_PI, this.percToRad(this.participationRateAvg)-HALF_PI);

      //tot participation
      noFill();
      stroke(partC)
      arc(this.location[0],this.location[1], 60, 60, -HALF_PI, this.percToRad(this.participationRateAvg)-HALF_PI);
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
  this.participationRate = 100; //percentage of total participation
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