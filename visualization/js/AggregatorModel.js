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
    this.solarAccess = 1.0; //percentage of PSH unobstructed
    this.reservationWh = this.reservationW * eD;
    this.manualParticipationRate = 0.3; //SOURCE: Smart AC Demand Control Program: Impact Evaluation Final Report 
    //communication methods
    this.phone = true;
    this.sms = true;
    this.email = true;
    this.iot = true;
    this.interfaceIndicator = true;

    /* Visualation */
    this.location = [100,100]; //this can be set indepedently by the visualizer
    /*this.partC = [0,255,0];
    this.autoC = [255,150,255];
    this.batC = [0,255,255];
    this.alertC = [255,100,0];
    this.manuC = [100,150,255];*/

    /* New stuff */

    this.package = {};
    this.csrp = new Program();
    this.dlrp = new Program();
    this.network = '';
    this.borough = '';
    //this.psh = [];

  }

  updateEnergy(eH,isPSH, weather){
    //draw down battery
    this.package.batState = this.package.batState - (this.loadProfile[eH]/ this.package.batWh)
    
    //charge battery with solar if PSH
    if(isPSH){
      this.package.batState = this.package.batState + this.package.batState.pvWatts
    }
  }

  isPSH(){

  }

  /*updateEnergyDraw(){
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
  }*/

  //this needs work
  /*updateParticipation(){
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
  }*/

  /*getTotParticipation(){

  }

  getTotCsrpParticipation(){

  }

  updateDlrpParticipation(){
  }*/

}

//class to track participation for each program
class Program{
  constructor(){
    this.participating = true;
    this.participationRateAvg = 1.0;//total participation (auto + manual)
    this.participationHistory = [];//total participation (auto + manual)
    this.automatedReplacementHistory = [];
    this.automatedReplacementHistoryAvg = 1.0;
    this.manualCurtailmentHistory = [];
    this.manualCurtailmentHistoryAvg = 1.0;
  }
}

class Package{
  constructor(p,r){
    this.package = p;
    this.pvWatts = 0;//solar array wattage
    this.batWh = 0; //capacity of battery
    this.batType = "LION";//options SLA, LION
    this.batDoD = .8;// battery depth of discharge
    this.batState = 1.0; //percentage of charge
    this.inverterType = "hybrid";//options: hybrid, off-grid, on-grid
    this.inverterEfficiency = .9 ;//inverter efficiency
    this.gridChargeRate = 0; //charger watts (how fast can the grid charge the battery per hour)
    this.smartRelay = r; //boolean for automated or manual switching

    this.setPackage();
  }

  setPackage(){

    if(this.package == 1){//PV module, battery, hybrid inverter
      this.pvWatts = 50;
      this.batWh = 2000;
      this.inverterType = "hybrid"
      this.gridChargeRate = 120;
    } else if (this.package == 2){ //PV module, grid-tied inverter
      this.pvWatts = 50;
      this.inverterType = "on-grid";
      this.gridChargeRate = 0;
    } else if (this.package == 3){ //PV module, battery, off-grid inverter
      this.pvWatts = 50;
      this.batWh = 2000;
      this.gridChargeRate = 0;
      this.inverterType = "off-grid"
    } else if (this.package == 4){//battery, hybrid inverter
      this.batWh = 2000;
      this.inverterType = "hybrid"
      this.gridChargeRate = 120;
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
    this.alertNow = false;
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
    this.weather = [];//weather data needed
    this.loadProfileFile = 'data/single-day-loadprofile.csv'
    this.loadProfile = {}
  }

//this entire function can probably be done much cleaner by properly chaining promises!
  setupModel(settings){
    this.testSettings = settings;

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
                    this.run();
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

  /*getPVWatts(city){
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
        console.error(`Error while reading response: ${error.message}`); // Log the error message
      });

    }*/

  dateDelta(d1, d2){
    return (d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24);
  }

  //arguments: DLRP CSRP or ALL
  checkOngoingEvent(){

    this.eventNow = false;

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
      }
    }
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

  }

  isPSH(){
    let month = new Date(this.nowMS).getMonth() 
    let psh = this.pvWatts.outputs['solrad_monthly'][month -1]
    if (Math.abs((this.elapsedHours % 24) - 12) < psh * .5){
      return true;
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

    //instantiate participants
    let resW = (this.testSettings['reservation'] / this.testSettings['participants']) * 1000;

    for (let p =0;p<this.testSettings['participants'];p++){
      this.participants.push(new Participant(resW, this.eventDuration));
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

      //determine likelihood of upcoming event
      this.predictEvent();

      //determine what to do with available energy and
      //update energy consumption and production states

      //update PV based on time of day and NREL PV watts data
      //center sun hours around noon

      //if no event do normal
      //pass in psh, weather
      for (let p = 0; p < this.participants.length;p++){
        this.participants[p].updateEnergy(this.elapsedHours%24, this.isPSH())
      }

      //

      //100ms viz = 1 hour irl
      //this.clock = (Date.now()/this.runSpeed) - this.clockOffset;
      //new Date(year,month,day,hours)
      //console.log(1+int(clock/23));
      //this.day = Math.floor(this.clock/24)+1;
      //hour = clock% 24;
      this.elapsedHours++;

    }

    //loop based on frame rate to avoid timeouts and give the machine some rest between loops
    if(this.elapsedHours <= (this.duration+1) * 24){
      window.requestAnimationFrame(()=>this.hourlyLoop());
    }
  }
}