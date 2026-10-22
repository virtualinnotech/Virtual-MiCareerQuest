window.mountProbe129=()=>{
 StudentProgress99.completeForTesting();StudentRewards100.close();state.paused=false;state.overview=null;
 const p=Scooter100.snapshot().rides['front-west-bike-0'].parked;
 player.position=[p.x,floorHeightAt(p.x,p.z)+PHYSICS.radii[1]+.002,p.z+.38];player.grounded=true;
 Scooter100.mount('front-west-bike-0');AnimatedCharacters.update(.01);state.paused=true;
 state.orbitYaw=Math.PI/2;state.pitch=-.1;state.radius=.95;updateCamera(0,true);render();
};
window.fitProbe129=()=>{
 const a=characterState.player,m=a.model,M=mm(CharacterFitting.invert4(Scooter100.snapshot().root),actorMatrix(a)),sets={palmL:[],palmR:[],seat:[]};
 for(const p of m.parts){if(!/Body|Pants/.test(p.name))continue;const s=p.source,skin=m.skins[p.skin],data=a.textures[p.skin].data;
  for(let i=0;i<s.positions.length/3;i++){
   let v=[0,0,0],palmL=0,palmR=0;
   for(let k=0;k<4;k++){
    const j=s.joints[i*4+k],w=s.weights[i*4+k];if(!w)continue;
    const q=tp(data.subarray(j*16,j*16+16),...s.positions.subarray(i*3,i*3+3));v=v.map((a,k)=>a+q[k]*w);
    const name=m.j.nodes[skin.joints[j]].name;if(/LeftHand$/.test(name))palmL+=w;if(/RightHand$/.test(name))palmR+=w;
   }
   const q=tp(M,...v);
   if(palmL>.6)sets.palmL.push(q);if(palmR>.6)sets.palmR.push(q);
   if(/Pants/.test(p.name)&&Math.abs(q[0])<.06&&q[2]>-.43&&q[2]<-.24&&q[1]>.8)sets.seat.push(q);
  }
 }
 return Object.fromEntries(Object.entries(sets).map(([k,vs])=>[k,{count:vs.length,lo:[0,1,2].map(k=>Math.min(...vs.map(v=>v[k]))),hi:[0,1,2].map(k=>Math.max(...vs.map(v=>v[k]))),low:vs.sort((a,b)=>a[1]-b[1]).slice(0,5)}]));
};
