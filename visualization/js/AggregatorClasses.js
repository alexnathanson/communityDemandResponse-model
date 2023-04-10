class Model{
  constructor(){
    this.mode = 'solar' //options: solar, grid
    this.speed = 500;
    this.eventLikely = false;
    this.tThresh = 85;
    this.predictMode = true;
    this.clockOffset = 0;
    this.eventNow = false;
    this.loopIt = false;

  }

  tempPrediction(weather){
    this.eventLikely = false;

    let wT = weather.getColumn('Max_Temp');

    //let avgMaxT = (wT[day-1] + wT[day-2])*.5;

    if (this.predictMode){
      if (wT[day-1] >this.tThresh || wT[day] > this.tThresh){
        this.eventLikely = true;
      }
    }

  }
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
    this.batWh = int(random(500,2000));
    this.chargeW = int(this.batWh /6); //full charge within 6 hrs
    this.participationHistory = [];
    this.reservationW=500;
    this.eventDuration = 4; //this should be fed in from events
    this.reservationWh = this.reservationW * this.eventDuration
    this.eventStartTime = this.getStartTime(); //not currently in use
    this.manualParticipationRate = 0.2/*random(0.15,0.5)*/;
    //communication methods
    this.phone = true;
    this.sms = true;
    this.email = true;
    this.iot = true;
    this.interfaceIndicator = true;

    //visualization colors
    this.partC = color(0,255,0);
    this.autoC = color(255,150,255);
    this.batC = color(0,255,255);
    this.alertC = color(255,100,0);
    this.manuC = color(100,150,255);


  }

  updateEnergy(){
    //update power draw
    this.batPerc = max(this.batPerc - (this.loadW/this.batWh),0.0);
  }

  updateEnergyChargePV(){
    let h= int(clock%24);

    let c = false;
    if(this.mode == 'grid'){
      //grid at cheapest time of day
      if(h > 20 || h < 5){
        c= true;
      }
    } else if (this.mode == 'solar'){
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
    for (let i =0;i < int(this.eventDuration*(1-p));i++){
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
        fill(this.alertC)
      } else {
        fill(255,255,0);
      }
      text(pT,this.location[0],this.location[1])
      
      //draw info bars
      strokeWeight(5);

      //bat
      noFill();
      stroke(this.batC)
      arc(this.location[0],this.location[1], 30,30, -HALF_PI, this.percToRad(this.batPerc)-HALF_PI);

      //auto participation
      noFill();
      stroke(this.autoC)
      arc(this.location[0],this.location[1], 45,45, -HALF_PI, this.percToRad(this.automatedReplacementHistoryAvg)-HALF_PI);

      //manual participation
      noFill();
      stroke(this.manuC)
      arc(this.location[0],this.location[1], 60,60, -HALF_PI, this.percToRad(this.manualCurtailmentHistoryAvg)-HALF_PI);

      //tot participation
      noFill();
      stroke(this.partC)
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