import * as THREE from 'three';

// Reuse the completed workshop meshes so the room display cannot drift to an older PC.
export function gamingStation(view,{variant='white',equipmentOnly=false,furnitureOnly=false,peripheralsOnly=false}={}){
 const root=new THREE.Group();root.name='White gaming desk station';
 const setup=new THREE.Group();setup.name='Actual completed workshop PC and peripherals';setup.scale.setScalar(.20);setup.position.set(.64,.765,-.12);root.add(setup);
 for(const [name,group]of Object.entries(view.groups))if(!peripheralsOnly&&name!=='fans'&&group.visible)setup.add(group.clone(true));
 for(const cable of Object.values(view.cables))if(!peripheralsOnly&&cable.visible)setup.add(cable.clone(true));
 setup.add(view.desktop.root.clone(true),view.desktop.cables.clone(true));
 if(equipmentOnly){root.updateMatrixWorld(true);return root;}
 if(furnitureOnly)setup.removeFromParent();
 const white=new THREE.MeshStandardMaterial({color:0xe9edef,roughness:.28,metalness:.18}),dark=new THREE.MeshStandardMaterial({color:0x20252c,roughness:.67}),rubber=new THREE.MeshStandardMaterial({color:0x0e1419,roughness:.9}),metal=new THREE.MeshStandardMaterial({color:0xa7b6c2,metalness:.85,roughness:.26});
 const cyan=new THREE.MeshStandardMaterial({color:0x0a4348,emissive:0x29dbeb,emissiveIntensity:1.8}),pink=new THREE.MeshStandardMaterial({color:0x43174d,emissive:0xcb50dc,emissiveIntensity:1.3});
 const sporty=variant==='carbon',wooden=variant==='oak';
 const chairShell=sporty?new THREE.MeshStandardMaterial({color:0x24262a,roughness:.56}):wooden?new THREE.MeshStandardMaterial({color:0x384048,roughness:.72}):white;
 const upholstery=sporty?new THREE.MeshStandardMaterial({color:0x9b2637,roughness:.88}):dark;
 let desktop=white;
 if(sporty||wooden){const c=document.createElement('canvas');c.width=c.height=512;const q=c.getContext('2d');q.fillStyle=wooden?'#987958':'#22262a';q.fillRect(0,0,512,512);for(let i=0;i<256;i++){q.strokeStyle=wooden?`rgba(57,37,22,${.05+(i%5)*.015})`:(i%2?'#303439':'#191d21');q.lineWidth=wooden?1:2;q.beginPath();q.moveTo(0,i*2);q.bezierCurveTo(170,i*2+Math.sin(i)*3,380,i*2+Math.cos(i)*4,512,i*2);q.stroke();}const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(wooden?2:4,1);desktop=new THREE.MeshStandardMaterial({map,roughness:wooden?.58:.43,metalness:sporty?.2:0});}
 function box(g,p,d,m=white){const mesh=new THREE.Mesh(new THREE.BoxGeometry(...d),m);mesh.position.set(...p);g.add(mesh);return mesh;}
 function cylinder(g,p,r,h,m=metal,axis='y'){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,24),m);mesh.position.set(...p);if(axis==='x')mesh.rotation.z=Math.PI/2;if(axis==='z')mesh.rotation.x=Math.PI/2;g.add(mesh);return mesh;}
 function tube(g,points,r,m){const mesh=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),40,r,8,false),m);g.add(mesh);return mesh;}
 function cushion(g,p,d,m){const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),m);mesh.position.set(...p);mesh.scale.set(d[0]/2,d[1]/2,d[2]/2);g.add(mesh);return mesh;}
 box(root,[0,.733,0],[2.20,.060,1.06],desktop);box(root,[0,.699,0],[2.16,.012,1.015],dark);
 if(wooden){box(root,[.825,.733,.65],[.55,.060,.77],desktop);box(root,[.825,.37,.94],[.49,.68,.08],dark);}
 box(root,[0,.701,.514],[2.08,.008,.01],cyan);
 for(const x of [-.96,.96]){if(sporty){tube(root,[[x,.06,-.37],[x,.38,.22],[x,.70,-.20]],.035,dark);box(root,[x,.38,.17],[.018,.28,.019],pink);}else box(root,[x,.355,-.03],[.055,.67,.065],metal);box(root,[x,.038,-.03],[.15,.05,.84],dark);box(root,[x,.50,-.43],[.042,.42,.04],chairShell);}
 box(root,[0,.67,-.42],[1.88,.095,.12],dark);if(!sporty){box(root,[-.85,.52,.06],[.43,.27,.73],wooden?desktop:white);for(const y of [.52,.63])box(root,[-.85,y,.43],[.16,.009,.02],metal);}
 box(root,[0,.012,.32],[2.12,.018,1.78],new THREE.MeshStandardMaterial({color:0x303338,roughness:1}));
 // Low acoustic backing and integrated light bars keep this a compact corner desk.
 box(root,[0,1.195,-.585],[2.20,.63,.04],dark);
 for(let i=0;i<38;i++)box(root,[-1.07+i*.057,1.195,-.555],[.021,.60,.019],rubber);
 box(root,[-1.075,1.195,-.531],[.014,.60,.012],cyan);box(root,[1.075,1.195,-.531],[.014,.60,.012],pink);
 box(root,[0,1.52,-.48],[2.2,.038,.22],desktop);box(root,[0,1.493,-.38],[2.07,.008,.012],sporty?pink:cyan);
 for(const x of [-.85,.91]){const speaker=new THREE.Group();root.add(speaker);speaker.position.set(x,.77,-.11);box(speaker,[0,.12,0],[.12,.24,.13],white);box(speaker,[0,.12,.07],[.105,.22,.012],dark);for(const [y,r]of [[.07,.034],[.17,.022]]){cylinder(speaker,[0,y,.079],r,.013,rubber,'z');cylinder(speaker,[0,y,.09],r*.35,.005,metal,'z');}box(speaker,[0,.012,.079],[.086,.005,.005],cyan);}
 const pot=new THREE.Mesh(new THREE.CylinderGeometry(.065,.048,.09,24),white);pot.position.set(-.89,1.582,-.47);root.add(pot);
 const green=new THREE.MeshStandardMaterial({color:0x276f54,roughness:.8});for(let i=0;i<9;i++){const a=i*2.4;tube(root,[[-.89,1.62,-.47],[-.89+Math.cos(a)*.035,1.70,-.47+Math.sin(a)*.035],[-.89+Math.cos(a)*.08,1.71+(i%3)*.025,-.47+Math.sin(a)*.08]],.008,green);}
 // Upholstered chair, chrome five-star base, paired casters and adjustable arms.
 const chair=new THREE.Group();chair.name=wooden?'Ergonomic mesh chair':sporty?'Red and graphite racing chair':'White gaming chair';chair.position.set(-.22,0,1.08);chair.rotation.y=wooden?.16:sporty?-.08:-.22;root.add(chair);
 cylinder(chair,[0,.25,0],.035,.35);cylinder(chair,[0,.17,0],.055,.16,dark);
 for(let i=0;i<5;i++){const a=i*Math.PI*2/5,x=Math.cos(a)*.30,z=Math.sin(a)*.30;tube(chair,[[0,.12,0],[x*.55,.085,z*.55],[x,.066,z]],.018,metal);for(const dx of [-.018,.018])cylinder(chair,[x+dx,.045,z],.038,.025,rubber,'x');}
 cushion(chair,[0,.46,0],[.56,.16,.56],chairShell);cushion(chair,[0,.493,-.02],[.40,.07,.43],upholstery);
 for(const x of [-.235,.235])cushion(chair,[x,.515,0],[.095,.10,.45],chairShell);
 const back=new THREE.Group();back.position.set(0,.49,.22);back.rotation.x=.08;chair.add(back);
 const shape=new THREE.Shape();shape.moveTo(-.21,0);shape.lineTo(-.28,.42);shape.quadraticCurveTo(-.29,.52,-.20,.57);shape.lineTo(-.15,.78);shape.quadraticCurveTo(0,.88,.15,.78);shape.lineTo(.20,.57);shape.quadraticCurveTo(.29,.52,.28,.42);shape.lineTo(.21,0);shape.closePath();
 if(wooden){
  for(const x of [-.205,.205])tube(back,[[x,.05,0],[x*1.12,.36,.025],[x*.9,.65,.01]],.025,chairShell);
  for(const y of [.08,.64])tube(back,[[-.19,y,.01],[0,y+.018,.012],[.19,y,.01]],.023,chairShell);
  for(let i=0;i<22;i++)tube(back,[[-.19,.11+i*.023,.013],[0,.11+i*.023,-.01],[.19,.11+i*.023,.013]],.0025,metal);
  for(let i=0;i<17;i++)box(back,[-.182+i*.022,.365,.013],[.002,.52,.004],rubber);
  box(back,[0,.71,0],[.03,.15,.03],metal);cushion(back,[0,.78,-.012],[.31,.12,.10],dark);cushion(back,[0,.19,-.035],[.30,.065,.07],dark);
 }else{
  const shell=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.075,bevelEnabled:true,bevelThickness:.018,bevelSize:.018,bevelSegments:3,curveSegments:12}),chairShell);back.add(shell);
  cushion(back,[0,.40,-.01],[.36,.73,.10],upholstery);cushion(back,[0,.63,-.063],[.28,.115,.08],rubber);cushion(back,[0,.14,-.073],[.31,.12,.11],upholstery);
  for(const x of [-.10,.10]){box(back,[x,.58,.102],[.075,.043,.012],rubber);box(back,[x,.58,.111],[.057,.009,.006],sporty?pink:cyan);}
  for(const x of sporty?[-.16,.16]:[0])tube(back,[[x,.09,.103],[x,.34,.104],[x*.8,.66,.106]],.005,sporty?pink:cyan);
 }
 for(const x of [-.32,.32]){box(chair,[x,.54,0],[.025,.22,.026],metal);cushion(chair,[x,.65,-.015],[.11,.05,.30],dark);}
 root.updateMatrixWorld(true);return root;
}
