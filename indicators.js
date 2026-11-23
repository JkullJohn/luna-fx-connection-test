(function(root,factory){
 if(typeof module==="object"&&module.exports){module.exports=factory()}
 else{root.LunaIndicators=factory()}
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 function ema(values,period){
  if(!Array.isArray(values)||!Number.isInteger(period)||period<1)throw new TypeError("EMA expects an array and a positive integer period");
  var out=[],k=2/(period+1),prev=null;
  values.forEach(function(v){
   if(!Number.isFinite(v))throw new TypeError("EMA values must be finite numbers");
   prev=prev===null?v:v*k+prev*(1-k);out.push(prev);
  });
  return out;
 }
 function rsi(values,period){
  if(!Array.isArray(values)||!Number.isInteger(period)||period<1)throw new TypeError("RSI expects an array and a positive integer period");
  if(values.some(function(v){return !Number.isFinite(v)}))throw new TypeError("RSI values must be finite numbers");
  var out=new Array(values.length).fill(null);
  if(values.length<=period)return out;
  var gain=0,loss=0,i;
  for(i=1;i<=period;i++){var d=values[i]-values[i-1];gain+=Math.max(d,0);loss+=Math.max(-d,0)}
  var ag=gain/period,al=loss/period;
  out[period]=al===0?(ag===0?50:100):100-100/(1+ag/al);
  for(i=period+1;i<values.length;i++){
   var diff=values[i]-values[i-1];
   ag=(ag*(period-1)+Math.max(diff,0))/period;
   al=(al*(period-1)+Math.max(-diff,0))/period;
   out[i]=al===0?(ag===0?50:100):100-100/(1+ag/al);
  }
  return out;
 }
 return {ema:ema,rsi:rsi};
});
