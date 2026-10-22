/* Accelerated solar time and a bounded set of nearby, physical night lights. */
window.CityLighting131=(()=>{
 const MAX_LIGHTS=40,core=CityClock131;
 let seconds=new URLSearchParams(location.search).get('time')==='night'?2100:450,last=null,held=false,lights=[],selected=[],current=core.sample(seconds),nightLights=true;
 const points=new Float32Array(MAX_LIGHTS*4),colors=new Float32Array(MAX_LIGHTS*4),directions=new Float32Array(MAX_LIGHTS*4);
 const declarations=`
 uniform float uDay131;uniform float uNight131;uniform float uSunPower131;uniform vec3 uSunColor131;
 uniform int uLampCount131;uniform vec4 uLampPos131[40];uniform vec4 uLampColor131[40];uniform vec4 uLampDir134[40];
 vec3 localLighting131(vec3 p,vec3 n,vec3 eye,vec3 base,float rough){
  vec3 result=vec3(0.);
  for(int i=0;i<40;i++){if(i>=uLampCount131)break;vec4 lamp=uLampPos131[i];vec3 delta=lamp.xyz-p;float distance=length(delta);if(distance>=lamp.w)continue;
   vec3 l=delta/max(distance,.001);vec4 beam=uLampDir134[i];float cone=smoothstep(beam.w,min(.98,beam.w+.40),dot(-l,beam.xyz)),falloff=pow(1.-distance/lamp.w,2.);
   vec3 radiance=uLampColor131[i].rgb*uLampColor131[i].a*falloff*cone;
   result+=base*radiance*(.08+max(dot(n,l),0.));
   vec3 halfVector=normalize(l+eye);result+=radiance*pow(max(dot(n,halfVector),0.),mix(180.,12.,rough))*(1.-rough)*.45;
  }return result;
 }
 `;
 const sky=`
  vec3 sun=normalize(uSunDirection);float up=clamp(d.y,0.,1.),elev=asin(up)/1.5707963;
  float u=fract(atan(d.z,d.x)/6.2831853+.2);
  vec3 photo=pow(texture(uSkyMap,vec2(u,clamp(1.-elev,.015,.985))).rgb,vec3(2.2));
  float clouds=dot(photo,vec3(.2126,.7152,.0722));
  vec3 daylight=mix(vec3(.40,.56,.70),vec3(.065,.24,.49),pow(up,.46));
  daylight=mix(daylight,vec3(.76,.79,.80),smoothstep(.19,.58,clouds)*.62);
  float twilight=(1.-smoothstep(.04,.42,abs(sun.y)))*uDay131,alignment=max(dot(d,sun),0.);
  daylight=mix(daylight,vec3(.72,.25,.075),twilight*pow(1.-up,3.)*(.25+.65*pow(alignment,6.)));
  vec3 night=mix(vec3(.018,.028,.052),vec3(.0035,.007,.019),pow(up,.45));
  vec3 c=mix(night,daylight,uDay131);
  c+=uSunColor131*pow(alignment,50.)*.22*uSunPower131;
  c+=vec3(3.2,2.6,1.8)*smoothstep(.99965,.99988,alignment)*uDay131;
  vec3 moon=-sun;float moonDot=max(dot(d,moon),0.);
  c+=vec3(.55,.65,.82)*smoothstep(.99965,.99992,moonDot)*(1.-uDay131);
  vec2 starUV=vec2(atan(d.z,d.x),asin(clamp(d.y,-1.,1.)))*170.,id=floor(starUV),q=fract(starUV)-.5;
  float aa=max(fwidth(starUV.x),fwidth(starUV.y)),star=(1.-smoothstep(.025,.055+aa*.45,length(q)))*step(.995,hash(id));
  c+=star*vec3(.40,.48,.65)*(1.-uDay131)*smoothstep(.03,.25,d.y);
  return c;
 `;
 function frame(){
  const now=(window.frameNow164?.()??performance.now())/1000,dt=last===null?0:Math.max(0,now-last);last=now;
  if(!held&&!state.paused&&!document.hidden)seconds+=dt;
  current=core.sample(seconds);City106.sunDirection.splice(0,3,...current.sun);
 }
 function bind(){
  const farm=!!window.FarmScene63?.active,s=farm?core.sample(900):current;
  const uniform=name=>uniforms[name]??=gl.getUniformLocation(program,name);
  gl.uniform1f(uniform('uDay131'),s.daylight);gl.uniform1f(uniform('uNight131'),farm?0:s.night);
  gl.uniform1f(uniform('uSunPower131'),s.power);gl.uniform3fv(uniform('uSunColor131'),s.color);
  const nearest=(list,count)=>list.map(l=>({l,d:Math.hypot(l.p[0]-camera[0],l.p[1]-camera[1],l.p[2]-camera[2])})).filter(x=>x.d<30+x.l.radius).sort((a,b)=>a.d/a.l.radius-b.d/b.l.radius).slice(0,count).map(x=>x.l);
  selected=nightLights&&!farm?nearest(lights.filter(l=>(l.alwaysOn||s.night>.001)&&!window.StreetProps128?.disabled(l.id)),32):[];
  if(nightLights&&!farm&&s.night>.001){
   const ride=[...(window.Scooter100?.headlights136()||[]),...(window.Rivian147?.headlights()||[])];
   selected.push(...ride,...nearest((window.CityLife111?.trafficBodies()||[]).flatMap(v=>v.parked||!v.light134?[]:[v.light134]),8-ride.length));
  }
  points.fill(0);colors.fill(0);directions.fill(0);selected.forEach((l,i)=>{points.set([...l.p,l.radius],i*4);colors.set([...l.color,l.power*(l.alwaysOn?1:s.night)],i*4);directions.set([...(l.direction||[0,-1,0]),l.outer??-.12],i*4);});
  gl.uniform1i(uniform('uLampCount131'),selected.length);gl.uniform4fv(uniform('uLampPos131[0]'),points);gl.uniform4fv(uniform('uLampColor131[0]'),colors);gl.uniform4fv(uniform('uLampDir134[0]'),directions);
 }
 document.addEventListener('visibilitychange',()=>{last=null;});
 return {declarations,sky,frame,bind,configure(data){lights=data?.lights||[];},addLights(items){lights.push(...items);},snapshot:()=>({...current,held,lights:lights.length,selected:selected.map(l=>l.id),nightLights}),
  test:{setTime(value){seconds=value;held=true;last=null;frame();},advance(dt){seconds+=dt;frame();},resume(){held=false;last=null;},lights(enabled){nightLights=enabled;}}};
})();
