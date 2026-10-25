import test from 'node:test';
import assert from 'node:assert/strict';
import {STATIONS,routeLength} from '../core.mjs?v=5';
import {BUS_ROUTE,BUS_STOPS,createMetroJourney,stepMetro,boardMetro,alightMetro,createBusService,requestBus,stepBus,boardBus,alightBus,busPosition} from '../transport.mjs?v=5';
function tick(fn,state,seconds,dt=.05){for(let t=0;t<seconds;t+=dt)fn(state,Math.min(dt,seconds-t))}
test('metro arrives before doors open and only boards through fully open doors',()=>{
 const j=createMetroJourney(STATIONS[0],STATIONS[1],1);assert(j);assert.equal(j.doors,0);assert(!boardMetro(j));tick(stepMetro,j,4);assert(j.arrivingOffset>0);assert.equal(j.phase,'approach');assert.equal(j.doors,0);tick(stepMetro,j,2.2);assert.equal(j.phase,'boarding');assert.equal(j.doors,1);assert(boardMetro(j));assert.equal(j.phase,'closing');assert.equal(j.distance,0);stepMetro(j,.25);assert.equal(j.distance,0);assert(j.doors>0);tick(stepMetro,j,1);assert.equal(j.phase,'riding');assert.equal(j.doors,0);
});
test('metro stops and opens doors before allowing passengers onto destination platform',()=>{
 const j=createMetroJourney(STATIONS[1],STATIONS[2],2);tick(stepMetro,j,6.2);boardMetro(j);tick(stepMetro,j,1.2);assert(!alightMetro(j));tick(stepMetro,j,10);assert.equal(j.phase,'alighting');assert.equal(j.distance,j.total);assert.equal(j.doors,1);assert(alightMetro(j));assert.equal(j.phase,'exit');assert.equal(j.platformX,4);
});
test('invalid metro route does not start a journey',()=>{assert.equal(createMetroJourney(STATIONS[0],STATIONS[2],1),null)});
test('waiting at each stop dispatches a bus which reaches its own exact docking point',()=>{
 for(let i=0;i<4;i++){const b=createBusService(i);assert.equal(b.phase,'idle');assert(requestBus(b));assert(!requestBus(b));assert(!boardBus(b));let time=0;while(b.phase!=='dwell'&&time<20){stepBus(b,.05);time+=.05}assert(time<20);assert.equal(b.phase,'dwell');assert.equal(b.target,i);const p=busPosition(b);assert(Math.abs(p.x-BUS_STOPS[i].dockX)<.001);assert(Math.abs(p.z-BUS_STOPS[i].dockZ)<.001);assert.equal(b.speed,0);assert(!boardBus(b));tick(stepBus,b,1);assert(boardBus(b));assert(b.passenger)}
});
test('bus closes doors before moving, stops at next stop, then lets passenger get off',()=>{
 const b=createBusService(1);requestBus(b);while(b.phase!=='dwell')stepBus(b,.05);tick(stepBus,b,1);assert(boardBus(b));tick(stepBus,b,9);assert.equal(b.phase,'moving');assert.equal(b.target,2);assert(!alightBus(b));let time=0;while(b.phase!=='dwell'&&time<90){stepBus(b,.05);if(b.doors>0)assert.equal(b.speed,0);time+=.05}assert(time<90);assert.equal(b.target,2);tick(stepBus,b,1);assert(alightBus(b));assert.equal(b.passenger,false);
});
test('unboarded bus departs and returns to idle rather than blocking the stop forever',()=>{
 const b=createBusService(3);requestBus(b);tick(stepBus,b,30);assert.equal(b.phase,'idle');assert.equal(b.speed,0);assert(requestBus(b));
});
test('all bus stops lie on the route, including its wraparound segment',()=>{
 assert(routeLength(BUS_ROUTE)>1000);for(let i=0;i<4;i++){const b=createBusService(i);b.distance=BUS_STOPS[i].distance;const p=busPosition(b);assert.equal(p.x,BUS_STOPS[i].dockX);assert.equal(p.z,BUS_STOPS[i].dockZ)}
});
