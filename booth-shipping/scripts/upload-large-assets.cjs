// Uploads the game files listed in public/.assetsignore (too big for
// Cloudflare static assets) to R2 under static/<path>, where src/index.js
// serves them. Runs after the design page upload (package.json).
// usage: node scripts/upload-large-assets.cjs --remote|--local
const {execFileSync}=require('node:child_process'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),pub=path.join(root,'public'),mode=process.argv.includes('--local')?'--local':'--remote';
const list=fs.readFileSync(path.join(pub,'.assetsignore'),'utf8').split('\n').map(l=>l.trim()).filter(l=>l&&!l.startsWith('#'));
for(const rel of list){
 const file=path.join(pub,rel);
 if(!fs.existsSync(file)){console.log('Not present, skipped:',rel);continue;}
 console.log('Uploading',rel,(fs.statSync(file).size/1048576).toFixed(1)+' MB');
 execFileSync('npx',['wrangler','r2','object','put','micareerquest-booths/static/'+rel,'--file='+file,mode],{stdio:'inherit',cwd:root});
}
