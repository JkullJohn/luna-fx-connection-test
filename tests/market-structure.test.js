"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {analyze}=require("../market-structure.js");
function candles(highs,lows,closes){return closes.map((close,i)=>({open:close,high:highs[i],low:lows[i],close:close,epoch:i}));}
test("detects confirmed higher highs and higher lows",()=>{const c=candles([2,3,2,4,3,5,4],[0,1,0.5,2,1.5,3,2.5],[1,2,1.5,3,2.5,4,3.5]);const r=analyze(c,{left:1,right:1});assert.equal(r.trend,"Bullish");assert.equal(r.highState,"Higher highs");assert.equal(r.lowState,"Higher lows");});
test("detects confirmed lower highs and lower lows",()=>{const c=candles([6,5,5.5,4,4.5,3,3.5],[4,3,3.5,2,2.5,1,1.5],[5,4,4.5,3,3.5,2,2.5]);const r=analyze(c,{left:1,right:1});assert.equal(r.trend,"Bearish");});
test("reports building when there are not enough confirmed swings",()=>{assert.equal(analyze(candles([2,3],[0,1],[1,2]),{left:1,right:1}).trend,"Building");});
test("reports mixed structure instead of forcing a trend",()=>{const c=candles([2,4,3,5,4,4.5,3],[0,1,0.5,2,1.5,2.5,1],[1,3,2,4,3,3.5,2]);assert.equal(analyze(c,{left:1,right:1}).trend,"Mixed");});
test("detects a bullish break of structure through the latest confirmed swing high",()=>{const c=candles([2,3,2,4,3,5,4,5.2],[0,1,0.5,2,1.5,3,2.5,3.5],[1,2,1.5,3,2.5,4,3.5,5.1]);const r=analyze(c,{left:1,right:1});assert.equal(r.lastEvent.type,"BOS");assert.equal(r.lastEvent.direction,"bullish");assert.equal(r.lastEvent.level,5);});
test("detects CHoCH when price closes through support against established bullish structure",()=>{const c=candles([2,3,2,4,3,5,4,5.5,4.5],[0,1,0.5,2,1.5,3,2.5,3.2,1.5],[1,2,1.5,3,2.5,4,3.5,3.8,2]);const r=analyze(c,{left:1,right:1});assert.equal(r.lastEvent.type,"CHoCH");assert.equal(r.lastEvent.direction,"bearish");assert.equal(r.lastEvent.level,3);});
test("rejects malformed OHLC data",()=>{assert.throws(()=>analyze([{open:2,high:1,low:0,close:1}]),TypeError);assert.throws(()=>analyze("not candles"),TypeError);assert.throws(()=>analyze([],{left:0}),TypeError);});
