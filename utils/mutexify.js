// https://github.com/mafintosh/mutexify
// https://github.com/mafintosh/queue-tick

const queueTick = (fn) => Promise.resolve().then(fn);
globalThis.mutexify=function(){var u=[],e=null,n=function(){e(i)},t=function(i){return e?u.push(i):(e=i,t.locked=!0,queueTick(n),0)};t.locked=!1;var i=function(n,i,c){e=null,t.locked=!1,u.length&&t(u.shift()),n&&n(i,c)};return t};
