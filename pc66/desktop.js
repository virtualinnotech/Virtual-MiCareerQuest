import * as THREE from 'three';
import {monitorRear} from './monitor-rear.js?v=20261009-station83';

// Monitor pixels stay on the curved mesh, including the live racing canvas.
export function gamingDesktop(scene,hardware){
 const root=new THREE.Group();root.name='Gaming desktop peripherals';root.position.set(-3.25,0,-.6);root.rotation.y=-.65;scene.add(root);
 const {white,black,steel,box,led}=hardware,screenCanvas=document.createElement('canvas');screenCanvas.width=1728;screenCanvas.height=720;
 const q=screenCanvas.getContext('2d');q.translate(224,0);const texture=new THREE.CanvasTexture(screenCanvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
 const screenMaterial=new THREE.MeshBasicMaterial({map:texture,toneMapped:false});
 function curved(w,h,z,material,name){const geometry=new THREE.PlaneGeometry(w,h,64,1),p=geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i);p.setZ(i,z+8.8-Math.sqrt(8.8*8.8-x*x));}geometry.computeVertexNormals();const mesh=new THREE.Mesh(geometry,material);mesh.position.y=1.86;mesh.name=name;root.add(mesh);return mesh;}
 const shell=new THREE.MeshStandardMaterial({color:0xf1f2ef,roughness:.26,metalness:.2,side:THREE.DoubleSide});
 curved(4.79,2.08,-.09,shell,'White curved monitor shell');curved(4.73,2.02,-.008,new THREE.MeshStandardMaterial({color:0x111820,roughness:.23,side:THREE.DoubleSide}),'Thin monitor bezel');
 const screen=curved(4.608,1.92,.012,screenMaterial,'Alienware curved display');
 for(const x of [-2.385,2.385])box(root,[x,1.86,.245],[.035,2.06,.15],white);
 const rear=monitorRear(root,hardware);
 function label(text,p,w,h,color='#92a0a5',background=null,back=false){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');if(background){ctx.fillStyle=background;ctx.fillRect(0,0,512,128);}ctx.fillStyle=color;ctx.font='500 46px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,64);const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;const m=new THREE.MeshBasicMaterial({map,transparent:!background,side:THREE.DoubleSide});const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);mesh.position.set(...p);if(back)mesh.rotation.y=Math.PI;root.add(mesh);return mesh;}
 label('A L I E N W A R E',[0,.873,.022],.75,.045);
 box(root,[.28,1.14,-.15],[.12,.075,.045],black,'DisplayPort connection');box(root,[.50,1.14,-.15],[.1,.075,.045],black,'Monitor power');
 const keyboard=new THREE.Group();keyboard.name='White RGB keyboard';keyboard.position.set(-.26,.06,1.36);root.add(keyboard);
 box(keyboard,[0,.04,0],[2.44,.08,.79],white);box(keyboard,[0,.095,-.01],[2.32,.024,.68],black);
 const keys=[],legends=[],rows=[['Esc','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12','Prt','Del'],['~','1','2','3','4','5','6','7','8','9','0','-','=','Bk','Nm'],['Tab','Q','W','E','R','T','Y','U','I','O','P','[',']','7','8'],['Caps','A','S','D','F','G','H','J','K','L',';','Enter','4','5','6'],['Shift','Z','X','C','V','B','N','M',',','.','/','Up','1','2','3'],['Ctrl','Win','Alt','','','','','','Alt','Fn','Lt','Dn','Rt','0','.']];
 for(let col=0;col<15;col++){const color=new THREE.Color().setHSL(col/17,.9,.62),diffuser=led(color,3.4);box(keyboard,[-1.105+col*.155,.128,-.01],[.146,.025,.68],diffuser);box(keyboard,[-1.105+col*.155,.065,.40],[.152,.014,.014],diffuser);}
 rows.forEach((row,r)=>row.forEach((text,c)=>{if(r===5&&c>3&&c<8)return;const wide=r===5&&c===3;keys.push({p:[-1.105+c*.155+(wide?.31:0),.143,-.30+r*.117],s:[wide?.73:.133,.055,.097]});legends.push({text,x:-1.105+c*.155+(wide?.31:0),z:-.30+r*.117});}));
 const instance=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),white,keys.length),object=new THREE.Object3D();keys.forEach((k,i)=>{object.position.set(...k.p);object.scale.set(...k.s);object.updateMatrix();instance.setMatrixAt(i,object.matrix);});keyboard.add(instance);
 const letters=document.createElement('canvas');letters.width=1024;letters.height=384;const l=letters.getContext('2d');l.fillStyle='#47525e';l.textAlign='center';l.font='18px Arial';for(const k of legends)l.fillText(k.text,(k.x/2.44+.5)*1024,(k.z/.79+.5)*384+5);const lt=new THREE.CanvasTexture(letters);lt.colorSpace=THREE.SRGBColorSpace;const lm=new THREE.MeshBasicMaterial({map:lt,transparent:true,depthWrite:false});const letterMesh=new THREE.Mesh(new THREE.PlaneGeometry(2.44,.79),lm);letterMesh.rotation.x=-Math.PI/2;letterMesh.position.y=.173;keyboard.add(letterMesh);
 const mouse=new THREE.Group();mouse.name='White RGB gaming mouse';mouse.position.set(1.36,.16,1.32);root.add(mouse);
 const mouseBody=new THREE.Mesh(new THREE.SphereGeometry(1,28,18),white);mouseBody.scale.set(.19,.13,.32);mouse.add(mouseBody);
 const rim=new THREE.Mesh(new THREE.TorusGeometry(.18,.012,6,40),led(0xf466cc,2));rim.rotation.x=Math.PI/2;rim.scale.y=1.68;rim.position.y=-.07;mouse.add(rim);
 box(mouse,[0,.112,-.16],[.013,.015,.24],steel);box(mouse,[0,.127,-.09],[.035,.032,.085],black);
 const wheel=new THREE.Mesh(new THREE.TorusGeometry(.022,.006,6,16),led(0x67dcff,2));wheel.position.set(0,.14,-.09);wheel.rotation.y=Math.PI/2;mouse.add(wheel);
 const pad=box(root,[.1,.015,1.3],[3.6,.027,1.2],new THREE.MeshStandardMaterial({color:0x222830,roughness:.88}));pad.name='Desk mat';
 const cables=new THREE.Group();cables.name='Connected display and USB cables';scene.add(cables);root.updateMatrixWorld(true);
 function cord(points,r=.012,name='Peripheral cable'){
  // Rounded polylines stay inside their guide-point hull, unlike overshooting splines.
  const ps=points.map(p=>new THREE.Vector3(...p)),curve=new THREE.CurvePath();let previous=ps[0];
  for(let i=1;i<ps.length-1;i++){const p=ps[i],radius=Math.min(.12,p.distanceTo(ps[i-1])*.22,p.distanceTo(ps[i+1])*.22),a=p.clone().addScaledVector(ps[i-1].clone().sub(p).normalize(),radius),b=p.clone().addScaledVector(ps[i+1].clone().sub(p).normalize(),radius);curve.add(new THREE.LineCurve3(previous,a));curve.add(new THREE.QuadraticBezierCurve3(a,p,b));previous=b;}
  curve.add(new THREE.LineCurve3(previous,ps.at(-1)));
  const geometry=new THREE.TubeGeometry(curve,180,r,8,false),mesh=new THREE.Mesh(geometry,white);mesh.name=name;mesh.userData.route=curve.getPoints(480).map(p=>p.toArray());mesh.userData.radius=r;cables.add(mesh);return mesh;
 }
 const world=p=>root.localToWorld(new THREE.Vector3(...p)).toArray();
 // Side service loops stay behind the stand and outside its swept feet.
 let displayCable;function setBuild(spec){displayCable?.removeFromParent();displayCable?.geometry.dispose();const x=spec?.vertical?-.15:.06,y=spec?.vertical?1.335:1.55;displayCable=cord([[x,y,-1.265],[x,y,-1.65],[x,.10,-1.92],[-.8,.10,-1.92],world([1.65,.10,-1.2]),world([.8,.12,-1.05]),world([.72,.72,-.82]),world([.64,1.14,-.49]),world([.28,1.14,-.20])],.012,'DisplayPort cable around stand');}setBuild(null);
 for(const [x,side,port] of [[-.26,-1.65,.29],[1.36,1.8,.42]])cord([world([x,.10,.965]),world([side,.10,.80]),world([side,.10,-.88]),world([side,.10,-1.28]),[-.8,.10,-2.12],[port,.10,-2.12],[port,2.053,-1.65],[port,2.053,-1.265]],.008,x<0?'Keyboard USB cable around stand':'Mouse USB cable around stand');
 let state={phase:'boot',boot:0},raceActive=false,last=-1,bootStart=0,lastBoot=-1,screenClicks=0;
 function text(value,x,y,size=28,color='#e6eef9'){q.fillStyle=color;q.font=`${size>=40?'600':'400'} ${size}px Arial`;q.textAlign='left';q.fillText(value,x,y);}
 function button(value,x,y,w,h){const g=q.createLinearGradient(0,y,0,y+h);g.addColorStop(0,'#ebfdff');g.addColorStop(.48,'#99dcf5');g.addColorStop(.5,'#4ea4cd');g.addColorStop(1,'#d9f8ff');q.fillStyle=g;q.beginPath();q.roundRect(x,y,w,h,10);q.fill();q.strokeStyle='#e4fdff';q.lineWidth=2;q.stroke();q.fillStyle='#102c44';q.font='700 34px Arial';q.textAlign='center';q.fillText(value,x+w/2,y+h*.66);q.textAlign='left';}
 function update(s,time,power){state=s;root.visible=cables.visible=s.phase==='boot'||s.phase==='complete';cables.visible&&=s.boot>=1||s.phase==='complete';if(!root.visible||raceActive)return;if(s.boot!==lastBoot){lastBoot=s.boot;bootStart=time;}if(time-last<.12)return;last=time;
  q.fillStyle='#030608';q.fillRect(-224,0,1728,720);if(power){q.fillStyle='#091726';q.fillRect(-224,0,1728,720);text('ALIENWARE',70,72,24,'#87dde9');text('YOUR GAMING PC',70,132,44);text('System check',70,190,25,'#a5b8c9');
   const items=[['Processor','AMD Ryzen 7 9800X3D'],['Memory','32 GB / DDR5 simulation'],['Graphics','ASUS ROG Astral GeForce RTX'],['Storage','2 TB / SATA'],['Cooling','Pump and fans connected'],['Display + USB','Monitor, keyboard and mouse']];
   items.forEach(([name,value],i)=>{const ready=s.phase==='complete'||s.boot>=3||time-bootStart>i*.52;const y=249+i*53;text(name,70,y,24,'#99adbd');text(value,340,y,23);text(ready?'PASS':'CHECKING',1010,y,23,ready?'#66f2b9':'#d9bb69');q.fillStyle='#193344';q.fillRect(70,y+16,1130,1);});
   if(s.phase==='complete'||s.boot>=3){text('ALL SYSTEMS READY',70,634,29,'#78edbc');if(s.phase==='complete')button('Test graphics',832,594,358,78);}else text('Starting your practice PC...',70,634,24,'#87d9ed');text('SIMULATED SYSTEM CHECK',70,689,15,'#60798b');
  }texture.needsUpdate=true;
 }
 function gameFrame(canvas,s){if(!raceActive)return;q.drawImage(canvas,-224,0,1728,720);q.fillStyle='#03112166';q.fillRect(-224,0,1728,76);text('NIGHT RUN',35,47,26);if(s.turbo){text('TURBO',1080,47,26,'#65f4ff');q.fillStyle='#36d9f5';q.fillRect(0,710,1280,5);}text(`${Math.round(s.speed*2.236936)} MPH`,1060,663,32);text(`${s.position} / 3`,35,663,32);text(`${s.elapsed.toFixed(1)} s`,1090,698,20);if(s.phase==='ready')button('Ready!',490,507,300,87);if(s.phase==='loading')text('Preparing downtown...',430,400,36);if(s.phase==='error')text('Unable to load. Return to your PC and retry.',240,390,28);if(s.phase==='countdown'||s.phase==='racing'&&s.elapsed<.7){const n=s.countdown<1?0:s.countdown<2?1:2;q.fillStyle='#07131eea';q.beginPath();q.roundRect(480,130,320,100,18);q.fill();for(let i=0;i<3;i++){q.fillStyle=i===n?['#ff564c','#ffc651','#49ffa5'][i]:'#20313e';q.shadowBlur=i===n?22:0;q.shadowColor=q.fillStyle;q.beginPath();q.arc(540+i*100,180,29,0,Math.PI*2);q.fill();}q.shadowBlur=0;}
  if(s.wrongWay&&Math.floor(s.elapsed*3)%2===0){q.fillStyle='#921d2bdc';q.fillRect(400,110,480,74);text('WRONG WAY',497,160,40);}
  if(s.phase==='finished'){q.fillStyle='#071724ec';q.fillRect(295,205,690,335);text(s.position===1?'FIRST ACROSS THE LINE':'RACE COMPLETE',355,282,36);text(`${s.elapsed.toFixed(2)} seconds`,493,345,32);button('Race again',355,400,270,76);button('Back to PC',655,400,270,76);}texture.needsUpdate=true;
 }
 function click(uv){screenClicks++;const x=uv.x*1728-224,y=(1-uv.y)*720;if(raceActive)return {x,y};if(state.phase==='complete'&&x>832&&x<1190&&y>594&&y<672)return 'test-graphics';return null;}
 const monitorCenter=()=>root.localToWorld(new THREE.Vector3(0,1.86,.08));
 return {root,cables,screen,rear,setBuild,update,gameFrame,click,monitorCenter,normal:()=>new THREE.Vector3(0,0,1).applyQuaternion(root.quaternion),setRace(value){raceActive=value;last=-1;},snapshot:()=>({visible:root.visible,connected:cables.visible,raceActive,screenClicks,monitor:'Alienware 38-inch ultrawide',screenSize:[1728,720],dimensions:[4.608,1.92]}),dispose(){texture.dispose();}};
}
