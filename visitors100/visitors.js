/* Shared, bounded static visitors: fixed-pose source models never slide along walking paths. */
window.Visitors100=(()=>{
 const ids=['student2','green','casual','stride-a','stride-b','smiling','teenage'],models=new Map(),visitors=[];
 let started=false,error=null,lastGrid=null,placementTime=0;
 const palettes=[[[.22,.42,.82],[.22,.25,.3],[.18,.12,.07]],[[.8,.2,.25],[.12,.19,.3],[.45,.23,.08]],[[.2,.58,.38],[.3,.28,.24],[.075,.06,.05]],[[.55,.32,.7],[.15,.2,.25],[.65,.48,.22]]];
 const role=(id,name)=>id==='green'?(/Hair/.test(name)?2:/Outfit_Top/.test(name)?0:/Outfit_Bottom/.test(name)?1:-1):id==='student2'?(/id80/.test(name)?2:/id72/.test(name)?0:/id68/.test(name)?1:-1):-1;
 async function init(){if(started)return;started=true;
  const groups=[[28.9,2.5],[29.1,-2.8],[36.8,2.7],[37,-2.9]];
  for(let i=0;i<11;i++){const [x,z]=groups[Math.floor(i/3)],j=i%3;visitors.push({id:i<7?ids[i]:ids[(i-7)%2],x:x+(j-1)*.48,z:z+(j===1?.32:0),yaw:j===1?Math.PI:0,variant:i<7?-1:(i-6)%4});}
  for(const [i,sector]of DISCOVERY_LAYOUT.sectors.entries())for(let j=0;j<2;j++){const pod=sector.pods[0];visitors.push({id:j===0?ids[i]:ids[i%2],x:pod.x-1.8+j*.65,z:pod.z+1.8,yaw:j===0?Math.PI/2:-Math.PI/2,variant:j===0?-1:i%4,industry:sector.industry,placed:false});}
  for(const id of [...ids,'student2-variants','green-variants'])try{const parts=await DroneAssets44.load(id,{base:'./visitors100/'});for(const p of parts){p.tintRole=role(id.replace('-variants',''),p.name);p.originalColor=p.batch.color;p.batch.emission=[0,0,0];}models.set(id,parts);}catch(e){error=e.message;console.warn('Additional visitor '+id+':',e);}
 }
 function placeInSectors(){const grid=crowdState.sim?.grid;if(!grid||grid===lastGrid)return;lastGrid=grid;const occupied=[];
  for(const v of visitors.filter(v=>v.industry)){let best=null,distance=Infinity;for(const id of grid.regions.get(v.industry)||[]){const [x,z]=CrowdCore.point(grid,id),d=Math.hypot(x-v.x,z-v.z);if(d>=distance||occupied.some(p=>Math.hypot(x-p[0],z-p[1])<.55))continue;if((DISCOVERY_LAYOUT.gates||[]).some(g=>x>g.keepClear[0]&&x<g.keepClear[2]&&z>g.keepClear[1]&&z<g.keepClear[3]))continue;best=[x,z];distance=d;}v.placed=!!best;if(best){[v.x,v.z]=best;occupied.push(best);}}
 }
 function draw(planes){if(!state.ready||window.FarmScene63?.active)return;if(!started){init();return;}
  if(performance.now()-placementTime>500){placementTime=performance.now();placeInSectors();}
  for(const v of visitors){if(v.industry&&!v.placed)continue;const y=floorHeightAt(v.x,v.z),s=.4*sectorScaleAt(v.x,v.z),eye=state.overview?camera:player.position;if(Math.hypot(eye[0]-v.x,eye[2]-v.z)>24||!sphereVisible([v.x,y+.36,v.z],.8,planes))continue;
   const root=transform([v.x,y+.002,v.z],[s,s,s],0,v.yaw);
   for(const p of models.get(v.id+(v.variant>=0?'-variants':''))||[]){p.batch.color=v.variant>=0&&p.tintRole>=0?[...palettes[v.variant][p.tintRole],1]:p.originalColor;drawBatch(p.batch,mm(root,p.matrix));}
  }
 }
 const prior=RobotExhibit20.draw;RobotExhibit20.draw=function(planes){prior.call(this,planes);draw(planes);};
 function visit(){if(window.Scooter100?.busy()){toast('Leave the current challenge first.');return;}MissionUI99.close();$('controlsPopup').classList.add('hidden');HubGuide.close();places['students101']={label:'New student visitors',p:[36.8,.66,.65],yaw:Math.PI,scaledPlayer:true};teleport('students101',true);state.firstPerson=false;state.orbitYaw=0;state.radius=1.1;updateCamera(0,true);}
 return {visit,snapshot:()=>({ready:models.size===9,error,models:[...models.keys()],visitors:visitors.map(v=>({...v})),palettes})};
})();
