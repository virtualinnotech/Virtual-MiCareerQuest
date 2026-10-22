import * as THREE from 'three';

// Teaching geometry follows the existing board and connector coordinates.
export function addMotherboardDetails(board){
 const black=new THREE.MeshStandardMaterial({color:0x242a30,roughness:.7});
 const metal=new THREE.MeshStandardMaterial({color:0x87949e,metalness:.55,roughness:.4});
 const darkMetal=new THREE.MeshStandardMaterial({color:0x414f5b,metalness:.45,roughness:.5});
 const gold=new THREE.MeshStandardMaterial({color:0xcbb571,metalness:.55,roughness:.45});
 const details=new THREE.Group();details.name='Raised motherboard hardware';board.add(details);
 function box(name,p,size,material){const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),material);mesh.name=name;mesh.position.set(...p);details.add(mesh);return mesh;}
 // The board faces negative X: components project out of its front surface.
 box('Rear I/O housing',[.34,2.03,-.99],[.17,.77,.105],darkMetal);
 for(let i=0;i<6;i++)box('Rear I/O connector',[.33,1.74+i*.10,-1.047],[.09,.052,.018],metal);
 for(const [y,z,width,height]of [[2.34,-.48,.50,.12],[2.03,-.82,.12,.51],[1.35,-.72,.35,.18]]){
  box('Heatsink base',[.389,y,z],[.065,height,width],darkMetal);
  for(let i=0;i<7;i++)box('Raised heatsink fin',[.345,y,z-width/2+(i+.5)*width/7],[.06,height,.012],metal);
 }
 for(const [y,length]of [[1.56,.72],[1.41,.27],[1.24,.72]]){
  box('PCIe slot housing',[.385,y,-.46],[.08,.051,length],black);
  box('PCIe slot opening',[.342,y,-.46],[.006,.018,length-.028],darkMetal);
  for(let i=0;i<12;i++)box('PCIe contact',[.337,y,-.46-length/2+.035+i*(length-.07)/12],[.004,.009,.006],gold);
  box('PCIe retaining clip',[.368,y,-.46+length/2+.025],[.10,.062,.04],metal);
 }
 for(let i=0;i<6;i++)box('SATA connector',[.386,1.26+i*.042,.115],[.083,.03,.075],black);
 for(const [y,z]of [[1.68,-.80],[1.31,-.33],[1.72,-.29],[2.26,-.29]])box('Controller chip',[.409,y,z],[.029,.095,.092],black);
 const capGeometry=new THREE.CylinderGeometry(.024,.024,.065,10);
 for(const [y,z]of [[2.26,-.76],[2.18,-.76],[2.10,-.76],[2.02,-.76],[1.94,-.76],[1.86,-.76],[2.26,-.63],[2.26,-.55],[2.26,-.47],[2.26,-.39],[1.67,-.94],[1.60,-.94],[1.53,-.94]]){
  const cap=new THREE.Mesh(capGeometry,metal);cap.name='Raised capacitor';cap.rotation.z=Math.PI/2;cap.position.set(.385,y,z);details.add(cap);
 }
 for(let i=0;i<5;i++)box('Power choke',[.390,1.87+i*.078,-.87],[.06,.055,.052],black);
 const battery=new THREE.Mesh(new THREE.CylinderGeometry(.057,.057,.024,20),metal);battery.name='CMOS battery';battery.rotation.z=Math.PI/2;battery.position.set(.401,1.69,-.57);details.add(battery);
 return details;
}
