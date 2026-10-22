import * as THREE from 'three';

const metal=new THREE.MeshStandardMaterial({color:0x34424d,metalness:.4,roughness:.5});
const dark=new THREE.MeshStandardMaterial({color:0x1e2931,roughness:.7});
const silver=new THREE.MeshStandardMaterial({color:0xa6bac5,metalness:.4,roughness:.4});
const glow=color=>new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:1.4,roughness:.24,toneMapped:false});
const white=new THREE.MeshStandardMaterial({color:0xeaf0f2,metalness:.28,roughness:.3});
function block(group,p,size,material=metal){const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),material);mesh.position.set(...p);group.add(mesh);return mesh;}

export function caseFeet(group){
 const geometry=new THREE.CylinderGeometry(.075,.08,.07,24);
 for(const x of [-.38,.38])for(const z of [-.94,.76]){const foot=new THREE.Mesh(geometry,dark);foot.name='Solid case foot';foot.position.set(x,.035,z);group.add(foot);}
}

export function rgbFan(group,p,color,axis='z'){
 const root=new THREE.Group();root.name='RGB cooling fan';root.position.set(...p);root.scale.setScalar(axis==='y'?1:.74/.49);if(axis==='y')root.rotation.x=-Math.PI/2;group.add(root);
 for(const y of [-.23,.23])block(root,[0,y,0],[.49,.03,.065],dark);
 for(const x of [-.23,.23])block(root,[x,0,0],[.03,.43,.065],dark);
 const ringMaterial=glow(color);ringMaterial.side=THREE.DoubleSide;for(const z of [-.044,.044]){const ring=new THREE.Mesh(new THREE.RingGeometry(.178,.217,48),ringMaterial);ring.name='RGB fan diffuser';ring.position.z=z;root.add(ring);}
 const rotor=new THREE.Group();rotor.name='Animated fan blades';rotor.position.z=.025;root.add(rotor);
 const hub=new THREE.Mesh(new THREE.CylinderGeometry(.051,.051,.06,16),silver);hub.rotation.x=Math.PI/2;rotor.add(hub);
 const shape=new THREE.Shape();shape.moveTo(.025,.035);shape.bezierCurveTo(.10,.06,.17,.10,.175,.155);shape.quadraticCurveTo(.12,.19,.075,.183);shape.bezierCurveTo(.078,.12,.02,.095,-.008,.048);shape.closePath();
 const bladeGeometry=new THREE.ExtrudeGeometry(shape,{depth:.008,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.002,bevelThickness:.002,curveSegments:8});
 for(let i=0;i<7;i++){const blade=new THREE.Mesh(bladeGeometry,white);blade.scale.set(.83,.83,1);blade.rotation.z=i*Math.PI*2/7;rotor.add(blade);}
 for(const x of [-.21,.21])for(const y of [-.21,.21]){const screw=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.012,8),silver);screw.rotation.x=Math.PI/2;screw.position.set(x,y,.04);root.add(screw);}
 return rotor;
}

function label(group,text,p,size,color=0xeaf0f2,lit=false){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=64;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.font='bold 42px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,32);
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
 const material=new THREE.MeshStandardMaterial({map,color,transparent:true,roughness:.4,emissive:lit?color:0,emissiveMap:lit?map:null,emissiveIntensity:lit?2:0,depthWrite:false});
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(...size),material);mesh.rotation.y=-Math.PI/2;mesh.position.set(...p);group.add(mesh);return mesh;
}

export function gamingMemory(group,z,color){
 const body=block(group,[.346,2.032,z],[.15,.70,.032],white);body.name='White RAM heat spreader';
 block(group,[.415,2.032,z],[.008,.68,.028],dark);
 for(const x of [.30,.37])block(group,[x,2.032,z-.018],[.006,.63,.006],silver);
 for(const y of [1.72,2.34])block(group,[.338,y,z],[.11,.03,.039],white);
 const diffuser=block(group,[.267,2.032,z],[.019,.65,.037],glow(color));diffuser.name='RAM RGB top diffuser';
 for(let i=0;i<5;i++)block(group,[.267,1.77+i*.13,z],[.02,.007,.04],white);
}

export function gamingGPU(group){
 const rotors=[];
 for(const z of [-.765,-.165]){const rotor=rgbFan(group,[.149,1.662,z],0x51dedd,'y');const fan=rotor.parent;fan.remove(...fan.children.slice(0,4));fan.scale.setScalar(.90);fan.name='GPU cooling fan';const recess=new THREE.Mesh(new THREE.CircleGeometry(.217,40),dark);recess.position.z=-.015;fan.add(recess);rotors.push(rotor);}
 block(group,[-.157,1.607,-.464],[.008,.009,1.10],glow(0x4fdecf)).name='GPU RGB edge';
 block(group,[-.157,1.556,-.47],[.006,.145,.75],dark);
 const badge=label(group,'GEFORCE RTX',[-.161,1.558,-.47],[.72,.067],0x87f6b4,true);badge.name='Illuminated GeForce badge';badge.material.toneMapped=false;
 return rotors;
}

export function frontGrille(group){
 for(const x of [-.515,.515])block(group,[x,1.337,1.04],[.03,2.52,.09],metal);
 for(const y of [.077,2.597])block(group,[0,y,1.04],[1.06,.04,.09],metal);
 const specs=[{count:42,size:[1,.005,.016],position:i=>[0,.13+i*.059,1.082]},{count:24,size:[.005,2.46,.016],position:i=>[-.49+i*.0426,1.337,1.082]}];
 for(const spec of specs){const mesh=new THREE.InstancedMesh(new THREE.BoxGeometry(...spec.size),dark,spec.count);mesh.name='Perforated front grille';for(let i=0;i<spec.count;i++){const transform=new THREE.Matrix4().makeTranslation(...spec.position(i));mesh.setMatrixAt(i,transform);}group.add(mesh);}
}

export function liquidCooler(group){
 block(group,[.30,2.02,-.465],[.13,.25,.25]);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.09,.009,6,24),glow(0x39e5df));ring.rotation.y=Math.PI/2;ring.position.set(.227,2.02,-.465);group.add(ring);
 block(group,[0,2.42,.22],[.52,.09,1.10]);
 for(let i=0;i<18;i++)block(group,[0,2.367,-.28+i*.058],[.46,.012,.014],silver);
 for(const [offset,color]of [[-.045,0x32e4db],[.045,0xf252b6]]){
  const points=[[.26,2.08,-.465+offset],[-.08,2.15,-.34+offset],[-.27,2.30,-.08+offset],[-.15,2.40,.63+offset]].map(p=>new THREE.Vector3(...p));
  const tube=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),24,.026,8,false),glow(color));tube.name='Sealed coolant tube';group.add(tube);
  for(const p of [points[0],points[3]]){const fitting=new THREE.Mesh(new THREE.SphereGeometry(.037,10,6),silver);fitting.position.copy(p);group.add(fitting);}
 }
}

export function tidyCable(points,color=0x304e68){
 const group=new THREE.Group();group.name='Visible tied cable';
 const vectors=points.map(p=>new THREE.Vector3(...p)),path=new THREE.CurvePath();let cursor=vectors[0];
 for(let i=1;i<vectors.length-1;i++){
  const corner=vectors[i],incoming=vectors[i-1].clone().sub(corner),outgoing=vectors[i+1].clone().sub(corner),radius=Math.min(.035,incoming.length()/3,outgoing.length()/3);
  if(radius<.001)continue;
  const before=corner.clone().addScaledVector(incoming.normalize(),radius),after=corner.clone().addScaledVector(outgoing.normalize(),radius);
  path.add(new THREE.LineCurve3(cursor,before));path.add(new THREE.QuadraticBezierCurve3(before,corner,after));cursor=after;
 }
 path.add(new THREE.LineCurve3(cursor,vectors.at(-1)));
 const cable=new THREE.Mesh(new THREE.TubeGeometry(path,64,.014,6,false),new THREE.MeshStandardMaterial({color,roughness:.7}));group.add(cable);
 const ties=[];
 for(let i=1;i<vectors.length;i++){
  const start=vectors[i-1],end=vectors[i],delta=end.clone().sub(start),length=delta.length();
  if(length<.15)continue;
  for(let t=.2;t<length;t+=.28){const tie=new THREE.Object3D();tie.position.copy(start).addScaledVector(delta,t/length);tie.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),delta.clone().normalize());tie.updateMatrix();ties.push(tie.matrix.clone());}
 }
 if(ties.length){const batch=new THREE.InstancedMesh(new THREE.TorusGeometry(.021,.0035,4,10),dark,ties.length);batch.name='Cable zip ties';ties.forEach((matrix,i)=>batch.setMatrixAt(i,matrix));group.add(batch);}
 for(const p of [vectors[0],vectors.at(-1)])block(group,p.toArray(),[.037,.045,.07],dark);
 return group;
}
