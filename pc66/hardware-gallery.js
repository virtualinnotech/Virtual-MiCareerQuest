import * as THREE from 'three';

export function hardwareGallery(view){
 const root=new THREE.Group();root.name='GPU, motherboard and memory gallery';
 function part(id,position,size,rotation){const group=view.groups[id].clone(true);group.position.set(0,0,0);const inner=new THREE.Group();inner.add(group);const bound=new THREE.Box3().setFromObject(group),center=bound.getCenter(new THREE.Vector3());group.position.sub(center);const d=bound.getSize(new THREE.Vector3());inner.scale.setScalar(size/Math.max(d.x,d.y,d.z));if(rotation)inner.rotation.set(...rotation);inner.position.set(...position);root.add(inner);return inner;}
 part('gpu',[0,.38,0],.80,[-Math.PI/2,Math.PI/2,0]);part('board',[0,1.05,-.10],.79,[0,Math.PI/2,0]);
 part('ramA',[-.51,.52,.05],.35,[0,Math.PI/2,0]);part('ramB',[.51,.52,.05],.35,[0,Math.PI/2,0]);
 part('cpu',[0,.82,.14],.20,[0,Math.PI/2,0]);
 part('psu',[0,.09,.025],.53,[0,Math.PI/2,0]);
 root.updateMatrixWorld(true);return root;
}
