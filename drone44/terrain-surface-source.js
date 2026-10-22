import clipping from 'polygon-clipping';
import earcut,{flatten} from 'earcut';

// Resolve paint footprints into disjoint polygons before making any GPU geometry.
window.FarmSurface91=(()=>{
 const height=.14,layers=[];let batches=[],dirty=false,stats={};
 function add(points,color,props={}){
  if(points.length<3)return;
  const ring=points.map(p=>[p[0],p[2]]);ring.push([...ring[0]]);
  const key=JSON.stringify([color,props]),last=layers.at(-1);
  if(last?.key===key)last.polygons.push([ring]);else layers.push({key,color,props,polygons:[[ring]]});
  dirty=true;
 }
 function plane(p,d,color,props={}){add([[-.5,-.5],[-.5,.5],[.5,.5],[.5,-.5]].map(([x,z])=>[p[0]+x*d[0],height,p[2]+z*d[1]]),color,props);}
 function rebuild(){
  for(const b of batches)freeBatch(b);batches=[];
  let occupied=[],triangles=0,area=0;
  const materials=new Map();
  for(const layer of [...layers].reverse()){
   const region=clipping.union(...layer.polygons),visible=occupied.length?clipping.difference(region,occupied):region;
   occupied=occupied.length?clipping.union(occupied,region):region;
   if(!materials.has(layer.key))materials.set(layer.key,{...layer,v:[],i:[]});
   const m=materials.get(layer.key);
   for(const polygon of visible){
    const data=flatten(polygon),indices=earcut(data.vertices,data.holes,2),base=m.v.length/6;
    for(let k=0;k<data.vertices.length;k+=2)m.v.push(data.vertices[k],height,data.vertices[k+1],0,1,0);
    for(let k=0;k<indices.length;k+=3){
     const [a,b,c]=indices.slice(k,k+3).map(i=>[data.vertices[i*2],data.vertices[i*2+1]]);
     area+=Math.abs((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]))/2;
    }
    // Earcut's XY winding faces downward when its second coordinate becomes world Z.
    for(let k=0;k<indices.length;k+=3)m.i.push(base+indices[k],base+indices[k+2],base+indices[k+1]);
    triangles+=indices.length/3;
   }
  }
  for(const m of materials.values())if(m.i.length)batches.push(uploadBatch(new Float32Array(m.v),new Uint32Array(m.i),{color:m.color,rough:.9,...m.props}));
  stats={height,triangles,area,layers:layers.length,batches:batches.length};dirty=false;
 }
 function draw(){if(dirty)rebuild();gl.disable(gl.CULL_FACE);for(const b of batches)drawBatch(b);}
 return {add,plane,draw,snapshot:()=>({...stats,dirty})};
})();
