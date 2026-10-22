import * as THREE from 'three';

// The offline beta has its own reward view, without loading the rest of the venue.
export function awardDisplay(scene,camera,controls,groups,cables,selected){
 let root=null,turntable=null,hidden=[],rotors=[],owned=[],saved=null;
 function mesh(geometry,material,p,parent=root){const m=new THREE.Mesh(geometry,material);m.position.set(...p);parent.add(m);owned.push(geometry);return m;}
 function close(){
  if(!root)return;
  root.removeFromParent();for(const [o,visible]of hidden)o.visible=visible;
  for(const resource of owned)resource.dispose();
  camera.position.copy(saved.camera);controls.target.copy(saved.target);controls.autoRotate=saved.rotate;controls.update();
  root=turntable=null;owned=[];hidden=[];rotors=[];
 }
 function show(){
  close();saved={camera:camera.position.clone(),target:controls.target.clone(),rotate:controls.autoRotate};
  hidden=scene.children.filter(o=>!o.isLight).map(o=>[o,o.visible]);
  root=new THREE.Group();root.name='Completed build glass display';turntable=new THREE.Group();root.add(turntable);
  const model=selected();for(const o of model?[model]:[...Object.values(groups).filter(g=>g.visible&&g.name!=='fans'),...Object.values(cables).filter(g=>g.visible)]){
   const clone=o.clone(true);clone.position.y+=.35;turntable.add(clone);
   clone.traverse(n=>{if(n.name==='Animated fan blades')rotors.push(n);});
  }
  for(const [o]of hidden)o.visible=false;
  const dark=new THREE.MeshStandardMaterial({color:0x18232a,metalness:.55,roughness:.3}),silver=new THREE.MeshStandardMaterial({color:0xa7c8ce,metalness:.85,roughness:.17}),glow=new THREE.MeshStandardMaterial({color:0x74ffdd,emissive:0x24dcbb,emissiveIntensity:1.3}),glass=new THREE.MeshPhysicalMaterial({color:0xc3f4f6,transparent:true,opacity:.075,metalness:.1,roughness:.06,depthWrite:false,side:THREE.DoubleSide});
  owned.push(dark,silver,glow,glass);
  mesh(new THREE.BoxGeometry(1.9,.42,3.1),dark,[0,.08,0]);
  mesh(new THREE.BoxGeometry(1.94,.035,3.14),silver,[0,.307,0]);
  for(const x of [-.86,.86])mesh(new THREE.BoxGeometry(.014,.018,2.86),glow,[x,.338,0]);
  for(const z of [-1.43,1.43])mesh(new THREE.BoxGeometry(1.72,.018,.014),glow,[0,.338,z]);
  for(const x of [-.87,.87])for(const z of [-1.43,1.43])mesh(new THREE.BoxGeometry(.014,3.2,.014),silver,[x,1.95,z]);
  for(const x of [-.88,.88])mesh(new THREE.BoxGeometry(.008,3.2,2.86),glass,[x,1.95,0]);
  for(const z of [-1.44,1.44])mesh(new THREE.BoxGeometry(1.76,3.2,.008),glass,[0,1.95,z]);
  mesh(new THREE.BoxGeometry(1.94,.045,3.14),dark,[0,3.57,0]);
  const label=document.createElement('canvas');label.width=768;label.height=128;const q=label.getContext('2d');q.fillStyle='#152129';q.fillRect(0,0,768,128);q.fillStyle='#a6f8ed';q.textAlign='center';q.font='600 72px sans-serif';q.fillText('Your Build',384,91);
  const texture=new THREE.CanvasTexture(label);texture.colorSpace=THREE.SRGBColorSpace;const labelMaterial=new THREE.MeshBasicMaterial({map:texture});owned.push(texture,labelMaterial);
  const plaque=mesh(new THREE.PlaneGeometry(2.1,.35),labelMaterial,[-.956,.095,0]);plaque.rotation.y=-Math.PI/2;
  scene.add(root);controls.autoRotate=false;controls.target.set(0,1.9,0);camera.position.copy(controls.target).add(new THREE.Vector3(-5.8,1.6,6.3).multiplyScalar(Math.max(1,.85/camera.aspect)));controls.update();
 }
 return {show,close,get active(){return !!root;},update(dt){if(turntable){for(const [o]of hidden)o.visible=false;for(const r of rotors)r.rotation.z+=dt*12;}}};
}
