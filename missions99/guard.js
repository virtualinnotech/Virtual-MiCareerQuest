// Register before gameplay capture listeners so modal input never reaches vehicles.
// Secret code: holding Shift+F+I+N together completes every mission, which
// unlocks the Segways, bikes, scooters and Rivian. Keys typed into a field never count.
const held162=new Set();window.addEventListener('blur',()=>held162.clear());
for(const type of ['keydown','keyup'])window.addEventListener(type,event=>{
 const typing=['INPUT','TEXTAREA','SELECT'].includes(event.target?.tagName)||event.target?.isContentEditable;
 if(type==='keyup'||typing)held162.delete(event.code);else held162.add(event.code);
 if(type==='keydown'&&!typing&&event.shiftKey&&!event.altKey&&!event.ctrlKey&&!event.metaKey&&['KeyF','KeyI','KeyN'].every(k=>held162.has(k))){held162.clear();event.preventDefault();event.stopImmediatePropagation();window.StudentRewards100?.cheat();return;}
 if(window.StudentRewards100?.active){if(type==='keydown'&&event.key==='Escape')StudentRewards100.close();event.stopImmediatePropagation();return;}
 // A booth video or link panel is open: keys belong to the panel (Esc closes it).
 if(window.BoothMedia162?.active){event.stopImmediatePropagation();return;}
 if(window.Rivian147?.handleKey(event,type))return;
 if(window.Hotel146?.handleKey(event,type))return;
 if(window.Hibachi145?.handleKey(event,type))return;
 if(window.Scooter100?.handleKey(event,type))return;
 if(!window.MissionUI99?.active)return;
 if(type==='keydown'&&event.key==='Escape'){event.preventDefault();MissionUI99.close();}
 event.stopImmediatePropagation();
},true);
