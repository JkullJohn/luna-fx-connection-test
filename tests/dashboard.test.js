"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const html = fs.readFileSync("index.html", "utf8");
const inlineScripts = [...html.matchAll(/<script(?:\\s[^>]*)?>([\\s\\S]*?)<\\/script>/g)]
  .map(match => match[1])
  .filter(source => source.trim());

test("dashboard inline JavaScript parses without syntax errors", () => {
  assert.ok(inlineScripts.length > 0, "expected an inline dashboard script");
  for (const source of inlineScripts) {
    assert.doesNotThrow(() => new vm.Script(source));
  }
});

test("dashboard refreshes M5, M15 and H1 histories every 60 seconds", () => {
  const source = inlineScripts.join("\\n");
  assert.match(
    source,
    /Refresh the independent M5, M15 and H1 histories[\\s\\S]*?setInterval\\(function\\(\\)\\{[\\s\\S]*?\\},60000\\);/
  );
  assert.match(source, /\\{g:300,id:5\\}/);
  assert.match(source, /\\{g:900,id:15\\}/);
  assert.match(source, /\\{g:3600,id:60\\}/);
  assert.match(source, /ticks_history:symbol,count:120,end:"latest",style:"candles",granularity:q\\.g,req_id:q\\.id/);
});
