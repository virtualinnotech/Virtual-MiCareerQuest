const {chromium}=require('playwright'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1800,height:2400}});
  await page.goto('http://127.0.0.1:8014/city106/buildings125/assets.json');
  await page.setContent('<style>body{margin:0;background:#c4cbd0}canvas{display:block}span{position:absolute;font:16px Arial;background:white;padding:4px}</style><script type="importmap">{"imports":{"three":"/pc66/vendor/three/three.module.js"}}</script>');
  await page.evaluate(async far=>{
   const T=await import('three'),{GLTFLoader}=await import('/pc66/vendor/three/addons/loaders/GLTFLoader.js');
   const data=await new GLTFLoader().loadAsync('/city106/buildings125/buildings.glb');
   const r=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});r.setSize(1800,2400);document.body.append(r.domElement);r.setScissorTest(true);
   const nodes=data.scene.children.filter(n=>n.name.endsWith('far')===far);
   for(let i=0;i<nodes.length;i++){
    const n=nodes[i],scene=new T.Scene();scene.background=new T.Color('#c4cbd0');scene.add(n);scene.add(new T.HemisphereLight(0xeef6ff,0x665b4e,2));const light=new T.DirectionalLight(0xfff2db,3);light.position.set(30,80,40);scene.add(light);
    const b=new T.Box3().setFromObject(n),sz=b.getSize(new T.Vector3()),c=b.getCenter(new T.Vector3()),d=Math.max(sz.x,sz.y,sz.z)*1.6;
    const cam=new T.PerspectiveCamera(40,1,.01,2000);cam.position.copy(c).add(new T.Vector3(d*.6,d*.35,d));cam.lookAt(c);
    const x=i%6*300,y=Math.floor(i/6)*300;r.setViewport(x,2400-y-300,300,300);r.setScissor(x,2400-y-300,300,300);r.render(scene,cam);
    const label=document.createElement('span');label.style.left=x+'px';label.style.top=y+'px';label.textContent=n.name;document.body.append(label);
   }
  },process.argv.includes('--far'));
  await page.screenshot({path:path.resolve('../work/buildings125/contact'+(process.argv.includes('--far')?'-far':'')+'.png')});
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
