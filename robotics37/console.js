/* One model shared by the walk-up terminal and its live close-up viewport. */
const RobotConsole37=(()=>{
 const parts=[];
 async function load(){
  const response=await fetch('./robotics37/console.glb');
  if(!response.ok)throw Error('Controller model could not load');
  const {json:j,bin}=parseGLB(await response.arrayBuffer()),textures=new Map();
  for(const node of j.nodes){
   if(node.mesh===undefined)continue;
   for(const p of j.meshes[node.mesh].primitives){
    const pos=accessor(j,bin,p.attributes.POSITION),normal=accessor(j,bin,p.attributes.NORMAL),uv=accessor(j,bin,p.attributes.TEXCOORD_0),indices=accessor(j,bin,p.indices),v=new Float32Array(pos.length*2);
    for(let i=0;i<pos.length;i+=3)v.set([...pos.subarray(i,i+3),...normal.subarray(i,i+3)],i*2);
    const mat=j.materials[p.material],pbr=mat.pbrMetallicRoughness,ti=pbr.baseColorTexture?.index;
    if(ti!==undefined&&!textures.has(ti))textures.set(ti,await embeddedGLBTexture(j,bin,ti));
    const monitor=['Cube.010','Cube.012'].includes(node.name);
    parts.push({matrix:mm(monitor?transform([0,-.66,0],[1,1.5,1]):IDENTITY,trs(node)),batch:uploadBatch(v,indices,{color:pbr.baseColorFactor||[1,1,1,1],rough:.7,metal:.1,baseTexture:textures.get(ti),uv,alphaCutoff:mat.alphaMode==='MASK'?.3:-1})});
   }
  }
 }
 function draw(matrix){gl.disable(gl.CULL_FACE);for(const p of parts)drawBatch(p.batch,mm(matrix,p.matrix));}
 function closeup(panel){
  if(!parts.length)return;
  const cw=canvas.clientWidth,ch=canvas.clientHeight;
  const rect={x:cw*.5,y:0,w:cw*.5,h:ch};
  const ratio=canvas.width/cw,x=Math.round(rect.x*ratio),y=Math.round((ch-rect.y-rect.h)*ratio),w=Math.round(rect.w*ratio),h=Math.round(rect.h*ratio);
  // Orthographic shoulder view gives an affine monitor plane and precise DOM hit targets.
  const span=Math.max(3.3,3.1*rect.w/rect.h),vertical=span*rect.h/rect.w,cy=2.65;
  const projection=[2/span,0,0,0,0,2/vertical,0,0,0,0,-2/40,0,0,0,0,1];
  gl.enable(gl.SCISSOR_TEST);gl.scissor(x,y,w,h);gl.viewport(x,y,w,h);gl.clearColor(.045,.055,.06,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  const vp=mm(projection,lookAt([1.45,cy+.45,10],[2.013,cy,-2]));
  gl.uniformMatrix4fv(uniforms.uVP,false,new Float32Array(vp));gl.uniform3fv(uniforms.uCamera,[1.45,cy+.45,10]);gl.uniform1f(uniforms.uShadowOn,0);
  draw(transform([0,0,0],[1,1,1]));
  const project=p=>{const q=tp(vp,...p);return [rect.x+(q[0]+1)*rect.w/2,rect.y+(1-q[1])*rect.h/2];};
  const tl=project([.72,3.17*1.5-.66,-1.97]),tr=project([3.305,3.17*1.5-.66,-1.97]),bl=project([.72,1.48*1.5-.66,-1.97]);
  Object.assign(panel.style,{left:'0',top:'0',width:'480px',height:'420px',transformOrigin:'0 0',transform:`matrix(${(tr[0]-tl[0])/480},${(tr[1]-tl[1])/480},${(bl[0]-tl[0])/420},${(bl[1]-tl[1])/420},${tl[0]},${tl[1]})`});
  // Render the student's existing skinned avatar beside the terminal, not a substitute model.
  const foot=[player.position[0],player.position[1]-PHYSICS.radii[1],player.position[2]],avatarMap=mm(transform([-.15,-3.31,.8],[8,8,8]),transform(mul(foot,-1),[1,1,1]));
  gl.uniformMatrix4fv(uniforms.uVP,false,new Float32Array(mm(vp,avatarMap)));
  const yaw=player.yaw,first=state.firstPerson,overview=state.overview,radius=smoothRadius;
  try{player.yaw=0;state.firstPerson=false;state.overview=false;smoothRadius=2;if(characterState.player)drawActor(characterState.player,[]);else renderAvatar();}
  finally{player.yaw=yaw;state.firstPerson=first;state.overview=overview;smoothRadius=radius;}
  gl.disable(gl.SCISSOR_TEST);gl.viewport(0,0,canvas.width,canvas.height);
  gl.uniformMatrix4fv(uniforms.uVP,false,new Float32Array(mm(perspective(cw/ch),lookAt(camera,target))));gl.uniform3fv(uniforms.uCamera,camera);gl.uniform1f(uniforms.uShadowOn,state.sunShadows===false?0:1);
 }
 return {load,draw,closeup};
})();
