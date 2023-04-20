class Participant{
  constructor(r,eD){
    this.reservationW=r;

    /*
    //this will need to be used when using participants in multiple neighborhoods
    this.eventNow = false;
    this.alertNow = false;
    this.eventPredicted = false;*/
    this.eventStartHour = 11;

    this.loadProfile=[];// need to replace this with the real thing
    this.curtailment = false;
    this.solarAccess = 1.0; //percentage of PSH unobstructed
    this.reservationWh = this.reservationW * eD;
    this.manualParticipationRate = 0.3; //SOURCE: Smart AC Demand Control Program: Impact Evaluation Final Report 
    
    this.totDCEnergy = 0; //energy produced by the PV
    this.totACEnergy = 0; //dc energy * inverter efficiency

    //communication methods
    this.phone = true;
    this.sms = true;
    this.email = true;
    this.iot = true;
    this.interfaceIndicator = true;

    this.location = [100,100]; //this can be set indepedently by the visualizer

    /* New stuff */

    this.package = {};
    this.csrp = new Program();
    this.dlrp = new Program();
    this.network = '';
    this.borough = '';
    //this.psh = [];

    this.overallParticipation = 1;
    this.overallAutoReplacement = 1;
    this.overallManualCurtailment = 1;

  }

  //returns wattage produce by solar array at this particular psh%
  //solar access variables needs
  solarProductionW(psh){
    let p = this.package.pvWatts * psh * this.solarAccess;

    if(p > 0){
      this.package.solarStatus = true;
    } else {
      this.package.solarStatus = false;
    }
    
    return p; 
  }

  //returns power produce by solar array as a % of battery capacity
  solarProductionAsBatPercentage(psh){
    return this.solarProductionW(psh) / this.package.batWh; 
  }

  //elapsed hours, psh at this moment, ongoing event status, alerted about future event, prediction for future event
  updateEnergy(eH,psh, o, eP,oP){

    let tempBatState = this.package.batState;

    //if there isn't an ongoing event
    if(!o){
      //draw down battery if no event is suspected
      tempBatState = tempBatState - (((this.loadProfile[eH]*1000)/ this.package.batWh)*(1-eP))

      //charge battery with solar if PSH
      tempBatState = tempBatState + this.solarProductionAsBatPercentage(psh)
    
      //charge battery from grid if no solar and event is anticipated
      if(psh == 0 & eP != 0){
        //console.log(psh + ' psh and ' + eP +' event, charging from grid')
        tempBatState =tempBatState + ((eP * this.package.gridChargeRate)/this.package.batWh)
      }

      this.curtailment = false;
    } else {//if there is an event ongoing

      //charge battery with solar if PSH
      tempBatState = tempBatState + + this.solarProductionAsBatPercentage(psh)

      // determine amount to of load up to reservation amt
      let eventLoad = Math.min(this.reservationW,(this.loadProfile[eH]*1000))

      //determine energy in battery available for replacement
      let availEnergy = tempBatState * this.package.batWh;

      //determined percentage of eventLoad available
      let rep = Math.min(1,availEnergy/eventLoad)

      if(oP == "CSRP"){
        this.csrp.updateAutoReplacement(rep)
        this.curtailment = this.csrp.isCurtailing;
      } else if (oP == "DLRP"){
        this.dlrp.updateAutoReplacement(rep)
        this.curtailment = this.csrp.isCurtailing;
      }
      //update
      tempBatState = tempBatState - (eventLoad/ this.package.batWh)
      
      
    }

    tempBatState = Math.max(0,tempBatState)
    this.package.batState = Math.min(1,tempBatState)

    //update total participation stats
    this.overallParticipation = (this.csrp.participationRateAvg + this.dlrp.participationRateAvg) /2
    this.overallAutoReplacement =(this.csrp.automatedReplacementHistoryAvg + this.dlrp.automatedReplacementHistoryAvg) /2
    this.overallManualCurtailment = (this.csrp.manualCurtailmentHistoryAvg + this.dlrp.manualCurtailmentHistoryAvg) /2
  }

}

//class to track participation for each program
class Program{
  constructor(){
    this.participating = true;
    this.participationRateAvg = 1.0;//total participation (auto + manual)
    this.participationHistory = [];//total participation (auto + manual)
    this.automatedReplacementHistory = [];
    this.automatedReplacementHistoryAvg = 1.0;//the % of total demand met by auto replacement
    this.manualCurtailmentHistory = [];
    this.manualCurtailmentHistoryAvg = 1.0; //the % of total demand met by manual curtailment
    this.isCurtailing = false;
  }

  //this needs fixing
  updateParticipation(){

    //this isn't an average of automated replacement and manual curtailment!
    //this is the sum of the average % auto replacement could address and the average % manual curtailment could address
    this.participationRateAvg = Math.floor((this.automatedReplacementHistoryAvg + this.manualCurtailmentHistoryAvg)*100)/100
  }

  updateAutoReplacement(p){
    //console.log(this.batPerc * this.batWh);
    p = Math.floor(p*100)/100;

    this.automatedReplacementHistory.push(p)
    
    let a = 0;
    for(let pa = 0; pa < this.automatedReplacementHistory.length;pa++){
      a = a + this.automatedReplacementHistory[pa];
    }
    this.automatedReplacementHistoryAvg = Math.floor((a/this.automatedReplacementHistory.length)*100)/100;

    this.updateManualCurtailment(1-p);//send the remaining participation percentage to manual curtailment
    this.updateParticipation()

  }

  updateManualCurtailment(p){
    p = Math.floor(p*100)/100;

    //determine chance of participation
    //assumes 30% chance every hour
    let c = 0;
    this.isCurtailing = false;
    if(Math.random() < .3){
      c =1
      this.isCurtailing = true
    }


    //p*c is the remaining % of demand response need * 30% chance of manually doing it
    this.manualCurtailmentHistory.push(p*c);

    //update manual curtailment history average
    let a = 0;
    for(let pa = 0; pa < this.manualCurtailmentHistory.length;pa++){
      a = a + this.manualCurtailmentHistory[pa];
    }
    //round average to 2 decimal places
    this.manualCurtailmentHistoryAvg = Math.floor((a/this.manualCurtailmentHistory.length)*100)/100;

  }

}

class Package{
  constructor(p,r){
    this.package = p;
    this.pvWatts = 0;//solar array wattage
    this.pvStatus = false;//is the pv module produce this hour
    this.batWh = 0; //capacity of battery
    this.batType = "LION";//options SLA, LION
    this.batDoD = .8;// battery depth of discharge
    this.batState = 1.0; //percentage of charge
    this.batChargingStatus = false; //is the battery being charge currently?
    this.batDischargingStatus = false; //is the battery discharging currently?
    this.inverterType = "hybrid";//options: hybrid, off-grid, on-grid
    this.inverterEfficiency = .9 ;//inverter efficiency
    this.gridChargeRate = 0; //charger watts (how fast can the grid charge the battery per hour)
    this.gridChargeStatus = false; //is the grid providing power this hour
    this.smartRelay = r; //boolean for automated or manual switching
    this.cost = 0; //estimated hardware costs
    this.setPackage();
  }

  setPackage(){

    if(this.package == 1){
      //PV module, battery, hybrid inverter
      //product template: https://www.goalzero.com/collections/portable-solar-generator-kits/products/goal-zero-yeti-1500x-power-station-boulder-100-briefcase-kit
      this.pvWatts = 100;
      this.batWh = 1500;
      this.inverterType = "hybrid"
      this.gridChargeRate = 120;
      this.cost = 2000;
    } else if (this.package == 2){
      //PV module, grid-tied inverter
      //products:
      //solar: $70 https://hqsolarpower.com/100-watt-12volt-polycrystalline-solar-panel/?Rng_ads=8639ed5a7d8e95a8
      //inverter: $150 https://cuttingedgepower.com/collections/grid-tie-inverters/products/260w-mini-grid-tie-inverter-for-18-50v-solar-panels-plug-and-play
      this.pvWatts = 100;
      this.inverterType = "on-grid";
      this.gridChargeRate = 0;
      this.cost = 220;
    } else if (this.package == 3){ //PV module, battery, off-grid inverter
      this.pvWatts = 100;
      this.batWh = 2000;
      this.gridChargeRate = 0;
      this.inverterType = "off-grid"
      this.cost = 600
    } else if (this.package == 4){//battery, hybrid inverter
      this.batWh = 2000;
      this.inverterType = "hybrid"
      this.gridChargeRate = 120;
      this.cost = 1500
    }

    if(this.batType == "LION"){
      this.batDoD = .8
    } else if (this.batType == "SLA"){
      this.batDoD = .5
    }
  }
}

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
    //this.day = 0;
    this.nowMS//the timestamp within the context of the test timeline
    this.startMS = Date.now();
    this.tempThresh = 85; //optimize this!
    this.eventPrediction = 0.0; //percentage of upcoming event likelihood
    this.eventNow = false;
    this.eventNowProgram = false;
    this.alertNow = false;
    this.predictionAccuracyRate = NaN;
    //this.startHour = 11;
    this.eventDuration = 4; //4 hour event
    this.testSettings = {}
    this.borough = '';
    this.participants = [];//array of participants
    //data
    this.networkListFile = 'data/conEdNetworks2022-cleaned.csv'
    this.networkList = [];
    this.activityLog = []
    this.activityLogFile = 'data/DR-activitylog-cleaned.csv'
    this.nrelKeyFile = 'nrelKey.txt';
    this.pvWatts = {};
    this.weatherFile = 'data/NWS-NY-KennedyAirport-2022-observedweather.csv';
    this.weather = {};//weather data needed
    this.loadProfileFile = 'data/single-day-loadprofile.csv'
    this.loadProfile = {}
    this.eventPrediction = 0; //percentage chance of upcoming event
  }

//this entire function can probably be done much cleaner by properly chaining promises!
  setupModel(settings){
    this.testSettings = settings;
    
    //instantiate participants
    let resW = (this.testSettings['reservation'] / this.testSettings['participants']) * 1000;

    for (let p =0;p<this.testSettings['participants'];p++){
      this.participants.push(new Participant(resW, this.eventDuration));
    }

    if(this.testSettings['timeperiod'] == 'august'){
      this.startDay = new Date("8/1/2022"); //first day of the test
      this.endDay = new Date("8/31/2022"); //last day of the test
    } else if (this.testSettings['timeperiod'] == 'aWeek'){
      this.startDay = new Date("8/1/2022"); //first day of the test
      this.endDay = new Date("8/7/2022"); //last day of the test
    } else if (this.testSettings['timeperiod'] == 'jWeek'){
      this.startDay = new Date("7/1/2022"); //first day of the test
      this.endDay = new Date("7/7/2022"); //last day of the test
    } else if (this.testSettings['timeperiod'] == 'day'){
      this.startDay = new Date("8/1/2022"); //first day of the test
      this.endDay = new Date("8/2/2022"); //last day of the test
    }

    //get network data
    this.readCSVFile(this.networkListFile,this.csvToObj)
      .then((data) => {
        this.networkList = data
        
        //get borough
        for(let b = 0; b < this.networkList.length;b++){
          if(this.testSettings['network'] == this.networkList[b]['network']){
            this.borough = this.networkList[b]['borough'];
            //this.getPVWatts(this.borough)
            break;
          }
        }


        //get DR event history data
        this.readCSVFile(this.activityLogFile,this.csvToObj)
          .then((data) => {
            console.log(data)
            this.activityLog = data
            this.filterActivityLog()
            console.log(this.activityLog)


            //get load profile data
            this.readCSVFile(this.loadProfileFile,this.csvToObj)
              .then((data) => {
                console.log(data)
                this.loadProfile = data

                //get NREL PV Watts data
                this.getRequest(this.pvWattsRequest(this.borough))
                  .then((data) => {
                    this.pvWatts = JSON.parse(data);
                    console.log(this.pvWatts)

                    //get weather data
                    this.readCSVFile(this.weatherFile,this.csvToObj)
                      .then((data) => {
                        console.log(data)
                        this.weather = data
                        this.run();
                        })
                    .catch((error) => {
                    });
                  })
                  .catch((error) => {
                  });
              })
              .catch((error) => {
                console.error(`Error while reading CSV file: ${error.message}`); // Log the error message
              });
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

  pvWattsRequest(city){
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

    let getURL = 'https://developer.nrel.gov/api/pvwatts/v8.json?api_key=' + nrelKey + '&azimuth=' + nAzimuth+'&system_capacity=' + nCapkW +'&losses=' + nLosses +'&array_type=1&module_type=0&inv_eff=' + nInvEff + '&tilt=' +  nTilt +'&address=' + nBorough +',ny&timeframe=' + nTimeframe

    return getURL
  }

  dateDelta(d1, d2){
    return (d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24);
  }

  //arguments: DLRP CSRP or ALL
  checkOngoingEvent(){

    this.eventNow = false;
    this.eventNowProgram = false;

    //loop through all events
    for(let a = 0; a < this.activityLog.length;a ++){

      //event start hour
      let s = 0;

      //get the date of the event in MS
      let d = new Date(this.activityLog[a]["Event Date"]).getTime()//day of event in MS
        
      //csrp entries are listed multiple times in the activity log and need to be filtered be network
      //get event star time
      if(this.activityLog[a]["Zone/Network"]=="All"){

        //all participants are in the same neighborhood
        //this will need to change if they are all unique
        s = this.participants[0].eventStartHour * 60 * 60 * 1000

      } else if(this.activityLog[a]["Zone/Network"].toLowerCase() == this.participants[0].network){
        //if your specific network is identfied use the start date in the log
        s = this.activityLog[a]["Start Time"].split(':')[0] * 60 * 60 * 1000 //hour of event
      }

      let eventStartMS = d + s;

      //filter by date
      if( this.nowMS - eventStartMS <= (4 * 60 * 60 * 1000) & this.nowMS - eventStartMS  > 0){
        this.eventNow = true;
        this.eventNowProgram = this.activityLog[a]['Program'];
      }
    }
  }

  getEventStartHours(){
    let sH = [];

    //loop through all events
    for(let a = 0; a < this.activityLog.length;a ++){

      //event start hour
      let s = 0;

      //get the date of the event in MS
      let d = new Date(this.activityLog[a]["Event Date"]).getTime() / 1000 / 60 /60//day of event in MS
        
      //csrp entries are listed multiple times in the activity log and need to be filtered be network
      //get event star time
      if(this.activityLog[a]["Zone/Network"]=="All"){

        //all participants are in the same neighborhood
        //this will need to change if they are all unique
        s = this.participants[0].eventStartHour

      } else if(this.activityLog[a]["Zone/Network"].toLowerCase() == this.participants[0].network){
        //if your specific network is identfied use the start date in the log
        s = this.activityLog[a]["Start Time"].split(':')[0] //hour of event
      }

      sH.push(d + s);      
    }
    return sH;
  }

  //arguments: DLRP CSRP or ALL
  checkAlertActivity(){

    this.alertNow = false;

    //loop through all events
    for(let a = 0; a < this.activityLog.length;a ++){

      //event start hour
      let s = 0;

      //get the date of the event in MS
      let d = new Date(this.activityLog[a]["Event Date"]).getTime()//day of event in MS
        
      //csrp entries are listed multiple times in the activity log and need to be filtered be network
      //get event star time
      if(this.activityLog[a]["Zone/Network"]=="All"){

        //all participants are in the same neighborhood
        //this will need to change if they are all unique
        s = this.participants[0].eventStartHour * 60 * 60 * 1000

      } else if(this.activityLog[a]["Zone/Network"].toLowerCase() == this.participants[0].network){
        //if your specific network is identfied use the start date in the log
        s = this.activityLog[a]["Start Time"].split(':')[0] * 60 * 60 * 1000 //hour of event
      }

      let eventStartMS = d + s;

      //set alert window by program
      let eDuration;
      if (this.activityLog[a]["Program"] == 'DLRP'){
        eDuration = 2 * 60 * 60 * 1000;
      } else {
        eDuration = 21 * 60 * 60 * 1000;
      }

      //filter by date
      if(  eventStartMS - this.nowMS <= eDuration &  eventStartMS - this.nowMS > 0){
        this.alertNow = true;
      }
    }
  }

  predictEvent(){
    //Event prediction based on previous 48hr recorded temp and 24hr forecast
    //data base of 2022 weather forecasts needed!

    //get the number of the day in 2022 that the test is currently at
    let dayofY = Math.floor((this.nowMS - new Date('1/1/2022').getTime()) / 1000/ 60/60 /24);

    //get the percentage of the temperature in the range of 85-95F
    //under 85 returns 0
    //over 95 returns 1
    let tod = Math.min(Math.max((this.weather[dayofY]['Max T'] - 85)/10,0),1);
    let yes = Math.min(Math.max((this.weather[dayofY-1]['Max T'] - 85)/10,0),1);
    let tom = Math.min(Math.max((this.weather[dayofY+1]['Max T'] - 85)/10,0),1);

    //return the average 3 day % between 80-95.
    return (tod+yes+tom)/3;
    //return 0;
  }

  //returns a % of the psh if its a sun hour
  //(i.e. if there are 3.5 sun hours it splits the .5 hour before the start and end of the PSH window)
  //returns 0 if not psh
  isPSH(){
    let month = new Date(this.nowMS).getMonth() 
    let psh = this.pvWatts.outputs['solrad_monthly'][month -1]
    //console.log(psh)
    if (Math.abs((this.elapsedHours % 24) - 12) < Math.floor(psh * .5)  ){
      return 1;
    } else if (Math.abs((this.elapsedHours % 24) - 12) < psh * .5){
      let r = (psh * .5)- Math.floor(psh * .5 )
      //console.log(r)
      return r;
    } else {
      return 0;
    }
  }

  run(){
    console.log('creating participants')
    
    //get start hour
    let sH;
    for(let n = 0; n < this.networkList.length;n++){
      if(this.testSettings.network == this.networkList[n]['network']){
        sH = this.networkList[n]['start time'].split(':')[0];
        break;
      }
    }

    for (let p =0;p<this.testSettings['participants'];p++){
      //this.participants.push(new Participant(resW, this.eventDuration));
      //this.participants[p].reservationW = resW;
      this.participants[p].dlrp.participating = (this.testSettings['DLRP'] == 'true');
      this.participants[p].csrp.participating = (this.testSettings['CSRP'] == 'true');
      this.participants[p].network = this.testSettings['network'];
      this.participants[p].borough = this.borough;
      this.participants[p].solarAccess = 1.0;
      this.participants[p].package = new Package(this.testSettings['package'],(this.testSettings['smart-relay'] == 'true'));
      this.participants[p].eventStartHour = sH

      for(let l = 0; l < this.loadProfile.length;l++){
        this.participants[p].loadProfile.push(this.loadProfile[l]['USAGE']);
      }

    }

    console.log('running!')
    this.running = true;

    //dateDelta returns days
    this.duration = this.dateDelta(this.endDay, this.startDay)

    let durationHours = this.duration * 24
    console.log(this.runSpeed)
    let runDuration = (Math.floor((durationHours * (this.runSpeed/1000/60))*100))/100

    if(runDuration > 1.0){
      runDuration = runDuration + " minutes"
    } else {
      runDuration = Math.floor(runDuration * 60) + " seconds"
    }
    console.log("This test will simulate " + this.duration + " days. It is estimated to take time: " + runDuration)
    //this.intervalID = setInterval(this.hourlyLoop(), this.runSpeed);

    this.elapsedHours = 0;

    this.startMS = Date.now();

    this.eT = this.startMS;

    this.hourlyLoop();
  }

  hourlyLoop(){
    if(Date.now() - this.eT > this.runSpeed){
      this.eT = Date.now()
      //this.hourlyLoop()
      //console.log(this.elapsedHours)

      //current point in the test converted into MS
     this.nowMS = this.startDay.getTime() + (this.elapsedHours * 60 * 60 * 1000)

      //check if event is happening
      this.checkOngoingEvent();

      //check if alert has been issued
      this.checkAlertActivity();

      if(this.alertNow){
        this.eventPrediction = 1;
      } else {
        //determine likelihood of upcoming event
        this.eventPrediction = this.predictEvent();
      }

      //if no event do normal
      //pass in hour of the day, psh, event status, and prediction
      for (let p = 0; p < this.participants.length;p++){
        this.participants[p].updateEnergy(this.elapsedHours%24, this.isPSH(), this.eventNow, this.eventPrediction, this.eventNowProgram)
      }

      this.elapsedHours++;

    }

    //loop based on frame rate to avoid timeouts and give the machine some rest between loops
    if(this.elapsedHours <= (this.duration+1) * 24){
      window.requestAnimationFrame(()=>this.hourlyLoop());
    }
  }
}