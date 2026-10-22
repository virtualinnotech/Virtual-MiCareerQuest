(function(root,factory){
 const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CityTreePits137=api;
})(globalThis,()=>{
 'use strict';
 function clip(poly,axis,edge,sign){
  const out=[];
  for(let i=0;i<poly.length;i++){
   const a=poly[i],b=poly[(i+1)%poly.length],da=(a[axis]-edge)*sign,db=(b[axis]-edge)*sign;
   if(da>=0)out.push(a);
   if((da>=0)!==(db>=0)){const t=da/(da-db);out.push(a.map((v,k)=>v+(b[k]-v)*t));}
  }return out;
 }
 // Subtract only horizontal paving near the grate. Vertical curbs, deeper
 // foundations and the original walking collision remain intact.
 function cut(data,idx,uv,pits){
  if(!idx.length||!pits.length)return {data,idx,uv};
  const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
  for(let i=0;i<data.length;i+=6)for(let k=0;k<3;k++){lo[k]=Math.min(lo[k],data[i+k]);hi[k]=Math.max(hi[k],data[i+k]);}
  const nearby=pits.filter(p=>hi[0]>p.x0&&lo[0]<p.x1&&hi[2]>p.z0&&lo[2]<p.z1&&hi[1]>p.y-.04&&lo[1]<p.y+.008);
  if(!nearby.length)return {data,idx,uv};
  let vertices=null,texcoords=null;const indices=[];
  function append(poly){
   for(let i=1;i<poly.length-1;i++){
    const a=poly[0],b=poly[i],c=poly[i+1];
    if(Math.abs((b[0]-a[0])*(c[2]-a[2])-(b[2]-a[2])*(c[0]-a[0]))<1e-10)continue;
    for(const v of[a,b,c]){indices.push(vertices.length/6);vertices.push(...v.slice(0,6));if(texcoords)texcoords.push(...v.slice(6));}
   }
  }
  for(let i=0;i<idx.length;i+=3){
   const ids=[idx[i],idx[i+1],idx[i+2]],ys=ids.map(v=>data[v*6+1]);
   const candidates=Math.max(...ys)-Math.min(...ys)<1e-4?nearby.filter(p=>ys[0]>p.y-.04&&ys[0]<p.y+.008&&Math.max(...ids.map(v=>data[v*6]))>p.x0&&Math.min(...ids.map(v=>data[v*6]))<p.x1&&Math.max(...ids.map(v=>data[v*6+2]))>p.z0&&Math.min(...ids.map(v=>data[v*6+2]))<p.z1):[];
   if(!candidates.length){indices.push(...ids);continue;}
   if(!vertices){vertices=Array.from(data);texcoords=uv?Array.from(uv):null;}
   let polys=[ids.map(v=>[...data.subarray(v*6,v*6+6),...(uv?uv.subarray(v*2,v*2+2):[])])];
   for(const p of candidates){
    const outside=[];
    for(let covered of polys)for(const [axis,edge,sign]of[[0,p.x0,1],[0,p.x1,-1],[2,p.z0,1],[2,p.z1,-1]]){
     const part=clip(covered,axis,edge,-sign);if(part.length>=3)outside.push(part);
     covered=clip(covered,axis,edge,sign);if(covered.length<3)break;
    }
    polys=outside;
   }
   for(const poly of polys)append(poly);
  }
  return vertices?{data:new Float32Array(vertices),idx:new Uint32Array(indices),uv:texcoords?new Float32Array(texcoords):null}:{data,idx,uv};
 }
 return {cut};
});
