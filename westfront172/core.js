/* DeVos west front (172). The park strip between the westbridge sidewalk and
 * the DeVos west wall becomes buildings, matching the real street: the dark
 * glass entrance with five flags where the z=9.9 street meets the building,
 * the dark-paneled DeVos block with its drive-under to the left, and the
 * brick hotel tower and older hotel to the right. Pure layout data: the city
 * loader asks what to leave out, and the street pedestrians are rerouted. */
window.WestFrontCore172=(()=>{
 const front=-30.45,ground=-.10;
 // Each block runs from the sidewalk edge back to the existing DeVos wall.
 const blocks={
  // Amway Grand Plaza base: canopy over a drive-through (entrance and exit
  // lanes either side of the lettered planter), lobby wall at canopy.back.
  devos:{z:[-13.35,5.6],back:-22.0,height:5.6,canopy:{z:[-9.4,5.0],back:-27.0,soffit:1.4,top:1.64,lanes:[[-7.9,-3.5],[1.4,4.6]],planter:[-3.0,.9],small:[-9.35,-8.3]}},
  entrance:{z:[5.6,14.2],back:-22.0,height:3.6,glass:-29.55},
  tower:{z:[14.2,20.8],back:-24.0,height:15},
  // Its back wall shows past the DeVos front (z 33.93) and is finished there.
  hotel:{z:[20.8,36.8],back:-24.0,height:8.6,exposedBack:33.93},
  behind:{x:[-27.4,-23.0],z:[6.4,13.4],height:9.6},
  // Ten glass floors on top of the hospitality addition (its roof is 7.06).
  glassTower:{x:[-29.9,-5.6],z:[-29.8,-13.8],base:7.06,floors:10,floorHeight:1.05},
  // Skywalk over westbridge from the older hotel to the building opposite.
  // (between the westbridge streetlights at z 21.3 and 27.8)
  skywalk:{x:[-36.3,-30.45],z:[25.3,26.5],bottom:2.1,deck:2.72,vault:.42}
 };
 const strip=[-32.8,-13.45,-21.9,37.0];
 // Calder's La Grande Vitesse moves from the corner the hotel now fills to the
 // open plaza across Front Ave from the main entrance, behind the glass
 // building (same orientation, clear of the plaza tree).
 const calder={from:[-25.6,0,36.1],to:[17.6,0,56.0]},calderOffset=calder.to.map((v,i)=>v-calder.from[i]);
 const isCalder=name=>/^Calder113 |^Downtown134 sculpture wash /.test(name);
 // The westbridge signals along this block had been left out with the farm
 // field's street furniture; they come back (the farm scene hides the city
 // and its colliders anyway). DeVos-side poles step toward the curb so their
 // heads clear the new building front.
 const signal=/^City108 junction-[123] (south|north|west) signal$/,curbSide=/^City108 junction-[123] (south|west) signal$/;
 function keepsSignal(name){return signal.test(name);}
 function moved(name){return isCalder(name)?calderOffset:curbSide.test(name)?[-.25,0,0]:null;}
 function lights(list){return list.filter(l=>!(/park streetlight/.test(l.id)&&inStrip(l.p[0],l.p[2]))).map(l=>isCalder(l.id)?{...l,p:l.p.map((v,i)=>v+calderOffset[i])}:l);}
 const inStrip=(x,z)=>x>=strip[0]&&x<=strip[2]&&z>=strip[1]&&z<=strip[3];
 // Park furniture and planting in the strip are replaced; road drains,
 // signal poles and their footings stay.
 function clears(name,kind,lo,hi){
  if(!inStrip((lo[0]+hi[0])/2,(lo[2]+hi[2])/2))return false;
  // "tree" must start a word: signal and lamp names contain "street".
  return /(^|[^a-z])trees?([^a-z]|$)|tree soil|root collar|lawn|tuft|grass|bench|trash|\bbins?\b|fallen leaves|park streetlight|sidewalk approach|planter|shrub|bush|flower/i.test(name+' '+kind);
 }
 function inside(x,z,margin=0){
  if(z<blocks.devos.z[0]-margin||z>blocks.hotel.z[1]+margin||x<front-margin)return false;
  const back=z>blocks.entrance.z[1]?-24.0:blocks.devos.back;return x<=back+margin;
 }
 // The park walk ran through the new buildings (and the hospitality
 // addition); its walkers use the sidewalk in front instead. The grove walk
 // was entirely inside the hospitality addition.
 function walks(list){
  return list.filter(w=>w.id!=='park-grove').map(w=>w.id==='park'?{...w,cross:-31.05,start:-12.2,end:33.4,width172:.30}:w);
 }
 return {front,ground,blocks,strip,calder,clears,inside,walks,moved,lights,keepsSignal};
})();
