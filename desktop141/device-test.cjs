const assert=require('node:assert/strict'),path=require('node:path'),Module=require('node:module'),D=require('./device.js');
for(const userAgent of ['Mozilla Android 14 Mobile','Mozilla iPhone OS 18','Mozilla iPad OS 18','Windows Phone 8.1; Windows NT 6.3'])assert(D.isHandheld({userAgent}));
for(const userAgent of ['Mozilla Windows NT 10.0','Mozilla Macintosh Intel Mac OS X','Mozilla X11 CrOS x86_64'])assert(!D.isHandheld({userAgent,maxTouchPoints:userAgent.includes('Macintosh')?0:10,width:390}));
assert(D.isHandheld({userAgent:'Mozilla Macintosh Intel Mac OS X',maxTouchPoints:5,platform:'MacIntel'}));
assert(D.isHandheld({userAgent:'unknown',userAgentData:{mobile:true}}));
const esbuild=require('../../work/pc91-tools/node_modules/esbuild');
const code=esbuild.buildSync({entryPoints:[path.join(__dirname,'../booth-shipping/src/index.js')],bundle:true,write:false,platform:'node',format:'cjs'}).outputFiles[0].text;
const m=new Module('worker141',module);m._compile(code,'worker141.cjs');
(async()=>{let reads=0;const env={BOOTHS:{get:async()=>{reads++;return {body:'<!doctype html><title>Desktop game</title>'};}}},ctx={waitUntil(){}};
 for(const route of ['/','/venue.html','/design.html']){const r=await m.exports.default.fetch(new Request('https://example.test'+route,{headers:{'user-agent':'Mozilla Android Mobile'}}),env,ctx);assert.equal(r.status,302);assert(r.headers.get('location').endsWith('/computer-required.html'));assert.equal(r.headers.get('cache-control'),'private, no-store');}
 assert.equal(reads,0,'phone requests must not fetch the large R2 game export');
 const desktop=await m.exports.default.fetch(new Request('https://example.test/venue.html',{headers:{'user-agent':'Mozilla X11 CrOS x86_64'}}),env,ctx);assert.equal(desktop.status,200);assert.equal(reads,1);
 console.log('PASS: handheld gate, touchscreen desktop/Chromebook support, phone route avoids R2 game download.');
})().catch(e=>{console.error(e);process.exitCode=1;});
