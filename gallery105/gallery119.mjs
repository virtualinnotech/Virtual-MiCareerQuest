import sharp from '../../work/browser/node_modules/sharp/dist/index.cjs';

export const itDoors119=[{z:-7.3,old:[-10.35,-6.45],letter:'A'},{z:9.25,old:[6.45,10.35],letter:'B'}];
export const doorWidth119=1.22,doorTop119=1.32;

export function replaceFloor119(name,kind){
 return kind==='grandGalleryFloorInlay'||/^Grand_Gallery_floor(?:$|_subtle_cross_stone_joint)/.test(name)||
 /^V9_(raised upper entry landing_19|east raised landing_29)$/.test(name)||
 /^V9_Grand_Gallery_.*connected landing tread band_(2|8|14)$/.test(name);
}

// Ordered edges partition the entire floor, so adjacent bands share vertices.
// The front is pale and gold; the charcoal fan broadens toward the river end.
export function floorEdges119(z){
 const t=Math.max(0,Math.min(1,(31.5-z)/61.8)),fan=Math.sin(Math.PI*t)**2;
 const shift=-.55*Math.sin(2*Math.PI*t);
 return [-5.1,-2.8+shift-.7*fan,-2.18+shift-.38*fan,-1.74+shift-.12*fan,
  -1.08+shift+.40*fan,-.65+shift+.55*fan,.06+shift+1.08*fan,
  1.36+shift+1.08*fan,2.05+shift+.8*fan,3.05+shift+.48*fan,5.1];
}

export async function buildGallery119(api){
 const {box,rod,quad,material,append,json,stone,steel,edge,silver,black,lens,invisible}=api;
 function texture(name,bytes){const source=json.images.length;json.images.push({name,bufferView:append(bytes),mimeType:'image/png'});const sampler=json.samplers.length;json.samplers.push({wrapS:10497,wrapT:10497,minFilter:9987,magFilter:9729});const index=json.textures.length;json.textures.push({source,sampler});return {index};}
 function solid(name,c,s,mat){box('119 '+name,c,s,mat);box('119 '+name+' contact',c,s,invisible);}

 solid('entrance right wall closure',[5.046,1.515,29.49],[.124,2.59,1.42],stone);

 // The open leaves are fixed at ninety degrees on the IT side of the wall.
 // Existing room walls and floors remain intact; only the old portal voids are infilled.
 let grain='<svg xmlns="http://www.w3.org/2000/svg" width="256" height="512"><rect width="256" height="512" fill="#c39645"/>';
 for(let i=0;i<180;i++){const x=(i*73)%256;grain+=`<path d="M${x} 0 Q${x+3} 170 ${x-2} 330 T${x+1} 512" stroke="${i%3?'#b08641':'#dfb766'}" stroke-width="${.3+i%4*.19}" opacity=".44" fill="none"/>`;}
 const wood=material('119 honey oak doors',[1,1,1,1],.03,.38);
 json.materials[wood].pbrMetallicRoughness.baseColorTexture=texture('Gallery119 vertical oak grain',await sharp(Buffer.from(grain+'</svg>')).png().toBuffer());
 const pale=material('119 warm stone portal infill',[.65,.65,.59,1],.03,.65);
 for(const {z,old:[a,b],letter} of itDoors119){
  const lo=z-doorWidth119/2,hi=z+doorWidth119/2;
  for(const [l,r] of [[a,lo],[hi,b]]){
   solid('IT '+letter+' portal infill '+l,[-5.075,1.132,(l+r)/2],[.29,1.816,r-l],pale);
   box('119 IT '+letter+' stone skin',[-4.929,1.132,(l+r)/2],[.012,1.816,r-l],stone);
   box('119 IT '+letter+' black plinth',[-4.915,.33,(l+r)/2],[.022,.18,r-l],black);
  }
  solid('IT '+letter+' head infill',[-5.075,(2.04+doorTop119)/2,z],[.29,2.04-doorTop119,doorWidth119],pale);
  const half=Math.min(z-a,b-z)-.05;
  for(const side of [-1,1]){
   const w=half-doorWidth119/2;
   box('119 IT '+letter+' oak sidelights',[-4.908,.78,z+side*(doorWidth119/2+w/2)],[.03,1.08,w-.015],wood);
   box('119 IT '+letter+' metal jambs',[-5.065,.78,z+side*(doorWidth119/2+.015)],[.34,1.08,.028],silver);
   const leafX=-5.26-doorWidth119/4,leafZ=z+side*(doorWidth119/2-.012);
   solid('IT '+letter+' permanently open leaf '+side,[leafX,.78,leafZ],[doorWidth119/2,1.06,.035],wood);
   for(const x of [leafX-doorWidth119/4+.01,leafX+doorWidth119/4-.01])box('119 IT '+letter+' leaf metal edges',[x,.78,leafZ],[.022,1.06,.041],silver);
   box('119 IT '+letter+' kick plates',[leafX,.331,leafZ],[doorWidth119/2,.15,.039],silver);
   rod('119 IT '+letter+' push bars',[leafX-.23,.73,leafZ-side*.045],[leafX+.23,.73,leafZ-side*.045],.012,silver);
   box('119 IT '+letter+' door closers',[leafX+.19,1.253,leafZ-side*.035],[.13,.032,.036],silver);
  }
  box('119 IT '+letter+' oak overpanel',[-4.908,1.535,z],[.03,.40,half*2],wood);
  box('119 IT '+letter+' metal head',[-5.065,doorTop119+.014,z],[.34,.028,doorWidth119+.06],silver);
  box('119 IT '+letter+' stone lintel',[-4.91,1.87,z],[.038,.25,half*2+.1],stone);
  for(const dz of [-.38,.38])rod('119 IT '+letter+' recessed downlights',[-4.88,1.735,z+dz],[-4.88,1.727,z+dz],.025,lens,12);
  const label=await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="96"><rect width="1024" height="96" fill="#cecec4"/><text x="512" y="57" text-anchor="middle" font-size="29" font-family="Georgia" fill="#555959" letter-spacing="4">GRAND GALLERY ROOM ${letter}</text></svg>`)).png().toBuffer();
  const sign=material('119 gallery room '+letter+' lettering',[1,1,1,1],0,.7);
  json.materials[sign].pbrMetallicRoughness.baseColorTexture=texture('Gallery119 room '+letter+' sign',label);
  quad('119 room '+letter+' sign',[-4.889,1.79,z-half],[-4.889,1.79,z+half],[-4.889,1.95,z+half],[-4.889,1.95,z-half],sign,[1,1,0,1,0,0,1,0]);
 }

 // A shared, mipmapped aggregate texture keeps the stone detailed without distant shimmer.
 let seed=119;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const size=512,pixels=Buffer.alloc(size*size*3,232);
 for(let i=0;i<pixels.length;i+=3){const v=230+Math.floor(rnd()*18);pixels[i]=v;pixels[i+1]=v;pixels[i+2]=v-2;}
 for(let i=0;i<55000;i++){const x=Math.floor(rnd()*size),y=Math.floor(rnd()*size),r=rnd()<.88?1:2,v=55+Math.floor(rnd()*185);for(let dy=0;dy<r;dy++)for(let dx=0;dx<r;dx++){const k=(((y+dy)%size)*size+(x+dx)%size)*3;pixels[k]=v;pixels[k+1]=v;pixels[k+2]=v;}}
 const tex=texture('Gallery119 terrazzo aggregate',await sharp(pixels,{raw:{width:size,height:size,channels:3}}).png().toBuffer());
 const colors=[[.88,.87,.82,1],[.18,.19,.19,1],[.82,.80,.75,1],[.13,.15,.16,1],[.88,.86,.79,1],[.24,.25,.25,1],[.73,.57,.29,1],[.22,.25,.27,1],[.79,.81,.80,1],[.88,.87,.82,1]];
 const mats=colors.map((c,i)=>{const m=material('119 polished terrazzo '+i,c,.04,.26,{extras:{surfaceType:24}});json.materials[m].pbrMetallicRoughness.baseColorTexture=tex;return m;});
 const rows=[...Array.from({length:310},(_,i)=>-30.3+i*59.4/309),31.5];
 for(let j=1;j<rows.length;j++){
  const a=rows[j-1],b=rows[j],ea=floorEdges119(a),eb=floorEdges119(b),y=a>=29.099?.2406:.2391;
  for(let k=0;k<10;k++){
   const p=[[ea[k],y,a],[eb[k],y,b],[eb[k+1],y,b],[ea[k+1],y,a]];
   quad('119 seamless terrazzo floor '+k,...p,mats[k],p.flatMap(([x,,z])=>[x/.38,z/.38]));
  }
 }
}
