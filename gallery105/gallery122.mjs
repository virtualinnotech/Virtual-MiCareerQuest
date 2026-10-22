export const exhibitBays122=[[-15.9,-2.1],[2.1,15.9],[20.1,29.0]];
export const exhibitDoors122=[[-20.1,-15.9],[-2.1,2.1],[15.9,20.1]];
export const brickFront122=3.5,brickTop122=3.84,soffit122=4.38;
export const checkInShift122=-1.5;

export function buildGallery122({box,rod,quad,material,brick,steel,silver,dark,black,lens,invisible}){
 const white=material('122 pearl white wall panels',[.78,.80,.79,1],.12,.62,{extras:{surfaceType:16}});
 const warm=material('122 warm balcony soffit',[.77,.75,.66,1],.08,.65,{emissiveFactor:[.045,.036,.02],extras:{surfaceType:16}});
 const joint=material('122 fine panel joints',[.47,.49,.48,1],0,.8);
 const seat=material('122 charcoal woven balcony chairs',[.10,.12,.13,1],.08,.85);
 const top=material('122 balcony table tops',[.22,.24,.23,1],.1,.55);
 const wall=(name,a,b,c,d,mat)=>quad('122 '+name,a,b,c,d,mat,[a[2]/.4,a[1]/.4,b[2]/.4,b[1]/.4,c[2]/.4,c[1]/.4,d[2]/.4,d[1]/.4]);
 // The white wedge and brick plinth share their bay limits, with an open
 // seating storey between them. Door recesses retain the original thresholds.
 box('122 upper recessed wall',[4.965,6.685,.15],[.03,7.33,58.5],white);
 box('122 balcony rear warm wall',[4.938,3.7,.15],[.012,1.34,58.5],warm);
 for(const [a,b] of exhibitBays122){
  const id='bay '+a,lo=.24,hi=3.027,back=4.98,front=brickFront122,upper=brickTop122;
  const faces=[
   [[front,lo,a],[front,lo,b],[upper,hi,b],[upper,hi,a]],
   [[front,lo,a],[upper,hi,a],[back,hi,a],[back,lo,a]],
   [[front,lo,b],[back,lo,b],[back,hi,b],[upper,hi,b]],
   [[upper,hi,a],[upper,hi,b],[back,hi,b],[back,hi,a]],
   [[back,lo,a],[back,hi,a],[back,hi,b],[back,lo,b]]
  ];
  for(let i=0;i<faces.length;i++){
   if(i===3)continue; // The existing balcony slab supplies this top surface.
   const f=faces[i];
   if(i===1||i===2)quad('122 '+id+' brick return',...f,brick,f.flatMap(p=>[p[0]/.4,p[1]/.4]));
   else wall(id+' brick '+(i===0?'front':'cap'),...f,brick);
   quad('122 '+id+' solid contact',...f,invisible);
  }
  const baseX=y=>front+(upper-front)*(y-lo)/(hi-lo)-.008;
  wall(id+' black plinth',[baseX(lo),lo,a],[baseX(lo),lo,b],[baseX(.38),.38,b],[baseX(.38),.38,a],black);
  for(const z of[a,b])box('122 '+id+' return plinth',[(front+back)/2,.31,z],[back-front,.14,.018],black);
  const bottom=3.48,roofX=4.90,roofY=10.34,frontX=y=>bottom+(roofX-bottom)*(y-soffit122)/(roofY-soffit122);
  wall(id+' white inclined face',[bottom,soffit122,a],[bottom,soffit122,b],[roofX,roofY,b],[roofX,roofY,a],white);
  for(const z of[a,b])quad('122 '+id+' triangular white return',[bottom,soffit122,z],[back,soffit122,z],[back,roofY,z],[roofX,roofY,z],white);
  for(let z=a+2.25;z<b-.15;z+=2.25)rod('122 '+id+' vertical panel joints',[bottom-.004,soffit122,z],[roofX-.004,roofY,z],.003,joint,4);
  for(const y of[6.35,8.35])rod('122 '+id+' horizontal panel joints',[frontX(y)-.004,y,a],[frontX(y)-.004,y,b],.003,joint,4);
  box('122 '+id+' illuminated soffit',[(bottom+back)/2,soffit122-.018,(a+b)/2],[back-bottom,.036,b-a],warm);
  for(let z=a+.3;z<b;z+=.3)box('122 '+id+' soffit grid',[(bottom+back)/2,soffit122-.039,z],[back-bottom,.004,.006],joint);
  for(let x=bottom+.3;x<back;x+=.3)box('122 '+id+' soffit grid',[x,soffit122-.039,(a+b)/2],[.006,.004,b-a],joint);
  rod('122 '+id+' lighting track',[bottom+.16,soffit122-.07,a+.15],[bottom+.16,soffit122-.07,b-.15],.009,silver);
  for(let z=a+.55;z<b-.25;z+=1.15){
   rod('122 '+id+' recessed light trim',[4.18,soffit122-.04,z],[4.18,soffit122-.055,z],.060,silver,16);
   rod('122 '+id+' recessed light lens',[4.18,soffit122-.056,z],[4.18,soffit122-.061,z],.047,lens,16);
  }
  for(let z=a+.28;z<b-.15;z+=.4){
   rod('122 '+id+' track stems',[bottom+.16,soffit122-.07,z],[bottom+.16,soffit122-.12,z],.006,silver);
   rod('122 '+id+' track heads',[bottom+.17,soffit122-.12,z],[bottom+.21,soffit122-.145,z],.016,dark);
   rod('122 '+id+' track lenses',[bottom+.21,soffit122-.145,z],[bottom+.214,soffit122-.15,z],.013,lens);
  }
  for(let z=a+.8;z<b-.65;z+=1.7){
   box('122 balcony cafe table',[4.54,3.34,z],[.48,.026,.56],top);
   rod('122 balcony table pedestal',[4.54,3.04,z],[4.54,3.33,z],.022,silver);
   box('122 balcony table foot',[4.54,3.045,z],[.26,.022,.30],dark);
   for(const side of[-1,1]){
    const cz=z+side*.43;
    box('122 balcony chair seat',[4.54,3.21,cz],[.22,.022,.23],seat);
    box('122 balcony chair back',[4.54,3.33,cz+side*.105],[.22,.23,.022],seat);
    for(const dx of[-.085,.085])for(const dz of[-.085,.085])rod('122 balcony chair legs',[4.54+dx,3.04,cz+dz],[4.54+dx,3.2,cz+dz],.008,silver,6);
   }
  }
 }
 // A shorter terminal wall completes the river end without adding a fourth bay.
 wall('terminal brick wall',[4.967,.24,-28.8],[4.967,.24,-20.1],[4.967,2.80,-20.1],[4.967,2.80,-28.8],brick);
 box('122 terminal wall base',[4.95,.33,-24.45],[.035,.18,8.7],black);
 for(const [a,b]of exhibitDoors122){
  wall('recessed entrance brick header',[4.96,2.04,a],[4.96,2.04,b],[4.96,2.81,b],[4.96,2.81,a],brick);
  box('122 recessed entrance soffit',[4.4,2.875,(a+b)/2],[1.1,.014,b-a],warm);
  for(let z=a+.3;z<b;z+=.3)box('122 entrance soffit grid',[4.4,2.864,z],[1.1,.005,.007],joint);
  for(const z of[a+.7,(a+b)/2,b-.7])rod('122 entrance recessed lights',[4.35,2.865,z],[4.35,2.846,z],.045,lens,12);
  for(let y=2.15;y<2.44;y+=.045)box('122 entrance ventilation louvers',[4.94,y,(a+b)/2],[.025,.018,b-a-.08],dark);
  for(const z of[a+.02,b-.02])box('122 entrance jamb',[4.94,1.13,z],[.06,1.78,.045],steel);
 }
 // Existing clear guard panels and their collision remain at the balcony edge.
 box('122 balcony continuous fascia',[3.825,2.947,.15],[.045,.16,58.5],steel);
 rod('122 balcony stainless handrail',[3.81,3.505,-29.1],[3.81,3.505,31.15],.025,silver,10);
}
