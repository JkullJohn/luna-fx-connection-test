(function(root,factory){
 if(typeof module==="object"&&module.exports){module.exports=factory()}
 else{root.LunaZones=factory()}
})(typeof globalThis!=="undefined"?globalThis:this,function(){
 "use strict";
 function detect(candles,options){
  options=options||{};
  var left=Number.isInteger(options.left)?options.left:2;
  var right=Number.isInteger(options.right)?options.right:2;
  var lookback=Number.isInteger(options.lookback)?options.lookback:120;
  var mergeDistance=Number.isFinite(options.mergeDistance)?options.mergeDistance:0.00025;
  var maxZones=Number.isInteger(options.maxZones)?options.maxZones:3;
  if(!Array.isArray(candles))throw new TypeError("Zone detection expects an array of candles");
  if(left<1||right<1||lookback<10||mergeDistance<=0||maxZones<1)throw new TypeError("Invalid zone detection options");
  candles.forEach(function(c){
   if(!c||![c.open,c.high,c.low,c.close].every(Number.isFinite)||c.high<c.low||c.high<c.open||c.high<c.close||c.low>c.open||c.low>c.close)
    throw new TypeError("Candles must contain valid finite OHLC values");
  });
  var start=Math.max(0,candles.length-lookback),pointsHigh=[],pointsLow=[],end=candles.length-right;
  for(var i=Math.max(start,left);i<end;i++){
   var high=true,low=true;
   for(var j=i-left;j<=i+right;j++){
    if(j===i)continue;
    if(candles[j].high>=candles[i].high)high=false;
    if(candles[j].low<=candles[i].low)low=false;
   }
   if(high)pointsHigh.push({price:candles[i].high,index:i,epoch:candles[i].epoch});
   if(low)pointsLow.push({price:candles[i].low,index:i,epoch:candles[i].epoch});
  }
  function cluster(points,kind){
   var groups=[];
   points.slice().sort(function(a,b){return a.price-b.price}).forEach(function(p){
    var group=null,best=Infinity;
    groups.forEach(function(g){var d=Math.abs(p.price-g.total/g.points.length);if(d<=mergeDistance&&d<best){best=d;group=g}});
    if(!group){group={points:[],total:0};groups.push(group)}
    group.points.push(p);group.total+=p.price;
   });
   var current=candles.length?candles[candles.length-1].close:null;
   return groups.map(function(g){
    var prices=g.points.map(function(p){return p.price}),low=Math.min.apply(null,prices),high=Math.max.apply(null,prices),mid=g.total/g.points.length;
    var distance=current===null?null:Math.abs(current-mid)/0.0001;
    return {type:kind,low:low,high:high,mid:mid,touches:g.points.length,strength:g.points.length>=3?"Strong":g.points.length===2?"Moderate":"Developing",distancePips:distance,lastTouchIndex:Math.max.apply(null,g.points.map(function(p){return p.index})),lastTouchEpoch:g.points.reduce(function(a,p){return p.index>=a.index?p:a},g.points[0]).epoch};
   }).filter(function(z){return current===null||(kind==="Support"?z.mid<=current:z.mid>=current)})
    .sort(function(a,b){return (a.distancePips||0)-(b.distancePips||0)}).slice(0,maxZones);
  }
  var support=cluster(pointsLow,"Support"),resistance=cluster(pointsHigh,"Resistance");
  return {support:support,resistance:resistance,candleCount:candles.length,lookback:Math.min(lookback,candles.length),method:{left:left,right:right,mergeDistance:mergeDistance}};
 }
 return {detect:detect};
});
