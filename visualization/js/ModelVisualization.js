class ModelVisualization{
  constructor(){
    this.infoBarY
    this.sideBarX = 250
  }

  drawClock(cX,cY,c,eF){
    this.fillColor()
    stroke(0)
    rect(canvasX-infoBarY,canvasY - infoBarY,canvasX,canvasY);

    fill(0,100)
    rect(canvasX-infoBarY,canvasY - infoBarY,canvasX,canvasY);

    fill(timeC);
    circle(cX,cY,60);

    //change to red if event is upcoming/ongoing
    this.fillColor()
    arc(cX,cY, infoBarY-10, infoBarY-10, -HALF_PI, (((c% 24)/24)*TWO_PI)-HALF_PI);
  }

  fillColor(){
    if(model.eventNow){
      fill(eventC)
    } else if(model.alertNow){
      fill(alertC)
    } else {
      fill(normalC);
    }
  }
}

class Component{
  constructor(x,y,s){
    this.x = x;
    this.y = y;
    this.scale = s;
    this.w = 100 * this.scale;
    this.h = 100 * this.scale;
    this.center = this.setCenter();
    this.color = color(int(random(255)),int(random(255)),int(random(255)), 255);
    this.label = 'component'
    this.showLabel = true;
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
  constructor(x,y,s){
    super(x,y,s)
    this.w = 100*this.scale;
    this.h = 210*this.scale;
    this.pvAmtX = 5;
    this.pMarginX = 2 * this.scale;
    this.pFrame = 3;
    this.pD = (this.w-(this.pMarginX*(this.pvAmtX+1))) / this.pvAmtX
    this.pvAmtY = int(this.h/this.pD);
    this.pMarginY = (this.h - (this.pD*this.pvAmtY))/(this.pvAmtY+1);
    this.backSheetColor = color(255);
  }

  draw(){
    push();
      translate(this.x,this.y)

      //frame
      fill(200,200,255);
      rect(this.pFrame* -1,this.pFrame* -1, this.w + this.pFrame*2, this.h + this.pFrame * 2);
      //backsheet
      fill(this.backSheetColor)
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
  constructor(x,y,s){
    super(x,y,s);
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
  constructor(x,y,s){
    super(x,y,s);
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
  constructor(x,y,s){
    super(x,y,s);
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
  constructor(x,y,s){
    super(x,y,s);
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
  constructor(x,y,s){
    super(x,y,s);
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
  constructor(x,y,s){
    super(x,y,s);
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
  constructor(x,y,s){
    super(x,y,s)
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

  draw(){
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