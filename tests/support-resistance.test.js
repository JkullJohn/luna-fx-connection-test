"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {detect}=require("../support-resistance.js");
function make(values){
 return values.map((v,i)=>({open:v.close,high:v.high,low:v.low,close:v.close,epoch:i}));
}
test("groups nearby confirmed swing lows into a support zone",()=>{
 const c=make([
  {high:1.101,low:1.099,close:1.100},{high:1.102,low:1.098,close:1.100},{high:1.101,low:1.099,close:1.100},
  {high:1.103,low:1.100,close:1.102},{high:1.102,low:1.0991,close:1.101},{high:1.104,low:1.100,close:1.103},
  {high:1.103,low:1.0992,close:1.102},{high:1.105,low:1.101,close:1.104},{high:1.104,low:1.100,close:1.103}
 ]);
 const r=detect(c,{left:1,right:1,mergeDistance:0.0003});
 assert.ok(r.support.length>0);
 assert.equal(r.support[0].type,"Support");
 assert.ok(r.support[0].touches>=2);
 assert.equal(r.support[0].strength,"Moderate");
});
test("classifies resistance above the latest close",()=>{
 const c=make([
  {high:1.101,low:1.099,close:1.100},{high:1.104,low:1.100,close:1.102},{high:1.102,low:1.100,close:1.101},
  {high:1.105,low:1.101,close:1.103},{high:1.103,low:1.100,close:1.102},{high:1.106,low:1.101,close:1.104},
  {high:1.102,low:1.100,close:1.101}
 ]);
 const r=detect(c,{left:1,right:1});
 assert.ok(r.resistance.every(z=>z.mid>=1.101));
});
test("returns empty zones when there are not enough confirmed pivots",()=>{
 const r=detect(make([{high:1.1,low:1.09,close:1.095},{high:1.101,low:1.091,close:1.096}]),{left:1,right:1});
 assert.deepEqual(r.support,[]);
 assert.deepEqual(r.resistance,[]);
});
test("rejects malformed candles and invalid options",()=>{
 assert.throws(()=>detect("bad"),TypeError);
 assert.throws(()=>detect([{open:2,high:1,low:0,close:1}]),TypeError);
 assert.throws(()=>detect([],{left:0}),TypeError);
});
