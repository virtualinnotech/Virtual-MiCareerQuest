const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),files=['venue-frame.html','studio-frame.html','MiCareerQuest-Ship-to-Venue-v13.html'];
for(const dir of ['missions99','robotics37','farming36','ambulance35','network40','mri42','welding43','drone44','pc66','visitors100','forklift34','crane39']){
 for(const file of fs.readdirSync(path.join(root,dir))){if(/\.(css|js)$/.test(file)&&!/(?:test|min|build|vendor)/.test(file))files.push(dir+'/'+file);}
}
let removed=0;
for(const file of files){
 const before=fs.readFileSync(path.join(root,file),'utf8');let result='',cursor=0,count=0;
 const re=/@media\s*([^{}]+)\{/g;let m;
 while((m=re.exec(before))){
  const max=m[1].match(/max-width\s*:\s*(\d+)px/);if(!max||Number(max[1])>800)continue;
  let depth=1,end=re.lastIndex,quote=null;
  for(;end<before.length&&depth;end++){const ch=before[end];if(quote){if(ch==='\\')end++;else if(ch===quote)quote=null;}else if(ch==='"'||ch==="'")quote=ch;else if(ch==='{')depth++;else if(ch==='}')depth--;}
  if(depth)throw Error('Unbalanced media rule: '+file);
  result+=before.slice(cursor,m.index);cursor=end;re.lastIndex=end;count++;
 }
 result+=before.slice(cursor);
 if(file==='venue-frame.html')result=result.replace(/#touchControls(?: button)?\{[^{}]*\}/g,'').replace('body.fitting #touchControls,','');
 if(result!==before){fs.writeFileSync(path.join(root,file),result);console.log(file+': removed '+count+' phone media rules');removed+=count;}
}
console.log('Removed '+removed+' phone-specific media rules. Desktop/adaptive hardware settings retained.');
