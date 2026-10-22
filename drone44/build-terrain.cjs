const path=require('node:path'),fs=require('node:fs'),esbuild=require('esbuild');
esbuild.buildSync({entryPoints:[path.join(__dirname,'terrain-surface-source.js')],bundle:true,format:'iife',minify:true,outfile:path.join(__dirname,'terrain-surface.js'),nodePaths:(process.env.NODE_PATH||'').split(path.delimiter).filter(Boolean)});
const packages=['polygon-clipping','earcut','robust-predicates','splaytree'],licenses=[];
for(const name of packages){
 let dir=path.dirname(require.resolve(name));
 while(!fs.existsSync(path.join(dir,'package.json'))&&dir!==path.dirname(dir))dir=path.dirname(dir);
 const file=['LICENSE','LICENSE.md','LICENSE.txt'].find(n=>fs.existsSync(path.join(dir,n)));
 if(file)licenses.push(name+'\n\n'+fs.readFileSync(path.join(dir,file),'utf8'));
}
fs.writeFileSync(path.join(__dirname,'terrain-surface-LICENSE.txt'),licenses.join('\n\n--------------------\n\n'));
