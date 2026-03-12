function f(n,r,i){if(!n)return"";if(i==="ms"){const t=n[r+"_ms"];if(t!=null&&(Array.isArray(t)&&t.length>0||typeof t=="string"&&t.trim()))return t}return n[r]??""}export{f as t};
