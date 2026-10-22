import * as THREE from 'three';
import {showcase} from './showcase.js?v=20261009-collection86';
import {builds} from './collection.js?v=20261009-collection86';

// All collectible PCs use the same fully modeled hardware as the teaching build.
export function prebuilt(id){
 const spec=builds.find(b=>b.id===id);if(!spec||id==='original')throw Error('Unknown prebuilt '+id);
 const h=showcase(),root=new THREE.Group(),parts={},group=name=>{const g=new THREE.Group();g.name=name;parts[name]=g;root.add(g);return g;};
 root.name=spec.name;root.userData.build=id;
 h.white.color.setHex(spec.color);h.white.roughness=.32;
 const shell=group('Case'),panel=group('Glass'),bay=group('Lower bay');
 h.enclosure(shell,panel,bay);
 const metal=new THREE.MeshStandardMaterial({color:spec.trim||spec.color,metalness:spec.trim?.68:.32,roughness:.30});
 for(const y of [.19,2.90])h.roundBox(shell,[0,y,1.20],[1.25,.15,.12],metal,.02);
 if(spec.trim)for(const y of [.27,2.84])h.box(shell,[-.626,y,0],[.025,.12,2.36],metal);
 const board=group('Motherboard');h.motherboard(board);h.cpu(group('Processor'));
 h.memory(group('Memory A'),-.1596,spec.light);h.memory(group('Memory B'),-.0607,spec.light);
 h.powerSupply(group('Power supply'));
 const gpu=group('Graphics card');h.gpu(gpu);
 // GPU white finishes remain white in the pastel cases; darker editions have graphite shrouds.
 const gpuColor=spec.darkGPU?0x424951:spec.dashboard?0xb72b30:0xeff1f2;
 const gpuWhite=h.white.clone();gpuWhite.color.setHex(gpuColor);gpu.traverse(o=>{if(o.material===h.white)o.material=gpuWhite;});
 if(spec.vertical){
  const pivot=new THREE.Group();pivot.name='Vertical GPU mount';pivot.position.set(-.17,1.34,-.27);root.add(pivot);
  root.remove(gpu);gpu.position.set(-.055,-1.53,.27);pivot.rotation.z=-Math.PI/2;pivot.add(gpu);
  h.box(shell,[-.25,.95,-.27],[.43,.06,1.78],h.steel,'Vertical GPU support');
  const riser=h.cable([[.37,1.56,-.48],[.30,1.11,-.48],[-.03,.99,-.48]],12,'z');root.add(riser);
 }
 const cooler=group('CPU cooling'),roof=group('Roof fans');
 if(spec.air){
  h.box(cooler,[.1,2.03,-.46],[.44,.56,.56],h.steel,'Dual-tower heatsink');
  h.batch(cooler,new THREE.BoxGeometry(.47,.009,.59),h.silver,Array.from({length:32},(_,i)=>[.09,1.76+i*.017,-.46]));
  for(const z of [-.66,-.52,-.38,-.24])h.tube(cooler,[[.32,1.80,z],[-.10,1.75,z],[-.15,2.32,z]],.014,h.silver);
  const air=h.fan(cooler,[-.18,2.03,-.46],spec.light,'z',.57);air.rotation.y=-Math.PI/2;
  if(spec.airScreen)display(cooler,[-.21,2.04,-.79],.32,.39,'CPU  36 C',true);
 }else h.cooler(cooler,roof);
 for(const z of [-.72,0,.72])h.fan(roof,[0,2.64,z],spec.light,'down');
 const bottom=group('Bottom intake');for(const z of [-.72,0,.72])h.fan(bottom,[0,.81,z],spec.second||spec.light);
 h.fan(group('Rear exhaust'),[-.16,2.19,-1.135],spec.light,'z');
 if(spec.panorama||spec.mesh){
  const front=group('Front intake');
  for(const y of [1.15,1.84,2.51])h.fan(front,[0,y,1.06],spec.second||spec.light,'z',.61);
 }
 if(spec.mesh||spec.solidFront){
  const front=group(spec.mesh?'Ventilated front grille':'Front service column');
  if(spec.mesh){h.batch(front,new THREE.BoxGeometry(.022,2.20,.045),h.steel,Array.from({length:32},(_,i)=>[-.54+i*.035,1.73,1.24]));h.batch(front,new THREE.BoxGeometry(1.1,.012,.025),h.black,Array.from({length:64},(_,i)=>[0,.66+i*.034,1.267]));}
  else{h.roundBox(front,[0,1.76,1.24],[1.14,2.22,.07],h.black,.02);h.box(front,[-.49,1.76,1.285],[.014,2.10,.012],h.led(spec.light,1.4));}
 }
 if(spec.panorama){const edge=group('Panoramic corner trim');for(const y of [.31,2.86]){const bar=h.roundBox(edge,[-.56,y,1.15],[.20,.09,.20],metal,.018);bar.rotation.y=Math.PI/4;}}
 if(spec.dashboard)display(group('Front dashboard'),[-.46,1.78,1.285],.28,1.98,'INFERNO',false);
 if(spec.mascot){
  const g=group('Reservoir and display ornament'),green=new THREE.MeshStandardMaterial({color:0x80c928,roughness:.24,metalness:.12});
  h.box(g,[-.12,2.01,.41],[.48,.035,.42],h.white);
  for(const [p,s]of [[[-.12,2.14,.41],[.12,.13,.12]],[[-.12,2.29,.41],[.11,.10,.10]]]){const m=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),green);m.position.set(...p);m.scale.set(...s);g.add(m);}
  for(const z of [.34,.47]){h.cylinder(g,[-.225,2.29,z],.020,.012,h.black,'x');h.tube(g,[[-.12,2.35,z],[-.12,2.44,z]],.010,green);}
  h.cylinder(g,[.12,1.91,.73],.10,.44,h.silver);h.cylinder(g,[.12,1.91,.73],.105,.30,h.led(spec.second,1.3));
 }
 const loom=group('Sleeved power leads');
 for(const route of [
  [[.40,.64,.86],[-.39,.74,.86],[-.46,1.05,.75],[-.38,1.73,.62],[-.268,1.77,.18]],
  [[.50,.70,.35],[.51,1.85,.34],[.18,1.85,.34],[.395,1.85,.12]],
  [[.51,.70,-.85],[.51,2.51,-.85],[.28,2.51,-.85],[.395,2.42,-.82]]
 ])loom.add(h.cable(route,8,'z'));
 // Consolidate lighting to the edition's palette, retaining shaped diffusers and fan rings.
 const glow=new Map();root.traverse(o=>{if(!o.isMesh)return;const m=o.material;if(m?.userData.rgb){
  const key=m.userData.matrix?'bay':m.userData.gradientRGB?'detail':'fan';
  if(!glow.has(key)){const n=m.clone();n.map=null;n.emissiveMap=null;n.color.setHex(0x11161b);n.emissive.setHex(key==='bay'||key==='detail'?spec.second||spec.light:spec.light);n.emissiveIntensity=spec.quiet?.3:key==='fan'?2.6:1.8;n.userData={collectionGlow:true,collectionIntensity:n.emissiveIntensity};glow.set(key,n);}
  o.material=glow.get(key);
 }});
 // Interior hardware stays silver/white where the real component finish differs from the shell.
 for(const g of [board,parts.Processor,parts['Memory A'],parts['Memory B'],parts['Power supply'],cooler]){
  const finish=h.white.clone();finish.color.setHex(spec.id==='rose'||spec.id==='glacier'?0xe9edf0:0x87929d);
  g.traverse(o=>{if(o.material===h.white)o.material=finish;});
 }
 const bladeFinish=h.white.clone();bladeFinish.color.setHex(['rose','glacier','polar'].includes(id)?0xe5e9ec:0x69747e);for(const rotor of h.rotors)rotor.traverse(o=>{if(o.material===h.white)o.material=bladeFinish;});
 h.update(1,true,true);for(const g of Object.values(parts))h.bake(g);
 root.updateMatrixWorld(true);
 const lights=[...glow.values()],panes=[];root.traverse(o=>{if(o.material?.isMeshPhysicalMaterial)panes.push(o);});
 function display(g,p,w,height,label,side){
  h.box(g,p,side?[.055,height+.045,w+.04]:[w+.045,height+.04,.045],h.black);
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=side?320:1536;const q=canvas.getContext('2d');
  q.fillStyle='#071522';q.fillRect(0,0,canvas.width,canvas.height);q.textAlign='center';
  const colors=['#f0ce70','#5ddbe9','#fa899d'];q.font='bold 24px sans-serif';q.fillStyle='#eef9ff';q.fillText(label,128,55);
  for(let i=0;i<(side?2:7);i++){const y=100+i*(side?95:196);q.fillStyle=colors[i%3];q.fillRect(20,y,216,5);q.font='bold 40px sans-serif';q.fillText(['36 C','READY','120 FPS','32 GB','47 C','NIGHT RUN','ONLINE'][i],128,y+60);q.font='16px sans-serif';q.fillText(['CPU','SYSTEM','GRAPHICS','MEMORY','GPU','GAME','STATUS'][i],128,y+91);}
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const screen=new THREE.Mesh(new THREE.PlaneGeometry(w,height),new THREE.MeshBasicMaterial({map:texture}));screen.name=label+' screen';screen.position.set(...p);if(side){screen.position.x-=.03;screen.rotation.y=-Math.PI/2;}else screen.position.z+=.026;g.add(screen);
 }
 return {root,spec,rotors:h.rotors,update(dt,rgb=true,glass=true){for(const r of h.rotors)r.rotation.z+=dt*12;for(const m of lights)m.emissiveIntensity=rgb?m.userData.collectionIntensity:0;for(const p of panes)p.visible=glass;},dispose(){const geometries=new Set(),materials=new Set(),textures=new Set();root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});for(const g of geometries)g.dispose();for(const m of materials){for(const v of Object.values(m))if(v?.isTexture)textures.add(v);m.dispose();}for(const t of textures)t.dispose();}};
}
