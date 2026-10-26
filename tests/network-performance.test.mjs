import test from 'node:test';import assert from 'node:assert/strict';
import {interestRows,simulationNearby,simulationDue,angleStep} from '../network-performance.mjs';
test('four separated players each keep nearby actors under a bounded shared budget',()=>{
 const centers=[0,1000,2000,3000].map(x=>({x,y:0,z:0})),rows=centers.flatMap((c,k)=>Array.from({length:100},(_,i)=>[k*100+i,c.x+i,0,0]));
 const selected=interestRows(rows,centers);assert.equal(selected.length,128);for(let k=0;k<4;k++)assert(selected.some(r=>r[0]===k*100));assert.equal(new Set(selected.map(r=>r[0])).size,selected.length);
});
test('far occupied aircraft stay synchronized and nearby interest returns after travel',()=>{
 const rows=[[0,0,0,0],[1,1000,150,0],[2,2000,0,0]];assert.deepEqual(interestRows(rows,[{x:0,y:0,z:0}],1,320,r=>r[0]===1).map(r=>r[0]),[0,1]);assert.deepEqual(interestRows(rows,[{x:2000,y:0,z:0}],1).map(r=>r[0]),[2]);
 assert(simulationNearby({x:1100,z:0},[{x:1000,y:0,z:0}]));assert(!simulationNearby({x:1800,z:0},[{x:1000,y:0,z:0}]));assert(simulationNearby({x:1800,z:0},[{x:1000,y:100,z:0}]));
});
test('traffic steps at ten hertz without a long catch-up stall',()=>{const state={};let count=0,time=0;for(let i=0;i<60;i++){const dt=simulationDue(state,1/60);if(dt){count++;time+=dt}}assert(count>=8&&count<=10);assert(time>.85&&time<=1.01);assert.equal(simulationDue(state,5),.25)});
test('vehicle yaw interpolation takes the short path across north',()=>{const result=angleStep(Math.PI-.01,-Math.PI+.01,.5);assert(Math.abs(result-Math.PI)<1e-9)});
