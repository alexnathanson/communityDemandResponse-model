//get model settings from query string
const urlParams = new URLSearchParams(location.search);
let qString = '?';
for (const [key, value] of urlParams.entries()) {
  if(qString != '?'){
    qString = qString + "&";
  }
  qString=qString + key + '=' + value
}

//rewrite nav links
document.getElementById('network').href = document.getElementById('network').href + qString
document.getElementById('settings').href = document.getElementById('settings').href + qString
document.getElementById('single').href = document.getElementById('single').href + qString

let amtP  = urlParams.get('participants');
let participants = [];

let daysInMonth = [31,28,31,30,31,30,31,31,30,31,30,31];
//run test for August
let testMonth = 8;

console.log(urlParams.get('rSpeed'));
let runSpeed = (2000 * (1 - (urlParams.get('rSpeed') * .01)))+10;
console.log(runSpeed);

let date, clock, day
let prevHour = -1;

let events = [];
let event21=[4,5]; //days events occur with 21 hr advanced notice
let event2=[8,9]; //days events occur with 2 hr advanced notice

let eventNow = false;

//low T, high T,sky (100 = clear, 0 = rain)
let augTemp22 = [[72,75,.7],[73,88,1.0],[79,86,1.0],[77,90,1.0],[81,90,.75],[79,86,.2]]

let clockOffset = 0;

let loopIt = false;

//modes for battery charging: grid, solar
let mode = 'solar';

//flag for prediction
let eventLikely = false;
let tThresh = 85;
let predictMode = true;


function predictionSetup(){
  //place circles
  for (let p =0;p<amtP;p++){
    participants.push(new Participant(Math.trunc(random(windowWidth-50))+25,Math.trunc(random(windowHeight-50))+25));
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

function predictionLoop(){

  //100ms viz = 1 hour irl
  clock = (millis()/runSpeed) - clockOffset;
  //new Date(year,month,day,hours)
  //console.log(1+int(clock/23));
  day = int(clock/24)+1;
  //hour = clock% 24;

  //console.log(clock);
  let eventFlag = false;

  if(day<=daysInMonth[testMonth-1]){
    /*if(day == 1){
      saveFrames('out', 'png', 1, 25);
    }*/

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

    //hourly activity
    if(int(clock) != prevHour){
      prevHour = int(clock);
      
      /*//update energy consumption if event is not anticipated
      if(eventFlag == false || eventNow == true){
        if(eventLikely == false){
          for(let p=0; p < participants.length;p++){
            participants[p].updateEnergyDraw();
          }
        }
      }*/

      //update energy production
      for(let p=0; p < participants.length;p++){
        participants[p].updateEnergyChargePV();
      }
      
    }


  } else {
    //reset clock to 0 at end of month
    if(loopIt){
      clockOffset = clock + clockOffset;
    }
  }


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