import * as T from '../../pc66/vendor/three/three.core.js';

function geometry(p){
 const g=new T.BufferGeometry();
 for(const [a,b,s]of[['POSITION','position',3],['NORMAL','normal',3],['TEXCOORD_0','uv',2]]){const v=p.getAttribute(a);if(v)g.setAttribute(b,new T.BufferAttribute(new Float32Array(v.getArray()),s));}
 g.setIndex(Array.from(p.getIndices().getArray()));
 if(!g.attributes.uv)g.setAttribute('uv',new T.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));return g;
}

export function fitHeadlamps134(models,{mesh,geo,material}){
 const lens=material('City134 fitted running headlamps',[.87,.92,.91,1],null,.12,.18).setEmissiveFactor([1.7,1.6,1.3]);
 const tail=material('City134 fitted red tail lamps',[.5,.015,.005,1],null,0,.3).setEmissiveFactor([.85,.012,.003]);
 for(const model of Object.values(models)){
  const surfaces=model.body.listPrimitives().map(p=>new T.Mesh(geometry(p),new T.MeshBasicMaterial({side:T.DoubleSide}))),ray=new T.Raycaster();
  const front=model.frontZ??Math.max(...model.body.listPrimitives().map(p=>p.getAttribute('POSITION').getMax([])[2]));
  for(const [role,sign,edge,mat]of[['headlight',1,front,lens],['brake',-1,model.rearZ,tail]]){
   const cache=new Map(),gs=model[role]?model[role].listPrimitives().map(geometry):[-1,1].map(side=>{
    const y=model.height*(model.id.startsWith('police')?.54:model.id==='bus'?.26:.43),g=new T.PlaneGeometry(model.width*(sign>0?.16:.09),model.id.startsWith('police')&&sign>0?.024:.043,8,3);
    if(sign<0)g.rotateY(Math.PI);g.translate(side*model.width*.33,y,edge);return g;
   });
   for(const g of gs){
    const pos=g.attributes.position;
    for(let i=0;i<pos.count;i++){
     const x=pos.getX(i),y=pos.getY(i),key=x.toFixed(5)+','+y.toFixed(5);let z=cache.get(key);
     if(z===undefined){ray.set(new T.Vector3(x,y,edge+sign),new T.Vector3(0,0,-sign));const hit=ray.intersectObjects(surfaces,false)[0];z=hit&&(hit.point.z-edge)*sign>-model.length*.35?hit.point.z+sign*.002:pos.getZ(i)+sign*.002;cache.set(key,z);}
     pos.setZ(i,z);
    }
    g.computeVertexNormals();
   }
   model[role]=mesh('City134 '+model.id+' fitted '+role,gs.map(g=>geo(g,mat)));
  }
  model.frontZ=front;
 }
}
