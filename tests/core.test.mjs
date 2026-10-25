import test from 'node:test';
import assert from 'node:assert/strict';
import {STATIONS,WEAPONS,VEHICLE_TYPES,groundHeight,districtAt,moveBody,lineBlocked,damageVitals,transitRoute,routeLength,sampleRoute,chooseExit,vehicleStep,BRIDGES,HILLS,blockedAt} from '../core.mjs';

test('Seoul sectors sit north and south of Hangang',()=>{
 assert.equal(groundHeight(55,-100),32);assert.equal(groundHeight(200,200),0);
 assert.equal(districtAt(-200,-200),'강북 · 종로·도심');assert.equal(districtAt(200,-200),'강북 · 성동·광진');
 assert.equal(districtAt(-200,200),'강남권 · 여의도·서초');assert.equal(districtAt(200,200),'강남 · 삼성·잠실');
});
test('fast cars cannot pass through walls between frames',()=>{
 const wall=[{x:200,z:0,w:1,d:5,bottom:0,top:8}],p={x:195,z:0};
 assert(moveBody(p,20,0,wall));assert(p.x<199);
 assert(lineBlocked({x:197,y:1,z:0},{x:203,y:1,z:0},wall));
 assert(!lineBlocked({x:197,y:12,z:0},{x:203,y:12,z:0},wall));
});
test('Namsan also blocks gunfire',()=>{
 assert(lineBlocked({x:-10,y:2,z:-100},{x:90,y:2,z:-100},[]));
 assert(!lineBlocked({x:-10,y:90,z:-100},{x:90,y:90,z:-100},[]));
});
test('armor absorbs damage until its finite durability runs out',()=>{
 assert.deepEqual(damageVitals(100,100,20),{health:95,armor:85});
 assert.deepEqual(damageVitals(100,3,20),{health:83,armor:0});
 assert.deepEqual(damageVitals(5,0,20),{health:0,armor:0});
});
test('fictional game line 1 connects only the two Gangbuk stations',()=>{
 assert.equal(routeLength(transitRoute('industry','home',1)),440);
 assert.equal(transitRoute('market','home',1),null);
 assert.equal(transitRoute('base','industry',1),null);
});
test('fictional game line 2 connects both banks using axis-aligned tunnels',()=>{
 for(const a of STATIONS)for(const b of STATIONS){if(a===b)continue;const route=transitRoute(a.id,b.id,2);assert(route);const end=sampleRoute(route,routeLength(route));assert.equal(end.x,b.x);assert.equal(end.z,b.z);for(let i=1;i<route.length;i++)assert(route[i].x===route[i-1].x||route[i].z===route[i-1].z)}
});
test('all five vehicle types accelerate; all three aircraft can take off',()=>{
 for(const type of Object.keys(VEHICLE_TYPES)){const v={type,x:-350,z:250,y:0,yaw:0,speed:0};for(let i=0;i<300;i++)vehicleStep(v,{forward:1,steer:0,lift:1,brake:false},.02,[]);assert(v.speed>0);assert(v.speed<=VEHICLE_TYPES[type].speed);if(VEHICLE_TYPES[type].flying)assert(v.y>5);else assert.equal(v.y,0)}
});
test('helicopter hovers and cannot descend below the ground',()=>{
 const v={type:'helicopter',x:200,z:100,y:20,yaw:0,speed:0};vehicleStep(v,{forward:0,steer:0,lift:0},1,[]);assert.equal(v.y,20);vehicleStep(v,{forward:0,steer:0,lift:-1},10,[]);assert.equal(v.y,0);
});
test('safe disembarking finds an alternate side or refuses when surrounded',()=>{
 const v={x:200,z:200};const block=[{x:206,z:200,w:2,d:2,bottom:0,top:8}];const exit=chooseExit(v,block);assert(exit);assert.notEqual(exit.x,206);
 assert.equal(chooseExit(v,[{x:200,z:200,w:20,d:20,bottom:0,top:8}]),null);
});
test('weapon choices have distinct magazines, rates and ammunition budgets',()=>{
 assert.equal(new Set(WEAPONS.map(w=>w.mag)).size,4);assert(WEAPONS.every(w=>w.reserve>0&&w.reload>0));assert(WEAPONS[2].pellets>1);assert(WEAPONS[3].range>WEAPONS[0].range);
});

test('Hangang navigation keeps cars on bridges without blocking bullets over water',()=>{
 const water=[{x:120,z:0,w:108,d:42,bottom:-30,top:4,kind:'water'}];
 assert(blockedAt(120,0,.4,water));assert(!blockedAt(240,0,.4,water));assert(!lineBlocked({x:120,y:2,z:-60},{x:120,y:2,z:60},water));assert.equal(BRIDGES.length,3);assert.equal(HILLS.length,2);
});
