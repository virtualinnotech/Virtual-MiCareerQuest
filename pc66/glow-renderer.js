import * as THREE from 'three';

// One scene render plus three small/fullscreen passes. No extra geometry render for glow.
export function glowRenderer(renderer){
 if(!renderer.extensions.has('EXT_color_buffer_float'))return {resize(){},render:(s,c)=>renderer.render(s,c),dispose(){}};
 const target=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,samples:2});
 const a=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,depthBuffer:false}),b=a.clone();
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1),quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2));scene.add(quad);
 const vertex='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
 const blur=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{inputMap:{value:null},direction:{value:new THREE.Vector2()},threshold:{value:0}},vertexShader:vertex,fragmentShader:`
  varying vec2 vUv;uniform sampler2D inputMap;uniform vec2 direction;uniform float threshold;
  vec3 sampleLight(vec2 uv){vec3 c=texture2D(inputMap,uv).rgb;float bright=max(c.r,max(c.g,c.b));return c*max(0.,bright-threshold)/max(bright,.0001);}
  void main(){vec3 c=sampleLight(vUv)*.227027;c+=(sampleLight(vUv+direction*1.384615)+sampleLight(vUv-direction*1.384615))*.316216;c+=(sampleLight(vUv+direction*3.230769)+sampleLight(vUv-direction*3.230769))*.070270;gl_FragColor=vec4(c,1.);}`});
 const composite=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{sceneMap:{value:target.texture},glowMap:{value:b.texture}},vertexShader:vertex,fragmentShader:`
  varying vec2 vUv;uniform sampler2D sceneMap;uniform sampler2D glowMap;
  void main(){gl_FragColor=vec4(texture2D(sceneMap,vUv).rgb+texture2D(glowMap,vUv).rgb*.35,1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  }`});
 return {resize(w,h){const ratio=renderer.getPixelRatio();target.setSize(Math.round(w*ratio),Math.round(h*ratio));a.setSize(Math.max(1,Math.round(w*ratio/4)),Math.max(1,Math.round(h*ratio/4)));b.setSize(a.width,a.height);},
  render(world,view){renderer.setRenderTarget(target);renderer.render(world,view);quad.material=blur;blur.uniforms.inputMap.value=target.texture;blur.uniforms.threshold.value=2.0;blur.uniforms.direction.value.set(1.8/a.width,0);renderer.setRenderTarget(a);renderer.render(scene,camera);blur.uniforms.inputMap.value=a.texture;blur.uniforms.threshold.value=0;blur.uniforms.direction.value.set(0,1.8/a.height);renderer.setRenderTarget(b);renderer.render(scene,camera);quad.material=composite;renderer.setRenderTarget(null);renderer.render(scene,camera);},
  dispose(){target.dispose();a.dispose();b.dispose();blur.dispose();composite.dispose();quad.geometry.dispose();}};
}
