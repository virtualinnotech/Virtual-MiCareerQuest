/* DEV32: instance-specific, muted wardrobes. Does not rewrite any source GLB,
 * skeleton, skin weight, animation, skin texture, volunteer uniform or officer.
 * The seven new atlases use hand-reviewed UV-island role masks (1 MiB R8 each).
 * Original models use their existing clothing materials and separate hair mesh.
 */
(function(global){
'use strict';
const META={
  "fig0027": {
    "reference": [
      0.025810036417856265,
      0.004024717018496307,
      0.018464403349299663,
      0.026945101344246304,
      0.013891963765978982
    ],
    "counts": {
      "0": 397157,
      "1": 124836,
      "2": 749762,
      "3": 202809,
      "4": 1197628,
      "5": 115360
    },
    "maskBytes": 15157,
    "protectedParts": "face, hands, exposed neck and skin islands remain uncolored",
    "sourceSha256": "f50ebbf3efa468608511193a88e602f45c42fbcf1841feea1f4b03093bf521f5",
    "vertices": 8622,
    "triangles": 14478,
    "clips": [
      "Walk",
      "Idle"
    ]
  },
  "fig0098": {
    "reference": [
      0.09305896284668747,
      0.033064961721644345,
      0.01998511806080753,
      0.12,
      0.0036281691704584274
    ],
    "counts": {
      "0": 437221,
      "1": 1265412,
      "2": 637868,
      "3": 324060,
      "4": 0,
      "5": 245178
    },
    "maskBytes": 12167,
    "protectedParts": "face, hands, exposed neck and skin islands remain uncolored",
    "sourceSha256": "2ec6c2a70b7b47a2624700e9954a4b0c52d5c225fcfad7dd356bc3f4d60b33ae",
    "vertices": 11395,
    "triangles": 20714,
    "clips": [
      "Walk",
      "Idle"
    ]
  },
  "fig0143": {
    "reference": [
      0.12,
      0.004211120036725068,
      0.06314106786032535,
      0.18712611184000044,
      0.12031163035540945
    ],
    "counts": {
      "0": 166566,
      "1": 0,
      "2": 987053,
      "3": 173777,
      "4": 1447560,
      "5": 282939
    },
    "maskBytes": 15169,
    "protectedParts": "face, hands, exposed neck and skin islands remain uncolored",
    "sourceSha256": "22dcf201937d62497d64f25b73d6f31aa9a903ffae587dc39fd01f035c14970a",
    "vertices": 12183,
    "triangles": 21476,
    "clips": [
      "Walk",
      "Idle"
    ]
  },
  "fig0147": {
    "reference": [
      0.23551259589354587,
      0.13098008370659708,
      0.3809656105000415,
      0.11699600412810555,
      0.019191502599312533
    ],
    "counts": {
      "0": 267114,
      "1": 434183,
      "2": 801035,
      "3": 142365,
      "4": 1037359,
      "5": 227965
    },
    "maskBytes": 16184,
    "protectedParts": "face, hands, exposed neck and skin islands remain uncolored",
    "sourceSha256": "7d764f053dc132665d4853567dfe55db2b90197a867666b65916db0aba86e10a",
    "vertices": 16680,
    "triangles": 30002,
    "clips": [
      "Walk",
      "Idle"
    ]
  },
  "fig0151": {
    "reference": [
      0.003387296613932108,
      0.0113881415932256,
      0.3123989803975417,
      0.05578874845259784,
      0.0564648007347315
    ],
    "counts": {
      "0": 217678,
      "1": 202693,
      "2": 765478,
      "3": 184563,
      "4": 1484915,
      "5": 174502
    },
    "maskBytes": 14653,
    "protectedParts": "face, hands, exposed neck and skin islands remain uncolored",
    "sourceSha256": "e5250be50ecda511a1c9aaa882cbd1117a5a860299a9afd7e2d056f94df8940c",
    "vertices": 12055,
    "triangles": 21134,
    "clips": [
      "Walk",
      "Idle"
    ]
  },
  "fig0160": {
    "reference": [
      0.0070696161052896216,
      0.0918001799052342,
      0.030310308767661005,
      0.11069749731407888,
      0.025571958182284596
    ],
    "counts": {
      "0": 304501,
      "1": 558533,
      "2": 796771,
      "3": 236287,
      "4": 978325,
      "5": 108454
    },
    "maskBytes": 18262,
    "protectedParts": "face, hands, exposed neck and skin islands remain uncolored",
    "sourceSha256": "ad5e0f4adceadcc53f1d1cc78da30bbd23dcb1fca28c6ed3440edb5ded967155",
    "vertices": 17984,
    "triangles": 32640,
    "clips": [
      "Walk",
      "Idle"
    ]
  },
  "fig0165": {
    "reference": [
      0.0035145410452692193,
      0.012855291709709815,
      0.29120248206405347,
      0.021416856601919415,
      0.11819473037082508
    ],
    "counts": {
      "0": 272696,
      "1": 132102,
      "2": 1379794,
      "3": 120766,
      "4": 855504,
      "5": 182233
    },
    "maskBytes": 15151,
    "protectedParts": "face, hands, exposed neck and skin islands remain uncolored",
    "sourceSha256": "c70471060c2e383b23fe95847779742caba689f9333588cc33ff48104e2060ed",
    "vertices": 12455,
    "triangles": 22056,
    "clips": [
      "Walk",
      "Idle"
    ]
  }
};
function makeWardrobe32(meta){
 'use strict';
 const shirts=['#353d44','#4c5965','#697b88','#829297','#667b6b','#8b9785','#a3a694','#b0a28d','#c4bdad','#d0c8b7','#92908a','#6e706f','#535d5d','#87786c','#876861','#956e62','#725556','#435d65','#b2b6b1','#65717d'];
 const pants=['#28323f','#354756','#4b6070','#637789','#3e4245','#55524b','#777165','#8d816d','#42483d','#54483d','#656a67','#353635'];
 const shoes=['#282a2b','#37332e','#554739','#736451','#777672','#a9aaa4','#c6c2b7','#58656c'];
 const coats=['#303d4a','#46545c','#56675b','#707966','#776c5c','#978575','#b6a68d','#545155','#929590','#697682','#805d53'];
 const hair=['#24221f','#322821','#453225','#594131','#76583e','#877153','#a28d64','#8d7250','#744b34','#634236'];
 const cache=new Map(),hairCache=new Map();let originalAppearance=null,previewIndex=0;
 const hexRGB=h=>[1,3,5].map(k=>parseInt(h.slice(k,k+2),16));
 const linear=h=>hexRGB(h).map(q=>{const v=q/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});
 function hash(s){let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
 function rng(seed){let a=seed>>>0;return()=>{a+=0x6d2b79f5;let t=Math.imul(a^(a>>>15),a|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
 const pack=h=>parseInt(h.slice(1),16);
 function pick(list,r,jitter=4){const base=hexRGB(list[Math.floor(r()*list.length)]),j=(r()-.5)*2*jitter;return '#'+base.map(v=>Math.max(12,Math.min(216,Math.round(v+j+(r()-.5)*3))).toString(16).padStart(2,'0')).join('');}
 function soft(index,seed,model,old){
  if(old?.police||model?.id==='traffic_officer23'||old?.volunteer)return old;
  const key=String(seed)+':'+index+':'+(model?.id||'');if(cache.has(key))return cache.get(key);
  const r=rng(hash(key)),shirt=pick(shirts,r),pant=pick(pants,r),shoe=pick(shoes,r),coat=pick(coats,r),h=pick(hair,r,2),accent=pick(coats,r,3);
  const neo=!!model?.j?.extras?.studentExpansion17;
  const result={...old,id:index,shirt,pants:pant,shoes:shoe,coat,hair:h,accent,
   colors:[...linear(shirt),...linear(pant),...linear(shoe),...linear(accent)],
   extraPalette32:[pack(coat),pack(h)],flags:[!neo&&old?.backpack?1:0,0,0,1],
   backpack:!neo&&!!old?.backpack,hat:false,volunteer:false,preserveOriginalColors:false,
   neutralWardrobe32:true,legacyColors32:old?.colors?.slice(),wardrobeRevision:32};
  if(cache.size>12000)cache.clear();cache.set(key,result);return result;
 }
 function renderOutfit(a){const o=a.outfit;if(!o)return {colors:Array(12).fill(1),flags:[0,0,0,0],extraPalette32:[0,0]};
  if((a.volunteer||o.volunteer||o.flags?.[2]>.5)&&o.neutralWardrobe32){
   // A boundary-helper constructor can take an attendee palette, then set purple.
   // Recover its previous pants/shoes/accent, not a new costume for the volunteer.
   if(!o.restoredVolunteer32)o.restoredVolunteer32={...o,colors:[...o.colors.slice(0,3),...(o.legacyColors32||o.colors).slice(3)],extraPalette32:[0,0],neutralWardrobe32:false};
   return o.restoredVolunteer32;
  }return o;
 }
 async function loadMask(id){
  const res=await fetch('./wardrobe32/'+id+'.png?rev=32',{cache:'no-cache'});if(!res.ok)throw Error('Missing wardrobe32/'+id+'.png. Copy the wardrobe32 folder beside index.html.');
  const im=await createImageBitmap(await res.blob()),c=document.createElement('canvas');c.width=im.width;c.height=im.height;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(im,0,0);im.close();const pixels=ctx.getImageData(0,0,c.width,c.height).data,red=new Uint8Array(c.width*c.height);for(let i=0;i<red.length;i++)red[i]=pixels[i*4];
  const t=gl.createTexture();gl.activeTexture(gl.TEXTURE5);gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);gl.texImage2D(gl.TEXTURE_2D,0,gl.R8,c.width,c.height,0,gl.RED,gl.UNSIGNED_BYTE,red);gl.pixelStorei(gl.UNPACK_ALIGNMENT,4);
  for(const p of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,p,gl.NEAREST);
  for(const p of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,p,gl.CLAMP_TO_EDGE);gl.activeTexture(gl.TEXTURE0);return t;
 }
 async function hairReference(model,part){
  const mat=model.j.materials[part.materialIndex],ti=mat?.pbrMetallicRoughness?.baseColorTexture?.index;if(ti==null)return .04;
  const key=model.id+':'+ti;if(hairCache.has(key))return hairCache.get(key);
  try{const im=await CharacterFitting.imageFromTexture(model.j,model.exportBin,ti);if(!im)return .04;const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(im,0,0,256,256);im.close?.();const d=ctx.getImageData(0,0,256,256).data,uv=part.source.uv,idx=part.source.indices,samples=[];const lin=v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4;
   const step=Math.max(3,Math.floor(idx.length/1800/3)*3);for(let k=0;k+2<idx.length;k+=step){let u=0,v=0;for(let n=0;n<3;n++){u+=uv[idx[k+n]*2]/3;v+=uv[idx[k+n]*2+1]/3;}const x=Math.max(0,Math.min(255,Math.floor(u*256))),y=Math.max(0,Math.min(255,Math.floor(v*256))),o=(y*256+x)*4;if(d[o+3]<80)continue;samples.push(.2126*lin(d[o]/255)+.7152*lin(d[o+1]/255)+.0722*lin(d[o+2]/255));}
   samples.sort((a,b)=>a-b);const ref=Math.max(.002,samples[Math.floor(samples.length*.58)]||.04);hairCache.set(key,ref);return ref;
  }catch(_){return .04;}
 }
 async function prepareModel(model){
  if(model.wardrobePrepared32)return model;
  if(meta[model.id]){
   const vertices=model.parts.reduce((n,p)=>n+p.source.positions.length/3,0);if(vertices!==meta[model.id].vertices)throw Error('The '+model.id+' mesh differs from this wardrobe mask. Keep your supplied DEV19 student GLBs in students17.');
   const t=await loadMask(model.id);model.wardrobeMask32=t;
   for(const p of model.parts){p.batch.wardrobeMask32=t;p.batch.wardrobeRef32=meta[model.id].reference;}
   model.fitReport={...model.fitReport,originalColors:false,neutralWardrobe32:true,source:'Original rig and supplied Walk/Idle; independently masked muted garments and natural hair.'};
  }else if(model.id!=='traffic_officer23'){
   for(const p of model.parts){const mat=model.j.materials[p.materialIndex],name=mat?.name||'';
    if(!p.fitted&&/hair/i.test(name)&&!/(eyelash|brow)/i.test(name)){p.batch.outfitRole=10;p.batch.hairRef32=await hairReference(model,p);}
    else if(p.batch.outfitRole===1&&/(Coat|Jacket|Suit|Vest)\b/i.test(name))p.batch.outfitRole=11;
   }
  }
  model.wardrobePrepared32=true;return model;
 }
 function bindBatch(b,outfit){
  const active=!!b.wardrobeMask32;gl.uniform1i(uniforms.uWardrobeMapped32,active);gl.activeTexture(gl.TEXTURE5);gl.bindTexture(gl.TEXTURE_2D,b.wardrobeMask32||whiteBaseMap);gl.uniform1i(uniforms.uWardrobeMask32,5);gl.activeTexture(gl.TEXTURE0);
  const ref=b.wardrobeRef32||[.12,.12,.12,.12,b.hairRef32||.04];gl.uniform4f(uniforms.uWardrobeRef32,ref[0],ref[1],ref[2],ref[3]);gl.uniform1f(uniforms.uHairRef32,ref[4]);
  const extra=outfit?.extraPalette32||[0,0];gl.uniform2f(uniforms.uExtraPalette32,extra[0],extra[1]);
 }
 function release(model){if(model?.wardrobeMask32){gl.deleteTexture(model.wardrobeMask32);model.wardrobeMask32=null;}}
 function install(){if(originalAppearance)return;originalAppearance=CrowdWardrobe.appearance;CrowdWardrobe.appearance=function(index,seed,model){return soft(index,seed,model,originalAppearance(index,seed,model));};}
 function installUI(){if(document.getElementById('wardrobePanel32')||!document.getElementById('rightTools'))return;
  const p=document.createElement('details');p.id='wardrobePanel32';p.className='panel';p.style.padding='12px';p.innerHTML='<summary>Natural student wardrobes / DEV 32</summary><p class="ship-hint">Individual muted shirts, outerwear, trousers, shoes and natural hair colors. Purple volunteers and traffic officers keep their uniforms. No population or graphics-quality changes.</p><button id="shuffleWardrobe32">New muted outfits</button><p class="ship-foot">The seven source GLBs and their supplied animations are unchanged. Extra palette variations reuse the same meshes and animation buffers.</p>';
  document.getElementById('rightTools').prepend(p);document.getElementById('shuffleWardrobe32').onclick=()=>{if(window.Crowd?.shuffleOutfits)Crowd.shuffleOutfits();};
 }
 return {install,installUI,soft,renderOutfit,prepareModel,bindBatch,release,linear,pack,
  nextPreview(){previewIndex++;},get previewIndex(){return previewIndex;},get metadata(){return meta;},
  summary(){const people=typeof crowdState!=='undefined'?crowdState.sim?.agents||[]:[];return{version:32,people:people.length,muted:people.filter(a=>a.outfit?.neutralWardrobe32&&!a.volunteer).length,volunteersUnchanged:true,sharedMasks:Object.keys(meta),naturalHair:true};}};
}
function patch(code,preview=false,integration={}){
 function one(a,b,label){const n=code.split(a).length-1;if(n!==1)throw Error('DEV32 source mismatch: '+label+' ('+n+' matches). No source files were changed.');code=code.replace(a,b);}
 // One additional attribute slot packs both RGB triples losslessly into floats.
 one('uniform vec3 uOutfitColors[4];uniform vec4 uOutfitFlags;',
  'uniform vec3 uOutfitColors[4];uniform vec4 uOutfitFlags;\n layout(location=15) in vec2 aExtraPalette32;uniform vec2 uExtraPalette32;\n flat out vec3 vCoat32;flat out vec3 vHair32;flat out float vPaletteOn32;\n vec3 unpackColor32(float p){vec3 s=vec3(floor(p/65536.),mod(floor(p/256.),256.),mod(p,256.))/255.;return mix(s/12.92,pow((s+.055)/1.055,vec3(2.4)),step(vec3(.04045),s));}', 'extra vertex palette');
 one('void main(){vShirt=', 'void main(){vec2 extra=uCrowd?aExtraPalette32:uExtraPalette32;vPaletteOn32=extra.y>0.?1.:0.;vCoat32=unpackColor32(extra.x);vHair32=unpackColor32(extra.y);vShirt=', 'unpack palette');
 one('in vec3 vShirt;in vec3 vPants;in vec3 vShoes;in vec3 vAccent;flat in vec4 vOutfitFlags;',
  'in vec3 vShirt;in vec3 vPants;in vec3 vShoes;in vec3 vAccent;flat in vec4 vOutfitFlags;\n flat in vec3 vCoat32;flat in vec3 vHair32;flat in float vPaletteOn32;\n uniform sampler2D uWardrobeMask32;uniform bool uWardrobeMapped32;uniform vec4 uWardrobeRef32;uniform float uHairRef32;', 'fragment palette');
 one('int garment=uOutfitRole;', 'int garment=uOutfitRole;if(garment==11)garment=(vOutfitFlags.z>.5||vPaletteOn32<.5)?1:11;', 'preserve uniform coat');
 one('garment==3?vShoes:vAccent;', 'garment==3?vShoes:garment==11?vCoat32:vAccent;', 'separate outerwear');
 one('garment==5||garment==7)?outfitTint:', 'garment==5||garment==7||garment==11)?outfitTint:', 'outerwear tint role');

 const recolor=`
 if(uOutfitOn&&vPaletteOn32>.5&&vOutfitFlags.z<.5){
   int role32=uWardrobeMapped32?int(floor(texture(uWardrobeMask32,vUV).r*255./40.+.5)):0;
   if(role32>0&&role32<=5){
     float reference32=role32==1?uWardrobeRef32.x:role32==2?uWardrobeRef32.y:role32==3?uWardrobeRef32.z:role32==4?uWardrobeRef32.w:uHairRef32;
     float luminance32=dot(texLinear,vec3(.2126,.7152,.0722));
     float detail32=clamp(pow(max(luminance32,.00005)/max(reference32,.0015),.68),.025,1.7);
     vec3 tint32=role32==1?vShirt:role32==2?vPants:role32==3?vShoes:role32==4?vCoat32:vHair32;
     surfaceBase=tint32*detail32;
   }else if(garment==10){
     float detail32=clamp(pow(max(dot(texLinear,vec3(.2126,.7152,.0722)),.00005)/max(uHairRef32,.0015),.72),.03,1.9);
     surfaceBase=vHair32*detail32;
   }
 }
 `;
 one(' if(uLogoMapped&&uOutfitOn',recolor+' if(uLogoMapped&&uOutfitOn','masked recolor only');
 one("for(const n of ['uLogoRect'", "for(const n of ['uExtraPalette32','uWardrobeMask32','uWardrobeMapped32','uWardrobeRef32','uHairRef32','uLogoRect'",'new uniform locations');
 one('const outfit=b.activeOutfit;', 'const outfit=b.activeOutfit?Wardrobe32.renderOutfit({outfit:b.activeOutfit}):null;Wardrobe32.bindBatch(b,outfit);','actor material setup');
 one('gl.bindVertexArray(null);if(!model.idle)throw Error(id+\' has no idle animation.\');return model;',
     'gl.bindVertexArray(null);if(!model.idle)throw Error(id+\' has no idle animation.\');return await Wardrobe32.prepareModel(model);', 'prepare masks and legacy hair roles');
 // Shared LOD material batches must carry the same mask/role reference.
 one('accessoryName:original.accessoryName});','accessoryName:original.accessoryName,wardrobeMask32:original.wardrobeMask32,wardrobeRef32:original.wardrobeRef32,hairRef32:original.hairRef32});','masks across all LODs');
 one('const off=index*36,','const off=index*38,','instance stride');
 one('pool.capacity*36','pool.capacity*38','instance buffer capacity');
 one('agents.length*36','agents.length*38','instance upload range');
 one('  d.set([c,0,-n,0,0,s,0,0,n,0,c,0,','  const outfit32=Wardrobe32.renderOutfit(a);\n  d.set([c,0,-n,0,0,s,0,0,n,0,c,0,','choose protected uniform');
 one('...(a.outfit?.colors||Array(12).fill(1)),...(a.outfit?.flags||[0,0,0,0])],off);',
     '...(outfit32.colors||Array(12).fill(1)),...(outfit32.flags||[0,0,0,0]),...(outfit32.extraPalette32||[0,0])],off);','pack extra colors');
 if((code.match(/false,144,/g)||[]).length!==4)throw Error('DEV32 expected four crowd attribute strides');code=code.replace(/false,144,/g,'false,152,');
 one('gl.vertexAttribDivisor(14,1);', 'gl.vertexAttribDivisor(14,1);gl.enableVertexAttribArray(15);gl.vertexAttribPointer(15,2,gl.FLOAT,false,152,144);gl.vertexAttribDivisor(15,1);Wardrobe32.bindBatch(b,null);','coat and hair instance attribute');
 one(' if(!model)return;\n   // Actor bone textures', ' if(!model)return;Wardrobe32.release(model);\n   // Actor bone textures','release preview mask');
 one('accent:a.outfit.accent,backpack:a.outfit.backpack', 'accent:a.outfit.accent,coat:a.outfit.coat||a.outfit.shirt,hair:a.outfit.hair||null,wardrobeRevision:a.outfit.wardrobeRevision||null,backpack:a.outfit.backpack','export wardrobe values');
 // Existing source files and the default population/loading behavior are intact.
 code=code.replaceAll('originalOutfitsLocked:true','originalOutfitsLocked:false,neutralWardrobe32:true');
 code=code.replaceAll('The 500 new students retain their supplied clothing and have no added accessories.','All students now use individually varied muted clothing and natural hair colors. No extra accessories are added to the newer models.');
 code=code.replaceAll('At 1,500 people the 500 extra students use original clothing colors; the original 50 purple-shirt volunteers stay unchanged.','Old and new students use individual muted wardrobes; the purple volunteers are unchanged.');
 code=code.replaceAll(' new students in original outfits / ',' new students with muted outfits / ');
 code=code.replaceAll('Original clothing colors. Your supplied Standard Walk and Idle are now retargeted to this rig. No procedural walk, added hats, packs or uniform.', 'DEV32: muted clothing and natural hair; original texture detail, rig and supplied Walk/Idle retained. Use Try another outfit to inspect variations.');
 code=code.replaceAll('actor.outfit=CrowdWardrobe.appearance(1000,914211001,actor.model);','actor.outfit=CrowdWardrobe.appearance(1000+Wardrobe32.previewIndex,914211001,actor.model);');
 code=code.replaceAll('volunteer?0:1245,914211001,actor.model','volunteer?0:1245+Wardrobe32.previewIndex,914211001,actor.model');
 one("$i('fitClose').onclick=close;", "$i('fitClose').onclick=close;const outfitButton32=document.createElement('button');outfitButton32.id='fitShuffle32';outfitButton32.textContent='Try another outfit';outfitButton32.onclick=()=>{Wardrobe32.nextPreview();outfit();};$i('fitClose').before(outfitButton32);",'preview outfit cycling');
 // Export currently serializes the original atlases, not these runtime masks.
 // Hide misleading GLB export on masked students rather than output a wrong outfit.
 one('function select(id){const m=characterState.models.get(id);if(!m)return;', "function select(id){const m=characterState.models.get(id);if(!m)return;$i('fitExport').hidden=!!m.wardrobeMask32;",'honest source export');
 let runtime='\nconst Wardrobe32=('+makeWardrobe32.toString()+')('+JSON.stringify(META)+');\nwindow.Wardrobe32=Wardrobe32;Wardrobe32.install();\n';
 if(preview){
   one('StudentPreview18.init();',runtime+'StudentPreview18.init();','standalone preview runtime');
   code=code.replaceAll('triangles; original colors.','triangles; muted wardrobe.');
 }else{
   one('(async()=>{try{initRenderer();',runtime+'(async()=>{try{initRenderer();','venue wardrobe runtime');
   const initHook=integration.initHook||'CheckIn30.init();';
   one(initHook,initHook+'Wardrobe32.installUI();','in-game wardrobe panel');
   one(integration.reportHook||"buildVersion:'dev30-volunteer-checkin'", "buildVersion:'dev32-natural-wardrobes',wardrobe32:Wardrobe32.summary()",'wardrobe build report');
 }
 return code;
}
global.MCQWardrobe32={patch,makeWardrobe32,metadata:META,version:32};
})(globalThis);
