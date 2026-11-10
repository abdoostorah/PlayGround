import * as THREE from '../vendor/three.module.js';

const $ = (id) => document.getElementById(id);
const canvas = $('pitch');
const shell = document.querySelector('.game-shell');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.8));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#a9c5bd');
scene.fog = new THREE.FogExp2('#a9c5bd', 0.0085);
const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, .1, 120);
camera.position.set(0, 4.15, 13.3);
camera.lookAt(0, 1.55, -4.4);

const mat = (color, roughness=.8, extra={}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
const grassMats = ['#2d7b4d','#317f4e','#2a7348','#378653'].map(c=>mat(c));
const turf = new THREE.Mesh(new THREE.PlaneGeometry(110, 75), mat('#2d7c4c'));
turf.rotation.x = -Math.PI/2; turf.position.set(0,-.045,-7); turf.receiveShadow=true; scene.add(turf);
for(let i=0;i<13;i++){
  const stripe=new THREE.Mesh(new THREE.PlaneGeometry(110,5.78),grassMats[i%4]);
  stripe.rotation.x=-Math.PI/2;stripe.position.set(0,-.035,-41+i*5.78);scene.add(stripe);
}
const lineMat=new THREE.MeshBasicMaterial({color:'#d7e8d5',transparent:true,opacity:.67,side:THREE.DoubleSide});
function groundLine(x,z,w,d){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),lineMat);m.rotation.x=-Math.PI/2;m.position.set(x,.012,z);scene.add(m);return m}
groundLine(0,8.35,110,.055);groundLine(0,-27,110,.055);groundLine(-52,-9, .055,36);groundLine(52,-9,.055,36);
// Penalty area, six-yard box, spot and the centre-circle arc.
groundLine(0,-10.65,20,.055);groundLine(-10,-5.35,.055,10.6);groundLine(10,-5.35,.055,10.6);
groundLine(0,-4.55,9.5,.05);groundLine(-4.75,-2.35,.05,4.4);groundLine(4.75,-2.35,.05,4.4);
const spot=new THREE.Mesh(new THREE.CircleGeometry(.105,24),new THREE.MeshBasicMaterial({color:'#fff8df'}));spot.rotation.x=-Math.PI/2;spot.position.set(0,.02,5.15);scene.add(spot);
function addArc(radius,start,end,z){const pts=[];for(let i=0;i<=60;i++){let a=start+(end-start)*i/60;pts.push(new THREE.Vector3(Math.cos(a)*radius,.025,z+Math.sin(a)*radius));}const geo=new THREE.BufferGeometry().setFromPoints(pts);scene.add(new THREE.Line(geo,new THREE.LineBasicMaterial({color:'#d7e8d5',transparent:true,opacity:.68})));}
addArc(9.15,Math.PI*.09,Math.PI*.91,-5.35);

// A deep, tiered stadium bowl with thousands of tiny club-colour silhouettes.
const standDark=mat('#202d2a'), seatA=mat('#31413b'), seatB=mat('#3c4842'), fascia=mat('#e3e1d6',.55,{emissive:'#5c655c',emissiveIntensity:.13});
function box(w,h,d,material,x,y,z,cast=false){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=true;scene.add(m);return m;}
box(82,5.2,3.8,standDark,0,7.1,-21.5);
for(let row=0;row<5;row++){const tier=box(78-row*1.25, .48, 1.1, row%2?seatA:seatB,0,4.8+row*.88,-18.7-row*.7);tier.rotation.x=-.06;}
box(81,.25,1.1,fascia,0,4.65,-17.35);
// crowd as instanced coloured jackets, repeated at stadium scale, lightweight in WebGL.
const crowdPalette=['#d7cba7','#a34838','#d5d9c7','#526f66','#7f987e','#274e44','#b58e50','#728b9b','#e2dfd2','#733d35'];
const crowdGeo=new THREE.BoxGeometry(.105,.18,.1);
for(let group=0;group<crowdPalette.length;group++){
  const count=group===0?550:Math.floor(600/crowdPalette.length);
  const im=new THREE.InstancedMesh(crowdGeo,mat(crowdPalette[group],.95),count);let idx=0;
  for(let i=0;i<count;i++){
    const x=(Math.random()-.5)*76,y=5.1+Math.random()*4.1,z=-20.8-Math.random()*2.2;
    const o=new THREE.Object3D();o.position.set(x,y,z);o.rotation.y=(Math.random()-.5)*.4;o.scale.setScalar(.7+Math.random()*.75);o.updateMatrix();im.setMatrixAt(idx++,o.matrix);
  }
  im.count=idx;scene.add(im);
}
// Dark roof canopy and long perimeter advertising strip.
const roof=box(86,.65,6,mat('#1b2824'),0,11.5,-21.4);roof.rotation.x=-.08;
box(81,.55,.3,mat('#c8f05a',.6,{emissive:'#739c2e',emissiveIntensity:.18}),0,4.3,-17.05);
for(let x=-37;x<=37;x+=12){
  const pole=box(.13,7.8,.13,mat('#aeb6aa',.45),x,10.8,-19.2);pole.castShadow=true;
  const lamp=box(3.2,.22,.55,mat('#efffe3',.25,{emissive:'#e4ffdc',emissiveIntensity:2.4}),x,7.15,-18.8);
  const light=new THREE.PointLight('#d8ffdf',40,20,2);light.position.set(x,7.2,-17.5);scene.add(light);
}
// Ambient dusk and directional stadium lighting.
scene.add(new THREE.HemisphereLight('#d9eee7','#193b29',2.05));
const sun=new THREE.DirectionalLight('#fff0cb',3.3);sun.position.set(-8,15,8);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-22;sun.shadow.camera.right=22;sun.shadow.camera.top=20;sun.shadow.camera.bottom=-12;sun.shadow.bias=-.00015;scene.add(sun);
const fill=new THREE.DirectionalLight('#a4d5c2',1.25);fill.position.set(10,8,-11);scene.add(fill);

// Goal structure: slim powder-coated posts, crossbar, depth and hand-strung net.
const postMat=mat('#f3f1e8',.34,{metalness:.18});
const goalX=3.72,goalY=2.52,goalZ=-12.3,goalTop=4.98,goalBottom=.12;
function cylinderBetween(a,b,r,material,r2=r){const dir=new THREE.Vector3().subVectors(b,a);const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r2,r,dir.length(),12),material);mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());mesh.castShadow=true;scene.add(mesh);return mesh;}
cylinderBetween(new THREE.Vector3(-goalX,goalBottom,goalZ),new THREE.Vector3(-goalX,goalTop,goalZ),.085,postMat);
cylinderBetween(new THREE.Vector3(goalX,goalBottom,goalZ),new THREE.Vector3(goalX,goalTop,goalZ),.085,postMat);
cylinderBetween(new THREE.Vector3(-goalX,goalTop,goalZ),new THREE.Vector3(goalX,goalTop,goalZ),.09,postMat);
cylinderBetween(new THREE.Vector3(-goalX,goalBottom,goalZ),new THREE.Vector3(goalX,goalBottom,goalZ),.045,postMat);
const netMat=new THREE.LineBasicMaterial({color:'#f4f4e7',transparent:true,opacity:.47});
for(let x=-goalX;x<=goalX+.01;x+=.42){
  const points=[new THREE.Vector3(x,goalBottom,goalZ),new THREE.Vector3(x,goalTop,goalZ),new THREE.Vector3(x,goalTop,goalZ-1.42),new THREE.Vector3(x,goalBottom,goalZ-1.42)];
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),netMat));
}
for(let y=goalBottom;y<=goalTop+.01;y+=.38){const p=[new THREE.Vector3(-goalX,y,goalZ),new THREE.Vector3(goalX,y,goalZ),new THREE.Vector3(goalX,y,goalZ-1.42),new THREE.Vector3(-goalX,y,goalZ-1.42),new THREE.Vector3(-goalX,y,goalZ)];scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(p),netMat));}
for(const x of [-goalX,goalX])for(let i=1;i<=5;i++){const y=goalBottom+(goalTop-goalBottom)*i/6;cylinderBetween(new THREE.Vector3(x,y,goalZ),new THREE.Vector3(x,y,goalZ-1.4),.012,postMat);}

// Player silhouettes assembled from tailored pieces and pivoting limbs.
const playerMaterials={home:mat('#c8f044',.58),dark:mat('#18211d',.65),skin:mat('#c9916d',.8),boot:mat('#f1ece1',.5,{metalness:.1}),keeper:mat('#f1743c',.6),keeperShort:mat('#18303b',.65)};
function makePlayer(kind='kicker'){
  const group=new THREE.Group();const isKeeper=kind==='keeper';
  const jersey=isKeeper?playerMaterials.keeper:playerMaterials.home, shorts=isKeeper?playerMaterials.keeperShort:playerMaterials.dark;
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.29,.64,5,10),jersey);torso.position.y=1.36;torso.castShadow=true;group.add(torso);
  const bib=new THREE.Mesh(new THREE.BoxGeometry(.32,.08,.018),mat(isKeeper?'#f8eee0':'#eef4d9',.7));bib.position.set(0,1.52,-.285);group.add(bib);
  const shortsMesh=new THREE.Mesh(new THREE.BoxGeometry(.48,.27,.34),shorts);shortsMesh.position.y=.88;shortsMesh.castShadow=true;group.add(shortsMesh);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.22,16,14),playerMaterials.skin);head.position.y=1.98;head.castShadow=true;group.add(head);
  const hair=new THREE.Mesh(new THREE.SphereGeometry(.225,16,8,0,Math.PI*2,0,Math.PI*.45),mat('#30241e'));hair.position.y=2.02;group.add(hair);
  const legs=[];const arms=[];
  for(let side of [-1,1]){
    const leg=new THREE.Group();leg.position.set(side*.16,.82,0);
    const thigh=new THREE.Mesh(new THREE.CapsuleGeometry(.105,.38,4,8),shorts);thigh.position.y=-.23;thigh.castShadow=true;leg.add(thigh);
    const sock=new THREE.Mesh(new THREE.CylinderGeometry(.075,.085,.38,9),isKeeper?jersey:mat('#eceadd'));sock.position.y=-.58;leg.add(sock);
    const boot=new THREE.Mesh(new THREE.BoxGeometry(.16,.105,.32),playerMaterials.boot);boot.position.set(0,-.78,-.095);boot.castShadow=true;leg.add(boot);
    group.add(leg);legs.push(leg);
    const arm=new THREE.Group();arm.position.set(side*.34,1.67,0);
    const upper=new THREE.Mesh(new THREE.CapsuleGeometry(.075,.34,4,8),jersey);upper.position.y=-.19;upper.rotation.z=side*-.13;arm.add(upper);
    const glove=new THREE.Mesh(new THREE.SphereGeometry(.095,10,8),isKeeper?mat('#f3e7d0'):playerMaterials.skin);glove.position.set(side*-.04,-.43,0);arm.add(glove);group.add(arm);arms.push(arm);
  }
  if(isKeeper){group.position.set(0,0,goalZ+.18);group.scale.set(1.05,1.05,1.05)}else{group.position.set(-1.22,0,5.95);group.rotation.y=-.18;group.scale.set(1.1,1.1,1.1)}
  group.userData={legs,arms,torso,head,kind};scene.add(group);return group;
}
const kicker=makePlayer('kicker'), keeper=makePlayer('keeper');
// The referee watches the line and gives a visible signal after every decision.
const referee=new THREE.Group();
const refJersey=mat('#26332f'),refShorts=mat('#202724'),refSkin=mat('#bc8867');
const refTorso=new THREE.Mesh(new THREE.CapsuleGeometry(.25,.58,5,10),refJersey);refTorso.position.y=1.3;referee.add(refTorso);
const refHead=new THREE.Mesh(new THREE.SphereGeometry(.19,14,12),refSkin);refHead.position.y=1.9;referee.add(refHead);
const refArms=[];
for(const side of [-1,1]){const arm=new THREE.Group();arm.position.set(side*.29,1.58,0);const sleeve=new THREE.Mesh(new THREE.CapsuleGeometry(.07,.38,4,8),refJersey);sleeve.position.y=-.2;arm.add(sleeve);const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.085,.44,4,8),refShorts);leg.position.set(side*.13,.43,0);referee.add(leg);referee.add(arm);refArms.push(arm);}
referee.position.set(5.2,0,-3.9);referee.rotation.y=-.25;scene.add(referee);

// Match-quality football with inset, raised pentagonal panels.
const ballGroup=new THREE.Group();const ballRadius=.215;
const ballCore=new THREE.Mesh(new THREE.SphereGeometry(ballRadius,36,28),new THREE.MeshStandardMaterial({color:'#f2f0e5',roughness:.43,metalness:.03}));ballCore.castShadow=true;ballCore.receiveShadow=true;ballGroup.add(ballCore);
const patchMat=mat('#161c1a',.48);
const patchDirections=[new THREE.Vector3(0,1,0),new THREE.Vector3(0,-1,0),new THREE.Vector3(1,0,0),new THREE.Vector3(-1,0,0),new THREE.Vector3(0,0,1),new THREE.Vector3(0,0,-1)];
for(const dir of patchDirections){const patch=new THREE.Mesh(new THREE.CircleGeometry(.068,5),patchMat);patch.position.copy(dir.clone().multiplyScalar(ballRadius+.002));patch.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),dir);ballGroup.add(patch)}
ballGroup.position.set(0,ballRadius+.025,5.15);scene.add(ballGroup);
const shadow=new THREE.Mesh(new THREE.CircleGeometry(.3,24),new THREE.MeshBasicMaterial({color:'#06130e',transparent:true,opacity:.32,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.set(0,.025,5.15);scene.add(shadow);

// A clean, floating reticle projected onto the goal plane, with a quiet pulse.
const reticle=new THREE.Group();const ring=new THREE.Mesh(new THREE.RingGeometry(.105,.125,32),new THREE.MeshBasicMaterial({color:'#d5ff3f',transparent:true,opacity:.95,side:THREE.DoubleSide}));reticle.add(ring);
const reticleDot=new THREE.Mesh(new THREE.CircleGeometry(.025,16),new THREE.MeshBasicMaterial({color:'#faffdf'}));reticle.add(reticleDot);
const reticleH=new THREE.Mesh(new THREE.PlaneGeometry(.5,.008),new THREE.MeshBasicMaterial({color:'#d5ff3f',transparent:true,opacity:.68}));const reticleV=new THREE.Mesh(new THREE.PlaneGeometry(.008,.5),reticleH.material);reticle.add(reticleH,reticleV);reticle.position.set(0,2.4,goalZ-.04);scene.add(reticle);

const ui={playerScore:$('playerScore'),keeperScore:$('keeperScore'),attempt:$('attemptLabel'),dots:$('shotDots'),power:$('powerFill'),powerVal:$('powerValue'),accuracy:$('accuracyValue'),aim:$('aimLabel'),callout:$('shotCallout'),shoot:$('shootButton'),toast:$('toast'),wind:$('windSpeed'),windIcon:document.querySelector('.wind-icon'),takerName:$('takerName'),takerSkill:$('takerSkill')};
const takers={ace:{name:'MARA VALE',role:'ACE',skill:96,control:.96},steady:{name:'JULES OKAFOR',role:'STEADY',skill:74,control:.74},rookie:{name:'KIT ROWAN',role:'ROOKIE',skill:48,control:.48}};
let taker=takers.ace;
let score=0, shots=0, active=false, inFlight=false, charging=false, charge=0, aimX=0, aimY=2.3, time=0, keeperX=0, keeperDive=0, lastResult=false, best=Number(localStorage.getItem('ft-best')||0), windDir=1, windStrength=4, windClock=0, refereeSignal=0, soundOn=false;
function updateTaker(){taker=takers[$('takerSelect').value]||takers.ace;ui.takerName.textContent=`${taker.name} · ${taker.role}`;ui.takerSkill.textContent=`PENALTY SKILL ${taker.skill} / 100`;}
function updateWind(){windStrength=Math.round(3+Math.random()*19);windDir=Math.random()<.5?-1:1;ui.wind.textContent=windStrength;ui.windIcon.textContent=windDir>0?'↗':'↖';}
const keys={};
function setAim(x,y){aimX=THREE.MathUtils.clamp(x,-4.05,4.05);aimY=THREE.MathUtils.clamp(y,.22,4.65);reticle.position.set(aimX,aimY,goalZ-.045);ui.aim.style.left='50%';}
function renderDots(){ui.dots.innerHTML='';for(let i=0;i<5;i++){const d=document.createElement('i');d.className='shot-dot'+(i<shots?(lastResult?'done':'miss'):'')+(i===shots&&active?' active':'');ui.dots.appendChild(d);}}
function refresh(){ui.playerScore.textContent=score;ui.keeperScore.textContent=shots-score;ui.attempt.textContent=`${shots} / 5`;renderDots();}
function popToast(text){ui.toast.textContent=text;ui.toast.classList.add('show');clearTimeout(popToast.t);popToast.t=setTimeout(()=>ui.toast.classList.remove('show'),1350)}
function callout(text,miss=false){ui.callout.textContent=text;ui.callout.style.color=miss?'#ff744d':'#d5ff3f';ui.callout.classList.remove('show');void ui.callout.offsetWidth;ui.callout.classList.add('show');}
function startGame(){score=0;shots=0;active=true;inFlight=false;lastResult=false;setAim(0,2.35);refresh();$('introOverlay').classList.add('hidden');$('resultOverlay').classList.add('hidden');shell.classList.add('playing');ui.aim.style.opacity='1';popToast('FIVE SHOTS. MAKE THEM COUNT.');}
function finish(){active=false;const won=score>=3;const drew=score===2;const title=won?'ICE COLD.':drew?'ALL SQUARE.':'NEXT TIME.';$('resultKicker').textContent=won?'YOU OWNED THE SPOT':drew?'A TIGHT FINISH':'THE KEEPER HELD';$('resultTitle').textContent=title;$('resultSubtitle').textContent=won?'The keeper never stood a chance.':drew?'A rematch is calling.':'Every great striker comes back.';$('finalScore').textContent=`${score} — ${shots-score}`;best=Math.max(best,score);localStorage.setItem('ft-best',String(best));$('bestStreak').textContent=best;$('resultOverlay').classList.remove('hidden');shell.classList.remove('playing');}
function holdStart(){if(!active||inFlight||charging)return;charging=true;charge=0;ui.shoot.classList.add('charging');ui.aim.style.opacity='.32';}
function holdEnd(){if(!charging)return;charging=false;ui.shoot.classList.remove('charging');ui.aim.style.opacity='1';if(active&&!inFlight)shoot(Math.max(.12,charge));}
function shoot(power){if(!active||inFlight)return;inFlight=true;shots++;lastResult=false;refresh();ui.aim.style.opacity='0';ui.callout.classList.remove('show');kicker.userData.kick=1;
  updateWind();
  // Wind and player composure both nudge the ball away from the sight line.
  const controlError=(1-taker.control)*1.35;
  const shotX=aimX+windDir*windStrength*.025+(Math.random()-.5)*controlError;
  const shotY=aimY+(Math.random()-.5)*controlError*.62;
  const target=new THREE.Vector3(shotX,shotY,goalZ);const start=ballGroup.position.clone();const duration=1.05+(.7*(1-power));
  // Keepers read the strike, but a confident taker and a clean charge are harder to stop.
  const aimOffset=shotX+(Math.random()-.5)*(.55+power*.22);keeperX=THREE.MathUtils.clamp(aimOffset*.82,-3.05,3.05);keeperDive=1;
  const keeperChance=Math.max(.08,.49-power*.30-taker.control*.12);
  const caught=Math.abs(shotX-keeperX)<(.75+(1-power)*.6)&&shotY<4.25&&Math.random()<keeperChance;
  const wide=Math.abs(shotX)>goalX-.13||shotY<.17||shotY>goalTop-.12;
  const bar=Math.abs(shotY-goalTop)<.20&&Math.abs(shotX)<goalX;
  const goal=!wide&&!bar&&!caught;
  const height=Math.max(.5,Math.min(1.75, .48+(shotY/goalTop)*.7+(1-power)*.32));
  let t0=performance.now();
  const animateShot=(now)=>{
    const t=Math.min(1,(now-t0)/(duration*1000));const eased=1-Math.pow(1-t,1.12);
    ballGroup.position.set(start.x+(target.x-start.x)*eased,start.y+(target.y-start.y)*eased+Math.sin(Math.PI*t)*height,start.z+(target.z-start.z)*eased);
    ballGroup.rotation.x+=.12;ballGroup.rotation.z+=.08;
    shadow.position.set(ballGroup.position.x,.026,ballGroup.position.z);shadow.scale.setScalar(Math.max(.38,1-t*.58));shadow.material.opacity=.32*(1-t*.45);
    if(t<1){requestAnimationFrame(animateShot);return;}
    ballGroup.position.copy(target);keeperDive=goal?0:1;lastResult=goal;
    refereeSignal=goal?1:-1;
    if(goal){score++;callout('STRIKE!');popToast('THE FANS ERUPT — TOP BINS!');}
    else if(caught){callout('SAVED.',true);popToast('THE KEEPER READ IT.');}
    else if(bar){callout('OFF THE BAR.',true);popToast('SO CLOSE.');}
    else{callout('MISS.',true);popToast('WIND CARRIED IT WIDE.');}
    refresh();
    ui.accuracy.textContent=`${Math.round(Math.max(0,100-Math.hypot(shotX-aimX,shotY-aimY)*28-Math.hypot(shotX,shotY-2.4)*7))}%`;
    setTimeout(()=>{
      if(shots>=5){finish();return;}
      inFlight=false;ballGroup.position.set(0,ballRadius+.025,5.15);ballGroup.rotation.set(0,0,0);shadow.position.set(0,.025,5.15);shadow.scale.setScalar(1);shadow.material.opacity=.32;keeperDive=0;keeperX=0;kicker.userData.kick=0;setAim((Math.random()-.5)*.65,2.1+Math.random()*.65);refresh();ui.aim.style.opacity='1';
    },1050);
  };
  requestAnimationFrame(animateShot);
}

// Aim by pointing anywhere in the playing view; the target plane sits exactly on the goal mouth.
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2(),goalPlane=new THREE.Plane(new THREE.Vector3(0,0,1),-goalZ);
function aimPointer(event){if(!active||inFlight||charging)return;const rect=canvas.getBoundingClientRect();pointer.x=((event.clientX-rect.left)/rect.width)*2-1;pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;raycaster.setFromCamera(pointer,camera);const hit=new THREE.Vector3();if(raycaster.ray.intersectPlane(goalPlane,hit)&&hit.z<0)setAim(hit.x,hit.y);}
canvas.addEventListener('pointermove',aimPointer);
canvas.addEventListener('pointerdown',e=>{if(!active||inFlight)return;aimPointer(e);canvas.setPointerCapture?.(e.pointerId)});
canvas.addEventListener('pointerup',e=>{if(charging)holdEnd();});
ui.shoot.addEventListener('pointerdown',e=>{e.preventDefault();ui.shoot.setPointerCapture?.(e.pointerId);holdStart();});
ui.shoot.addEventListener('pointerup',e=>{e.preventDefault();holdEnd();});ui.shoot.addEventListener('pointercancel',holdEnd);ui.shoot.addEventListener('lostpointercapture',holdEnd);
$('startButton').addEventListener('click',startGame);$('rematchButton').addEventListener('click',startGame);$('restartButton').addEventListener('click',()=>{$('introOverlay').classList.remove('hidden');$('resultOverlay').classList.add('hidden');active=false;inFlight=false;charging=false;shell.classList.remove('playing');});
$('mobileAimLeft').addEventListener('click',()=>setAim(aimX-.38,aimY));$('mobileAimRight').addEventListener('click',()=>setAim(aimX+.38,aimY));
$('mobileShoot').addEventListener('pointerdown',e=>{e.preventDefault();holdStart()});$('mobileShoot').addEventListener('pointerup',holdEnd);$('mobileShoot').addEventListener('pointercancel',holdEnd);
window.addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(e.code==='Space'){e.preventDefault();holdStart()}if(e.key==='Enter'&&!active)startGame();if(e.key.toLowerCase()==='r'){$('restartButton').click()}});
window.addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;if(e.code==='Space')holdEnd()});window.addEventListener('blur',()=>{if(charging)holdEnd()});
$('soundButton').addEventListener('click',()=>{soundOn=!soundOn;$('soundIcon').textContent=soundOn?'♫':'♪';popToast(soundOn?'SOUND ON':'SOUND OFF')});
$('takerSelect').addEventListener('change',updateTaker);
updateTaker();updateWind();

let prev=performance.now();
function animate(now){requestAnimationFrame(animate);const dt=Math.min(.04,(now-prev)/1000);prev=now;time+=dt;
  if(charging){charge=Math.min(1,charge+dt*.43);ui.power.style.width=`${Math.round(charge*100)}%`;ui.powerVal.textContent=`${Math.round(charge*100)}%`;}
  else if(active&&!inFlight){charge=(Math.sin(time*1.6)+1)*.025;ui.power.style.width=`${charge*100}%`;ui.powerVal.textContent='READY';}
  else if(!active){ui.power.style.width='0%';ui.powerVal.textContent='—';}
  if(active&&!inFlight&&!charging){const step=dt*1.75;if(keys.arrowleft||keys.a)setAim(aimX-step,aimY);if(keys.arrowright||keys.d)setAim(aimX+step,aimY);if(keys.arrowup||keys.w)setAim(aimX,aimY+step);if(keys.arrowdown||keys.s)setAim(aimX,aimY-step);}
  if(!inFlight){ballGroup.position.y=ballRadius+.025+Math.sin(time*2.7)*.012;ballGroup.rotation.y+=dt*.15;}
  const p=kicker.userData.kick||0;if(p>0){kicker.userData.kick=Math.max(0,p-dt*1.6);kicker.userData.legs[1].rotation.x=-Math.sin((1-p)*Math.PI)*.95;kicker.userData.legs[0].rotation.x=Math.sin((1-p)*Math.PI)*.22;kicker.userData.arms[0].rotation.z=.22*Math.sin((1-p)*Math.PI);kicker.userData.arms[1].rotation.z=-.22*Math.sin((1-p)*Math.PI);}else{kicker.userData.legs.forEach(l=>l.rotation.x=0);kicker.userData.arms.forEach(a=>a.rotation.z=0);}
  if(keeperDive>0){keeper.position.x+=(keeperX-keeper.position.x)*Math.min(1,dt*4.2);keeper.rotation.z+=((keeperX>0?-.75:.75)-keeper.rotation.z)*Math.min(1,dt*4);keeper.rotation.x=-.3;keeper.position.y=Math.sin(Math.min(1,keeperDive))*0;keeperDive=Math.max(0,keeperDive-dt*1.5);}else{keeper.position.x+=(0-keeper.position.x)*Math.min(1,dt*2);keeper.rotation.z*=.94;keeper.rotation.x*=.94;}
  if(refereeSignal>0){refArms[1].rotation.z=-.78;refArms[0].rotation.z=.08;}else if(refereeSignal<0){refArms[0].rotation.z=.45;refArms[1].rotation.z=-.45;}else{refArms[0].rotation.z=Math.sin(time*2)*.08;refArms[1].rotation.z=-Math.sin(time*2)*.08;}
  refereeSignal*=Math.max(0,1-dt*1.6);
  reticle.scale.setScalar(1+Math.sin(time*3)*.035);renderer.render(scene,camera);
}
requestAnimationFrame(animate);
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.8));}
window.addEventListener('resize',resize);
setAim(0,2.35);refresh();
