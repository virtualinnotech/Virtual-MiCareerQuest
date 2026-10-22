/* A dropped banquet ceiling; the original room footprint and exterior stay intact. */
window.ITRoom88=(()=>{
 const bounds=[-21.78,-13.08,-5.22,13.08],height=2.62;
 let batches=[],ready=false;
 function init(){
  if(ready)return;const M=NetworkScene40.Mesh;
  const tile=new M([.78,.79,.77,1]),grid=new M([.46,.49,.49,1]),beam=new M([.13,.15,.16,1]),light=new M([.91,.97,1,1]);
  const [x0,z0,x1,z1]=bounds,cx=(x0+x1)/2,cz=(z0+z1)/2;
  tile.box([cx,height+.04,cz],[x1-x0,.08,z1-z0]);
  for(let x=x0;x<=x1;x+=.60)grid.box([x,height-.004,cz],[.009,.008,z1-z0]);
  for(let z=z0;z<=z1;z+=.60)grid.box([cx,height-.004,z],[x1-x0,.008,.009]);
  for(let z=-11.6;z<13;z+=4.8)beam.box([cx,height-.065,z],[x1-x0,.13,.09]);
  for(let x=-20.5;x<-5.5;x+=2.4)for(let z=-11.9;z<12;z+=2.4){grid.box([x,height-.015,z],[1.83,.028,.10]);light.box([x,height-.032,z],[1.72,.012,.055]);}
  batches=[tile.build({rough:.95}),grid.build(),beam.build(),light.build({unlit:true,emission:[.3,.34,.38]})];ready=true;
 }
 function draw(planes){if(!ready||!roofsVisible()||!sphereVisible([-13.5,height,0],15.6,planes))return;gl.disable(gl.CULL_FACE);for(const b of batches)drawBatch(b);}
 function constrainCamera(){if(!ready||state.overview||state.firstPerson||window.PCChallenge66?.active)return;const [x,,z]=player.position;if(x>bounds[0]&&x<bounds[2]&&z>bounds[1]&&z<bounds[3]&&player.position[1]<height)camera[1]=Math.min(camera[1],height-.12);}
 const view=updateCamera,drawVenue=RobotExhibit20.draw;updateCamera=function(...args){view(...args);constrainCamera();};RobotExhibit20.draw=function(planes){drawVenue(planes);draw(planes);};
 const start=()=>{if(!state.ready){setTimeout(start,250);return;}init();};start();
 return {snapshot:()=>({ready,bounds,height,batches:batches.length})};
})();
