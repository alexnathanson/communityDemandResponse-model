class Participant{
  constructor(){
    this.batPerc = 1.0;
    this.participationRateAvg = 1.0;//total participation (auto + manual)
    this.participationHistory = [];//total participation (auto + manual)
    this.automatedReplacementHistory = [];
    this.automatedReplacementHistoryAvg = 1.0;
    this.manualCurtailmentHistory = [];
    this.manualCurtailmentHistoryAvg = 1.0;
    this.location = [100,100]; //this can be set indepedently by the visualizer
    this.loadW = 500;
    this.batWh = Math.floor(Math.random(500,2000));
    this.psh = [5.94,5.87,6.39,5.51,5.08]; //average peak sun hours in May-September @ 20 degree tilt in central Brooklyn
    this.chargeW = Math.floor(this.batWh /Math.min(this.psh)); //full charge within min available psh
    this.solarAccess = 1.0; //percentage of PSH unobstructed
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
    this.partC = [0,255,0];
    this.autoC = [255,150,255];
    this.batC = [0,255,255];
    this.alertC = [255,100,0];
    this.manuC = [100,150,255];


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

    return Math.random(eventStartOptions);
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

/*class Event{
  constructor(){
    this.type = 'dlrp';
    this.n
  }
}*/

/*class Event{
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
}*/

class Model{
  constructor(){
    //run settings
    this.startDay = new Date("5/1/2022"); //first day of the test
    this.endDay = new Date("9/31/2022"); //last day of the test
    this.daysInMonth = [31,28,31,30,31,30,31,31,30,31,30,31];//the days in each month
    this.loopIt = false;
    //this.intervalID = {}
    this.running = false;
    this.runSpeed = 50;
    this.elapsedHours = 0;
    this.eT = 0;
    this.day = 0;
    this.startMS = Date.now();
    this.tempThresh = 85; //optimize this!
    this.eventLikely = false;
    this.eventNow = false;
    this.alertNow = false;
    this.testSettings = {}
    this.participants = [];//array of participants
    //data
    this.networkListFile = 'data/conEdNetworks2022-cleaned.csv'
    this.networkList = []
    this.activityLog = []
    this.activityLogFile = 'data/DR-activitylog-cleaned.csv'
    this.nrelKeyFile = 'nrelKey.txt';
    this.pvWatts = {};
    this.weather = [];//weather data needed
  }

  setupModel(settings){
    this.testSettings = settings;
    //instantiate participants
    for (let p =0;p<this.testSettings['participants'];p++){
      this.participants.push(new Participant());
    }

    //get network data
    this.readCSVFile(this.networkListFile,this.csvToObj)
      .then((data) => {
        this.networkList = data
        console.log(this.networkList)

        //get DR event history data
        this.readCSVFile(this.activityLogFile,this.csvToObj)
          .then((data) => {
            console.log(data)
            this.activityLog = data
            this.filterActivityLog()
            console.log(this.activityLog)

            this.run()
          })
          .catch((error) => {
            console.error(`Error while reading CSV file: ${error.message}`); // Log the error message
          });
      })
      .catch((error) => {
        console.error(`Error while reading CSV file: ${error.message}`); // Log the error message
      });

  }

  readCSVFile(file, callback) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', file, true);
      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            resolve(callback(xhr.responseText));
          } else {
            reject(new Error(`Failed to load CSV file. Status: ${xhr.status}`));
          }
        }
      };
      xhr.onerror = (error) => {
        reject(error);
      };
      xhr.send();
    });
  }

  csvToObj(response){
    const csvData = response;
    const lines = csvData.split('\n');
    const result = [];
    let headers = lines[0].split(',');
    for (let j = 0; j < lines[0].split(',').length; j++) {
      headers[j]= headers[j].replace('\r','');
    }
    for (let i = 1; i < lines.length; i++) {
      const obj = {};
      const currentLine = lines[i].split(',');
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentLine[j].replace('\r','');
      }
      result.push(obj);
    }
    return result
  }

  //filter by administrator, program, and date
  filterActivityLog(){
    let fA = []
    for(let a = 0; a < this.activityLog.length;a ++){
      //filter by administrator
      if(this.activityLog[a]["Administrator"] == "Con Edison"){
        //filter by program
        if(['DLRP','CSRP'].includes(this.activityLog[a]["Program"])){
          let e = new Date(this.activityLog[a]["Event Date"])
          //filter by date
          if(e > this.startDay & e < this.endDay){
            fA.push(this.activityLog[a])
          }
        }
      }
    }

    this.activityLog = fA;
    //console.log(this.activityLog)
  }

  getRequest(gDst){
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', gDst, true);
      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            resolve(xhr.responseText);
          } else {
            reject(new Error(`Failed to load txt file. Status: ${xhr.status}`));
          }
        }
      };
      xhr.onerror = (error) => {
        reject(error);
      };
      xhr.send();
    });
  }

  getPVWatts(city){
    this.getRequest(this.nrelKeyFile)
      .then((nKey) => {
        // api documentation: https://developer.nrel.gov/docs/solar/pvwatts/v8/#request-url
        const nAzimuth = 180; //cardinal direction
        const nCapkW = .05; //nameplate capacity minimum 0.05
        const nLat = 41; //latitude
        //const nLong //longitude
        const nTilt = nLat - 15; //priotized for summer
        const nLosses = 15; //derating
        const nInvEff = 96.0; // inverter efficiency
        let nBorough = city.replace(' ',''); //remove spaces
        const nTimeframe = 'monthly'

        let getURL = 'https://developer.nrel.gov/api/pvwatts/v8.json?api_key=' + nKey.trim() + '&azimuth=' + nAzimuth+'&system_capacity=' + nCapkW +'&losses=' + nLosses +'&array_type=1&module_type=0&inv_eff=' + nInvEff + '&tilt=' +  nTilt +'&address=' + nBorough +',ny&timeframe=' + nTimeframe
        console.log(getURL)
        this.getRequest(getURL)
          .then((data) => {
            this.pvWatts = JSON.parse(data);
            console.log(this.pvWatts)
          })
          .catch((error) => {

          });
      })
      .catch((error) => {
        console.error(`Error while reading CSV file: ${error.message}`); // Log the error message
      });

    }

  dateDelta(d1, d2){
    return (d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24);
  }

  //arguments: DLRP CSRP or ALL
  checkOngoingActivity(nowMS, p){

    for(let a = 0; a < this.activityLog.length;a ++){
   
      //convert event start time to MS
      let d = new Date(this.activityLog[a]["Event Date"]).getTime()//day of event
      let s = this.activityLog[a]["Start Time"].split(':')[0] * 60 * 60 * 1000 //hour of event

      let eventStartMS = d + s;

      //4 hour event
      let eDuration = 4 * 60 * 60 * 1000;

      //delta between now and event end
      let eDelta = eventStartMS + eDuration - nowMS

      //filter by date
      if( eDelta <= eDuration & eDelta > 0){
        this.eventNow = true;
        break;
      } else {
        this.eventNow = false;
      }
    }

  }

  //arguments: DLRP CSRP or ALL
  checkAlertActivity(nowMS,p){
    

    for(let a = 0; a < this.activityLog.length;a ++){
   
      //convert event start time to MS
      let d = new Date(this.activityLog[a]["Event Date"]).getTime()//day of event
      let s = this.activityLog[a]["Start Time"].split(':')[0] * 60 * 60 * 1000 //hour of event

      let eventStartMS = d + s;

      //advanced notice
      let eDuration;
      if (this.activityLog[a]["Program"] == 'DLRP'){
        eDuration = 2 * 60 * 60 * 1000;
      } else {
        eDuration = 21 * 60 * 60 * 1000;
      }

      //delta between now and event start
      let eDelta = eventStartMS - eDuration - nowMS

      //filter by date
      if( eDelta <= eDuration & eDelta > 0){
        this.alertNow = true;
        break;
      } else {
        this.alertNow = false;
      }
    }
    

  }

  run(){
    console.log('running!')
    this.running = true;


    this.duration = this.dateDelta(this.endDay, this.startDay)

    console.log("This test will simulate " + this.duration + " days. It is estimated to take time: " + (this.duration * this.runSpeed)/(1000*60) + " minutes")
    //this.intervalID = setInterval(this.hourlyLoop(), this.runSpeed);

    this.elapsedHours = 0;

    this.startMS = Date.now();

    this.eT = this.startMS;

    //while(this.running){

      //if(Date.now() - this.eT > this.runSpeed){
        //this.eT = Date.now()
    this.hourlyLoop()
        //this.elapsedHours++;
        //console.log(this.elapsedHours)
        /*if(this.elapsedHours > (this.duration * 24)){
          this.running = false;
        }*/
      //} 

    //}
  }

  hourlyLoop(){
    if(Date.now() - this.eT > this.runSpeed){
      this.eT = Date.now()
      //this.hourlyLoop()
      this.elapsedHours++;
      console.log(this.elapsedHours)
      
      //current point in the test converted into MS
      let nowMS = this.startDay.getTime() + (this.elapsedHours * 60 * 60 * 1000)
      //check if event is happening
      this.checkOngoingActivity(nowMS,'ALL');
      if(this.eventNow){
        console.log('!');
      }
      //check if alert has been issued
      this.checkAlertActivity(nowMS,'ALL');

      //determine likelihood of upcoming event

      //determine what to do with available energy

      //update energy consumption and production states


      //100ms viz = 1 hour irl
      //this.clock = (Date.now()/this.runSpeed) - this.clockOffset;
      //new Date(year,month,day,hours)
      //console.log(1+int(clock/23));
      //this.day = Math.floor(this.clock/24)+1;
      //hour = clock% 24;
    }
    if(this.elapsedHours <= (this.duration * 24)){
      window.requestAnimationFrame(hourlyLoop);
    }
}