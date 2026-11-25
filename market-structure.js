(function(root,factory){
 if(typeof module==="object"&&module.exports){module.exports=factory()}
 else{root.LunaMarketStructure=factory()}
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 function analyze(candles,options){
  options=options||{};
  var left=Number.isInteger(options.left)?options.left:2;
  var right=Number.isInteger(options.right)?options.right:2;
  var tolerance=Number.isFinite(options.tolerance)?Math.max(0,options.tolerance):0;
  if(!Array.isArray(candles))throw new TypeError("Market structure expects an array of candles");
  if(left<1||right<1)throw new TypeError("Swing confirmation windows must be positive integers");
  candles.forEach(function(c){
   if(!c||![c.open,c.high,c.low,c.close].every(Number.isFinite)||c.high<c.low||c.high<c.open||c.high<c.close||c.low>c.open||c.low>c.close)
    throw new TypeError("Candles must contain valid finite OHLC values");
  });
  var highs=[],lows=[];
  for(var i=left;i<candles.length-right;i++){
   var high=true,low=true;
   for(var j=i-left;j<=i+right;j++){
    if(j===i)continue;
    if(candles[j].high>=candles[i].high-tolerance)high=false;
    if(candles[j].low<=candles[i].low+tolerance)low=false;
   }
   if(high)highs.push({index:i,price:candles[i].high,epoch:candles[i].epoch});
   if(low)lows.push({index:i,price:candles[i].low,epoch:candles[i].epoch});
  }
  function classify(points,up,down){
   if(points.length<2)return "Building";
   var a=points[points.length-2].price,b=points[points.length-1].price;
   if(b>a+tolerance)return up;
   if(b<a-tolerance)return down;
   return "Equal";
  }
  function trendAt(index){
   var h=highs.filter(function(p){return p.index<index}),l=lows.filter(function(p){return p.index<index});
   var hs=classify(h,"Higher highs","Lower highs"),ls=classify(l,"Higher lows","Lower lows");
   return hs==="Higher highs"&&ls==="Higher lows"?"bullish":hs==="Lower highs"&&ls==="Lower lows"?"bearish":null;
  }
  var highState=classify(highs,"Higher highs","Lower highs"),lowState=classify(lows,"Higher lows","Lower lows");
  var trend=highState==="Higher highs"&&lowState==="Higher lows"?"Bullish":highState==="Lower highs"&&lowState==="Lower lows"?"Bearish":highState==="Building"||lowState==="Building"?"Building":"Mixed";
  var lastEvent=null,used={};
  for(var k=1;k<candles.length;k++){
   var availableHighs=highs.filter(function(p){return p.index<k&&!used["high:"+p.index]});
   var availableLows=lows.filter(function(p){return p.index<k&&!used["low:"+p.index]});
   var swingHigh=availableHighs[availableHighs.length-1],swingLow=availableLows[availableLows.length-1];
   var previous=candles[k-1].close,current=candles[k].close;
   var crossedUp=swingHigh&&previous<=swingHigh.price&&current>swingHigh.price;
   var crossedDown=swingLow&&previous>=swingLow.price&&current<swingLow.price;
   if(!crossedUp&&!crossedDown)continue;
   var direction=crossedUp?"bullish":"bearish",level=crossedUp?swingHigh:swingLow;
   var priorBias=trendAt(k),eventType=priorBias&&priorBias!==direction?"CHoCH":"BOS";
   lastEvent={type:eventType,direction:direction,level:level.price,index:k,epoch:candles[k].epoch,brokenSwing:crossedUp?"high":"low"};
   used[(crossedUp?"high:":"low:")+level.index]=true;
  }
  return {trend:trend,highState:highState,lowState:lowState,swingHighs:highs.slice(-2),swingLows:lows.slice(-2),support:lows.length?lows[lows.length-1].price:null,resistance:highs.length?highs[highs.length-1].price:null,lastEvent:lastEvent,confirmedSwingCount:{highs:highs.length,lows:lows.length},method:{left:left,right:right,tolerance:tolerance}};
 }
 return {analyze:analyze};
});
