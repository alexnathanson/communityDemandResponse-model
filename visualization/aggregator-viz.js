let img;
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
let event2=[6,25]; //days events occur with 2 hr advanced notice

function preload() {
  img = loadImage('assets/crownheights-googlemaps.png');
}

function setup() {
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
  
}

function draw(){
  //100ms viz = 1 hour irl
  clock = millis()/100;
  //new Date(year,month,day,hours)
  //console.log(1+int(clock/23));
  day = int(clock/24)+1;
  //hour = clock% 24;

  let eventFlag = false;

  if(day<=daysInMonth[testMonth-1]){
    date = new Date(2022,testMonth-1,day, int(clock% 24));



    //check for eventsignal
    for (let s of events){
      if (s.isUpcoming(int(clock))==true){
        eventFlag = true;
      }
    }

    if(eventFlag){
      background(200,0,0);
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
      if(eventFlag == false){
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
      participants[p].drawP();
    }

    drawClock(canvasX-(infoBarY*.5),canvasY+(infoBarY*.5), clock);
  }
  
}

function drawInfoBar(eF){
//progress bar parent box
  bW = canvasX-infoBarY;

  //width of each day within box
  dW = bW/daysInMonth[testMonth-1];

  fill(100,100,200);
  rect(0,canvasY,bW,canvasY+infoBarY);

  //progress bar
  if(eF){
    fill(255,0,0)

  } else {
    fill(0,255,0)
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
  text("AVG Participation Rate: ", 400, canvasY+25);

  //draw event flag
  //loop through all elapsed days
  for (let d = 1; d <= int(day); d++){
    //check for past events
    for (let s of events){
      if ((d * 24) - 24 > s.startTotHour && (d * 24) - 24 < s.startTotHour + 24){
        circle((d*dW)-(dW*.5),canvasY+infoBarY-20,15);
      }
    }
  }
  
}

function drawClock(cX,cY,c){
  stroke(0);
  fill(0,255,100);
  circle(cX,cY,60);
  fill(255,0,0)
  arc(cX,cY, infoBarY-10, infoBarY-10, -HALF_PI, (((clock% 24)/24)*TWO_PI)-HALF_PI);
}

class Participant{
  constructor(pX,pY){
    this.batPerc = 1.0;
    this.participationRate = 1.0;
    this.location = [pX,pY];
    this.loadW = int(random(50,100));
    this.batWh = int(random(300,700));
    this.chargeW = int(random(200,500));
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

  drawP(){
    push();

      //draw P with drop shadow
      fill(255);
      //circle(this.location[0],this.location[1],this.batStat * 15);
      textAlign(CENTER,CENTER);
      textStyle(BOLD);
      fill(0);
      textSize(16);
      text('P',this.location[0]+1,this.location[1]+1)
      fill(255,255,0);
      text('P',this.location[0],this.location[1])
      
      //draw info bars
      strokeWeight(5);

      //bat
      noFill();
      stroke(0,255,0)
      arc(this.location[0],this.location[1], 30,30, -HALF_PI, this.percToRad(this.batPerc)-HALF_PI);

      //participation
      noFill();
      stroke(255,0,0)
      arc(this.location[0],this.location[1], 45, 45, -HALF_PI, this.percToRad(this.participationRate)-HALF_PI);
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
  //this.isNow = false;
  this.participationRate = 100; //percentage of total participation
 }

  //get to hours elapsed since beginning of the month
  getEventStart_TotHour(d, h){
    return ((d * 24) - 24) + h;
  }

  getAlert_TotHour(sT, a){
    return sT - a;
  }

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

  percToRGB(){
    g = map(this.participationRate,0,100,0,255)
    r = map(this.participationRate,0,100,255,0)

    return color(r,g,0);
  }
}

/*class Event{
  constructor(){
    this.eventSchedule21=[3,4,8,12]; //days events occur with 21 hr advanced notice
    this.eventSchedule2=[6,25]; //days events occur with 2 hr advanced notice
    this.upcoming = false; //when flag is raised an event is scheduled
    this.eventStartHour = 15; //start events at 3pm
    this.eventLength = 4;
    //the event start time in hours elapsed since the beginning of the month
    this.eventSchedule21_totalhours = this.getEventStartHours(this.eventSchedule21);
    //the event start time in hours elapsed since the beginning of the month
    this.eventSchedule2_stotalhours = this.getEventStartHours(this.eventSchedule2);
    this.eventSignals= this.getEventSignals();
  }



  //pass an array of days and convert them to hours elapsed since beginning of the month
  getEventStartHours(eA){
    let tH = []
    for(e of eA){
      tH.push((e -1) * 24 + this.eventStartHour)
    }
    return tH
  }

  //returns an array of times (in total hours elapsed) when event signal is sent to participants 
  getEventSignals(){
    let allSignals = [];

    for(let e of this.eventSchedule21_totalHours){
      allSignals.push(e - 21);
    }

    for(let e of this.eventSchedule2_totalHours){
      allSignals.push(e -2);
    }

    return allSignals;
  }

  checkForSignal(d, h){
    for (s of this.eventSignals){

    }

    if (convertDHtoH(d,h) > s){
      fill(0);
      circle(d*(bW/daysInMonth[testMonth-1])-(dW*.5),canvasY+infoBarY-20,15);
    }

    if (event.eventSchedule2.includes(d)){
      fill(0);
      circle(d*(bW/daysInMonth[testMonth-1])-(dW*.5),canvasY+infoBarY-20,15);
    }
  }

  //convert day:hour to total hours
  convertDHtoH(d,h){
    tH = (d * 24) + h;
    return tH;
  }

  
}*/