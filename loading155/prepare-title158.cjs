const sharp=require('sharp'),path=require('node:path'),assert=require('node:assert/strict');
const source=process.argv[2];
if(!source)throw Error('Pass the original loading-title screenshot path.');
(async()=>{
 const {data,info}=await sharp(source).removeAlpha().raw().toBuffer({resolveWithObject:true});
 const rgba=Buffer.alloc(info.width*info.height*4);
 let clear=0,solid=0;
 // The supplied navy backdrop is below 60; the logo's white, blue and red are brighter.
 for(let i=0;i<info.width*info.height;i++){
  const r=data[i*3],g=data[i*3+1],b=data[i*3+2],t=Math.max(0,Math.min(1,(Math.max(r,g,b)-60)/40));
  const alpha=Math.round(255*t*t*(3-2*t));
  rgba[i*4]=alpha?r:0;rgba[i*4+1]=alpha?g:0;rgba[i*4+2]=alpha?b:0;rgba[i*4+3]=alpha;
  if(alpha===0)clear++;if(alpha===255)solid++;
 }
 assert(clear>info.width*info.height*.5&&solid>info.width*info.height*.1,'expected transparent backdrop and intact lettering');
 const output=path.join(__dirname,'title158.png');
 await sharp(rgba,{raw:{width:info.width,height:info.height,channels:4}}).png({compressionLevel:9}).toFile(output);
 console.log(JSON.stringify({output,width:info.width,height:info.height,transparentPixels:clear,opaquePixels:solid}));
})().catch(e=>{console.error(e);process.exitCode=1;});
