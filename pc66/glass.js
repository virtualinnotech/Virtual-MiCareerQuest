import * as THREE from 'three';

export function panelReflections(){
 const faces=Array.from({length:6},(_,i)=>{
  const canvas=document.createElement('canvas');canvas.width=canvas.height=64;
  const ctx=canvas.getContext('2d');ctx.fillStyle=i===2?'#eef7fb':'#7894a2';ctx.fillRect(0,0,64,64);
  ctx.fillStyle='#d9ebf4';ctx.fillRect(12,0,8,64);ctx.fillStyle='#ffffff';ctx.fillRect(23,0,3,64);return canvas;
 });
 const texture=new THREE.CubeTexture(faces);texture.colorSpace=THREE.SRGBColorSpace;texture.needsUpdate=true;return texture;
}

export function outlinePanel(panel){
 const bounds=new THREE.Box3().setFromObject(panel),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
 const outline=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(Math.max(size.x,.008),size.y,size.z)),new THREE.LineBasicMaterial({color:0x6e9bab,transparent:true,opacity:.65}));outline.position.copy(center);outline.name='Glass panel edge';panel.add(outline);
 // A restrained reflection makes the clear pane readable against the open case.
 const x=bounds.min.x-.004,y=bounds.min.y,z=bounds.min.z,h=size.y,d=size.z;
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute([x,y+h*.09,z+d*.12,x,y+h*.88,z+d*.38,x,y+h*.88,z+d*.44,x,y+h*.09,z+d*.18],3));geometry.setIndex([0,1,2,0,2,3]);geometry.computeVertexNormals();
 const sheen=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color:0xdceff8,transparent:true,opacity:.13,side:THREE.DoubleSide,depthWrite:false}));sheen.name='Glass reflection';panel.add(sheen);
}
