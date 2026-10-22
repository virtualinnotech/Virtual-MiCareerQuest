import * as T from '../../pc66/vendor/three/three.core.js';
import sharp from '../../../work/browser/node_modules/sharp/dist/index.cjs';
import {createRequire} from 'node:module';
const {parkCorner}=createRequire(import.meta.url)('../district115.js');

export const parkBenches=[...[-22,-10,8,16,25.2].map(z=>[-26.65,z,-Math.PI/2]),[-15,-23.9,Math.PI]];
export const parkPaths=[[-28.2,1.4,1.6,65.2],[-27.6,24,5.9,1.3],[-27,-5,6.3,1.3],[-17.5,-25,21,1.6],
 [-29.15,-27.35,3.5,11.7],
 [(parkCorner.x0+parkCorner.x1)/2,(parkCorner.z0+parkCorner.z1)/2,parkCorner.x1-parkCorner.x0,parkCorner.z1-parkCorner.z0],
 ...parkBenches.map(([x,z,yaw])=>yaw===Math.PI? [x,-24.4,1.9,2]:[-27.4,z,2.8,1.9])];
export const pathTop=-.021,paverRepeat=.64;

export function createParkPathGeometry(){
 const rects=parkPaths.map(([x,z,w,d])=>({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2}));
 const xs=[...new Set(rects.flatMap(r=>[r.x0,r.x1]))].sort((a,b)=>a-b),zs=[...new Set(rects.flatMap(r=>[r.z0,r.z1]))].sort((a,b)=>a-b);
 const filled=(i,j)=>i>=0&&i<xs.length-1&&j>=0&&j<zs.length-1&&rects.some(r=>(xs[i]+xs[i+1])/2>r.x0&&(xs[i]+xs[i+1])/2<r.x1&&(zs[j]+zs[j+1])/2>r.z0&&(zs[j]+zs[j+1])/2<r.z1);
 const positions=[],normals=[],uv=[],indices=[],bottom=-.0765;
 function quad(points,normal){const start=positions.length/3;for(const p of points){positions.push(...p);normals.push(...normal);uv.push(p[0]/paverRepeat,p[2]/paverRepeat);}indices.push(start,start+1,start+2,start,start+2,start+3);}
 // Partition the union at rectangle edges so each crossing has one top face.
 // World-space UVs keep the paver scale and bond continuous through junctions.
 for(let i=0;i<xs.length-1;i++)for(let j=0;j<zs.length-1;j++)if(filled(i,j)){
  const x0=xs[i],x1=xs[i+1],z0=zs[j],z1=zs[j+1],y=pathTop;
  quad([[x0,y,z0],[x0,y,z1],[x1,y,z1],[x1,y,z0]],[0,1,0]);
  if(!filled(i-1,j))quad([[x0,bottom,z0],[x0,bottom,z1],[x0,y,z1],[x0,y,z0]],[-1,0,0]);
  if(!filled(i+1,j))quad([[x1,bottom,z1],[x1,bottom,z0],[x1,y,z0],[x1,y,z1]],[1,0,0]);
  if(!filled(i,j-1))quad([[x1,bottom,z0],[x0,bottom,z0],[x0,y,z0],[x1,y,z0]],[0,0,-1]);
  if(!filled(i,j+1))quad([[x0,bottom,z1],[x1,bottom,z1],[x1,y,z1],[x0,y,z1]],[0,0,1]);
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);return g;
}

export async function createPaverMaterial({material,texture}){
 const size=512,pixels=Buffer.alloc(size*size*4),height=new Float32Array(size*size),normal=Buffer.alloc(size*size*4);
 const hash=(x,y)=>{let n=Math.imul(x+17,374761393)^Math.imul(y+91,668265263);n=Math.imul(n^(n>>>13),1274126177);return (n>>>0)/4294967296;};
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const row=Math.floor(y/64),shift=row%2*64,bx=(x+shift)%128,by=y%64,column=Math.floor((x+shift)/128)%4;
  const edge=Math.min(bx,127-bx,by,63-by),bevel=Math.min(1,Math.max(0,(edge-1)/3)),grain=(hash(x,y)-.5)*10;
  const stone=161+hash(column,row)*23,shade=(edge<1?110:stone*(.82+.18*bevel))+grain,i=(y*size+x)*4;
  pixels[i]=shade;pixels[i+1]=shade+2;pixels[i+2]=shade+3;pixels[i+3]=255;height[y*size+x]=bevel;
 }
 const h=(x,y)=>height[((y+size)%size)*size+(x+size)%size];
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const nx=(h(x-1,y)-h(x+1,y))*.5,ny=(h(x,y-1)-h(x,y+1))*.5,length=Math.hypot(nx,ny,1),i=(y*size+x)*4;
  normal[i]=(nx/length*.5+.5)*255;normal[i+1]=(ny/length*.5+.5)*255;normal[i+2]=(1/length*.5+.5)*255;normal[i+3]=255;
 }
 const png=data=>sharp(data,{raw:{width:size,height:size,channels:4}}).png().toBuffer();
 const m=material('Park116 staggered stone pavers',[1,1,1,1],await texture('Park116 stone paver color',await png(pixels)),0,.86);
 m.setNormalTexture(await texture('Park116 shallow paver joints',await png(normal))).setExtras({surfaceType:19});return m;
}
