import * as THREE from 'three';

export function turboExhaust(car){
 const root=new THREE.Group();root.name='Turbo exhaust flames';car.add(root);root.visible=false;
 const orange=new THREE.MeshBasicMaterial({color:0xff6c12,transparent:true,opacity:.7,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
 const hot=new THREE.MeshBasicMaterial({color:0xffdf87,transparent:true,opacity:.92,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
 const blue=new THREE.MeshBasicMaterial({color:0x72cfff,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
 const jets=[];
 for(const x of [-.17,0,.17]){
  const jet=new THREE.Group();jet.position.set(x,.36,2.04);root.add(jet);jets.push(jet);
  for(const [radius,length,material]of [[.092,1.23,orange],[.062,.88,hot],[.042,.35,blue]]){
   const geometry=new THREE.ConeGeometry(radius,length,18,12,true);geometry.translate(0,length/2,0);geometry.rotateX(Math.PI/2);
   const p=geometry.attributes.position;for(let i=0;i<p.count;i++){const z=p.getZ(i);p.setX(i,p.getX(i)+Math.sin(z*14)*.018*z);p.setY(i,p.getY(i)+Math.cos(z*19)*.012*z);}geometry.computeVertexNormals();jet.add(new THREE.Mesh(geometry,material));
  }
 }
 const light=new THREE.PointLight(0xff8a2b,0,4,2);light.position.set(0,.4,2.6);root.add(light);
 return {root,update(time,active){root.visible=active;light.intensity=active?9:0;for(const [i,jet]of jets.entries()){jet.scale.z=.82+.22*Math.sin(time*42+i*2)+.14*Math.sin(time*71+i);jet.scale.x=jet.scale.y=.9+.12*Math.sin(time*33+i);jet.rotation.z=Math.sin(time*19+i)*.14;}},snapshot:()=>({visible:root.visible,jets:jets.length})};
}
