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
document.getElementById('system').href = document.getElementById('system').href + qString

//instantiate new model
let model = new Model()
model.setupModel(testSettings);

let viz = new ModelVisualization(model,250,70,true);

/*********visualization stuff*********/

let participantNumber= 0;

let img;
/*let imgX = 1713;
let imgY = 964;
let imgRatio = imgY/imgX;*/
let canvasX, canvasY;
//let sideBarX = 250;
let posPV, posBatX, posGridX,posCcX, posInvX
//let infoBarY = 70
let iBy

let partC, batC, alertC,timeC, elapsedTimeC, autoC, manuC,normalC,eventC;

let pvWire,gridWire, loadWire, loadWireB, batWire, invWire, relayWire

let weather

//let showLabel = true;

//this is based on a 1000x562 (16:9) pixel window
let scaleIconsX, scaleIconsY;
let scaleIcons = 1;

let ds = 1; // drop shadow offset

let clock;

let eventSH = []

function preload() {
  img = loadImage('assets/seinfeld-bw.jpg');
}

function setup() {
  let c = window.document.getElementById('p5-canvas')
  canvasX = c.clientWidth
  canvasY= c.clientHeight

  scaleIconsX = canvasX/1000;
  scaleIconsY = canvasY/562;

  scaleIcons = scaleIconsX;
  console.log(scaleIcons)

  posPV = { x: canvasX * .35, y: canvasY*.5};
  posCcX= canvasX * .5;
  posBatX = canvasX * .6;
  posInvX = canvasX * .7;
  posGridX = canvasX * .9;


  //set top of info bar
  ibY = canvasY-viz.infoBarY;

  //sideBarX = .2 * canvasX;

  let canvas = createCanvas(canvasX, canvasY);
  canvas.parent('p5-canvas');

  //background(255)
  img.resize(canvasX-viz.sideBarX,canvasY)

  pv = new PVModule(posPV.x,posPV.y,scaleIcons,viz.showLabel);
  pv.centerX(posPV.x);
  pv.centerY(posPV.y)
  pv.label = 'solar panel'

  outlet = new EdisonOutlet(posGridX,pv.center.y, scaleIcons,viz.showLabel);
  outlet.centerX(posGridX)
  outlet.centerY(pv.center.y)
  outlet.label = 'outlet'
  outlet.showLabelPosition="right"

  cc = new ChargeController(posCcX,pv.center.y, scaleIcons,viz.showLabel);
  cc.centerX(posCcX)
  cc.centerY(pv.center.y)
  cc.label = 'charge controller'
  cc.showLabelPosition = 'top'

  bat = new Battery(posBatX,pv.center.y, scaleIcons,viz.showLabel);
  bat.centerX(posBatX)
  bat.centerY(pv.center.y)
  bat.label = 'battery'

  inv = new Inverter(posInvX,pv.center.y, scaleIcons,viz.showLabel);
  inv.centerX(posInvX)
  inv.centerY(pv.center.y)
  inv.label='inverter'

  load = new Load(100,100, scaleIcons,viz.showLabel);
  load.centerX((inv.center.x + outlet.center.x) * .5);
  load.label = 'electrical load'
  load.showLabelPosition = 'right';

  relay = new Relay(100, 100, scaleIcons,viz.showLabel)
  relay.centerY((load.center.y+outlet.center.y)*.5)
  relay.centerX(load.center.x);
  relay.label = 'switch'
  relay.showLabelPosition='right'

  //from PV to CC
  pvWire = new MultiWire([{x:pv.center.x,y:pv.center.y},{x:cc.center.x,y:cc.center.y}],scaleIcons);
  //from CC to Bat
  batWire = new MultiWire([{x:cc.center.x,y:cc.center.y},{x:bat.center.x,y:bat.center.y}],scaleIcons);
  //from Bat to Inv
  invWire = new MultiWire([{x:bat.center.x,y:bat.center.y},{x:inv.center.x,y:inv.center.y}],scaleIcons)
  //grid to relay
  //loadWire = new MultiWire([{x:outlet.center.x,y:outlet.center.y},{x:relay.center.x,y:relay.center.y}],scaleIcons);
  //inv to load
  loadWireB = new MultiWire([{x:inv.center.x,y:inv.center.y},{x:relay.center.x,y:relay.center.y}], scaleIcons);
  //loadWire.animate = 2
  relayWire = new MultiWire([{x:relay.center.x,y:relay.center.y},{x:load.center.x,y:load.center.y}],scaleIcons)


  gridWire = new MultiWire([{x:outlet.center.x,y:outlet.center.y},{x:outlet.center.x,y:outlet.center.y+100},{x:cc.center.x,y:cc.center.y+100},{x:cc.center.x,y:cc.center.y}],scaleIcons)
  console.log(gridWire.allPoints)

   //colors for energy viz
  partC = color(0,255,0);
  autoC =  color(255,150,255);
  batC = color(0,255,255);
  manuC = color(100,150,255);

  //background of timeline and clock
  timeC = color(150,150,255);

  //these colors change based on event status and prediction
  eventC = color(255,0,0); //red
  alertC = color(255,255,0); //yellow (r valued scale to prediction)
  normalC = color(0,255,0);//green

  eventSH = model.getEventStartHours();
}

function draw(){
  /*if(model.eventNow & eventShBool == false){
    eventSH = model.getEventStartHours();
    eventShBool = true;
  }
*/
  //eventSH = model.getEventStartHours();

  clock = model.elapsedHours
  //clock = millis()/500;
  //day = int(clock/24)+1;

  //background(200)

  image(img, viz.sideBarX,0);

  //day light overlay
  //fill(0,0,0,map(min(abs(12-clock%24),6),0,6,50,120));
  fill(255,255,255,100);
  rect(viz.sideBarX,0,canvasX,canvasY);

  //sidebar
  fill(150,100,200);
  rect(0,0,viz.sideBarX,canvasY);

  /*if(participants[0].batPerc == 0){
    loadWireB.state = false
  } else {
    loadWireB.state = true
  }*/

  pvWire.draw(model.participants[participantNumber].package.solarStatus)

  let bWStatus = false;
  if(model.participants[participantNumber].package.solarStatus || model.participants[participantNumber].gridChargeStatus){
    bWStatus = true;
  }
  batWire.draw(bWStatus)

  let invStatus = false;
  if(model.participants[participantNumber].package.batState > 0){
    invStatus = true;
  }

  invWire.draw(invStatus)
  gridWire.draw(model.participants[participantNumber].gridChargeStatus)
  //loadWire.draw()
  loadWireB.draw(!model.participants[participantNumber].curtailment)
  relayWire.draw(!model.participants[participantNumber].curtailment)

  pv.draw(model.participants[participantNumber].package.solarStatus)
  bat.status = model.participants[participantNumber].package.batState
  bat.draw()
  cc.draw();
  outlet.draw();
  inv.draw();
  relay.draw();
  load.on = !model.participants[participantNumber].curtailment
  load.draw();


  viz.drawInfoBar(model.getEventStartHours());
  viz.drawClock(canvasX-(viz.infoBarY*.5),ibY+(viz.infoBarY*.5), model.elapsedHours, model.eventNow);
  viz.drawClockFiller(canvasX-(viz.infoBarY*.5),ibY+(viz.infoBarY*.5), model.elapsedHours, model.eventNow);

  viz.drawKey(model);

  viz.drawLoad(model.loadProfile);

  viz.drawPrediction(model)
}