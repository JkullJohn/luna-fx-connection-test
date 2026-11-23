"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {ema,rsi}=require("../indicators.js");

test("EMA seeds with first close and applies standard smoothing",()=>{
 assert.deepEqual(ema([1,2,3],2),[1,1+2/3,1+2/3+ (1/3)*(2/3)]);
});
test("EMA returns an empty array for empty history",()=>assert.deepEqual(ema([],20),[]));
test("RSI returns null until a full lookback is available",()=>{
 assert.deepEqual(rsi([1,2,3],3),[null,null,null]);
});
test("RSI reports neutral 50 for a completely flat market",()=>{
 assert.deepEqual(rsi([5,5,5,5,5],2),[null,null,50,50,50]);
});
test("RSI reports 100 when gains exist without losses",()=>{
 assert.deepEqual(rsi([1,2,3,4],2),[null,null,100,100]);
});
test("RSI reports 0 when losses exist without gains",()=>{
 assert.deepEqual(rsi([4,3,2,1],2),[null,null,0,0]);
});
test("RSI uses Wilder smoothing after the initial average",()=>{
 const values=[1,2,1,2,1];
 const result=rsi(values,2);
 assert.equal(result.length,values.length);
 assert.ok(Math.abs(result[4]-100/3)<1e-8);
});
test("indicator functions reject invalid periods and non-finite inputs",()=>{
 assert.throws(()=>ema([1,2],0),TypeError);
 assert.throws(()=>rsi([1,2],1.5),TypeError);
 assert.throws(()=>ema([1,NaN],2),TypeError);
 assert.throws(()=>rsi([1,Infinity],1),TypeError);
});
