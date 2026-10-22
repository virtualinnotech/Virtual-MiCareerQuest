import assert from 'node:assert/strict';
import {brickFront122,brickTop122} from './gallery122.mjs';

export const sign124={centerZ:24.6,centerY:2.0,width:6.6,height:1.5,logoWidth:6.0};

export function buildSign124({html,json,append,material,quad}){
 const tag=html.match(/<img\b[^>]*\balt="MiCareerQuest"[^>]*>/)?.[0];
 const source=tag?.match(/src="data:image\/png;base64,([^"]+)"/)?.[1];
 assert(source,'The supplied MiCareerQuest logo must be present in the header.');
 const bytes=Buffer.from(source,'base64'),width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
 const image=json.images.length;json.images.push({name:'MiCareerQuest supplied logo 124',bufferView:append(bytes),mimeType:'image/png'});
 const sampler=json.samplers.length;json.samplers.push({wrapS:33071,wrapT:33071,minFilter:9987,magFilter:9729});
 const texture=json.textures.length;json.textures.push({source:image,sampler});
 const white=material('124 wall sign white backing',[.96,.96,.95,1],0,.68);
 const print=material('124 authentic MiCareerQuest logo',[1,1,1,1],0,1,{alphaMode:'BLEND',extensions:{KHR_materials_unlit:{}}});
 json.materials[print].pbrMetallicRoughness.baseColorTexture={index:texture};
 json.extensionsUsed=[...new Set([...(json.extensionsUsed||[]),'KHR_materials_unlit'])];
 const slope=(brickTop122-brickFront122)/(3.027-.24),scale=Math.hypot(1,slope);
 // Follow the inclined brick face, keeping the artwork's physical aspect ratio intact.
 function corners(w,h,offset){
  return [[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]].map(([z,v])=>{
   const y=sign124.centerY+v/scale;
   return [brickFront122+slope*(y-.24)-offset,y,sign124.centerZ+z];
  });
 }
 const front=corners(sign124.width,sign124.height,.055),back=corners(sign124.width,sign124.height,.012);
 quad('124 volunteer wall sign backing',...front,white);
 for(let i=0;i<4;i++){const next=(i+1)%4;quad('124 volunteer wall sign edges',front[i],back[i],back[next],front[next],white);}
 quad('124 volunteer wall sign logo',...corners(sign124.logoWidth,sign124.logoWidth*height/width,.058),print,[0,1,1,1,1,0,0,0]);
 return {...sign124,imageWidth:width,imageHeight:height,source:'header supplied PNG'};
}
