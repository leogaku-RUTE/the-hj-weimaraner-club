'use strict';
/**
 * Reject broken iframe srcdoc HTML before deployment.
 * The two pedigrees are HTML-escaped documents embedded in a double-quoted
 * attribute. An unescaped " in CSS/JS closes srcdoc early and blanks the UI.
 */
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('index.html','utf8');
const escapeDecode = s => s.replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
let count = 0;
for (const family of [1,2]) {
  const startToken = '<iframe id="frame'+family+'"';
  const at = html.indexOf(startToken);
  if(at<0) throw Error('Family '+family+': missing iframe');
  const attr = html.indexOf('srcdoc="',at);
  if(attr<0) throw Error('Family '+family+': missing srcdoc');
  const start = attr + 8;
  const close = html.indexOf('"',start);
  const expected = html.indexOf('" title="',start);
  if(close<0 || expected<0 || close!==expected) {
    throw Error('Family '+family+': UNESCAPED double quote inside srcdoc. Use &quot; inside all embedded CSS/JS.');
  }
  const encoded = html.slice(start,close);
  if(!encoded.startsWith('&lt;!DOCTYPE html&gt;')) throw Error('Family '+family+': incomplete srcdoc DOCTYPE');
  const decoded = escapeDecode(encoded);
  for(const required of ['<html','<head>','</head>','<body>','</body>','</html>','id="canvas"','id="nodes"','id="edges"']) {
    if(!decoded.includes(required)) throw Error('Family '+family+': missing '+required);
  }
  const scripts = [...decoded.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
  if(scripts.length<5) throw Error('Family '+family+': expected scripts, got '+scripts.length);
  for(const [i,m] of scripts.entries()) {
    try { new vm.Script(m[1],{filename:'family'+family+'-script'+i+'.js'}); }
    catch(e) { throw Error('Family '+family+' JavaScript '+i+' invalid: '+e.message); }
  }
  count++;
  console.log('Family '+family+': intact srcdoc ('+encoded.length+' chars), '+scripts.length+' scripts parsed');
}
if(count!==2) throw Error('Expected two pedigrees');
console.log('PASS: both family pedigree HTML documents validated.');
