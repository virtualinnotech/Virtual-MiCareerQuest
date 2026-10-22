const fs=require('node:fs/promises'),path=require('node:path'),sharp=require('sharp');
const names=['Exhibit Hall','Front Entrance','Grand Gallery','Robotics','Ambulance','Crane','Farming','PC Lab','River Walk'];
(async()=>{
 const out=path.join(__dirname,'art');await fs.mkdir(out,{recursive:true});
 for(const name of names){
  const file=name.toLowerCase().replaceAll(' ','-')+'.webp';
  await sharp(path.join('/Users/mapettiforsd/Desktop/VMCQ Loading Photos',name+'.png')).resize({width:1920,withoutEnlargement:true}).webp({quality:90}).toFile(path.join(out,file));
  console.log(file,(await fs.stat(path.join(out,file))).size);
 }
})().catch(e=>{console.error(e);process.exitCode=1;});
