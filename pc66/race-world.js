import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {Reflector} from 'three/addons/objects/Reflector.js';
export const COURSE_LENGTH=1120;
const v=(x,y,z)=>new THREE.Vector3(x,y,z);
function random(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
function texture(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;}

// Each street block is batched by material and culled independently.
export function downtown(scene){
 const rand=random(8026),materials=[],textures=[],blocks=[];
 const mat=(color,roughness=.6,metalness=0)=>{const m=new THREE.MeshStandardMaterial({color,roughness,metalness});materials.push(m);return m;};
 const light=color=>{const m=mat(color,.3,.25);m.emissive.set(color);m.emissiveIntensity=2.8;return m;};
 const concrete=mat(0xaaa8a1),curb=mat(0xb9bdbb),iron=mat(0x242e34,.32,.75),stone=mat(0x72797c),wood=mat(0x593f2f),yellow=mat(0xe3b945,.5),white=mat(0xc9ced1,.52),leaf=mat(0x304a36),bark=mat(0x493d33);
 const cyan=light(0x4be3ec),warm=light(0xffd092);
 const storefront=mat(0x354c54,.16,.5),interior=mat(0xc0a27a,.7);interior.emissive.set(0xb58a53);interior.emissiveIntensity=.2;
 const foliage=texture(256,256,(q,w,h)=>{const r=random(628);for(let i=0;i<4300;i++){const a=r()*Math.PI*2,rad=Math.sqrt(r()),x=128+Math.cos(a)*rad*116,y=128+Math.sin(a)*rad*120;if(r()>.93)continue;const shade=Math.floor(35+r()*65);q.fillStyle=`rgb(${Math.floor(shade*.64)},${shade},${Math.floor(shade*.47)})`;q.beginPath();q.ellipse(x,y,2+r()*4,1+r()*3,r()*3,0,Math.PI*2);q.fill();}});textures.push(foliage);
 leaf.map=foliage;leaf.alphaTest=.5;leaf.side=THREE.DoubleSide;leaf.color.set(0xffffff);const foliageGeo=new THREE.PlaneGeometry(1,1);
 const asphalt=texture(256,256,(q,w,h)=>{const r=random(35);q.fillStyle='#252b30';q.fillRect(0,0,w,h);for(let i=0;i<16000;i++){const n=20+r()*38;q.fillStyle=`rgb(${n},${n+3},${n+5})`;q.fillRect(r()*w,r()*h,r()*1.8+.4,1);}q.strokeStyle='#171f23';q.lineWidth=.7;for(let i=0;i<8;i++){q.beginPath();q.moveTo(r()*w,0);q.lineTo(r()*w,h);q.stroke();}});asphalt.wrapS=asphalt.wrapT=THREE.RepeatWrapping;textures.push(asphalt);
 const pavement=texture(256,256,(q,w,h)=>{q.fillStyle='#a4a6a4';q.fillRect(0,0,w,h);for(let i=0;i<6000;i++){q.fillStyle=rand()>.5?'#9c9e9d':'#acafad';q.fillRect(rand()*w,rand()*h,2,2);}q.strokeStyle='#737b7c';q.lineWidth=2;for(let i=0;i<=256;i+=64){q.beginPath();q.moveTo(i,0);q.lineTo(i,h);q.moveTo(0,i);q.lineTo(w,i);q.stroke();}});pavement.wrapS=pavement.wrapT=THREE.RepeatWrapping;pavement.repeat.set(1,4);textures.push(pavement);concrete.map=pavement;concrete.bumpMap=pavement;concrete.bumpScale=.045;
 const facade=[];
 for(let style=0;style<5;style++){
  const map=texture(512,1024,(q,w,h)=>{const r=random(style+33);q.fillStyle=['#aca99e','#4a6471','#806b5f','#a3abb0','#344d61'][style];q.fillRect(0,0,w,h);
   for(let row=0;row<16;row++)for(let col=0;col<8;col++){
    const x=col*64,y=row*64,lit=r()>.63;q.fillStyle='#263039';q.fillRect(x+8,y+8,48,48);
    const grad=q.createLinearGradient(x,y,x+48,y+64);grad.addColorStop(0,lit?'#b6a58b':'#728f9f');grad.addColorStop(1,lit?'#efbd70':'#172c3e');q.fillStyle=grad;q.fillRect(x+11,y+10,42,44);
    q.fillStyle=lit?'#50443c':'#334853';if(r()>.4)q.fillRect(x+11,y+10,42,10+r()*16);
    q.fillStyle='#45515a';q.fillRect(x+31,y+10,2,44);q.fillRect(x+10,y+35,44,2);q.fillStyle='#d0c8b5';q.fillRect(x+7,y+56,50,2);
   }
  });textures.push(map);const m=mat(0xffffff,.27,.28);m.map=map;m.emissiveMap=map;m.emissive.set(0xcbdaf3);m.emissiveIntensity=.52;facade.push(m);
 }
 const signs=['NORTH / COFFEE','ATELIER 08','METRO HOTEL','CITY MARKET','STUDIO / SOUND','ORBIT CINEMA'];
 const signMaterials=signs.map((s,i)=>{const t=texture(512,128,(q,w,h)=>{q.fillStyle=['#10313c','#33232e','#182332'][i%3];q.fillRect(0,0,w,h);q.strokeStyle=['#76e3de','#f58cbb','#f0d19a'][i%3];q.lineWidth=5;q.strokeRect(8,8,w-16,h-16);q.fillStyle='#f3eee4';q.textAlign='center';q.textBaseline='middle';q.font='bold 38px Arial';q.fillText(s,w/2,h/2);});textures.push(t);const m=mat(0xffffff);m.map=t;m.emissiveMap=t;m.emissive.set(0xffffff);m.emissiveIntensity=.8;return m;});
 const boxGeo=new THREE.BoxGeometry(1,1,1),cylinderGeo=new THREE.CylinderGeometry(1,1,1,10),sphereGeo=new THREE.IcosahedronGeometry(1,1),matrix=new THREE.Matrix4(),quat=new THREE.Quaternion(),euler=new THREE.Euler();
 function block(z,index){
  const group=new THREE.Group();group.position.z=z;const buckets=new Map();
  function add(geo,m,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){euler.set(rx,ry,rz);quat.setFromEuler(euler);matrix.compose(v(x,y,z),quat,v(sx,sy,sz));const g=geo.clone().applyMatrix4(matrix);if(facade.includes(m)){const uv=g.attributes.uv;for(let i=0;i<uv.count;i++){const face=Math.floor(i/4);uv.setXY(i,uv.getX(i)*(face<2?sz:sx)/24,uv.getY(i)*sy/48);}}if(!buckets.has(m))buckets.set(m,[]);buckets.get(m).push(g);}
  const box=(m,x,y,z,sx,sy,sz,ry=0)=>add(boxGeo,m,x,y,z,sx,sy,sz,0,ry);
  for(const side of [-1,1]){
   box(concrete,side*10.2,.14,0,4.4,.28,40);box(curb,side*8.08,.16,0,.16,.32,40);
   for(let dz=-18;dz<20;dz+=4)box(stone,side*8.04,.22,dz,.17,.04,.045);
   for(let j=0;j<2;j++){
    const dz=-10+j*20,h=12+rand()*40,w=10+rand()*6,depth=18+rand()*8,x=side*(12.6+depth/2),m=facade[(index+j+(side>0?2:0))%5];
    box(m,x,h/2+.25,dz,depth,h,w);box(stone,x,h+.35,dz,depth+.4,.5,w+.4);box(iron,side*12.51,2.0,dz,.15,3.8,w-.4);
    for(let k=-1;k<=1;k++){box(storefront,side*12.39,1.9,dz+k*3.8,.09,3.1,3.6);box(iron,side*12.30,1.9,dz+k*3.8-1.8,.18,3.4,.08);box(interior,side*12.28,2.3,dz+k*3.8,.02,.9,2.6);box(iron,side*12.25,1.8,dz+k*3.8,.04,2.9,.06);box(iron,side*12.18,1.25,dz+k*3.8+.16,.06,.36,.025);}
    box(signMaterials[(index+j)%signMaterials.length],side*12.19,4.1,dz,.18,.95,w-.5);box(index%2?cyan:warm,side*12.06,3.49,dz,.07,.065,w-.6);
    box(white,side*11.65,3.2,dz,1.2,.12,w-.4);box(iron,side*12.0,.4,dz,1,.4,w+.5);
    for(let y=6.25;y<h;y+=3)box(stone,side*12.52,y,dz,.18,.16,w+.05);
    if(index%3===0){box(iron,side*12.0,7,dz,1,.1,4);for(let k=-2;k<=2;k++)box(iron,side*11.5,7.6,dz+k*.85,.06,1.2,.06);box(iron,side*11.5,8.2,dz,.06,.06,4);}
    box(stone,x+side*2,h+1,dz+1,4,1.5,3);box(iron,x,h+1,dz-3,.12,3,.12);
   }
   for(const dz of [-13,13]){
    add(cylinderGeo,iron,side*9.1,3.4,dz,.08,6.5,.08);box(iron,side*8.35,6.6,dz,1.65,.09,.12);box(iron,side*7.65,6.54,dz,.75,.12,.34);box(warm,side*7.65,6.46,dz,.64,.04,.28);box(stone,side*9.1,.3,dz,.32,.4,.32);
    box(stone,side*10.9,.32,dz+4,1.8,.4,1.8);box(wood,side*10.9,.56,dz+4,1.6,.07,1.6);add(cylinderGeo,bark,side*10.9,2,dz+4,.12,3,.12);
    for(let n=0;n<4;n++)add(foliageGeo,leaf,side*10.9,3.9,dz+4,3.3,4,1,0,n*Math.PI/4);
    add(cylinderGeo,iron,side*9.6,.7,dz-3,.35,1.0,.35);add(cylinderGeo,stone,side*9.6,1.22,dz-3,.38,.08,.38);
    for(let n=0;n<10;n++){const a=n*Math.PI/5;box(stone,side*9.6+Math.sin(a)*.351,.68,dz-3+Math.cos(a)*.351,.025,.77,.025);}
    for(let k=0;k<4;k++)box(wood,side*10.9,.69,dz-6+k*.14,1.9,.08,.11);for(const dx of [-.7,.7])box(iron,side*10.9+dx,.4,dz-5.8,.07,.6,.5);box(wood,side*10.9,1.04,dz-5.38,1.9,.45,.09);
   }
   for(let dz=-18;dz<20;dz+=8){add(cylinderGeo,iron,side*8.7,.65,dz,.065,1,.065);add(cylinderGeo,warm,side*8.7,.96,dz,.067,.045,.067);}
   if(index%3===1){box(iron,side*9.8,1.55,3,.12,2.8,.12);box(cyan,side*9.8,2.8,3,1.5,.55,.05);}
  }
  // Road paint sits only millimeters above the driving surface.
  for(let dz=-18;dz<20;dz+=8){for(const x of [-4,4])box(white,x,.018,dz,.12,.008,3);for(const x of [-.13,.13])box(yellow,x,.018,dz,.08,.008,7.5);}
  for(const x of [-7.7,7.7])box(white,x,.018,0,.1,.008,40);
  if(index%4===2)for(let x=-7;x<8;x+=1.3)box(white,x,.02,-18,.7,.01,2.8);
  for(const [m,geos]of buckets){const geometry=mergeGeometries(geos);geos.forEach(g=>g.dispose());group.add(new THREE.Mesh(geometry,m));}
  scene.add(group);blocks.push(group);
 }
 for(let i=0;i<32;i++)block(50-i*40,i);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(600,1800),mat(0x303b40,.85));ground.rotation.x=-Math.PI/2;ground.position.set(0,-.03,-600);scene.add(ground);
 const reflectionShader={...Reflector.ReflectorShader,uniforms:{...Reflector.ReflectorShader.uniforms,grain:{value:asphalt},headlights:{value:new THREE.Vector3()}},vertexShader:Reflector.ReflectorShader.vertexShader.replace('varying vec4 vUv;','varying vec4 vUv; varying vec3 world;').replace('vUv = textureMatrix','world=(modelMatrix*vec4(position,1.)).xyz; vUv = textureMatrix'),fragmentShader:`
  uniform sampler2D tDiffuse;uniform sampler2D grain;uniform vec3 headlights;varying vec4 vUv;varying vec3 world;
  void main(){vec3 a=texture2D(grain,world.xz*.32).rgb;vec4 uv=vUv;uv.x+=(a.r-.03)*.0015*uv.w;uv.y+=(a.g-.03)*.0015*uv.w;
   vec2 coord=uv.xy/uv.w;vec3 reflection=texture2D(tDiffuse,coord).rgb*.4;
   reflection+=(texture2D(tDiffuse,coord+vec2(.0015,0.)).rgb+texture2D(tDiffuse,coord-vec2(.0015,0.)).rgb+texture2D(tDiffuse,coord+vec2(0.,.002)).rgb+texture2D(tDiffuse,coord-vec2(0.,.002)).rgb)*.15;
   vec2 offset=world.xz-headlights.xy;vec2 forward=vec2(sin(headlights.z),-cos(headlights.z));float along=dot(offset,forward);float side=abs(dot(offset,vec2(-forward.y,forward.x)));
   float beam=smoothstep(1.8,4.,along)*(1.-smoothstep(14.,29.,along))*(1.-smoothstep(.7+along*.12,1.5+along*.22,side));
   float wet=.22+.09*sin(world.z*.071+world.x*.2);gl_FragColor=vec4(mix(a*.42,reflection,wet)+beam*vec3(.085,.13,.17),1.);
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
  }`};
 const road=new Reflector(new THREE.PlaneGeometry(16,1500),{textureWidth:768,textureHeight:512,multisample:0,clipBias:.003,shader:reflectionShader});road.rotation.x=-Math.PI/2;road.position.set(0,.008,-620);scene.add(road);
 const lamps=[];for(let i=0;i<6;i++){const lamp=new THREE.PointLight(i%2?0xffba75:0x71e9e5,28,17,1.8);scene.add(lamp);lamps.push(lamp);}
 const finish=new THREE.Group();finish.position.z=-COURSE_LENGTH;scene.add(finish);
 const banner=texture(1024,128,(q,w,h)=>{q.fillStyle='#132127';q.fillRect(0,0,w,h);q.fillStyle='#e7eeee';q.font='bold 72px Arial';q.textAlign='center';q.fillText('FINISH',w/2,91);for(let x=0;x<180;x+=24)for(let y=0;y<128;y+=24)if((x/24+y/24)%2===0){q.fillRect(x,y,24,24);q.fillRect(w-x-24,y,24,24);}});textures.push(banner);const bannerMat=new THREE.MeshStandardMaterial({map:banner,emissiveMap:banner,emissive:0xffffff,emissiveIntensity:.6});materials.push(bannerMat);
 for(const x of [-8,8]){const pole=new THREE.Mesh(new THREE.BoxGeometry(.22,8,.22),iron);pole.position.set(x,4,0);finish.add(pole);}const sign=new THREE.Mesh(new THREE.BoxGeometry(16,1.7,.2),bannerMat);sign.position.y=7;finish.add(sign);
 return {road,update(z,x=0,heading=0){for(const block of blocks)block.visible=Math.abs(block.position.z-z)<220;road.material.uniforms.headlights.value.set(x,z,heading);const base=Math.round((z-50)/40)*40+50;for(let i=0;i<lamps.length;i++)lamps[i].position.set(i%2?7.65:-7.65,6.3,base+(Math.floor(i/2)-1)*40+13);},dispose(){road.dispose();textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());boxGeo.dispose();cylinderGeo.dispose();sphereGeo.dispose();foliageGeo.dispose();}};
}
