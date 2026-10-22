export const builds=[
 {id:'original',name:'My First Build',finish:'White / rainbow',cooling:'Liquid cooling',color:0xf3f4f6,light:0x55deee},
 {id:'aurora',name:'Aurora Loop',finish:'Black / cyan + green',cooling:'Panoramic liquid cooling',color:0x24292e,light:0x33dfff,second:0x6fff38,panorama:true,mascot:true},
 {id:'polar',name:'Polar Night',finish:'Black / ice white',cooling:'Dual-tower air cooling',color:0x24272c,light:0xc5eaff,air:true,panorama:true},
 {id:'ember',name:'Ember Core',finish:'Graphite / amber + blue',cooling:'Screened liquid cooling',color:0x242428,light:0xffac35,second:0x6862ff,solidFront:true},
 {id:'sunset',name:'Sunset Glass',finish:'Black / coral + magenta',cooling:'Panoramic liquid cooling',color:0x242428,light:0xff7445,second:0xff42a2,panorama:true},
 {id:'glacier',name:'Glacier White',finish:'White / frost',cooling:'White-sleeved liquid cooling',color:0xf0f3f5,light:0xd6f2ff,panorama:true,darkGPU:true},
 {id:'stealth',name:'Stealth Mesh',finish:'Graphite / subtle teal',cooling:'Mesh-front liquid cooling',color:0x303439,light:0x53bfae,mesh:true,quiet:true,darkGPU:true},
 {id:'gold',name:'Gold Edition',finish:'Black + gold / warm white',cooling:'Vertical GPU / liquid cooling',color:0x22272c,trim:0xe6b842,light:0xffe893,vertical:true,panorama:true},
 {id:'emerald',name:'Emerald Air',finish:'Black / green',cooling:'Mesh-front air cooling',color:0x292e33,light:0x39f87b,mesh:true,air:true,darkGPU:true},
 {id:'rose',name:'Rose Quartz',finish:'Pink / soft pink',cooling:'Display air cooler / vertical GPU',color:0xd97899,light:0xff9be9,vertical:true,air:true,airScreen:true,panorama:true},
 {id:'inferno',name:'Inferno Dashboard',finish:'Red + black / amber',cooling:'Front display / vertical GPU',color:0xb92327,light:0xffc238,second:0xff372e,vertical:true,panorama:true,dashboard:true,darkGPU:true}
];
export const collectionKey='micq.pc-builder66.collection.v1';
export function rewardState(saved){
 const valid=!!(saved?.unlocked&&saved?.certificate?.completed&&saved.certificate.phase==='complete');
 return {unlocked:valid,selected:valid&&builds.some(b=>b.id===saved.selected)?saved.selected:'original',certificate:valid?saved.certificate:null};
}
export function earnReward(reward,game){
 if(!game.state.completed||game.state.phase!=='complete')return false;
 const first=!reward.unlocked;reward.unlocked=true;reward.certificate=game.serialize();return first;
}
