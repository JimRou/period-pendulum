//Animation montrant l'influence des conditions initiales sur la période du pendule simple

// ------ dimensions et échelles---------
var lp;//longueur du pendule
var rp;//rayon de la masse du pendule
var hh;//demi-hauteur
var FS, offset, widthGraphe;//fontsize,largeur du panneau de controles et du graphe
//------ caractéristique de l'oscillateur -----
var omega;//pulsation prore
var lambda;//coef d'amortissement
var S=new Array(2);//vecteur d'état (S[0]=theta et s[1]=w)
//------ intégrateur de Verlet
var h;//pas temorel
var time;//temps
var tMesure, thetaMesure, thetaInit;
let Mesures = [['Theta0 (rad)', 'Theta1 (rad)', 'Période (s)']];// mesures (Thetamax,T)
//-------- GUI
let sliderLambda;
//let resetButton;
let stopButton;
let infoButton;
let ralentiButton;
let info=false;
let stop=false;
let erase=false;
let ralenti=false;
let declenchement;//booléen qui indique le déclenchement du chrono
let capteurON;//booléen qui indique si le capteur est prêt à mesurer.


function setup() {
  createCanvas(windowWidth, windowWidth/2);//on impose un format 2x1
  resetSketch();
  resetCapteur();
  //Controles
  infoButton=createButton("Infos");
  infoButton.position(3*FS, 4*FS);
  infoButton.mousePressed(toggleInfo);
  stopButton=createButton("Reset");
  stopButton.position(3*FS, 6*FS);
  stopButton.mousePressed(toggleStop);
  ralentiButton=createButton("0,1 x");
  ralentiButton.position(3*FS, 8*FS);
  ralentiButton.mousePressed(toggleRalenti);
  sliderLambda = createSlider(0.0, 0.1, 0.01, 0.01);
  sliderLambda.position(FS, ralentiButton.y+2*FS);
}


function draw() {
  background(64);
  if (mouseIsPressed == true && (mouseX<height && mouseX>hh)) {//si on clique sur le pendule, on impose les conditions initiales
    stop=false;
    var OM = createVector(mouseX-hh, mouseY-hh);//pour orienter le pendule avec la souris
    S[1] = 0;
    S[0] = HALF_PI-OM.heading();
    thetaInit=S[0];
    var xtheta=map(S[0], 0, PI, height+2*FS, width-2*FS);
    stroke(255);
    line(xtheta, 2.5*FS, xtheta, height-2.5*FS);
    //reinitialisation des mesures
    resetCapteur();
  } else {Verlet();}
  displayPendulum();//affichage du pendule 
  displayGraphe();//afichage des données 
  displayMesures();//affichage des mesures en temps réel
  displayGUI();//affichage de la fenêtre de contrôles
  if (info) {
    displayInfo();
  }
  if (stop) {
    lambda = 5;
    resetCapteur();
    for (let i = 1; i < Mesures.length; i++) {
      Mesures.pop();
    }
  } else {
    lambda = sliderLambda.value();
    if (ralenti) {
      h=.001;
    } else {
      h=.02;
    }
  }
}

function resetSketch() {
  hh=height/2;
  FS=max(int(windowWidth/64), 10);
  textSize(0.75*FS);
  offset=int(textWidth(" Amortissement \u03BB = 0,05 Hz ")+FS);
  //widthGraphe=height-offset-3*FS;
  widthGraphe=height-4*FS;
  omega= PI ;//(T=2s)
  lambda=0.1;
  frameRate(50); // 50 frames per second
  //------- Conditions initiales ----
  thetaInit=0.9*PI;
  S[0]=thetaInit;//theta
  S[1]=0;//vitesse angulaire
  h=0.02;
  time=0;
  //------ Dimensions du pendule
  lp = 0.40*height;
  rp = 0.08*height;
}

function resetCapteur() {
  declenchement=false;
  capteurON=true;
  tMesure=0;
  thetaMesure=0;
}

//***** Intégration par Verlet *****
function Verlet() {
  var SS0, SS1, a0;
  let n=0;
  SS0=S[0];//on stocke theta_prec
  SS1=S[1];//idem pour omega
  a0=acceleration(SS0, SS1);//accélération angulaire
  S[0]+=h*SS1+0.5*sq(h)*a0;
  S[1]+=0.5*h*(a0+acceleration(S[0], SS1));
  time+=1;
}


function acceleration(xx, yy) {
  return -sq(omega)*sin(xx)-2*lambda*yy*abs(yy) ;
}

function displayPendulum() {
  push();
  translate(hh, hh);
  stroke(200);
  fill(64);
  strokeWeight(5);
  var xp=(lp-20)*sin(S[0]);
  var yp=(lp-20)*cos(S[0]);
  line(0, 0, 1.2*xp, 1.2*yp);
  ellipse(xp, yp, rp, rp);
  strokeWeight(1);
  fill(0);
  ellipse(xp, yp, 4, 4);
  ellipse(0, 0, 4, 4);
  pop();
}

function displayGUI() {
  textSize(FS);
  fill(255);
  textAlign(LEFT, TOP);
  text("CONTROLES", 3*FS, FS);
  textSize(0.75*FS);
  text('Amortissement \u03BB = '+nf(lambda, 1, 2), FS, sliderLambda.y+1.5*FS);
  textAlign(RIGHT, TOP);
  fill(255, 100);
  text("short  \ncut  ", 3*FS, FS);
  stroke(255, 70);
  strokeWeight(1);
  line(3*FS, 2.5*FS, hh, 2.5*FS );
  text("I ", 3*FS, infoButton.y+1);
  text("Tab ", 3*FS, stopButton.y+1);
  text("R ", 3*FS, ralentiButton.y+1);

  if (ralenti) {
    fill(255, 255, 255, 255*sin(0.1*time));
    noStroke();
    text("Ralenti x 0,1", hh, FS);
  }
}

function displayGraphe() {
  var xangle, yT, P;
  push();
  translate(height+2*FS, 0);
  strokeWeight(1);
  //tracé du graphe theorique T=f(thetamax)
  noFill();
  stroke(255);
  beginShape();
  vertex(0, map(2, 0, 8, height-2.5*FS, 2.5*FS));
  for (let angle=9; angle<180; angle+=2) {
    P=periode(angle);
    xangle=map(angle, 0, 180, 0, widthGraphe);
    yT=map(P, 0, 8, height-2.5*FS, 2.5*FS);
    vertex(xangle, yT);
  }
  endShape();
  // graduations
  //d'abord les traits fins
  fill(255);
  stroke(255, 30);
  for (let T=0.2; T<8; T+=0.2) {
    yT=map(T, 0, 8, height-2.5*FS, 2.5*FS);
    line(0, yT, widthGraphe, yT);
  }
  for (let angle=10; angle<180; angle+=10) {
    xangle=map(angle, 0, 180, 0, widthGraphe);
    line(xangle, 2.5*FS, xangle, height-2.5*FS);
  }
  //ensuite les traits épais
  textAlign(RIGHT, CENTER);
  strokeWeight(2);
  stroke(255, 70);
  for (let T=1; T<8; T+=1) {
    yT=map(T, 0, 8, height-2.5*FS, 2.5*FS);
    line(0, yT, widthGraphe, yT);
    text(T, -FS, yT);
  }
  textAlign(CENTER, TOP);
  text("T [s]", -FS, 2.5*FS);
  text("\u03B8 [°]", .5*widthGraphe, height - FS);
  for (let angle=30; angle<=180; angle+=30) {
    xangle=map(angle, 0, 180, 0, widthGraphe);
    line(xangle, 2.5*FS, xangle, height-2.5*FS);
    text(angle, xangle, height-2.5*FS);
  }
  textSize(FS);
  fill(255);
  text("PÉRIODE EN FONCTION DE L'AMPLITUDE", .5*widthGraphe, FS);
  stroke(255, 140);
  line(0, 2.5*FS, 0, height-2.5*FS);//axe vertical
  line(0, height-2.5*FS, widthGraphe, height-2.5*FS);//axe horizontal
  strokeWeight(1);
  stroke(255);
  fill(0, 160, 205);
  for (let i = 1; i < Mesures.length; i++) {
    ellipse(map(Mesures[i][1], 0, PI, 0, widthGraphe), map(Mesures[i][2], 0, 8, height-2.5*FS, 2.5*FS), 7, 7);
  }
  pop();
}

function afficheT(t) {
  var second=floor(t);
  var millisecond=round(1000*(t-second));
  fill(0, 160, 205);
  noStroke();
  textSize(FS);
  textAlign(RIGHT, CENTER);
  text(nf(second, 2, 0)+": ", hh+3*FS, height-FS);
  textSize(0.75*FS);  
  textAlign(LEFT, CENTER);
  text(nf(millisecond, 3, 0)+' ms', hh+3*FS, height-FS);
}

function afficheTheta(t) {
  var degre=floor(t*180/PI);
  var minute=round(60*(t*180/PI-degre));
  fill(0, 160, 205);
  noStroke();
  textSize(FS);
  textAlign(RIGHT, CENTER);
  text(nf(degre, 2, 0)+'° ', hh-2*FS, height-FS);
  textSize(0.75*FS);  
  textAlign(LEFT, CENTER);
  text(nf(minute, 2, 0)+'\'', hh-2*FS, height-FS);
}

function displayMesures() {
  stroke(255, 60);
  line(hh, hh, hh, height);
  afficheTheta(thetaMesure);
  afficheT(tMesure);
  if (!capteurON) {
    declenchement=false;
  } else {
    if ((S[0]<0)) {
      declenchement=true;
      tMesure+=h;
      if ((S[1]<0)) {
        thetaMesure=-S[0];
      }
    }
    if ((S[0]>0)&&(declenchement)) {
      capteurON=false;
      //Mesures.push(new p5.Vector(thetaMesure, 2*tMesure));
      Mesures.push([thetaInit, thetaMesure, 2*tMesure]);
    }
  }
}

function displayInfo() {
  fill(64);
  push();
  translate(height, 0);
  rect(0, 0, height, height);
  textSize(FS);
  textAlign(CENTER, TOP);
  fill(255, 255);
  textLeading(FS);
  text("PÉRIODE DU PENDULE PESANT", hh, FS);
  fill(255, 127);
  textSize(0.75*FS);
  text("© Jimmy Roussel, 2021", hh, 3*FS);
  textAlign(LEFT, TOP);
  text("Interactions au clavier:\n     I pour afficher/cacher ces informations\n    Barre espace pour arrêter le pendule et effacer les points\n    R pour ralentir (gain de précision) ", hh/2, 7*FS);
  text("Interactions à la souris:\n    Cliquer-glisser sur le slider pour jouer sur l'amortissement\n    Cliquer-glisser sur le pendule pour fixer l'état initial\n", hh/2, 13*FS);
  fill(30, 134, 193);
  textAlign(CENTER, TOP);
  text("femto-physique.fr", hh, 4*FS);
  pop();
}

function periode(thetaMax) {
  var a, b, c;
  a=1;
  b=cos(PI*thetaMax/360);
  for (let i=0; i<5; i++) {
    c=(a+b)/2;
    b=sqrt(a*b);
    a=c;
  }
  return TWO_PI/(omega*a);
}

function toggleStop() {
  stop=!stop;
}

function toggleInfo() {
  info=!info;
}

function toggleReset() {
  erase=!erase;
}

function toggleRalenti() {
  ralenti=!ralenti;
  if (ralenti) {
    ralentiButton.html('1 x');
  } else {
    ralentiButton.html('0,1 x');
  }
}


function keyPressed() {
  if (key =='i' || key == 'I') {
    info =!info;
  }
  if (keyCode == 32) {
    stop=!stop;
  }
  if (key =='e' || key == 'E') {
    erase=!erase;
  }
  if (key =='r' || key == 'R') {
    toggleRalenti();
  }
  if (key =='s' || key == 'S') {
    save('myCanvas.jpg');
  }
  if (key =='t' || key == 'T') {
    //let data = [];
    //for (let i = 0; i < Mesures.length; i++) {
    //  data.push(Mesures[i].x+";"+Mesures[i].y);
    //}
    //save(data, 'data.txt');
    save(Mesures, 'data.txt');
  }
}

function windowResized() {
  // redimensionner dynamiquement notre canvas aux dimensions de la fenêtre de notre navigateur
  resizeCanvas(windowWidth, 0.5*windowWidth);
  resetSketch();
  resetCapteur();
  infoButton.position(3*FS, 4*FS);
  stopButton.position(3*FS, 6*FS);
  ralentiButton.position(3*FS, 8*FS);
  sliderLambda.position(FS, ralentiButton.y+2*FS);
}
