// Traffic planning and the replacement meshes must use the same curbside poses.
export function schoolBusPose131(node,worldBounds){
 const {lo,hi}=worldBounds(node),section=node.getExtras().queueSection;
 const p=[(lo[0]+hi[0])/2,-.1254,(lo[2]+hi[2])/2],index=node.getExtras().queueIndex;
 const side=section!=='front';
 if(section==='front')p[0]=[6,18.45,28.8,43.35,61][index-1];
 if(section==='corner')p.splice(0,3,67.33,-.1254,36.85);
 if(section==='side'&&index===7)p[2]=27.7;
 return {id:node.getName(),kind:'schoolBus',parked:true,p,width:1.055,length:3.889422,height:1.152,
  yaw:side?0:-Math.PI/2,modelYaw:side?Math.PI:Math.PI/2,scale:3.889422/4.5};
}

export function squareCorner131({doc,scene,mesh,box}){
 const paving=doc.getRoot().listMaterials().find(m=>m.getName()==='City106 paving');
 const corner=mesh('City131 square sidewalk corner',[box([63.825,-.07925,36.825],[5.55,.1015,5.55],paving)]);
 scene.addChild(doc.createNode('City131 square sidewalk corner').setMesh(corner).setExtras({cityProp:true,surface115:true}));
 return ['Front_east_rounded_sidewalk','Front_east_corner_curb'];
}
