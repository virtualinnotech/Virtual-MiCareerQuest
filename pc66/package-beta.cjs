const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process'),esbuild=require('esbuild');
const root=__dirname,out=path.resolve(root,'../../deliverables/PC Build Challenge Beta'),zip=path.resolve(out,'../PC-Build-Challenge-Beta.zip');
const data=(file,type='application/octet-stream')=>'data:'+type+';base64,'+fs.readFileSync(file).toString('base64');
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const decoder=Object.fromEntries(['draco_wasm_wrapper.js','draco_decoder.wasm'].map(n=>[n,data(path.join(root,'vendor/draco',n))]));
 await esbuild.build({entryPoints:[path.join(root,'app.js')],bundle:true,format:'iife',minify:true,target:'es2020',outfile:path.join(out,'challenge.js'),banner:{js:'window.PCStandalone91=true;'},plugins:[{
  name:'local-offline-assets',
  setup(build){
   build.onResolve({filter:/.*/},args=>{
    const name=args.path.split('?')[0];
    if(name==='three')return {path:path.join(root,'vendor/three/three.module.js')};
    if(name.startsWith('three/addons/'))return {path:path.join(root,'vendor/three/addons',name.slice(13))};
    if(name.startsWith('.'))return {path:path.resolve(args.resolveDir,name)};
   });
   build.onLoad({filter:/\.js$/},args=>{
    let contents=fs.readFileSync(args.path,'utf8');
    if(['scene.js','race.js'].includes(path.basename(args.path)))contents=contents.replace(/(['"])\.\/models\/([^'"]+)\1/g,(_,q,name)=>JSON.stringify(data(path.join(root,'models',name))));
    if(path.basename(args.path)==='DRACOLoader.js')contents=contents.replace('loader.setPath( this.decoderPath );','url = '+JSON.stringify(decoder)+'[url] || url;');
    return {contents,loader:'js'};
   });
  }
 }]});
 let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 html=html.replace(/<script type="importmap">[\s\S]*?<\/script>/,'').replace(/<link rel="stylesheet" href="([^"?]+)[^"]*">/g,(_,name)=>'<style>'+fs.readFileSync(path.join(root,name),'utf8')+'</style>');
 html=html.replace('<script src="../ambulance35/vendor/matter.min.js"></script>','<script src="physics.js"></script>').replace(/<script type="module" src="app.js[^"]*"><\/script>/,'<script src="challenge.js"></script>');
 html=html.replace('title="Return to IT department" aria-label="Return to IT department"','title="Reset view" aria-label="Reset view"');
 fs.writeFileSync(path.join(out,'START HERE.html'),html);
 fs.copyFileSync(path.join(root,'../ambulance35/vendor/matter.min.js'),path.join(out,'physics.js'));
 for(const folder of ['pictures','icons'])fs.cpSync(path.join(root,folder),path.join(out,folder),{recursive:true});
 fs.mkdirSync(path.join(out,'Credits'),{recursive:true});
 fs.copyFileSync(path.join(root,'vendor/three/LICENSE'),path.join(out,'Credits/Three.js LICENSE.txt'));
 fs.copyFileSync(path.join(root,'icons/LICENSE'),path.join(out,'Credits/Lucide LICENSE.txt'));
 for(const name of ['Matter-LICENSE.txt','Draco-LICENSE.txt'])fs.copyFileSync(path.join(root,name),path.join(out,'Credits',name));
 fs.copyFileSync(path.join(root,'models/race/CREDITS.txt'),path.join(out,'Credits/Racing assets.txt'));
 fs.writeFileSync(path.join(out,'READ ME.txt'),'PC BUILD CHALLENGE - BETA\n\n1. Unzip the entire folder.\n2. Double-click START HERE.html.\n\nNo installation, server, account or internet connection is required to play.\nUse a current desktop browser with WebGL 2 enabled, such as Chrome or Edge.\nKeep challenge.js, physics.js, pictures and icons next to START HERE.html.\n\nIncludes the hardware lessons, complete assembly, startup checks, unlocked PC collection, rotating glass display reward and racing game. The full career-fair venue is intentionally excluded.\n\nProgress is saved in this browser when local-file storage is available. Moving the folder, using private browsing or switching browsers may start a fresh save.\n\nBeta feedback: note your browser, the build step, what you expected, what happened and a screenshot. The build sheet contains component notes and source links; opening those optional links requires internet access.\n\nTraining simulation only. Model details and compatibility notes are illustrative, not a real PC assembly manual.\n');
 if(fs.existsSync(zip))fs.unlinkSync(zip);
 execFileSync('/usr/bin/zip',['-qr',zip,path.basename(out)],{cwd:path.dirname(out)});
 console.log(JSON.stringify({folder:out,zip,bytes:fs.statSync(zip).size}));
})().catch(e=>{console.error(e);process.exitCode=1;});
