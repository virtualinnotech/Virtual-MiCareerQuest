const {mkdirSync,copyFileSync}=require('node:fs');
const path=require('node:path');
const source=path.resolve(__dirname,'../../forklift34');
const destination=path.resolve(__dirname,'../public/forklift34');
mkdirSync(destination,{recursive:true});
for(const file of ['forklift.js','forklift.glb'])copyFileSync(path.join(source,file),path.join(destination,file));
console.log('Forklift runtime and model copied into Cloudflare static assets.');
