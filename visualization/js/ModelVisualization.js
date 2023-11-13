class ModelVisualization{
  constructor(m,sX,iY,sL){
    this.sideBarX = sX
    this.infoBarY = iY
    this.model = m
    this.participantNumber = 0;
    this.pScale = 1;
    this.showLabel = sL
  }

  drawClock(cX,cY,c,eF){
    this.fillColor()
    stroke(0)
    rect(canvasX-this.infoBarY,canvasY - this.infoBarY,canvasX,this.infoBarY);

    fill(0,100)
    rect(canvasX-this.infoBarY,canvasY - this.infoBarY,canvasX,this.infoBarY);

    ellipseMode(CENTER);

    fill(timeC);
    circle(cX,cY,60);

    //change to red if event is upcoming/ongoing
    this.fillColor()
    arc(cX,cY, this.infoBarY-10, this.infoBarY-10, -HALF_PI, (((c% 24)/24)*TWO_PI)-HALF_PI);
  }

  drawClockFiller(cX,cY,c,eF){
    this.fillColor()
    stroke(0)
    rect(canvasX-this.infoBarY,canvasY - this.infoBarY*2,canvasX,this.infoBarY);

    fill(0,100)
    rect(canvasX-this.infoBarY,canvasY - this.infoBarY*2,canvasX,this.infoBarY);

    ellipseMode(CENTER);

    fill(timeC);
    circle(cX,cY-this.infoBarY,60);

    //change to red if event is upcoming/ongoing
    this.fillColor()
    arc(cX,cY-this.infoBarY, this.infoBarY-10, this.infoBarY-10, -HALF_PI, (((c% 24)/24)*TWO_PI)-HALF_PI);
  }


  fillColor(m){
    if(this.model.eventNow){
      fill(eventC)
    } else if(this.model.alertNow){
      fill(alertC)
    } else {
      fill(normalC);
    }
  }

  drawInfoBar(sh){
  //progress bar parent box

    textSize(16);

    let bW = canvasX-this.infoBarY;

    let totDays = ((this.model.endDay.getTime()-this.model.startDay.getTime())/1000/60/60/24)
    let currentHour = (this.model.nowMS-this.model.startDay.getTime())/1000/60/60

    //width of each day within box
    let dW = bW/(totDays+1);

    fill(timeC);
    rect(0,ibY,bW,this.infoBarY);

    //progress bar
    this.fillColor()

    stroke(0)
    rect(0,ibY, currentHour*(dW/24),canvasY);

    this.drawWeather(dW);

    //day ticks
    stroke(0)
    for (let t = 1; t <= totDays; t++){
      let tX = t*dW;
      line(tX, canvasY,tX,canvasY-20);
    }

    //TEXT
    noStroke();
    fill(0);
    text(new Date(this.model.nowMS), 60, ibY+25);
    //text("TIME: " + (millis()/1000), 100,canvasY+25);

    //text("Average Network Participation Rate: " + getTotAvgParticipation() + "% ($" + getAvgIncome() + " per participant)", 400, ibY+25);

    //draw event flag
    //check for past events
    let sH = this.model.startDay.getTime() / 1000 /60/ 60
    let hDelta = (this.model.endDay.getTime() / 1000 /60/ 60) - sH

    //console.log(model.elapsedHours)
    //let eventSH = m.getEventStartHours()//redundant because model was already passed in (i think)
    for (let s of sh){
      if ((this.model.elapsedHours + sH) > s){
      //circle(int(s.startTotHour*(dW/24)),canvasY+this.infoBarY-20,15);
      push();
        textAlign(CENTER,CENTER);
        textSize(24);
        textStyle(BOLD);
        //console.log(((s-sH)/hDelta)*bW)
        fill(255);
        text("!",int(((s-sH)/hDelta)*bW)+ds,canvasY-20+ds);
        fill(0)
        text("!",int(((s-sH)/hDelta)*bW),canvasY-20);
      pop();
      }
    }
  }

  drawWeather(dW){

    push()

      let eD = int(this.model.elapsedHours /24) 
      let tMin = 80;
      let tMax = 100
      
      for (let d = 0; d < eD; d++){

        let startDayNumber =Math.floor(this.model.startDay.getTime()/1000/60/60/24) - Math.floor(new Date("1/1/2022").getTime()/1000/60/60/24)

        
        stroke(0);
        fill(map(this.model.weather[d+startDayNumber]['Max T'],tMin,tMax,0,255),0,map(this.model.weather[d+startDayNumber]['Max T'],tMin,tMax,255,0))
        rect(d*dW,map(this.model.weather[d+startDayNumber]['Max T'],tMin,tMax,canvasY,canvasY-45), dW,canvasY)

        /*
          dWH = dW * .5;
          line((d)*dW +dWH,map(model.weather[d+startDayNumber]['Max T'],50,100,canvasY,canvasY-45),
          ((d+1)*dW)+dWH,map(model.weather[d+startDayNumber+1]['Max T'],50,100,canvasY,canvasY-45));*/
      }

      noStroke()
      fill(255)
      textSize(12);
      textAlign(LEFT, CENTER);
      text(tMax + "F", 5+ds,canvasY-45 +ds);
      text("TEMP", 5+ds,canvasY-25+ds);
      text(tMin + "F", 5+ds,canvasY-5+ds);
      
      fill(0)
      text(tMax + "F", 5,canvasY-45);
      //line(0,canvasY+this.infoBarY-45,10,canvasY+this.infoBarY-45)
      text("TEMP", 5,canvasY-25);
      text(tMin + "F", 5,canvasY-5);
    pop();
  }

  drawKey(m){
    let kY = 15;
    let kH = 25;
    let kX = 15;
    let kW = viz.sideBarX-(kX*2);

    fill(220,240,255)
    rect(0,0,viz.sideBarX,ibY);

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
      stroke(eventC);
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

      textStyle(BOLD)
      textSize(16)
      text("Aggregation Stats",kX+kW*.5, kY + (kH *6));

      textStyle(NORMAL)
      textSize(13);
      text("Total CSRP: " + m.participants[this.participantNumber].csrp.participationRateAvg,kX+kW*.5, kY + (kH *7));
      textStyle(NORMAL);
      text("Automated Replacement: " + m.participants[this.participantNumber].csrp.automatedReplacementHistoryAvg,kX+kW*.5, kY + (kH *8));
      text("Automated Curtailment: " + m.participants[this.participantNumber].csrp.automatedCurtailmentHistoryAvg,kX+kW*.5, kY + (kH *9));
      text("Manual Curtailment: " + m.participants[this.participantNumber].csrp.manualCurtailmentHistoryAvg,kX+kW*.5, kY + (kH *10));
      text("-----",kX+kW*.5, kY + (kH *11))
      text("Total DLRP: " + m.participants[this.participantNumber].dlrp.participationRateAvg,kX+kW*.5, kY + (kH *12));
      textStyle(NORMAL);
      text("Automated Replacement: " + m.participants[this.participantNumber].dlrp.automatedReplacementHistoryAvg,kX+kW*.5, kY + (kH *13));
      text("Automated Curtailment: " + m.participants[this.participantNumber].dlrp.automatedCurtailmentHistoryAvg,kX+kW*.5, kY + (kH *14));
      text("Manual Curtailment: " + m.participants[this.participantNumber].dlrp.manualCurtailmentHistoryAvg,kX+kW*.5, kY + (kH *15));


      text("Solar Energy Produced: " + m.participants[this.participantNumber].totDCEnergykWh + "kWh DC",kX+kW*.5, kY + (kH *17));
      text("Grid Energy Replaced: " + m.participants[this.participantNumber].totACEnergykWh + "kWh AC",kX+kW*.5, kY + (kH *18));
      text("Estimated Cost of Hardware: $"+m.participants[this.participantNumber].package.cost,kX+kW*.5, kY + (kH *19));
      text("Total DR Income: $" + m.participants[this.participantNumber].totDRIncome,kX+kW*.5, kY + (kH *20));
      text("Avoided Energy Costs @\u00A222/kWh: $" + (Math.floor(.22 * m.participants[this.participantNumber].totACEnergykWh*100)/100),kX+kW*.5, kY + (kH *21));
      text("Est Hardware ROI: " + m.participants[this.participantNumber].roi + 'yrs',kX+kW*.5, kY + (kH *22));
      //text("Prediction Accuracy: " + m.predictionAccuracyRate,kX+kW*.5, kY + (kH *23));
      /*stroke(200,200,200);
      line(kX,kY + (kH *6),kX+kW,kY + (kH *6));*/
      /*fill(0);
      noStroke();*/
    
    pop()
  }

  /*estimateHardwareROI(m){
    let dR = ((m.participants[this.participantNumber].dlrp.resIncome + m.participants[this.participantNumber].csrp.resIncome) * 5) + m.participants[this.participantNumber].csrp.partIncome + m.participants[this.participantNumber].dlrp.partIncome
    let aAE = 365*((.22 * m.participants[this.participantNumber].totACEnergykWh)/Math.floor(m.elapsedHours/24))
    
    return Math.floor((m.participants[this.participantNumber].package.cost/(dR + aAE))*100)/100
  }*/

  drawP(p){
    push();

      //draw P with drop shadow
      fill(255);
      //circle(this.location[0],this.location[1],this.batStat * 15);
      textAlign(CENTER,CENTER);
      textStyle(BOLD);
      fill(0);
      textSize( this.pScale * 16);

      let pT = 'P';
      if(model.eventNow){
        /*fill(255);
        circle(this.location[0],this.location[1], 30,30)*/
        pT = "!";
      }
      text(pT,p.location[0]+1,p.location[1]+1)
      
      this.fillColor();

      text(pT,p.location[0],p.location[1])
      
      //draw info bars
      strokeWeight( this.pScale * 5);

      //bat
      noFill();
      stroke(batC)
      arc(p.location[0],p.location[1], this.pScale * 30, this.pScale * 30, -HALF_PI, percToRad(p.package.batState)-HALF_PI);

      //DLRP participation
      noFill();
      stroke(autoC)
      arc(p.location[0],p.location[1],  this.pScale * 45, this.pScale * 45, -HALF_PI, percToRad(p.overallAutoReplacement)-HALF_PI);

      //CSRP participation
      noFill();
      stroke(manuC)
      arc(p.location[0],p.location[1],  this.pScale * 60, this.pScale * 60, -HALF_PI, percToRad(p.overallManualCurtailment)-HALF_PI);

      //tot participation
      noFill();
      stroke(partC)
      arc(p.location[0],p.location[1],  this.pScale * 75, this.pScale * 75, -HALF_PI, percToRad(p.overallParticipation)-HALF_PI);
    pop();
  }

  drawLoad(lP){
    push();
      let bW = canvasX-this.infoBarY;

      let lbY = ibY-this.infoBarY
      let totHours = ((this.model.endDay.getTime()-this.model.startDay.getTime())/1000/60/60)
      let currentHour = (this.model.nowMS-this.model.startDay.getTime())/1000/60/60

      //width of each day within box
      let hW = bW/(totHours+24);

      fill(255,150,0);
      rect(0,lbY,bW,this.infoBarY);

      //let hourInYr = (this.model.nowMS-new Date('1/1/2022').getTime())/1000/60/60

      noStroke()
      fill(0,100)
      //strokeWeight(hW)
      for(let h = 0; h < currentHour;h++){
        //rectMode(CORNERS)
        rect(h*(bW/(totHours+24)),ibY,hW, - (this.infoBarY*lP[h%24])*.95)
        //line(h*(bW/(totHours+24)),ibY,h*(bW/(totHours+24)), ibY - (this.infoBarY*lP[h%24])*.95)
      }
    pop();
  }

  drawPrediction(m){
    push();
      let bW = canvasX-this.infoBarY;

      //let lbY = ibY-this.infoBarY
      let totHours = ((this.model.endDay.getTime()-this.model.startDay.getTime())/1000/60/60)
      let currentHour = (this.model.nowMS-this.model.startDay.getTime())/1000/60/60

      //width of each day within box
      let hW = bW/(totHours+24);

      //let hourInYr = (this.model.nowMS-new Date('1/1/2022').getTime())/1000/60/60

      noStroke()
      fill(0,100)
      //strokeWeight(hW)
      for(let h = 0; h < currentHour;h++){
        //rectMode(CORNERS)
        rect(h*hW,canvasY,hW, - (this.infoBarY*m.hourlyEventPredictionLog[h]))
        //line(h*(bW/(totHours+24)),ibY,h*(bW/(totHours+24)), ibY - (this.infoBarY*lP[h%24])*.95)
      }
    pop();
  }
}

class Component{
  constructor(x,y,s,sL){
    this.x = x;
    this.y = y;
    this.scale = s;
    this.w = 100 * this.scale;
    this.h = 100 * this.scale;
    this.center = this.setCenter();
    this.color = color(int(random(255)),int(random(255)),int(random(255)), 255);
    this.label = 'component'
    this.showLabel = sL;
    this.showLabelPosition = 'bottom';//possible values are botton, top, left,right
    this.cost = 100;//dollar cost
    this.lifespan = 5; //life span in years
  }

  centerX(x){
    this.x = this.x + (x - this.center.x)
    this.center = this.setCenter()
  }

  centerY(y){
    this.y = this.y + (y - this.center.y)
    this.center = this.setCenter()
  }

  setCenter(){
    return { x: this.x + (this.w * .5), y: this.y + (this.h * .5)};
  }

  get centerT(){
    return this.center;
  }

  drawLabel(){
    push()

      if(this.showLabel){
        noStroke();
        textSize(14* this.scale)
        textStyle(BOLD)
        if(this.showLabelPosition=='bottom'){
          textAlign(CENTER,TOP)
          for(let d=1; d>=0;d--){
            fill(255*d)
            text(this.label, this.w*.5+(d*1),this.h+10+(d*1))
          }
          
        } else if(this.showLabelPosition=='top'){
          textAlign(CENTER,BOTTOM)
          for(let d=1; d>=0;d--){
            fill(255*d)
            text(this.label, this.w*.5+(d*1),-10 + (d*1))
          }
          //text(this.label, this.w*.5,10)
        }  else if(this.showLabelPosition=='left'){
          textAlign(RIGHT,CENTER)
          for(let d=1; d>=0;d--){
            fill(255*d)
            text(this.label, -10+(d*1),this.h*.5+(d*1))
          }
          //text(this.label, -10,this.h*.5)
        }  else if(this.showLabelPosition=='right'){
          textAlign(LEFT,CENTER)
          for(let d=1; d>=0;d--){
            fill(255*d)
            text(this.label, this.w+10*.5+(d*1),this.h*.5+(d*1))
          }
          //text(this.label, this.w+10,this.h*.5)
        } 
      }
    pop();
  }
}

class PVModule extends Component{
  constructor(x,y,s,sL){
    super(x,y,s,sL)
    this.w = 100*this.scale;
    this.h = 210*this.scale;
    this.pvAmtX = 5;
    this.pMarginX = 2 * this.scale;
    this.pFrame = 3;
    this.pD = (this.w-(this.pMarginX*(this.pvAmtX+1))) / this.pvAmtX
    this.pvAmtY = int(this.h/this.pD);
    this.pMarginY = (this.h - (this.pD*this.pvAmtY))/(this.pvAmtY+1);
    this.backSheetColor = color(255);
    this.backSheetColorSun = color(255,255,0);
  }

  draw(b){
    push();
      translate(this.x,this.y)

      //frame
      fill(200,200,255);
      rect(this.pFrame* -1,this.pFrame* -1, this.w + this.pFrame*2, this.h + this.pFrame * 2);
      //backsheet
      if(b){
        fill(this.backSheetColorSun)
      } else {
        fill(this.backSheetColor)
      }
      rect(0,0,this.w,this.h);

      //cells
      fill(0,0,200)
      for (let x = 0; x < this.pvAmtX ;x++){
        for(let y = 0; y<this.pvAmtY;y++){

          let cellX =(x*this.pD)+(this.pMarginX*(x+1))
          let cellY = (y*this.pD)+(this.pMarginY*(y+1))
          rect(cellX,cellY,this.pD,this.pD,5); 

        }
      }

      this.drawLabel();

    pop();
  }
}

class ChargeController extends Component{
  constructor(x,y,s,sL){
    super(x,y,s,sL);
    this.w = 50 * this.scale;
    this.h = 75 * this.scale;
    //this.center =  { x: this.x + (this.w * .5), y: this.y + (this.h * .5)};
    //this.center = this.setCenter();
    this.color = color(200)
  }

  draw(){

    push();
      translate(this.x,this.y)
      fill(this.color);
      rect(0,0,this.w,this.h);

      fill(50);
      rect(10,10,this.w-20,this.h*.25);

      for(let i=1;i<=6;i++){
        circle(i*(this.w/7),this.h-10,5)
      }

      this.drawLabel();

    pop();
  }

}

class Relay extends Component{
  constructor(x,y,s,sL){
    super(x,y,s,sL);
    this.w = 20 * this.scale;
    this.h = 30 * this.scale;
    //this.center =  { x: this.x + (this.w * .5), y: this.y + (this.h * .5)};
    //this.center = this.setCenter();
    this.color = color(50,200,50)
    this.state = false
  }

  draw(){

    push();
      translate(this.x,this.y)
      if(this.state){
        fill(this.color);
      } else {
        fill(200,50,50);
      }
      rect(0,0,this.w,this.h);

      if(this.state){
        textAlign(CENTER,BOTTOM);
        stroke(0);
        fill(200,200,200)
        rect(2,5,this.w-4,(this.h-10)*.5,2);
        stroke(0)
        text("I", this.w*.5, 5+(this.h*.5 -5))

      } else {
              textAlign(CENTER,TOP);

        stroke(0);
        fill(200,200,200)
        rect(2,this.h*.5,this.w-4,(this.h-10)*.5,2);
        stroke(0)
        text("O", this.w*.5, 5+(this.h*.5 -5))
      }
      this.drawLabel();
      
    pop();
  }

}

class Inverter extends Component{
  constructor(x,y,s,sL){
    super(x,y,s,sL);
    this.w = 75 * this.scale;
    this.h = 30 * this.scale;
    //this.center =  { x: this.x + (this.w * .5), y: this.y + (this.h * .5)};
    this.center = this.setCenter();
    this.color = color(100,255,100)
  }

  draw(){

    push();
      translate(this.x,this.y)
      fill(this.color);
      rect(0,0,this.w,this.h);

      fill(255,100,100)
      let tY =5*this.scale
      //terminal 1
      let t1Y = 2 * this.scale
      rect(-10,t1Y,10,tY)

      //terminal 2
      fill(120)
      let t2Y = this.h-t1Y-tY
      rect(-10,t2Y,10,tY)

      stroke(0)
      noFill();
      textAlign(CENTER,CENTER)
      text('DC/AC',this.w*.5,this.h*.5)
      this.drawLabel();

    pop();
  }

}

class Battery extends Component{
  constructor(x,y,s,sL){
    super(x,y,s,sL);
    this.w = 75 * this.scale;
    this.h = 50 * this.scale;
    this.status = 1.0
    this.color = color(200);
    this.statusColor = color(255,255,0);
  }

  draw(){

    push();
      translate(this.x,this.y)
      fill(this.color);
      rect(0,0,this.w,this.h);

      //status
      fill(this.statusColor);
      rect(3,this.h * (1-this.status),this.w-6,this.h * this.status -3)

      fill(230,230,255)
      //terminal 1
      let t1X = 5 * this.scale
      rect(t1X,0,t1X+(5*this.scale),-7*this.scale)

      //terminal 2
      let t2X = this.w-t1X
      rect(t2X,0,t1X*-2,-7*this.scale)
      this.drawLabel();
    pop();
  }

}

class SolarGenerator extends Battery{
  constructor(x,y,s,sL){
    super(x,y,s,sL);
    this.w = 100 * this.scale;
    this.h = 100 * this.scale;
  }

  draw(){

    push();
      translate(this.x,this.y)
      fill(this.color);
      rect(0,0,this.w,this.h);

      //status
      fill(255,255,0)
      rect(3,this.h * (1-this.status),this.w-6,this.h * this.status -3)

      fill(230,230,255)
      //terminal 1
      let t1X = 5 * this.scale
      rect(t1X,0,t1X+(5*this.scale),-7*this.scale)

      //terminal 2
      let t2X = this.w-t1X
      rect(t2X,0,t1X*-2,-7*this.scale)
      this.drawLabel();
    pop();
  }

}

class Load extends Component{
  constructor(x,y,s,sL){
    super(x,y,s,sL);
    /*this.scale = scale;
    this.loadX = loadX;
    this.loadY = loadY;
    this.center = { x: this.x + (this.w * .5), y: this.y + (this.h * .5)};*/
    this.w = 25 * this.scale;
    this.h = 40 * this.scale;
    //this.center = this.setCenter();
    this.on = true;
    this.color = this.setColor();

  }

  draw(){
    
    this.setColor();

    push();

      translate(this.x,this.y)

      strokeWeight(5*this.scale)
      stroke(200,200,255)
      line(5*this.scale,6.5*this.scale,this.w-(5*this.scale),5*this.scale)
      line(5.5*this.scale,12*this.scale,this.w-(5.5*this.scale),10.5*this.scale)
      line(7*this.scale,17.5*this.scale,this.w-(7*this.scale),16*this.scale)

      fill(this.color);
      noStroke();

      circle(this.w*.5,this.h*-.4,this.h);
      
      fill(255)
      rect(0,0,this.w,this.h*.09,5);


      this.drawLabel();

    pop();
  }

  setColor(){
    if(this.on){
      this.color = color (255,255,0,230)
    } else {
      this.color = color(255,200)
    }
  }
}


class EdisonOutlet extends Component{
  constructor(x,y,s,sL){
    super(x,y,s,sL)
    this.w = 30 * this.scale;
    this.h = 50 * this.scale;
    //this.center = { x: this.x + (this.w * .5), y: this.y + (this.h * .5)};
    //this.center = this.setCenter();
    this.color = color (200,255,200)
  }

  draw(){
    push()
      translate(this.x,this.y)

      fill(this.color);
      rect(0,0,this.w,this.h);

      rectMode(CENTER);
      fill(0);
      rect(this.w*.3,this.h*.3,this.w*.1,this.h*.25)
      rect(this.w*.7,this.h*.3,this.w*.1,this.h*.2)

      //circle(eW*.5, eH * .7,eW*.4)
      let p1 = { x: this.w*.35, y: this.h * .7 };
      let p2 = { x: this.w*.35, y: this.h * .7 - (this.h* .2) };
      let p3 = { x: this.w*.65, y: this.h * .7 - (this.h* .2) };
      let p4 = { x: this.w*.65, y: this.h * .7 };

      bezier(p1.x,p1.y,p2.x,p2.y,p3.x,p3.y,p4.x,p4.y)

      line(p1.x,p1.y,p4.x,p4.y )

      noFill();
      strokeJoin(ROUND)
      rect(this.w*.5,this.h*.5 -(this.h* .05),this.w*.7,p4.y, 15)
      this.drawLabel();
    pop()
  }
  
}

class Wire{
  constructor(sX,sY,eX,eY, dir,scale){
    this.startX = sX;
    this.startY = sY;
    this.endX = eX;
    this.endY = eY;
    this.scale = scale;
    //1 is start to end, -1 is end to start
    this.direction = dir;
    this.wireThickness = Math.max(10 * this.scale,0);
    this.wireColor = color(0,0,0,255);
    this.distance=dist(this.startX,this.startY,this.endX,this.endY);
    this.height = this.startY - this.endY
    this.width = this.startX - this.endX
    this.state = true;
  }

  draw(){
    push()
      //wire under shadow
      strokeWeight(this.wireThickness+2);
      stroke(255);
      line(this.startX,this.startY,this.endX,this.endY);

      strokeWeight(this.wireThickness);
      stroke(this.wireColor);
      line(this.startX,this.startY,this.endX,this.endY);

      strokeWeight(this.wireThickness*.1)
      stroke(255,0,0)
      fill(255,255,0)


      let xUnit = (this.endX - this.startX )/10

      let tD = this.wireThickness * .3

      if(this.state){
        for (let a = 0; a < 10;a++){
          let pointX=this.startX + (xUnit*a);
          let pointY=this.startY + ((this.endY - this.startY)/10)*a;


          if(int(clock/2) % 2 == 0 ){
            pointX = pointX + ((this.startX - this.endX) *.05);
            pointY = pointY + ((this.startY - this.endY) *.05);
          }
          
          push()
            translate(pointX, pointY)
            rotate(this.getRotation())
            //triangle(pointX, pointY, pointX+(tD* this.direction), pointY+tD,pointX+(tD* this.direction), pointY-tD)
            triangle(0,0, (tD* this.direction), tD,(tD* this.direction), -tD)
          pop()
        }
      }
      
    pop();
  }

  getRotation(){
    let a = Math.sin(this.height/this.distance)

    if (this.width < 0){
      a = a * -1;
    }
    return a;
  }

}

class MultiWire extends Wire{
  constructor(mArray, scale){
    super(mArray[0].x,mArray[0].y,mArray[mArray.length - 1].x,mArray[mArray.length - 1].y, 1,scale)
    /*this.start = {x : mArray[0].x, y: mArray[0].y}; //start point
    this.end = {x : mArray[mArray.length - 1].x, y: mArray[mArray.length - 1].y}; //end point*/
    //this.midPoints = mArray;//all mid points
    //this.allPoints = [this.start].concat(this.midPoints,[this.end]);
    this.allPoints = mArray;
  }

  draw(o){

    this.state = o;
    push()
      
      let tD = this.wireThickness * .3

      for (let mm=0;mm<this.allPoints.length-1; mm++){
        let sectionDist = dist(this.allPoints[mm].x,this.allPoints[mm].y,this.allPoints[mm+1].x,this.allPoints[mm+1].y);
        let sectionLength = abs(this.allPoints[mm].x - this.allPoints[mm+1].x)
        let sectionHeight = abs(this.allPoints[mm].y - this.allPoints[mm+1].y)

        let xDir, yDir

        if(this.allPoints[mm].x - this.allPoints[mm+1].x <= 0){
          xDir = 1;
        } else {
          xDir = -1;
        }

        if(this.allPoints[mm].y - this.allPoints[mm+1].y <= 0){
          yDir = 1;
        } else {
          yDir = -1;
        }

        //wire under shadow
        strokeWeight(this.wireThickness+2);
        stroke(255);
        line(this.allPoints[mm].x,this.allPoints[mm].y,this.allPoints[mm+1].x,this.allPoints[mm+1].y);

        //wire
        strokeWeight(this.wireThickness);
        stroke(this.wireColor);
        line(this.allPoints[mm].x,this.allPoints[mm].y,this.allPoints[mm+1].x,this.allPoints[mm+1].y);

        //arrows

        if(this.state){
          strokeWeight(this.wireThickness*.1)
          stroke(255,0,0)
          fill(255,255,0)
        
          let arrowDist = 20
          let amtArrows = sectionDist/arrowDist

          for (let a = 0; a < sectionDist/arrowDist;a++){
            let pointX, pointY;

            if(int(clock/2) % 2 == 0 ){
              pointX=this.allPoints[mm].x + (xDir * ((sectionLength/amtArrows)*(a+.5)));
              pointY=this.allPoints[mm].y + (yDir * ((sectionHeight/amtArrows)*(a+.5)));
            } else {
              pointX=this.allPoints[mm].x + xDir * ((sectionLength/amtArrows)*a);
              pointY=this.allPoints[mm].y + yDir * ((sectionHeight/amtArrows)*a);
            }
            
            push()
              translate(pointX, pointY)
              //angleMode(RADIANS);
              rotate(this.getRotation(this.allPoints[mm],this.allPoints[mm+1]))
              //triangle(pointX, pointY, pointX+(tD* this.direction), pointY+tD,pointX+(tD* this.direction), pointY-tD)
              triangle(0,0, tD, tD,tD, -tD)
            pop()
          }
        }
      }
      
    pop();
  }

  getRotation(s,e){

    let sD = dist(s.x,s.y,e.x,e.y)
    let r = Math.sin((s.y-e.y)/sD)

    //if horizontal
    if (s.y == e.y & s.x < e.x){
      r = PI;
    } else if (s.x == e.x & s.y < e.y){ //if vertical
      r = r - QUARTER_PI;
    } else if (s.x == e.x & s.y > e.y){ //if vertical
      r = r + QUARTER_PI;
    } else if (s.x < e.x){ //if vertical
      r = PI - r;
    } 

    /*else {
      let sD = dist(s.x,s.y,e.x,e.y)

      let a = abs(s.y-e.y)/sD

      if (abs(s.x-e.x) < 0){
        r = a * -1;
      }
    }*/
    
    //console.log(r);
    return r;
  }
}