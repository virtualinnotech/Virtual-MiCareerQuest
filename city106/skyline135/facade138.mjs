import * as T from '../../pc66/vendor/three/three.core.js';

// The source panes are planar rectangles split into many nearly coincident faces.
// Recover their connected outlines before simplification can join a frame across glass.
export function paneBounds(geometry){
 const a=geometry.attributes.position,indices=geometry.index.array,parent=Array.from({length:a.count},(_,i)=>i),welded=new Map();
 const root=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;};
 const join=(a,b)=>{parent[root(a)]=root(b);};
 for(let i=0;i<a.count;i++){
  const key=[a.getX(i),a.getY(i)].map(v=>Math.round(v*1e5)).join(',');
  if(welded.has(key))join(i,welded.get(key));else welded.set(key,i);
 }
 for(let i=0;i<indices.length;i+=3){join(indices[i],indices[i+1]);join(indices[i],indices[i+2]);}
 const groups=new Map();
 for(const i of indices){
  const key=root(i);if(!groups.has(key))groups.set(key,new T.Box3());
  groups.get(key).expandByPoint(new T.Vector3(a.getX(i),a.getY(i),a.getZ(i)));
 }
 const panes=[...groups.values()].filter(b=>b.max.x-b.min.x>1e-4&&b.max.y-b.min.y>1e-4);
 if(panes.some(b=>b.max.z-b.min.z>.0001))throw Error('Tower glazing is no longer planar');
 return panes;
}

function windowGroups(panes){
 const groups=[],unassigned=new Set(panes);
 while(unassigned.size){
  const cluster=[unassigned.values().next().value];unassigned.delete(cluster[0]);
  for(let i=0;i<cluster.length;i++)for(const p of unassigned){
   const b=cluster[i];
   if(p.min.x<=b.max.x+.012&&p.max.x>=b.min.x-.012&&p.min.y<=b.max.y+.012&&p.max.y>=b.min.y-.012){cluster.push(p);unassigned.delete(p);}
  }
  groups.push(cluster);
 }
 return groups;
}

function rectangle(path,x0,y0,x1,y1){path.moveTo(x0,y0);path.lineTo(x1,y0);path.lineTo(x1,y1);path.lineTo(x0,y1);path.closePath();return path;}

export function repairTowerFacade(parts){
 const report={panes:0,windows:0,coreInset:.045};
 const core=parts.find(p=>p.name==='SkyScraper_1_Cube.1587');
 if(!core)throw Error('Missing tower backing shell');
 core.g.computeBoundingBox();const center=core.g.boundingBox.getCenter(new T.Vector3()),size=core.g.boundingBox.getSize(new T.Vector3());
 core.g.translate(-center.x,0,-center.z).scale((size.x-2*report.coreInset)/size.x,1,(size.z-2*report.coreInset)/size.z).translate(center.x,0,center.z);
 const replacements=new Map();
 for(const glass of parts.filter(p=>/windows/i.test(p.name)&&p.m.getName().endsWith('Material.015'))){
  const frame=parts.find(p=>p.name===glass.name&&p.m.getName().endsWith(' black'));
  if(!frame)throw Error('Missing tower window frames');
  const panes=paneBounds(glass.g),groups=windowGroups(panes),paneBox=new T.Box3();
  panes.forEach(p=>paneBox.union(p));frame.g.computeBoundingBox();
  const padX=Math.max(paneBox.min.x-frame.g.boundingBox.min.x,frame.g.boundingBox.max.x-paneBox.max.x);
  const padY=Math.max(paneBox.min.y-frame.g.boundingBox.min.y,frame.g.boundingBox.max.y-paneBox.max.y);
  const side=Math.sign(paneBox.getCenter(new T.Vector3()).z),z=(paneBox.min.z+paneBox.max.z)/2;
  glass.m.setExtras({...glass.m.getExtras(),surfaceType:33});
  const positions=[],normals=[],uv=[],indices=[],frames=[];
  for(const [windowIndex,group] of groups.entries()){
   const box=new T.Box3();group.forEach(p=>box.union(p));
   const shape=rectangle(new T.Shape(),box.min.x-padX,box.min.y-padY,box.max.x+padX,box.max.y+padY);
   for(const b of group){
    shape.holes.push(rectangle(new T.Path(),b.min.x,b.min.y,b.max.x,b.max.y));
    const offset=positions.length/3;
    positions.push(b.min.x,b.min.y,z,b.max.x,b.min.y,z,b.max.x,b.max.y,z,b.min.x,b.max.y,z);
    for(let i=0;i<4;i++)normals.push(0,0,side);
    // Keep every pane inside its room's UV cell so occupancy cannot change with view angle.
    for(const [x,y]of[[b.min.x,b.min.y],[b.max.x,b.min.y],[b.max.x,b.max.y],[b.min.x,b.max.y]])uv.push(windowIndex+.1+.8*(x-box.min.x)/(box.max.x-box.min.x),(side>0?0:1)+.1+.8*(y-box.min.y)/(box.max.y-box.min.y));
    indices.push(...(side>0?[0,1,2,0,2,3]:[0,2,1,0,3,2]).map(i=>i+offset));
   }
   const frameGeometry=new T.ShapeGeometry(shape).translate(0,0,z);
   if(side<0){
    const a=frameGeometry.index.array;
    for(let i=0;i<a.length;i+=3)[a[i+1],a[i+2]]=[a[i+2],a[i+1]];
    for(let i=0;i<frameGeometry.attributes.normal.count;i++)frameGeometry.attributes.normal.setZ(i,-1);
   }
   frames.push({g:frameGeometry,m:frame.m,name:frame.name,preserveTopology138:true});
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);
  replacements.set(glass,[{...glass,g,preserveTopology138:true}]);replacements.set(frame,frames);
  report.panes+=panes.length;report.windows+=groups.length;
 }
 if(report.panes!==5952||report.windows!==496)throw Error('Unexpected tower window layout: '+JSON.stringify(report));
 return {parts:parts.flatMap(p=>replacements.get(p)||[p]),report};
}
