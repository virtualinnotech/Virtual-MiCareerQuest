(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else{
  root.ComputerOnly141=api;
  if(api.isHandheld(root.navigator)){
   root.stop();
   root.location.replace(new URL('./computer-required.html',document.baseURI).href);
  }
 }
})(globalThis,()=>{
 function isHandheld(device={}){
  const ua=device.userAgent||'';
  // Do not confuse a small desktop window or touchscreen Chromebook with a phone.
  if(/CrOS/i.test(ua)&&!/Android/i.test(ua))return false;
  return device.userAgentData?.mobile===true||/Android|iPhone|iPad|iPod|Windows Phone|IEMobile|Mobile|Silk\/|Kindle/i.test(ua)||(/Macintosh|MacIntel/i.test(ua+' '+(device.platform||''))&&device.maxTouchPoints>1);
 }
 return {isHandheld};
});
