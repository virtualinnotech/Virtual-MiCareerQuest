/* MiCareerQuest DEV 33 - 22 new real-world booth styles and 16 bold colour schemes for the Design
 * Booth studio (booths33.js): truss stages, container booths, barns, labs, neon arcades, pods and more.
 * Demo booths now use these styles, matched to each industry. Keeps DEV 32 (individual, softer outfits
 * for every duplicated new student in students32.js; the "event night" exhibit hall and the tractor in
 * hall32.js) and DEV 31 (volunteer check-in, see flow22.js)
 * and the DEV 23-30 traffic officers and boundary helpers on the unchanged DEV21 renderer.
 * Loads the unchanged v13 archive in this folder and applies ONLY the hat-removal
 * plus manual loading and resource-lifetime fixes. The camera, frame scheduler, shadows,
 * antialiasing, resolution controls, booth studio, and session storage are kept.
 * Adds context-loss diagnostics; no aerial controls, render throttling or quality override.
 * No uploads, telemetry, external scripts, or local-file writes are added here.
 */
'use strict';

function patchVenueHTML(html) {
  const start = html.indexOf("<script>'use strict';");
  const end = html.indexOf('</script>', start);
  if (start < 0 || end < 0) throw Error('The v13 archive is missing its expected venue runtime. No files were changed.');
  let code = html.slice(start + 8, end);
  const changes = [];
  function once(before, after, label) {
    if (!code.includes(before) || code.indexOf(before) !== code.lastIndexOf(before)) {
      throw Error('This update does not match the v13 archive (' + label + '). Keep your original game file in this folder.');
    }
    code = code.replace(before, after);
    changes.push(label);
  }

  // Leave random-number consumption untouched: existing outfit colors remain stable.
  once('for(const p of out)p.flags=[p.backpack?1:0,p.hat?1:0,p.volunteer?1:0,1];',
    'for(const p of out){p.hat=false;p.flags=[p.backpack?1:0,0,p.volunteer?1:0,1];}',
    'Disable added hats in all wardrobes');

  const hs = code.indexOf(' function fitHat(');
  const he = code.indexOf(' async function imageFromTexture', hs);
  if (hs < 0 || he <= hs) throw Error('The cap-fitting function was not found in the v13 archive.');
  code = code.slice(0, hs) + ' function fitHat(){return {meshes:[],report:{disabled:true,headSamples:0,reason:"Headwear removed in DEV 17"}};}\n' + code.slice(he);
  changes.push('Do not generate cap crowns, visors, bands, or stitching');

  once('if(node.mesh===undefined||node.extras?.crowdAddedV11)continue;',
    'if(node.mesh===undefined||node.extras?.crowdAddedV11||/(?:^|[_\\s-])(?:helmet|hat|cap)(?:$|[_\\s-])/i.test(node.name||""))continue;',
    'Keep native helmet meshes removed');
  once('<label><input type="checkbox" id="fitHat" checked>Cap (except native hardhat)</label>',
    '<input type="checkbox" id="fitHat" disabled hidden>',
    'Keep the cap option hidden');
  once("hat:$i('fitHat').checked&&!native", 'hat:false',
    'Character close-up and fitted exports remain hat-free');
  once("$i('fitHat').disabled=!!native;", "$i('fitHat').checked=false;$i('fitHat').disabled=true;",
    'Do not re-enable caps when changing inspected character');
  once("'Fitted to '+r.hat.headSamples.toLocaleString()+' head samples. Shirt logo: '",
    "'Hats removed. Shirt logo: '", 'Update the inspector explanation');
  once("buildVersion:'ship-v12-fitted-characters'", "buildVersion:'dev17-student-expansion'", 'Report the restored walking build');
  once("sourceCode:'Ship to Venue v12: solid character materials, surface-fitted packs and caps, UV-printed volunteer shirts'",
    "sourceCode:'MiCareerQuest DEV17: original walking renderer and controls, no character headwear'", 'Update the report label');

  function patchStudents17(code) {
   const ids=['fig0027','fig0098','fig0143','fig0147','fig0151','fig0160','fig0165'];
   function once(a,b,label){if(code.indexOf(a)<0||code.indexOf(a)!==code.lastIndexOf(a))throw Error('DEV17 base mismatch: '+label);code=code.replace(a,b);}
   function section(a,b,replacement){const x=code.indexOf(a),y=code.indexOf(b,x);if(x<0||y<0)throw Error('DEV17 section missing: '+a);code=code.slice(0,x)+replacement+'\n'+code.slice(y);}
   once('const CHARACTER_HEIGHT=.72;',`const NEW_STUDENT_FILES=${JSON.stringify(ids)};\nconst isNewStudent=id=>NEW_STUDENT_FILES.includes(id);\nconst CHARACTER_HEIGHT=.72;`,'student library');
   once("'dave_character','adam_character'];", "'dave_character','adam_character',...NEW_STUDENT_FILES];",'register files');
   once("const data=$('character-'+id).textContent.trim(),gz=Uint8Array.from(atob(data),c=>c.charCodeAt(0)),ab=await new Response(new Blob([gz]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();const{json:j,bin}=parseGLB(ab);",`let ab;if(isNewStudent(id)){const response=await fetch('./students17/'+id+'.glb?motion=19',{cache:'no-cache'});if(!response.ok)throw Error('Missing students17/'+id+'.glb. Copy the students17 folder beside index.html.');ab=await response.arrayBuffer();}else{const data=$('character-'+id).textContent.trim(),gz=Uint8Array.from(atob(data),c=>c.charCodeAt(0));ab=await new Response(new Blob([gz]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();}const{json:j,bin}=parseGLB(ab);if(isNewStudent(id)&&!j.extras?.motionRevision19)throw Error('Old animation file for '+id+'. Replace the students17 folder with the DEV19 models and refresh.');`,'load independent GLBs');
   once('const fitted=await CharacterFitting.fit(model,bin,originals);',`let fitted;if(isNewStudent(id)){model.exportBin=bin;model.logoInkMaps=new Map();model.fitReport={model:id,originalColors:true,backpack:{disabled:true},hat:{disabled:true,headSamples:0},logo:{rectangle:[0,0,0,0],frontGateZ:0,triangles:0,inkPixels:0},source:'Original student rig; supplied Standard Walk.fbx and Idle.fbx retargeted'};fitted=originals;}else fitted=await CharacterFitting.fit(model,bin,originals);`,'do not recolor or refit new people');
   once('function appearance(index,seed,model){const all=roster(seed);',`function appearance(index,seed,model){if(model?.j?.extras?.studentExpansion17)return {id:index,shirt:'original:'+model.id,pants:'original',shoes:'original',accent:'original',colors:Array(12).fill(1),backpack:false,hat:false,volunteer:false,flags:[0,0,0,0],preserveOriginalColors:true};const all=roster(seed);`,'preserve original clothing even after shuffle');
   section('function assignCrowdModels(){','function crowdSeedHash',`function assignCrowdModels(){
   if(!crowdState.sim||!crowdState.walkingModels.length)return;
   const original=Array.from(characterState.models.values()).filter(m=>!isNewStudent(m.id)),walking=original.filter(m=>m.walk),newModels=NEW_STUDENT_FILES.map(id=>characterState.models.get(id)).filter(Boolean);
   for(const a of crowdState.sim.agents){
    if(a.id>=1000){if(newModels.length!==7)throw Error('The extra 500 need all seven new student files.');a.model=newModels[(a.id-1000)%7];}
    else a.model=a.stationed?original[a.id%original.length]:walking[a.id%walking.length];
    if(a.id===40&&a.stationed)a.model=characterState.models.get('sara_character');
    a.outfit=CrowdWardrobe.appearance(a.id,crowdState.appearanceSeed,a.model);
    if(a.volunteer){a.position=[a.x,floorHeightAt(a.x,a.z)+.004,a.z];a.industry=a.station?.region;}
   }
  }
  `);
   once("const models=Array.from(characterState.models.values()),old=new Map(crowdState.staff.map(a=>[a.boothId,a]))", "const models=Array.from(characterState.models.values()).filter(m=>!isNewStudent(m.id)),old=new Map(crowdState.staff.map(a=>[a.boothId,a]))",'existing booth staff retained');
   once('const crowdState={targetCount:1000,','const crowdState={targetCount:1500,','default 1500');
   once('Math.min(1000,Math.round(n))','Math.min(1500,Math.round(n))','crowd count control');
   once('Math.min(1000,Math.floor(count))','Math.min(1500,Math.floor(count))','simulation capacity');
   once('Math.min(1000,Math.round(c.count))','Math.min(1500,Math.round(c.count))','session capacity');
   once('<option value="1000" selected>1,000</option>','<option value="1000">1,000 (original crowd)</option><option value="1250">1,250</option><option value="1500" selected>1,500 (+500 new students)</option>','population options');
   once('0 loaded / 1,000 requested','0 loaded / 1,500 requested','initial counter');
   once('Social crowd / v11','Expanded student crowd / DEV 17','panel title');
   once('The full crowd contains 950 attendees and 50 volunteers.','The full crowd contains 1,450 attendees and 50 volunteers. Each of the 500 new students gets its own softer top, pants, shoe and hair colours.','population description');
   once("'13 uploaded models: 8 supply walking clips; all 13 appear among stationed volunteers. Clothing varies per person, not per model.'", "'20 character models: 13 original + 7 new. Every duplicate of the 7 new students gets its own top, pants, shoe and hair colours; the original 50 purple-shirt volunteers stay unchanged.'",'library summary');
   once("'Uploaded models are reused, not downloaded 1,000 times.'", "'Shared character models are reused across all 1,500 people.'",'shared models message');
   once("+' printed texture pixels. No floating chest panel. Original body scale and animations retained.'", "+' printed texture pixels. Original body scale and animations retained.'",'remove outdated fit statement');
   // Inspector can preview the new source clothing but must not turn them into volunteers.
   once("function outfit(){if(!actor)return;",`function outfit(){if(!actor)return;const locked=isNewStudent(actor.model.id);$i('fitBackpack').disabled=locked;$i('fitVolunteer').disabled=locked;if(locked){$i('fitBackpack').checked=false;$i('fitVolunteer').checked=false;actor.outfit=CrowdWardrobe.appearance(1000,914211001,actor.model);return;}`, 'inspector original-colors lock');
   once("const r=m.fitReport;$i('fitModelName')", "const r=m.fitReport;$i('fitModelName')",'inspector exists');
   once(";view(0);}\n function view(angle)",";if(isNewStudent(id))$i('fitDetails').textContent='Recoloured for every duplicate: top/coat, pants, shoes and hair get softer everyday colours; skin, face and inner layers stay as scanned. Your supplied Standard Walk and Idle are retargeted to this rig.';view(0);}\n function view(angle)",'new inspector description');
   // Clear, truthful library messages. Keep the old decoder path for the original 13.
   once("'/13)...'", "'/20)...'",'loader count');
   once("'13 surface-fitted models ready. Solid clothing, fitted accessories, printed volunteer shirts.'","'20 models ready: 13 originals plus 7 new students. Brad and the 50 purple-shirt helpers are unchanged.'",'ready message');
   // Describe source outfits separately from the old procedural clothing palette.
   once("+' patrolling volunteers / '+w.uniqueAttendeeShirts+' unique attendee shirt colors / '+w.backpacks", "+' patrolling volunteers / '+crowdState.sim.agents.filter(a=>a.id>=1000).length+' new students in individual outfits / '+w.backpacks",'wardrobe status');
   // Focused preview control; no aerial camera or rendering downgrade.
   const additions=`
  window.StudentExpansion17={files:NEW_STUDENT_FILES,summary(){const a=crowdState.sim?.agents||[];return {total:a.length,newStudents:a.filter(p=>p.id>=1000).length,byModel:Object.fromEntries(NEW_STUDENT_FILES.map(id=>[id,a.filter(p=>p.id>=1000&&p.model?.id===id).length])),volunteers:a.filter(p=>p.volunteer).length,individualOutfits:true};},async preview(id='fig0027'){if(!isNewStudent(id))throw Error('Choose one of the seven new students.');for(const key of NEW_STUDENT_FILES)if(!characterState.models.has(key))characterState.models.set(key,await loadCharacterModel(key,null));CharacterInspector.open(id);},install(){if($('previewNewStudents'))return;const b=document.createElement('button');b.id='previewNewStudents';b.textContent='Preview 7 new students';b.style.width='100%';b.onclick=()=>this.preview().catch(e=>toast(e.message));$('characterPanel')?.append(b);}};
  const originalCharactersUI17=charactersUI;charactersUI=function(){originalCharactersUI17();StudentExpansion17.install();};
  `;
   const init="(async()=>{try{initRenderer();";once(init,additions+'\n'+init,'preview installed before startup');
   return code;
  }
  
  /* DEV 18: explicit loading, one-character preview, resource diagnostics.
     No aerial code, resolution override, dropped attendees, or clothing edits. */
  function patchRuntime18(code) {
    function once(a,b,label){if(!code.includes(a)||code.indexOf(a)!==code.lastIndexOf(a))throw Error('DEV18 archive mismatch: '+label);code=code.replace(a,b);}
    function section(a,b,text){const x=code.indexOf(a),y=code.indexOf(b,x);if(x<0||y<=x)throw Error('DEV18 section missing: '+a);code=code.slice(0,x)+text+'\n'+code.slice(y);}
    once('const crowdState={targetCount:1500,','const crowdState={targetCount:0,','empty startup');
    once("status:'waiting',message:'Waiting for the character library...'","status:'stopped',message:'No crowd loaded. Use the 100-person test when ready.'",'stopped state');
    once('if(window.AnimatedCharacters)AnimatedCharacters.init();','charactersUI();characterMessage("No character library loaded yet. Preview the new students separately, or start a small crowd test.");','defer library');
    once("if(window.Crowd)Crowd.start();}catch(e)","if(window.Crowd&&crowdState.targetCount>0)Crowd.start();}catch(e)",'no crowd after manual library load');
    once("async function startCrowd(){crowdUI();", "async function startCrowd(){crowdUI();if(gl.isContextLost())return;if(crowdState.targetCount===0){crowdState.status='stopped';crowdMessage('No crowd loaded. Select a population to run a test.');return;}",'explicit start');
    once("if(m.action==='crowd-start'){Crowd.setCount(m.payload?.count??1000);Crowd.pause(false);Crowd.start();Crowd.overview();result=true;}","if(m.action==='crowd-start'){requestPopulation18(m.payload?.count??100);result=true;}",'safe start RPC');
    once("$('crowdCount').onchange=e=>{setCrowdCount(e.target.value);crowdSaveSettings();};", "$('crowdCount').onchange=e=>requestPopulation18(e.target.value);",'explicit population UI');
    once('0 loaded / 1,500 requested','0 people loaded / manual start','counter');
    once('<option value="0">0</option>', '<option value="0" selected>0 - empty venue</option>','zero default option');
    once('<option value="1500" selected>1,500 (+500 new students)</option>', '<option value="1500">1,500 - full stress test</option>','manual maximum');
    once("'The crowd appears when the character models are ready.'","'Nothing starts automatically. Start with 100 people; higher counts are optional stress tests.'",'idle help');
    // A saved 1,500-person session must not immediately replay the failing load.
    once('if(Number.isFinite(c.count))crowdState.targetCount=c.count<=0?0:Math.max(50,Math.min(1500,Math.round(c.count)));', 'if(Number.isFinite(c.count)){window.MCQDiagnostics18.savedPopulation=c.count;crowdState.targetCount=0;}', 'safe restored count');
    once("if(characterState.status==='ready'&&!crowdState.building)startCrowd();", "if(characterState.status==='ready'&&!crowdState.building&&crowdState.targetCount>0)startCrowd();",'restore no autostart');
    once("crowdState.sim=null;crowdState.accumulator=0;crowdInvalidate();", "crowdState.sim=null;crowdState.status='stopped';crowdState.accumulator=0;crowdInvalidate();",'restored state');
    // Smaller mixed-population tests include the new students before ID 1,000.
    once('if(a.id>=1000){if(newModels.length!==7)', 'if(a.id>=1000||(crowdState.sim.agents.length<1000&&a.id>=50&&(a.id-50)%3===0)){if(newModels.length!==7)','new models in small tests');
    once('a.model=newModels[(a.id-1000)%7];','a.model=newModels[a.id>=1000?(a.id-1000)%7:Math.floor((a.id-50)/3)%7];','mixed IDs');
    once("a.filter(p=>p.id>=1000).length", "a.filter(p=>isNewStudent(p.model?.id)).length",'summary mixed models');
    once("p.id>=1000&&p.model?.id===id", "isNewStudent(p.model?.id)&&p.model?.id===id",'summary counts');
    once("crowdState.sim.agents.filter(a=>a.id>=1000).length", "crowdState.sim.agents.filter(a=>isNewStudent(a.model?.id)).length",'status counts');
    // Only upload textures for retained parts, not all unused legacy materials.
    once('const maps=await loadVenueMaterialImages(j,bin);for(let k=0;k<j.materials.length;k++){const tx=j.materials[k].extras?.crowdNeutralTextureIndex;if(tx!==undefined)maps.set(k,await embeddedGLBTexture(j,bin,tx));}', 'const maps=new Map();model.textureRefs18=[];', 'defer character material upload');
    once('for(const part of fitted){const {positions:p,normals:n,uv,indices,weights,joints}=part.source;', 'await loadRetainedCharacterTextures18(model,bin,fitted,maps);\n for(const part of fitted){if(gl.isContextLost())throw Error("Graphics reset while preparing "+id);const {positions:p,normals:n,uv,indices,weights,joints}=part.source;','used textures only');
    // Retry/inspector concurrency shares a single in-flight model load.
    once('async function loadCharacterModel(id,D){','async function loadCharacterModelRaw18(id,D){\n if(gl.isContextLost())throw Error("The graphics context has reset. Restart the empty venue.");MCQDiagnostics18.stage="loading model "+id;', 'model loader guard');
    once('async function prepareModels(onProgress){if(ready)return;', 'async function prepareModels(onProgress){if(ready&&Array.from(characterState.models.keys()).every(id=>lods.has(id)))return;', 'incremental LOD cache');
    once('let i=0;for(const m of characterState.models.values()){\n   onProgress?', 'let i=0;for(const m of characterState.models.values()){if(lods.has(m.id))continue;if(gl.isContextLost())throw Error("Graphics reset while preparing crowd models");\n   onProgress?', 'do not duplicate ready LODs');
    once("canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();state.paused=true;showError('The graphics context was lost. Reload the file to restart.');});", "canvas.addEventListener('webglcontextlost',handleGraphicsLoss18);", 'actionable loss response');
    once('function render(){if(!state.ready||!gl)return;', 'function render(){if(!state.ready||!gl||gl.isContextLost())return;', 'stop drawing lost context');
    once('function loop(t){const dt=', 'function loop(t){if(MCQDiagnostics18.contextLost)return;const dt=', 'stop loop after graphics reset');
    // Reuse safe preview instead of loading every character for inspection.
    section("async preview(id='fig0027'){", 'install(){if', "async preview(id='fig0027'){if(!isNewStudent(id))throw Error('Choose one of the seven new students.');window.parent.location.href='./student-preview.html?model='+encodeURIComponent(id);},");
    once("b.textContent='Preview 7 new students';", "b.textContent='Preview new students (one at a time)';", 'preview wording');
    const extension=`
  const characterLoads18=new Map();
  window.MCQDiagnostics18={build:'DEV19',stage:'venue startup',contextLost:false,savedPopulation:0,startedAt:new Date().toISOString()};
  async function loadCharacterModel(id,D){
   if(characterState.models.has(id))return characterState.models.get(id);
   if(characterLoads18.has(id))return characterLoads18.get(id);
   const p=loadCharacterModelRaw18(id,D).finally(()=>characterLoads18.delete(id));characterLoads18.set(id,p);return p;
  }
  async function loadRetainedCharacterTextures18(model,bin,parts,maps){
   const memo=new Map();
   for(const mi of new Set(parts.map(p=>p.materialIndex))){
    if(gl.isContextLost())throw Error('Graphics reset while uploading '+model.id);
    const mat=model.j.materials[mi],ti=mat?.extras?.crowdNeutralTextureIndex??mat?.pbrMetallicRoughness?.baseColorTexture?.index;
    if(ti==null)continue;
    if(!memo.has(ti)){const texture=await embeddedGLBTexture(model.j,bin,ti);memo.set(ti,texture);model.textureRefs18.push(texture);}
    maps.set(mi,memo.get(ti));
   }
   model.textureCount18=memo.size;
  }
  function releaseCharacterModel18(model){
   if(!model)return;
   // Actor bone textures are released by CharacterInspector.close before this.
   for(const p of model.parts||[]){const b=p.batch;for(const k of ['vbo','ibo','uvbo','jointsBuffer','weightsBuffer','lineIbo'])if(b[k])gl.deleteBuffer(b[k]);if(b.vao)gl.deleteVertexArray(b.vao);}
   for(const t of model.textureRefs18||[])releaseEmbeddedTexture(t);
   for(const r of model.logoInkMaps?.values()||[])if(r.texture)gl.deleteTexture(r.texture);
   model.parts=[];model.textureRefs18=[];characterState.models.delete(model.id);
  }
  function requestPopulation18(value){
   const count=Math.max(0,Math.min(1500,Math.round(Number(value)||0)));
   if(MCQDiagnostics18.contextLost)return;
   if(count>250&&!confirm('Run '+count.toLocaleString()+' people? This is a graphics stress test and may exceed the available graphics resources. Start with 100 first.')){$('crowdCount').value=String(crowdState.targetCount);return;}
   MCQDiagnostics18.stage='requested '+count+' people';
   Crowd.setCount(count);Crowd.pause(false);
   if(count>0)Crowd.start();else crowdState.status='stopped';
   crowdSaveSettings();
  }
  function graphicsReport18(){
   let gpu=null;try{if(gl&&!gl.isContextLost())gpu={renderer:gl.getParameter(gl.RENDERER),vendor:gl.getParameter(gl.VENDOR),maxTexture:gl.getParameter(gl.MAX_TEXTURE_SIZE),contextAttributes:gl.getContextAttributes()};}catch(_){}
   return {format:'micareerquest-graphics-report',version:19,time:new Date().toISOString(),diagnostic:{...MCQDiagnostics18},browser:navigator.userAgent,screen:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},gpu,loadedModels:Array.from(characterState.models.values(),m=>({id:m.id,textureCount:m.textureCount18,triangles:m.parts.reduce((s,p)=>s+p.batch.count/3,0)})),crowd:window.Crowd?.snapshot(),boothCount:typeof shippedBooths!=='undefined'?shippedBooths.size:0,scene:state.modelStats};
  }
  function downloadJSON18(value,name){const u=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),10000);}
  function rescueSession18(){
   const s=shippingSnapshot();const booths=s.booths.map(b=>{const {model,...rest}=b,arr=new Uint8Array(model);let text='';for(let i=0;i<arr.length;i+=32768)text+=String.fromCharCode(...arr.subarray(i,i+32768));return {...rest,modelBase64:btoa(text)};});
   downloadJSON18({...s,crowd:{...s.crowd,paused:true},booths},'MiCareerQuest-rescue-session.json');
  }
  function handleGraphicsLoss18(event){
   event.preventDefault();MCQDiagnostics18.contextLost=true;MCQDiagnostics18.stage='graphics context lost';state.paused=true;
   if(typeof crowdState!=='undefined')crowdState.paused=true;
   showError('The graphics connection reset. Save your session or report below. Restart with no crowd.');
   const box=$('loading');if(!box||$('graphicsRecovery18'))return;
   const tools=document.createElement('div');tools.id='graphicsRecovery18';tools.style.cssText='display:flex;gap:12px;flex-wrap:wrap;justify-content:center;max-width:650px;margin:15px auto';
   for(const [label,fn] of [['Save graphics report',()=>downloadJSON18(graphicsReport18(),'MiCareerQuest-graphics-DEV19.json')],['Save rescue session',rescueSession18],['Back to safe start',()=>window.parent.location.href='./']]){const b=document.createElement('button');b.textContent=label;b.onclick=()=>{try{fn();}catch(e){b.textContent=e.message;}};tools.append(b);}box.append(tools);
  }
  window.MCQSupport18={report:graphicsReport18,releaseModel:releaseCharacterModel18,requestPopulation:requestPopulation18};
  `;
    once("(async()=>{try{initRenderer();",extension+"\n(async()=>{try{initRenderer();",'support before startup');
    code=code.replace("buildVersion:'dev17-student-expansion'", "buildVersion:'dev19-supplied-student-motion'");
    return code;
  }
  
  code=patchRuntime18(patchStudents17(code));
  function patchRobots20(code){
   function once(a,b,label){if(code.indexOf(a)<0||code.indexOf(a)!==code.lastIndexOf(a))throw Error('DEV20 base mismatch: '+label);code=code.replace(a,b);}
   once('async function loadVenue(buffer){const {json:j,bin}=parseGLB(buffer),jobs=[]',
    'async function loadVenue(buffer){const {json:j,bin}=parseGLB(buffer);RobotExhibit20.prepareVenue(j);const jobs=[]','retire old arm meshes before batching');
   once('if(window.Crowd)Crowd.draw(planes);','if(window.Crowd)Crowd.draw(planes);RobotExhibit20.draw(planes);','draw shared robot assets');
   once('advanceLandmarkMotion(motionDelta);if(window.AnimatedCharacters)',
    'advanceLandmarkMotion(motionDelta);RobotExhibit20.update(dt);if(window.AnimatedCharacters)','robot animation and confined motion');
   once('if(window.HubGuide)HubGuide.init();','if(window.HubGuide)HubGuide.init();RobotExhibit20.init();','start six robots without student crowd');
   once('function refreshShipments(){','function refreshShipments(){if(window.RobotExhibit20)RobotExhibit20.invalidate();','replan around moved booths');
   once("if(m.action==='crowd-start'){", "if(m.action==='visit-robots20'){await RobotExhibit20.init();RobotExhibit20.visit(m.payload?.kind||'arm');result=true;}else if(m.action==='crowd-start'){",'visit robots button');
   once("buildVersion:'dev19-supplied-student-motion'", "buildVersion:'dev20-manufacturing-robots',robots:window.RobotExhibit20?.snapshot()",'robot report');
   once("diagnostic:{...MCQDiagnostics18}","diagnostic:{...MCQDiagnostics18},robots:window.RobotExhibit20?.snapshot()",'graphics report robots');
   once("(async()=>{try{initRenderer();", MCQRobotSource20+'\n(async()=>{try{initRenderer();','local robot modules');
   return code;
  }
  code=patchRobots20(code);
  function patchPerformance21(code){
   function once(a,b,label){if(code.indexOf(a)<0||code.indexOf(a)!==code.lastIndexOf(a))throw Error('DEV21 base mismatch: '+label);code=code.replace(a,b);}
   once("if(!gl)throw Error('Interactive 3D needs WebGL 2. Open this file in Chrome or Edge with graphics acceleration enabled. This is a live walkthrough, not a static preview.');", "if(!gl)throw Error('Interactive 3D needs WebGL 2. Open this file in Chrome or Edge with graphics acceleration enabled. This is a live walkthrough, not a static preview.');\n gl=Performance21.cacheGL(gl);",'cache graphics state');
   once("parts.push({name:n.name||'Booth surface',role:n.extras?.role,pos,nor,uv,idx,mat:pr.material??-1,nonColliding:n.extras?.nonColliding===true});", "parts.push(Performance21.indexPart({name:n.name||'Booth surface',role:n.extras?.role,pos,nor,uv,idx,mat:pr.material??-1,nonColliding:n.extras?.nonColliding===true}));",'lossless booth indexing');
   once('const groups=new Map();for(const p of r.parts){if(!groups.has(p.mat))groups.set(p.mat,[]);groups.get(p.mat).push(p);}', 'const groups=Performance21.groupShipmentParts(r);','equivalent booth materials');
   once('r.batches.push(b);', 'b.localBounds21=Performance21.boundsOfParts(parts);r.batches.push(b);','precise material bounds');
   once('for(const b of r.batches){b.modelMatrix=new Float32Array(matrix);b.center=center;b.cullRadius=radius;renderBatches.push(b);}', 'for(const b of r.batches){Performance21.placeBatch(b,matrix,center,radius);renderBatches.push(b);}','cull individual material groups');
   once('function refreshShipments(){', 'function refreshShipments(){Performance21.invalidateDebug();','invalidate debug geometry');
   once("batchAdd(debugMap,boundary?'boundary':'structure',data,g.idx,{boundary,unlit:true});",'/* DEV21: upload debug wireframes only when requested. */','defer venue debug upload');
   once("const data=new Float32Array(pos.length*2);for(let i=0;i<pos.length;i+=3)data.set([pos[i],pos[i+1],pos[i+2],0,1,0],i*2);\n   batchAdd(debug,'shipped',data,part.idx,{unlit:true,dynamicShip:true});",'/* DEV21: collision triangles stay exact; debug GPU buffers are lazy. */','defer booth debug upload');
   once('if(state.debug){for(const b of debugBatches){', 'if(state.debug){Performance21.ensureDebug();for(const b of debugBatches){','debug request still works');
   once('if(uSkinned)skin=joint(aJoints.x)*aWeights.x+joint(aJoints.y)*aWeights.y+joint(aJoints.z)*aWeights.z+joint(aJoints.w)*aWeights.w;', 'if(uSkinned){skin=mat4(0.);if(aWeights.x>0.)skin+=joint(aJoints.x)*aWeights.x;if(aWeights.y>0.)skin+=joint(aJoints.y)*aWeights.y;if(aWeights.z>0.)skin+=joint(aJoints.z)*aWeights.z;if(aWeights.w>0.)skin+=joint(aJoints.w)*aWeights.w;}','skip zero-weight joint reads');
   once('if(window.Crowd)Crowd.init();', 'if(window.Crowd)Crowd.init();Performance21.installUI();','local performance panel');
   once("buildVersion:'dev20-manufacturing-robots'", "buildVersion:'dev21-performance'",'report build');
   once("(async()=>{try{initRenderer();", MCQPerformanceSource21+'\n(async()=>{try{initRenderer();','performance module');
   return code;
  }
  code=patchPerformance21(code);
  function patchFlow22(code){
   function once(a,b,label){if(!code.includes(a)||code.indexOf(a)!==code.lastIndexOf(a))throw Error('DEV22 base mismatch: '+label);code=code.replace(a,b);}
   once('RobotExhibit20.prepareVenue(j);','RobotExhibit20.prepareVenue(j);EventFlow22.prepareVenue(j);','closed gate and orphan rings');
   once('function allocatePlacement(r,scale=DEFAULT_BOOTH_SCALE,preferred=null){return allocateDiscoveryPlacement(r,scale,preferred);}', 'function allocatePlacement(r,scale=DEFAULT_BOOTH_SCALE,preferred=null){return EventFlow22.allocate(r,scale,preferred);}', 'idempotent demo half turns');
   once('try{await baking;}catch(e){baking=null;throw e;}}','try{await baking;}finally{baking=null;}}','release completed crowd bake promise for incremental loads');
   once('const attendees=crowdState.sim?.agents||[],staff=state.showStaff===false?[]:crowdState.staff;', 'const attendees=EventFlow22.combined(crowdState.sim?.agents||[]),staff=state.showStaff===false?[]:crowdState.staff;', 'shared instancing for boundary people');
   once('...(window.Crowd?.volunteers()||[])','...(window.Crowd?.volunteers()||[]),...EventFlow22.forInteraction()', 'local questions at boundary volunteers');
   once('if(window.Crowd)Crowd.update(dt);','if(window.Crowd)Crowd.update(dt);EventFlow22.update(dt);','stationary idle timing');
   once('Performance21.installUI();','Performance21.installUI();EventFlow22.init();','boundary testing panel');
   once("lastSunRoof=null;state.modelStats.shippedBooths", "EventFlow22.invalidate();lastSunRoof=null;state.modelStats.shippedBooths",'station placement rechecked after booth edits');
   once('blocked[iz*nx+ix]=inside(x0+ix*step,z0+iz*step)?0:1;', 'blocked[iz*nx+ix]=inside(x0+ix*step,z0+iz*step)&&EventFlow22.insideVisitorArea(x0+ix*step,z0+iz*step)?0:1;', 'simulated students stay in intended event areas');
   once('...crowdState.staff].map(a=>[a.position[0],a.position[2]])','...crowdState.staff,...EventFlow22.visible()].map(a=>[a.position[0],a.position[2]])','crowd yields to the stationed helpers');
   once('if(crowdState.dirty&&!crowdState.building&&CrowdGraphics.ready&&','if(crowdState.targetCount>0&&crowdState.dirty&&!crowdState.building&&CrowdGraphics.ready&&','no zero-population navigation work');
   once('requested:crowdState.targetCount,boothStaff:crowdState.staff.length,','requested:crowdState.targetCount,boothStaff:crowdState.staff.length,boundaryVolunteers:EventFlow22.snapshot(),','extra people included in performance report');
   once("buildVersion:'dev21-performance'","buildVersion:'dev22-event-boundaries'",'build identity');
   once('(async()=>{try{initRenderer();',MCQFlowSource22+'\n(async()=>{try{initRenderer();','boundary module before startup');
   return code;
  }
  code=patchFlow22(code);

  function patchPolice23(code){
    function once(a,b,label){if(!code.includes(a)||code.indexOf(a)!==code.lastIndexOf(a))throw Error('DEV23 base mismatch: '+label);code=code.replace(a,b);}
    once('const original=Array.from(characterState.models.values()).filter(m=>!isNewStudent(m.id)),', 'const original=CHARACTER_FILES.filter(id=>!isNewStudent(id)).map(id=>characterState.models.get(id)).filter(Boolean),', 'officers never join student assignment');
    once('const models=Array.from(characterState.models.values()).filter(m=>!isNewStudent(m.id)),old=', 'const models=CHARACTER_FILES.filter(id=>!isNewStudent(id)).map(id=>characterState.models.get(id)).filter(Boolean),old=', 'officers never replace booth representatives');
    once('function appearance(index,seed,model){', 'function appearance(index,seed,model){if(model?.id==="traffic_officer23")return TrafficPolice23.outfit();', 'lock officer colors');
    once('function outfit(){if(!actor)return;const locked=', 'function outfit(){if(!actor)return;if(actor.model.id==="traffic_officer23"){for(const id of ["fitHat","fitBackpack","fitVolunteer"]){$i(id).disabled=true;$i(id).checked=false;}actor.outfit=TrafficPolice23.outfit();return;}const locked=', 'officer inspector uniform lock');
    once("if(m.action==='visit-robots20'){", "if(m.action==='visit-officers23'){await EventFlow22.load();EventFlow22.visit('front-arrival-apron');result=true;}else if(m.action==='visit-robots20'){", 'inspect officers without crowd');
    once("buildVersion:'dev22-event-boundaries'", "buildVersion:'dev24-checkin-officers'", 'report identity');
    return code;
  }
  code=patchPolice23(code);

  /* DEV31: volunteer check-in at the entrance table. The scene itself lives in flow22.js
     (CheckInScene31); this only adds a one-click venue command and the build label. */
  function patchCheckIn31(code){
    function once(a,b,label){if(!code.includes(a)||code.indexOf(a)!==code.lastIndexOf(a))throw Error('DEV31 base mismatch: '+label);code=code.replace(a,b);}
    once("if(m.action==='visit-officers23'){", "if(m.action==='visit-checkin31'){EventFlow22.visit('welcome-checkin');try{await EventFlow22.load();}catch(e){toast('Check-in volunteers could not load: '+(e.message||e));}result=true;}else if(m.action==='visit-officers23'){", 'visit volunteer check-in');
    once("buildVersion:'dev24-checkin-officers'", "buildVersion:'dev31-volunteer-checkin',checkIn:window.CheckInScene31?.summary", 'report identity');
    return code;
  }
  code=patchCheckIn31(code);

  /* DEV32: every duplicated new student gets its own top/coat, pants, shoe and hair colours
     (students32.js role maps + one texel lookup in the crowd shader), and the random crowd
     wardrobe uses softer everyday colours. Volunteer purple is unchanged. */
  function patchLooks32(code){
    function once(a,b,label){if(!code.includes(a)||code.indexOf(a)!==code.lastIndexOf(a))throw Error('DEV32 base mismatch: '+label);code=code.replace(a,b);}
    // Shader: per-texel garment role for scanned students (exact lookup, no filtering between roles).
    once('uniform sampler2D uBaseMap;uniform bool uMapped;', 'uniform bool uRoleMapped;uniform highp sampler2D uRoleMap;uniform sampler2D uBaseMap;uniform bool uMapped;', 'role map uniforms');
    once('int garment=uOutfitRole;', 'int garment=uOutfitRole;if(uOutfitOn&&uRoleMapped){vec2 rs=vec2(textureSize(uRoleMap,0));garment=int(texelFetch(uRoleMap,ivec2(clamp(vUV,vec2(0.),vec2(.99999))*rs),0).r*255.+.5)&127;}', 'role map lookup');
    once("'uNormalMapped','uNormalScale'", "'uNormalMapped','uNormalScale','uRoleMapped','uRoleMap'", 'role map uniform locations');
    // Crowd instances and single characters bind the role map of each mesh part (none for everyone else).
    once('gl.uniform1i(uniforms.uOutfitOn,1);gl.uniform1i(uniforms.uOutfitRole,b.outfitRole||0);', 'gl.uniform1i(uniforms.uOutfitOn,1);gl.uniform1i(uniforms.uOutfitRole,b.outfitRole||0);StudentLooks32.bind(b);', 'crowd role map');
    once('gl.uniform1i(uniforms.uOutfitOn,!!outfit);', 'gl.uniform1i(uniforms.uOutfitOn,!!outfit);StudentLooks32.bind(outfit&&!wire&&!colorOverride?b:null);', 'actor role map');
    once('accessoryName:original.accessoryName})', 'accessoryName:original.accessoryName,roleMap:original.roleMap})', 'distant crowd detail keeps role map');
    // New-student loading: neutral fabric texture + role map, then individual outfits.
    once('await loadRetainedCharacterTextures18(model,bin,fitted,maps);', 'await loadRetainedCharacterTextures18(model,bin,fitted,maps);if(isNewStudent(id))await StudentLooks32.prepare(model,bin,maps,fitted);', 'prepare student looks');
    once('accessoryName:ex.crowdOptional||null})', 'accessoryName:ex.crowdOptional||null,roleMap:model.roleMap32||null})', 'student mesh role map');
    once('if(model?.j?.extras?.studentExpansion17)return {', 'if(model?.j?.extras?.studentExpansion17&&model.looks32)return StudentLooks32.outfit(index,seed,model);if(model?.j?.extras?.studentExpansion17)return {', 'individual student outfits');
    // Softer, realistic palette for attendees, booth representatives and helper pants/shoes.
    once('shirt=volunteer?PURPLE:unique(shirts,.28,.83,.26,.73),pants=unique(trousers,.06,.55,.14,.46),shoe=unique(shoes,.04,.65,.21,.83),accent=nonPurple(r,.28,.80,.23,.65);',
      "shirt=volunteer?PURPLE:Muted32.unique(r,shirts,'top'),pants=Muted32.unique(r,trousers,'bottom'),shoe=Muted32.unique(r,shoes,'shoes'),accent=Muted32.color(r,'accent');", 'softer crowd palette');
    once("buildVersion:'dev31-volunteer-checkin'", "buildVersion:'dev32-student-looks-hall',studentLooks:window.StudentLooks32?.report", 'report identity');
    once('(async()=>{try{initRenderer();', MCQLooksSource32+'\n(async()=>{try{initRenderer();', 'student looks module');
    return code;
  }
  code=patchLooks32(code);

  /* DEV32: exhibit hall "event night" look (hall32.js). The shader additions only act inside the
     exhibit hall box and only while Hall32 lighting is on; everything else renders exactly as before. */
  function patchHall32(code){
    function once(a,b,label){if(!code.includes(a)||code.indexOf(a)!==code.lastIndexOf(a))throw Error('DEV32 hall base mismatch: '+label);code=code.replace(a,b);}
    once('uniform float uRoomFeather;uniform float uIndoorGain;', 'uniform float uRoomFeather;uniform float uIndoorGain;\n uniform float uHall;uniform float uHallTime;uniform int uHallRole;uniform vec4 uHallRings[12];uniform int uHallRingCount;uniform vec4 uHallSpot[3];uniform vec3 uHallSpotColor[3];uniform vec4 uHallSpotBox[3];', 'hall uniforms');
    once('weight=max(weight,f.x*f.y*f.z*uRoomStrength[i]);}return weight;}', `weight=max(weight,f.x*f.y*f.z*uRoomStrength[i]);}return weight;}
 vec3 hallPal(float k){float m=mod(floor(k+.5),6.);return m<.5?vec3(.10,.30,1.):m<1.5?vec3(.50,.20,1.):m<2.5?vec3(.16,.55,1.):m<3.5?vec3(1.,.20,.62):m<4.5?vec3(.36,.24,1.):vec3(1.,.55,.18);}
 float hallNorthU(float x){return x<=27.?(x-9.)/3.:x<=40.2?6.+(x-27.)/3.3:10.+(x-40.2)/3.;}
 float hallNorthSpan(float x){return (x<=27.||x>40.2)?3.:3.3;}
 vec3 hallWash(float u,float span,float h,float seed,bool doors){vec3 c=vec3(0.);float k=floor(u+.5);
  for(int j=-1;j<=1;j++){float kk=k+float(j);if(doors&&(abs(kk-1.)<.1||abs(kk-6.)<.1||abs(kk-11.)<.1))continue;
   float ds=(u-kk)*span,w=.26+h*.26;
   c+=hallPal(kk+seed)*(exp(-ds*ds/(w*w))*exp(-h*.2)*smoothstep(-.05,.6,h)+exp(-ds*ds*28.)*exp(-h*h*9.)*.8);}
  return c;}
 vec3 hallWallLight(vec3 p,int wall){float h=p.y-.24;if(h<-.02||h>10.3)return vec3(0.);
  if(wall==1)return hallWash((p.z+21.6)/3.6,3.6,h,1.,false);
  if(wall==2)return hallWash((p.z+21.6)/3.6,3.6,h,2.,true);
  return hallWash(hallNorthU(p.x),hallNorthSpan(p.x),h,wall==3?3.:0.,false);}
 float hallRect(vec2 q,vec4 r){vec2 d=abs(q-(r.xy+r.zw)*.5)-(r.zw-r.xy)*.5;return length(max(d,0.))+min(max(d.x,d.y),0.);}
 float hallSectors(vec2 q,out float id){float d=hallRect(q,vec4(9.,-24.6,32.4,-3.6));id=0.;float a=hallRect(q,vec4(34.8,-24.6,58.2,-3.6));if(a<d){d=a;id=1.;}a=hallRect(q,vec4(9.,3.6,32.4,24.6));if(a<d){d=a;id=2.;}a=hallRect(q,vec4(34.8,3.6,58.2,24.6));if(a<d){d=a;id=3.;}return d;}
 vec3 hallStrip(vec2 q){float a=.5+.5*sin((q.x*.07+q.y*.05-uHallTime*.2)*6.2832);return mix(vec3(.08,.75,1.),vec3(.55,.26,1.),a);}
 float hallStar(vec2 q,float fw){vec2 cs=vec2(1.2,1.5),id=floor(q/cs);if(hash(id)<.42)return 0.;vec2 o=(vec2(hash(id+7.3),hash(id+3.1))-.5)*.6;float dd=length((fract(q/cs)-.5-o)*cs),rad=.045;
  float a=(1.-smoothstep(rad-fw*.5,rad+fw,dd))*clamp(1.8-fw/rad,0.,1.);return a*(1.6+2.4*hash(id+1.7));}`, 'hall functions');
    once('float ndl=max(dot(n,l),0.),ndv=max(dot(n,v),0.);', `vec2 hq=vPosition.xz;float hfw=max(max(fwidth(hq.x),fwidth(hq.y)),1e-4);
 bool hxz=uHall>.5&&hq.x>5.1&&hq.x<62.1&&hq.y>-27.66&&hq.y<27.6;
 bool hceil=hxz&&uHallRole==2&&n.y<-.2&&vPosition.y<10.8;
 float hk=(hxz&&vPosition.y>-.6&&vPosition.y<10.5)||hceil?1.:0.;
 vec3 hAdd=vec3(0.);float hDim=.68;
 if(hk>.5){float hh=vPosition.y-.24;if(uHallRole==6)hDim=.5;
  if(hceil){base=vec3(.0045,.005,.0065);rough=.8;hDim=1.;vec3 sc=mix(vec3(1.,.9,.74),vec3(.8,.9,1.),step(.7,hash(floor(hq/vec2(1.2,1.5))+4.4)));hAdd+=sc*hallStar(hq,hfw);}
  else if(uHallRole==1&&n.y>.8){float sid;float ds=hallSectors(hq,sid);bool carpet=ds<-.03;hDim=.9;
   if(carpet){vec3 t=sid<.5?vec3(.020,.025,.040):sid<1.5?vec3(.034,.021,.024):sid<2.5?vec3(.020,.031,.023):vec3(.036,.029,.018);base=t*(.84+.32*noise(hq*90.))*(.92+.16*noise(hq*7.));rough=.95;}
   else{base=vec3(.045,.047,.054)*(.86+.24*noise(hq*36.)+.08*noise(hq*2.7));rough=.16;}
   vec2 g=vec2(clamp(floor((hq.x-8.4)/4.8+.5),0.,10.),clamp(floor((hq.y+24.)/6.+.5),0.,8.));float dl=length(hq-vec2(8.4+4.8*g.x,-24.+6.*g.y));
   hAdd+=base*vec3(1.,.95,.86)*1.6*exp(-dl*dl/2.2);
   for(int i=0;i<12;i++){if(i>=uHallRingCount)break;vec4 r=uHallRings[i];float e=max(length(hq-r.xz)-r.w*.7,0.);hAdd+=base*vec3(.85,.92,1.)*2.4*exp(-e*e/(r.y*r.y*.12))/(1.+r.y*r.y*.02);}
   if(hq.y>24.)hAdd+=hallWallLight(vec3(hq.x,.55,27.5),0)*.3*exp(-(27.5-hq.y)*1.3);
   if(hq.x>59.)hAdd+=hallWallLight(vec3(62.,.55,hq.y),1)*.3*exp(-(62.-hq.x)*1.3);
   if(hq.x<8.)hAdd+=hallWallLight(vec3(5.2,.55,hq.y),2)*.3*exp(-(hq.x-5.2)*1.3);
   if(hq.y<-24.)hAdd+=hallWallLight(vec3(hq.x,.55,-27.6),3)*.2*exp(-(hq.y+27.6)*1.3);
   if(!carpet){float d=abs(ds-.34);hAdd+=hallStrip(hq)*((1.-smoothstep(.02,.02+hfw*1.5,d))*2.2+exp(-d*d/.016)*.28);
    float hr=length(hq-vec2(33.6,0.)),d2=min(abs(hr-3.05),abs(hr-3.4)*1.6);hAdd+=vec3(.75,.9,1.)*((1.-smoothstep(.018,.018+hfw*1.5,d2))*2.+exp(-d2*d2/.02)*.25);
    vec3 nn=normalize(vec3((noise(hq*.8)-.5)*.006,1.,(noise(hq*.8+9.1)-.5)*.006)),R=reflect(-v,nn),refl=vec3(0.);
    if(R.y>.015){float t=(10.12-vPosition.y)/R.y;vec2 c=hq+R.xz*t;vec2 gg=vec2(clamp(floor((c.x-8.4)/4.8+.5),0.,10.),clamp(floor((c.y+24.)/6.+.5),0.,8.));float st=1./max(R.y,.2),dd=length(c-vec2(8.4+4.8*gg.x,-24.+6.*gg.y)),bl=(.05+t*.012)*st;refl+=vec3(1.,.97,.92)*.7*min(1.,.25/bl)*(1.-smoothstep(.26-bl,.26+bl,dd));
     for(int i=0;i<7;i++){if(i>=uHallRingCount)break;vec4 r=uHallRings[i];float tt=(r.y-vPosition.y)/R.y;float e=abs(length(hq+R.xz*tt-r.xz)-r.w),b2=(.04+tt*.014)*mix(1.,st,.5);refl+=vec3(.92,.96,1.)*2.*min(1.,.35/b2)*exp(-e*e/(b2*b2));}
     float tn=R.z>0.?(27.5-vPosition.z)/R.z:1e5,te=R.x>0.?(62.-vPosition.x)/R.x:1e5,tw=R.x<0.?(5.2-vPosition.x)/R.x:1e5,ts=R.z<0.?(-27.6-vPosition.z)/R.z:1e5,tm=min(min(tn,te),min(tw,ts));vec3 hp=vPosition+R*tm;
     refl+=tm==ts?vec3(.10,.13,.16)*step(hp.y,10.3):hallWallLight(hp,tm==tn?0:tm==te?1:2)*.8*(1.-smoothstep(6.5,10.3,hp.y));}
    hAdd+=refl*(.012+.988*pow(1.-max(dot(nn,v),0.),5.))*(1.-.8*smoothstep(.3,.75,R.y));}}
  else if(uHallRole==3){base=vec3(.028,.03,.036);rough=.9;hDim=.8;vec3 w=vec3(0.);
   if(vPosition.z>27.2&&n.z<-.3)w=hallWallLight(vPosition,0);else if(vPosition.x>61.8&&n.x<-.3)w=hallWallLight(vPosition,1);else if(vPosition.x<5.45&&n.x>.3)w=hallWallLight(vPosition,2);else if(vPosition.z<-27.2&&n.z>.3)w=hallWallLight(vPosition,3);
   hAdd+=w*.55;}
  else if(uHallRole==4){if(vPosition.y>9.6){base=vec3(.02,.021,.025);rough=.5;hDim=1.;}
   else if(vPosition.z<-27.25){base*=.3;hAdd+=hallWallLight(vec3(vPosition.x,vPosition.y,-27.6),3)*.35;}
   else{base=vec3(.05,.052,.058);vec3 cc=vec3(0.);if(abs(vPosition.z)>26.2)cc=hallPal(floor(hallNorthU(vPosition.x)+.5)+(vPosition.z>0.?0.:3.));else if(vPosition.x>60.4)cc=hallPal(floor((vPosition.z+21.6)/3.6+.5)+1.);hAdd+=cc*exp(-hh*.16)*smoothstep(0.,.5,hh)*.5;}}
  else if((uHallRole==0||uHallRole==6)&&abs(n.y)<.6&&hh<1.6){float sid2;float ds2=hallSectors(hq,sid2);if(ds2>-.08&&ds2<1.2){float d=abs(ds2-.34);hAdd+=hallStrip(hq)*base*5.*exp(-d*d/.05)*exp(-max(hh,0.)*2.4);}}
  for(int i=0;i<3;i++){vec4 s=uHallSpot[i];vec4 bx=uHallSpotBox[i];if(s.w<=0.||hq.x<bx.x||hq.y<bx.y||hq.x>bx.z||hq.y>bx.w)continue;vec3 L=s.xyz-vPosition;float d=length(L);if(d>=s.w)continue;float at=1.-d/s.w;hAdd+=base*uHallSpotColor[i]*max(dot(n,L/d),0.)*at*at;}}
 float ndl=max(dot(n,l),0.),ndv=max(dot(n,v),0.);`, 'hall surfaces');
    once('lit+=base*uFillColor*(uFillAmount.x+uFillAmount.y*max(n.y,0.))*indoor*uIndoorGain;', 'lit+=base*uFillColor*(uFillAmount.x+uFillAmount.y*max(n.y,0.))*indoor*uIndoorGain;\n if(hk>.5){lit*=hDim;lit+=base*vec3(.016,.02,.042);lit+=hAdd;}', 'hall light balance');
    once('lit+=uEmission*.5;', 'if(hk>.5&&uHallRole==5){lit=lit*.42+hallWallLight(vec3(vPosition.x,vPosition.y,-27.6),3)*.12;alpha=mix(alpha,1.,.3);}\n lit+=uEmission*.5;', 'tinted hall windows');
    once("'uRoleMapped','uRoleMap'", "'uRoleMapped','uRoleMap','uHall','uHallTime','uHallRole','uHallRings[0]','uHallRingCount','uHallSpot[0]','uHallSpotColor[0]','uHallSpotBox[0]'", 'hall uniform locations');
    // Per draw: surface role of each venue batch (floor, ceiling, walls, aluminium, glass); crowds and people are role 0.
    once('StudentLooks32.bind(outfit&&!wire&&!colorOverride?b:null);', 'StudentLooks32.bind(outfit&&!wire&&!colorOverride?b:null);Hall32.bind(wire||colorOverride?null:b);', 'hall role per batch');
    once('gl.uniform1i(uniforms.uOutfitRole,b.outfitRole||0);StudentLooks32.bind(b);', 'gl.uniform1i(uniforms.uOutfitRole,b.outfitRole||0);StudentLooks32.bind(b);Hall32.bind(null);', 'crowd role');
    once('gl.uniform1f(uniforms.uShadowOn,state.sunShadows===false?0:1);', 'gl.uniform1f(uniforms.uShadowOn,state.sunShadows===false?0:1);Hall32.frame();', 'hall frame uniforms');
    once('gl.uniform1f(uniforms.uShadowOn,0);gl.uniform1f(uniforms.uIndoorGain,0);', 'gl.uniform1f(uniforms.uShadowOn,0);gl.uniform1f(uniforms.uIndoorGain,0);if(uniforms.uHall)gl.uniform1f(uniforms.uHall,0);', 'inspector keeps neutral light');
    once("sky:/sky dome|distant horizon haze/i.test(material.name||''),roof,anchor}", "sky:/sky dome|distant horizon haze/i.test(material.name||''),roof,anchor,hallRole32:Hall32.role(g.mat)}", 'venue surface roles');
    once('if(window.HubGuide)HubGuide.init();RobotExhibit20.init();', 'if(window.HubGuide)HubGuide.init();RobotExhibit20.init();Hall32.init();', 'build hall additions');
    once("if(m.action==='visit-checkin31'){", "if(m.action==='visit-hall32'){Hall32.visit(m.payload?.spot||'entry');result=true;}else if(m.action==='visit-checkin31'){", 'visit exhibit hall');
    once("buildVersion:'dev32-student-looks-hall',studentLooks:window.StudentLooks32?.report", "buildVersion:'dev32-student-looks-hall',studentLooks:window.StudentLooks32?.report,exhibitHall:window.Hall32?.snapshot()", 'report hall');
    return code;
  }
  code=patchHall32(code);

  // Headwear remains disabled and renderer stays unchanged.
  code = code.replace("'use strict';", "'use strict';\nwindow.MCQ_DEV_UPDATE={version:32,mode:\"student-looks-hall\",hatsRemoved:true,officerUniformCapsOnly:true,changes:" + JSON.stringify(changes) + '};\n');
  html = html.slice(0, start + 8) + code + html.slice(end);
  return html.replace(/FITTED CHARACTERS \/ v\d+/g, 'STUDENT LOOKS & HALL / DEV 32');
}

function patchStudioHTML(html) {
  // DEV33: real-world booth styles for the Design Booth studio (booths33.js).
  if (html.includes('window.Booths33')) return html;
  const once = (a, b, label) => {
    if (!html.includes(a) || html.indexOf(a) !== html.lastIndexOf(a)) throw Error('DEV33 studio mismatch: ' + label);
    html = html.replace(a, () => b);
  };
  const all = (a, b, label, n) => {
    if (html.split(a).length - 1 !== n) throw Error('DEV33 studio mismatch: ' + label);
    html = html.split(a).join(b);
  };
  once('function createStudioBooth(template,data,options={}){', 'function createStudioBooth(template,data,options={}){if(typeof Booths33!=="undefined"&&Booths33.owns(template))return Booths33.create(template,data,options);', 'booth factory');
  once('function finalizeBoothContent(root,template){', 'function finalizeBoothContent(root,template){if(root.userData&&root.userData.layout33)return Booths33.finalize(root,template);', 'content layout');
  once('for(let f=0;f<32;f++)', 'for(let f=0;f<studioFamilies.length;f++)', 'random design');
  all('Math.floor(Math.random()*48)', 'Math.floor(Math.random()*studioPalettes.length)', 'random colours', 2);
  once('x.family>31', 'x.family>=studioFamilies.length', 'set family range');
  once('x.palette>47', 'x.palette>=studioPalettes.length', 'set palette range');
  once('a.assignments.length>512', 'a.assignments.length>studioFamilies.length*16', 'set size');
  once("status('All 512 structural IDs are used", "status('All structural IDs are used", 'random text');
  once('<strong>32 architectural families, 16 structural variations each, 48 palettes.</strong>', '<strong>54 architectural families (22 new real-world booth styles marked NEW), 16 structural variations each, 64 palettes.</strong>', 'hint');
  once('id="setCount" type="number" min="1" max="512"', 'id="setCount" type="number" min="1" max="864"', 'set count');
  once('Up to 512 structural designs before any ID repeats.', 'Up to 864 structural designs before any ID repeats. The new DEV 33 styles are dealt first.', 'set info');
  once("o.textContent=String(i+1).padStart(2,'0')+' - '+d[0];", "o.textContent=String(i+1).padStart(2,'0')+' - '+d[0]+(String(d[1]).startsWith('dev33:')?'  (NEW)':'');", 'family labels');
  once("$('layout').value='13';$('variant').value='9';$('palette').value='3';", "$('layout').value='32';$('variant').value='2';$('palette').value='48';", 'default design');
  once('main().then(setupStudio)', MCQBoothSource33.replace(/<\/script/gi, '<\\/script') + '\nmakeUniqueSet=Booths33.makeUniqueSet;\nmain().then(setupStudio)', 'booth module');
  return html;
}

function patchGameHTML(base, robotCode, performanceCode, flowCode, policeCode, looksCode, hallCode, boothCode) {
  if (!base.includes('id="venue-source"') || !base.includes('id="studio-source"')) {
    throw Error('This is not the expected v13 game archive. Keep MiCareerQuest-Ship-to-Venue-v13.html in this folder.');
  }
  const start = base.indexOf('<script>/* Parent workspace:');
  const end = base.indexOf('</script>', start);
  if (start < 0 || end < 0) throw Error('The archive is missing its workspace code.');
  let parentCode = base.slice(start + 8, end);
  const decoder = 'return new TextDecoder().decode(Uint8Array.from(raw,c=>c.charCodeAt(0)));';
  if (!parentCode.includes(decoder) || parentCode.indexOf(decoder) !== parentCode.lastIndexOf(decoder)) {
    throw Error('The archive loader has changed. This update is for the existing v13-based MiCareerQuest-DEV folder.');
  }
  parentCode = parentCode.replace(decoder,
    'const text=new TextDecoder().decode(Uint8Array.from(raw,c=>c.charCodeAt(0)));return id==="venue-source"?MCQPatchVenue(text):id==="studio-source"?MCQPatchStudio(text):text;');
  parentCode=parentCode.replace("'crowd-start',{count:1000}","'crowd-start',{count:1500}").replace('Social crowd: 950 attendees and 50 purple-shirt volunteers.','Social crowd: 1,450 attendees and 50 purple-shirt volunteers. The 500 new students keep original clothing colors.');
  /* Button label replaced after script assembly. */

  // DEV18: only create the booth studio when the user asks for it.
  function parentOnce(a,b,label){if(!parentCode.includes(a)||parentCode.indexOf(a)!==parentCode.lastIndexOf(a))throw Error('DEV18 parent mismatch: '+label);parentCode=parentCode.replace(a,b);}
  parentOnce("const pending=new Map();let serial=0,studioReady=false,", "const pending=new Map();let studioStarted18=false;let serial=0,studioReady=false,", 'lazy studio state');
  parentOnce("$('studioFrame').srcdoc=withToken(decodeHTML('studio-source'));", "/* Studio is deferred in DEV18. */", 'no hidden startup renderer');
  parentOnce("$('studioTab').onclick=()=>switchTab('studio');", "$('studioTab').onclick=async()=>{try{await ensureStudio18();switchTab('studio');}catch(e){note(e.message,true);}};", 'lazy design tab');
  parentOnce("await rpc($('studioFrame'),'edit',{project:m.project,id:m.id});", "await ensureStudio18();await rpc($('studioFrame'),'edit',{project:m.project,id:m.id});", 'lazy edit');
  parentOnce("await waitUntil(()=>studioReady,'The studio did not load.');backup=", "await ensureStudio18();backup=", 'lazy samples');
  parentOnce("try{draft=await rpc($('studioFrame'),'snapshot',null);", "try{await ensureStudio18();draft=await rpc($('studioFrame'),'snapshot',null);", 'lazy demos');
  parentOnce("'crowd-start',{count:1500}", "'crowd-start',{count:100}", 'small test button');
  // DEV33: demo booths take the new real-world styles first, matched to each industry area.
  parentOnce("const d=designs[k++];", "const d=MCQPick33(designs,industry);k++;", 'industry demo picker');
  parentOnce("const names=[['Lakeshore Robotics','Manufacturing',0,3,2],['Harbor Health Careers','Health Science',5,9,18],['Great Lakes Growers','Agribusiness',13,6,8],['Build West Michigan','Construction',20,2,21],['Future Code Lab','Information Technology',30,11,32]];",
    "const names=[['Lakeshore Robotics','Manufacturing',53,2,49],['Harbor Health Careers','Health Science',44,4,48],['Great Lakes Growers','Agribusiness',43,0,54],['Build West Michigan','Construction',45,1,53],['Future Code Lab','Information Technology',46,3,55]];", 'sample booth styles');
  parentOnce("note('Five distinct sample booths placed at 0.40x, with a 0.40x student. Choose an employer in Shipped booths to compare.');",
    "note('Five sample booths in the new DEV 33 styles (Gear Works, Clean Lab, Farm Stand, Scaffold Works, Neon Arcade) placed at 0.40x. Choose an employer in Shipped booths to compare.');", 'sample note');
  parentOnce("Social crowd: 1,450 attendees and 50 purple-shirt volunteers. The 500 new students keep original clothing colors.", "100-person mixed test requested. Nothing starts at 1,500 automatically. New students get individual, softer outfit and hair colours.", 'count help');
  parentCode += `
async function ensureStudio18(){if(!studioStarted18){studioStarted18=true;$('studioFrame').srcdoc=withToken(decodeHTML('studio-source'));}await waitUntil(()=>studioReady,'The booth studio did not load.');}
function MCQPick33(designs,industry){/* DEV33: rotate evenly through the booth styles that suit this industry, so neighbours differ. */const u=(window.__pick33=window.__pick33||{}),c=(u[industry]=u[industry]||{});let i=-1,best=Infinity;for(let j=0;j<designs.length;j++){const d=designs[j];if(!Array.isArray(d.industries)||!d.industries.includes(industry))continue;const n=c[d.family]||0;if(n<best){best=n;i=j;if(!n)break;}}if(i<0)i=0;const d=designs.length?designs.splice(i,1)[0]:null;if(d)c[d.family]=(c[d.family]||0)+1;return d;}
const previewButton18=document.createElement('button');previewButton18.textContent='Preview new students (light)';previewButton18.onclick=()=>{if(active&&!confirm('Leave this venue for the single-character preview? Save venue session first to keep a portable copy of your booths.'))return;location.href='./student-preview.html';};$('startCrowd').before(previewButton18);
const robotsButton20=document.createElement('button');robotsButton20.id='manufacturingRobots20';robotsButton20.textContent='Visit Manufacturing robots';robotsButton20.onclick=async()=>{try{await showVenue();await rpc($('venueFrame'),'visit-robots20',{kind:'arm'});}catch(e){note(e.message,true);}};$('startCrowd').before(robotsButton20);
const policeButton23=document.createElement('button');policeButton23.id='trafficOfficers23';policeButton23.textContent='Visit officers';policeButton23.onclick=async()=>{try{await showVenue();await rpc($('venueFrame'),'visit-officers23',{});}catch(e){note(e.message,true);}};$('startCrowd').before(policeButton23);
const checkinButton31=document.createElement('button');checkinButton31.id='volunteerCheckin31';checkinButton31.textContent='Visit volunteer check-in';checkinButton31.style.cssText='background:#f3ecfb;color:#4b2477;border-color:#c6aee3';checkinButton31.onclick=async()=>{try{await showVenue();note('Opening the volunteer check-in table...');await rpc($('venueFrame'),'visit-checkin31',{});note('Volunteer check-in: purple-shirt volunteers behind the entrance table, folded shirt stacks and clear bins. Press W to walk.');}catch(e){note(e.message,true);}};policeButton23.before(checkinButton31);
const hallButton32=document.createElement('button');hallButton32.id='exhibitHall32';hallButton32.textContent='Visit exhibit hall';hallButton32.style.cssText='background:#11141d;color:#eaf1ff;border-color:#3c4d80';hallButton32.onclick=async()=>{try{await showVenue();await rpc($('venueFrame'),'visit-hall32',{spot:'entry'});note('Exhibit hall: black ceiling with pin-spot lights, colour uplights on the walls, halo rings and polished aisles with LED floor strips. Press W to walk in.');}catch(e){note(e.message,true);}};checkinButton31.before(hallButton32);
const tractorButton32=document.createElement('button');tractorButton32.id='tractor32';tractorButton32.textContent='Visit tractor';tractorButton32.style.cssText='background:#eef7ef;color:#1d5a2c;border-color:#9fcca9';tractorButton32.onclick=async()=>{try{await showVenue();await rpc($('venueFrame'),'visit-hall32',{spot:'tractor'});note('Tractor display: Agribusiness corner beside booth 13. Press W to walk.');}catch(e){note(e.message,true);}};checkinButton31.before(tractorButton32);
$('sampleBooths').disabled=false;$('demoHall').disabled=false;
showVenue().then(()=>note('New in DEV 33: 22 new real-world booth styles and 16 bold colour schemes in Design booth (marked NEW). Load demo booths to fill the hall with them. The student crowd stays off until you start it.')).catch(()=>{});
`;

  // DEV33: the booth studio source gets the new booth styles (patchStudioHTML); rendering is unchanged.
  const prelude = 'const MCQBoothSource33='+JSON.stringify(boothCode||'')+';\nconst MCQPatchStudio='+patchStudioHTML.toString()+';\n'+'const MCQLooksSource32='+JSON.stringify(looksCode+'\n'+(hallCode||''))+';\n'+'const MCQFlowSource22='+JSON.stringify(policeCode+'\n'+flowCode)+';\n'+'const MCQPerformanceSource21='+JSON.stringify(performanceCode)+';\n'+'const MCQRobotSource20='+JSON.stringify(robotCode)+';\nconst MCQPatchVenue=' + patchVenueHTML.toString() + ';\n';
  base = base.slice(0, start + 8) + (prelude + parentCode).replace(/<\/script/gi, '<\\/script') + base.slice(end);
  base=base.replace('Start 1,000 people','Start 100-person test');
  return base.replace('FITTED CHARACTERS &middot; v13 &middot; 0.40x',
    'BOOTH STYLES &amp; HALL &middot; DEV 33 &middot; 0.40x');
}

async function bootDevelopmentUpdate() {
  try {
    if (location.protocol === 'file:') throw Error('Open http://localhost:8000/ through your running local server, rather than double-clicking index.html.');
    const response = await fetch('./MiCareerQuest-Ship-to-Venue-v13.html', {cache:'no-cache'});
    if (!response.ok) throw Error('MiCareerQuest-Ship-to-Venue-v13.html was not found. Copy the two update files into your existing MiCareerQuest-DEV folder, beside that archive.');
    const robotCode=(await Promise.all(['robot-navigation.js','robot-exhibit.js'].map(async name=>{const r=await fetch('./robots20/'+name+'?rev=20',{cache:'no-cache'});if(!r.ok)throw Error('The robots20 folder is missing '+name+'. Copy it beside index.html.');return r.text();}))).join('\n');
    const perfResponse=await fetch('./performance21.js?rev=21',{cache:'no-cache'});if(!perfResponse.ok)throw Error('Copy performance21.js beside index.html and dev-tools.js.');
    const flowResponse=await fetch('./flow22.js?rev=31',{cache:'no-cache'});if(!flowResponse.ok)throw Error('Copy flow22.js beside index.html and dev-tools.js.');
    const policeResponse=await fetch('./police23.js?rev=23',{cache:'no-cache'});if(!policeResponse.ok)throw Error('Copy police23.js beside index.html and dev-tools.js.');
    const looksResponse=await fetch('./students32.js?rev=32',{cache:'no-cache'});if(!looksResponse.ok)throw Error('Copy students32.js from the DEV 32 update beside index.html and dev-tools.js.');
    const hallResponse=await fetch('./hall32.js?rev=32',{cache:'no-cache'});if(!hallResponse.ok)throw Error('Copy hall32.js from the DEV 32 update beside index.html and dev-tools.js.');
    const boothResponse=await fetch('./booths33.js?rev=33',{cache:'no-cache'});if(!boothResponse.ok)throw Error('Copy booths33.js from the DEV 33 update beside index.html and dev-tools.js.');
    const game = patchGameHTML(await response.text(),robotCode,await perfResponse.text(),await flowResponse.text(),await policeResponse.text(),await looksResponse.text(),await hallResponse.text(),await boothResponse.text());
    document.open();
    document.write(game);
    document.close();
  } catch (error) {
    const status = document.getElementById('devLoadStatus');
    const title = document.getElementById('devLoadTitle');
    if (status) status.textContent = error.message || String(error);
    if (title) title.textContent = 'Check the working game folder';
    console.error(error);
  }
}

if(typeof window!=='undefined'){const b=document.getElementById('openGame18');if(b)b.onclick=()=>{b.disabled=true;document.getElementById('devLoadStatus').textContent='Opening the venue and Manufacturing robots. No student crowd starts automatically.';bootDevelopmentUpdate().finally(()=>b.disabled=false);};if(new URLSearchParams(location.search).has('game'))bootDevelopmentUpdate();}
