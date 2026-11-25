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
  var highState=classify(highs,"Higher highs","Lower highs");
  var lowState=classify(lows,"Higher lows","Lower lows");
  var trend=highState==="Higher highs"&&lowState==="Higher lows"?"Bullish":
   highState==="Lower highs"&&lowState==="Lower lows"?"Bearish":
   highState==="Building"||lowState==="Building"?"Building":"Mixed";
  var lastEvent=null,bias=trend==="Bullish"?"bullish":trend==="Bearish"?"bearish":null;
  var levels=[];
  highs.forEach(function(p){levels.push({type:"high",point:p})});
  lows.forEach(function(p){levels.push({type:"low",point:p})});
  levels.sort(function(a,b){return a.point.index-b.point.index});
  var used={};
  for(var k=0;k<candles.length;k++){
   var previous=k?candles[k-1].close:null,current=candles[k].close;
   for(var m=0;m<levels.length;m++){
    var item=levels[m],key=item.type+":"+item.point.index;
    if(item.point.index>=k||used[key])continue;
    var crossedUp=item.type==="high"&&previous!==null&&previous<=item.point.price&&current>item.point.price;
    var crossedDown=item.type==="low"&&previous!==null&&previous>=item.point.price&&current<item.point.price;
    if(!crossedUp&&!crossedDown)continue;
    var direction=crossedUp?"bullish":"bearish";
    var eventType=bias&&bias!==direction?"CHoCH":"BOS";
    lastEvent={type:eventType,direction:direction,level:item.point.price,index:k,epoch:candles[k].epoch,brokenSwing:item.type};
    bias=direction;used[key]=true;
   }
  }
  return {
   trend:trend,highState:highState,lowState:lowState,
   swingHighs:highs.slice(-2),swingLows:lows.slice(-2),
   support:lows.length?lows[lows.length-1].price:null,
   resistance:highs.length?highs[highs.length-1].price:null,
   lastEvent:lastEvent,confirmedSwingCount:{highs:highs.length,lows:lows.length},
   method:{left:left,right:right,tolerance:tolerance}
  };
 }
 return {analyze:analyze};
});
