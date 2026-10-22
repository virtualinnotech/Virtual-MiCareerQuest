import * as THREE from 'three';

export function monitorRear(root,{white,black,box,led}){
 const light=led(0x00dfce,1.1),trim=new THREE.MeshStandardMaterial({color:0x303638,roughness:.38,metalness:.35});
 function shapeMesh(shape,depth,material,name){const mesh=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:.009,bevelThickness:.006,bevelSegments:3,steps:1,curveSegments:24}),material);mesh.name=name;root.add(mesh);return mesh;}
 function capsule(w,h){const s=new THREE.Shape(),r=w/2;s.moveTo(-r,-h/2+r);s.lineTo(-r,h/2-r);s.absarc(0,h/2-r,r,Math.PI,0,true);s.lineTo(r,-h/2+r);s.absarc(0,-h/2+r,r,0,Math.PI,true);return s;}
 const mount=shapeMesh(capsule(.67,1.47),.07,trim,'Rounded rear ventilation mount');mount.position.set(0,1.74,-.18);
 for(const side of [-1,1])for(let i=0;i<12;i++)box(root,[side*.245,1.21+i*.09,-.20],[.016,.055,.024],black);
 const stand=shapeMesh(capsule(.40,1.91),.19,white,'White sculpted monitor spine');stand.position.set(0,1.11,-.42);
 const inset=shapeMesh(capsule(.20,1.64),.012,black,'Dark inset on monitor stand');inset.position.set(0,1.11,-.438);
 const path=new THREE.CurvePath(),radius=.071,top=1.81,bottom=.50;
 path.add(new THREE.LineCurve3(new THREE.Vector3(-radius,bottom,-.46),new THREE.Vector3(-radius,top,-.46)));
 const points=[];for(let i=0;i<=24;i++){const a=Math.PI-i*Math.PI/24;points.push(new THREE.Vector3(radius*Math.cos(a),top+radius*Math.sin(a),-.46));}path.add(new THREE.CatmullRomCurve3(points));
 path.add(new THREE.LineCurve3(new THREE.Vector3(radius,top,-.46),new THREE.Vector3(radius,bottom,-.46)));
 const lower=[];for(let i=0;i<=24;i++){const a=-i*Math.PI/24;lower.push(new THREE.Vector3(radius*Math.cos(a),bottom+radius*Math.sin(a),-.46));}path.add(new THREE.CatmullRomCurve3(lower));
 const strip=new THREE.Mesh(new THREE.TubeGeometry(path,144,.013,8,false),light);strip.name='Cyan stand light loop';root.add(strip);
 // The white fork wraps a dark lower edge, matching the rear-facing stand silhouette.
 for(const side of [-1,1]){const foot=new THREE.Shape();foot.moveTo(.035,.08);foot.quadraticCurveTo(.13,.18,.19,.36);foot.lineTo(.28,.30);foot.quadraticCurveTo(.30,.13,.55,.11);foot.lineTo(1.22,.075);foot.lineTo(1.24,.015);foot.lineTo(.32,0);foot.quadraticCurveTo(.13,.05,.035,.08);const base=shapeMesh(foot,.30,trim,'Dark monitor foot edge');base.scale.x=side;base.position.set(0,.017,-.39);const topMesh=shapeMesh(foot,.27,white,'Swept white monitor foot');topMesh.scale.x=side;topMesh.position.set(0,.035,-.40);}
 function rearDecal(draw,x,y,w,h,name){const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;draw(canvas.getContext('2d'));const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;const geometry=new THREE.PlaneGeometry(w,h,32,1),p=geometry.attributes.position,uv=geometry.attributes.uv;for(let i=0;i<p.count;i++){const gx=x+p.getX(i);p.setZ(i,-.101+8.8-Math.sqrt(8.8**2-gx*gx));uv.setX(i,1-uv.getX(i));}geometry.computeVertexNormals();const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({map,transparent:true,side:THREE.BackSide,depthWrite:false}));mesh.position.set(x,y,0);mesh.name=name;root.add(mesh);return mesh;}
 rearDecal(q=>{q.strokeStyle='#fafcfb';q.lineWidth=6;q.lineJoin='round';q.beginPath();q.moveTo(42,85);q.lineTo(415,85);q.quadraticCurveTo(451,85,451,120);q.lineTo(451,372);q.quadraticCurveTo(451,408,415,408);q.lineTo(42,408);q.lineTo(42,343);q.lineTo(376,343);q.lineTo(376,274);q.lineTo(105,274);q.lineTo(105,212);q.lineTo(376,212);q.lineTo(376,150);q.lineTo(42,150);q.closePath();q.moveTo(535,85);q.lineTo(918,85);q.quadraticCurveTo(951,85,951,120);q.lineTo(951,375);q.quadraticCurveTo(951,408,918,408);q.lineTo(535,408);q.quadraticCurveTo(502,408,502,375);q.lineTo(502,120);q.quadraticCurveTo(502,85,535,85);q.closePath();q.rect(579,150,295,62);q.rect(579,278,295,65);q.stroke();},-1.47,1.72,1.44,.66,'Outlined 38 rear engraving');
 rearDecal(q=>{q.fillStyle='#e2e7e5';q.font='30px Arial';q.textAlign='center';[...'ALIENWARE'].forEach((letter,i)=>q.fillText(letter,512,48+i*54));},.146,1.11,.07,1.10,'Vertical Alienware stand lettering').position.z=-.34;
 const logo=new THREE.Shape();logo.moveTo(0,-.14);logo.bezierCurveTo(-.035,-.14,-.13,-.035,-.13,.065);logo.bezierCurveTo(-.13,.24,.13,.24,.13,.065);logo.bezierCurveTo(.13,-.035,.035,-.14,0,-.14);
 for(const side of [-1,1]){const eye=new THREE.Path();eye.moveTo(side*.017,-.063);eye.bezierCurveTo(side*.032,.018,side*.07,.041,side*.107,.044);eye.bezierCurveTo(side*.112,-.014,side*.08,-.065,side*.017,-.063);logo.holes.push(eye);}
 const badge=shapeMesh(logo,.012,light,'Glowing Alienware emblem');badge.rotation.y=Math.PI;badge.scale.setScalar(.68);badge.position.set(-2.05,2.54,-.105+8.8-Math.sqrt(8.8**2-2.05**2));
 for(let i=0;i<5;i++){const button=new THREE.Mesh(new THREE.CylinderGeometry(i===0?.021:.014,i===0?.021:.014,.009,6),trim);button.rotation.x=Math.PI/2;button.position.set(2.12,1.24-i*.065,-.109+8.8-Math.sqrt(8.8**2-2.12**2));root.add(button);}
 return {light,badge,strip};
}
