/* Two mutually exclusive worlds share one renderer and one set of farm assets. */
window.FarmScene63=(()=>{
 let active=false,ground=null,hills=null,button=null;
 const farmCollider=c=>/^(Farm(?:_|\d)|Stable52 |UTV53 )/.test(c.name);
 function set(value){
  if(active===value)return;
  if(!value&&window.FarmTruck67?.mounted)FarmTruck67.exit(true);
  if(!value&&window.Farming36?.mounted)Farming36.exit(true);
  active=value;lastSunRoof=null;keys.clear();
  if(!value)window.FarmTruck67?.update(0);
  if(baselineColliders)refreshShipments();
  if(!value)window.Ambulance35?.refreshWorld();
  document.body.classList.toggle('countryside63',active);
  if(button)button.hidden=!active;
 }
 function enter(){set(true);}
 function leave(){set(false);}
 function back(){
  if(window.FarmTruck67?.mounted)FarmTruck67.exit(true);
  if(window.FarmVehicles53?.mounted)FarmVehicles53.exit(true);
  if(window.Farming36?.mounted)Farming36.exit(true);
  if(window.Drone44?.mission){Drone44.exit();return;}
  window.ChallengeEntry38?.visit('farm');
 }
 function build(){
  const S=NetworkScene40,land=new S.Mesh([.25,.36,.17,1]),ridge=new S.Mesh([.22,.34,.20,1]);
  land.box([-72,-.16,5],[1800,.2,1800]);
  // A few broad, low-poly hills provide a rural horizon with two draw calls.
  for(let i=0;i<22;i++){
   const a=i/22*Math.PI*2,x=-72+Math.cos(a)*(160+i%3*25),z=5+Math.sin(a)*(160+i%4*20),r=40+i%5*8,h=9+i%4*5;
   const point=(a,t)=>[x+Math.cos(a)*r*Math.sin(t),-.1+h*Math.cos(t),z+Math.sin(a)*r*Math.sin(t)];
   for(let ring=0;ring<4;ring++)for(let k=0;k<18;k++){
    const u=k/18*Math.PI*2,v=(k+1)/18*Math.PI*2,t=ring/4*Math.PI/2,nt=(ring+1)/4*Math.PI/2;
    const p=point(u,t),q=point(u,nt),r=point(v,nt),s=point(v,t),start=ridge.v.length/6;
    for(const vertex of [p,q,r,s]){const n=norm([(vertex[0]-x)/1500,(vertex[1]+.1)/100,(vertex[2]-z)/1500]);ridge.v.push(...vertex,...n);}ridge.i.push(start,start+2,start+1,start,start+3,start+2);
   }
  }
  ground=land.build();hills=ridge.build();
 }
 function draw(planes){if(!ground)build();gl.disable(gl.CULL_FACE);drawBatch(ground);drawBatch(hills);FarmSurface91.draw();Farming36.draw(planes);Drone44.draw(planes);Stables52.draw(planes);FarmVehicles53.draw(planes);window.Farmstead65?.draw(planes);}
 function update(dt){Farming36.update(dt);Drone44.update(dt);Stables52.update(dt);FarmVehicles53.update(dt);FarmPeople55.update();ChallengeEntry38.update();window.Farmstead65?.init();window.Farmstead65?.update(dt);
 }
 function init(){
  button=document.createElement('button');button.id='farmReturn63';button.textContent='Return to venue';button.hidden=!active;button.onclick=back;document.body.append(button);
  const style=document.createElement('style');style.textContent='#farmReturn63{position:fixed;right:16px;bottom:110px;z-index:46;padding:10px 14px;border:1px solid #b6d5bd;border-radius:4px;color:white;background:#193a29;cursor:pointer}#farmReturn63[hidden]{display:none}.countryside63 #staffPrompt{display:none!important}';document.head.append(style);
 }
 return {enter,leave,back,draw,update,preload:()=>{if(!ground)build();},get active(){return active;},acceptCollider:c=>farmCollider(c)===active,snapshot:()=>({active,scene:active?'countryside':'city',cityBatches:baseRenderBatches?.length||0,farmColliders:baselineColliders?.filter(farmCollider).length||0}),init};
})();
{
 const tele=teleport,walk=advancePlayer;
 teleport=function(name,...args){
  if(!places[name])return;
  if(window.Drone44?.mission)Drone44.exit();
  if(window.FarmVehicles53?.mounted)FarmVehicles53.exit(true);
  if(window.Farming36?.mounted)Farming36.exit(true);
  if(places[name].scene==='farm'||['farm36','utv53','stables52'].includes(name))FarmScene63.enter();else FarmScene63.leave();
  return tele(name,...args);
 };
 advancePlayer=function(...args){walk(...args);if(FarmScene63.active&&!window.Drone44?.active){const b=FarmBoundary48.bounds;player.position[0]=Math.max(b.left-1,Math.min(b.right+1,player.position[0]));player.position[2]=Math.max(b.north-1,Math.min(b.south+1,player.position[2]));}};
 FarmScene63.init();
}
