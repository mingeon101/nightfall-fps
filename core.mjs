// Pure simulation rules shared by the game and its regression checks.
export const LIMIT=425;
export const DISTRICTS=[
 {id:'jongno',name:'강북 · 종로·도심',x:-200,z:-220,color:'#d5ba80'},
 {id:'gangbuk',name:'강북 · 성동·광진',x:230,z:-220,color:'#8abbd3'},
 {id:'yeouido',name:'강남권 · 여의도·서초',x:-230,z:220,color:'#a8c890'},
 {id:'gangnam',name:'강남 · 삼성·잠실',x:230,z:220,color:'#d9a1ca'}
];
export const STATIONS=[
 {id:'industry',name:'종로·광화문',x:-220,z:-140,district:'jongno',lines:[1,2]},
 {id:'home',name:'왕십리·성수',x:220,z:-140,district:'gangbuk',lines:[1,2]},
 {id:'market',name:'강남·삼성',x:220,z:140,district:'gangnam',lines:[2]},
 {id:'base',name:'여의도·서초',x:-220,z:140,district:'yeouido',lines:[2]}
];
export const WEAPONS=[
 {id:'ar',name:'AR–41 돌격소총',mag:30,reserve:180,damage:35,interval:.12,reload:1.8,pellets:1,spread:.008,range:180,color:0x4e6454},
 {id:'smg',name:'V9 기관단총',mag:40,reserve:240,damage:23,interval:.075,reload:1.45,pellets:1,spread:.018,range:95,color:0x75849c},
 {id:'shotgun',name:'B12 산탄총',mag:8,reserve:48,damage:22,interval:.8,reload:2.3,pellets:8,spread:.055,range:45,color:0x936b43},
 {id:'sniper',name:'SR–7 저격소총',mag:5,reserve:30,damage:110,interval:1.1,reload:2.8,pellets:1,spread:.001,range:360,color:0x68704a}
];
export const VEHICLE_TYPES={
 car:{name:'시민 차량',speed:25,accel:10,turn:1.6,radius:1.5,eye:1.5},
 tank:{name:'전차',speed:15,accel:5,turn:.85,radius:2.2,eye:3.1,armed:true},
 plane:{name:'수송기',speed:55,accel:10,turn:.65,radius:4,eye:3.8,flying:true,lift:12,ceiling:150},
 fighter:{name:'전투기',speed:85,accel:17,turn:1.0,radius:3,eye:2.4,flying:true,lift:20,ceiling:210,armed:true},
 helicopter:{name:'헬리콥터',speed:35,accel:10,turn:1.4,radius:2.6,eye:2.5,flying:true,hover:true,lift:14,ceiling:150,armed:true}
};
export function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
export const HILLS=[{x:-75,z:-415,radius:48,height:45,name:'북악산'},{x:55,z:-100,radius:38,height:32,name:'남산'}];
export const BRIDGES=[{x:-240,name:'마포대교'},{x:0,name:'반포대교'},{x:240,name:'한남대교'}];
export function groundHeight(x,z){return Math.max(0,...HILLS.map(h=>Math.max(0,1-Math.hypot(x-h.x,z-h.z)/h.radius)*h.height))}
export function districtAt(x,z){if(Math.abs(z)<42)return '한강 · '+(BRIDGES.find(b=>Math.abs(x-b.x)<12)?.name||'수변');const h=HILLS.find(h=>Math.hypot(x-h.x,z-h.z)<h.radius);if(h)return h.name;return DISTRICTS.find(d=>Math.sign(d.x)===Math.sign(x||1)&&Math.sign(d.z)===Math.sign(z||1)).name}
export function blockedAt(x,z,r,blocks,y=0,height=1.8){return Math.abs(x)>LIMIT-r||Math.abs(z)>LIMIT-r||blocks.some(b=>Math.abs(x-b.x)<b.w+r&&Math.abs(z-b.z)<b.d+r&&y<b.top&&y+height>b.bottom)}
export function moveBody(pos,dx,dz,blocks,r=.4,y=0,height=1.8){
 const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.45));let collided=false;
 for(let i=0;i<steps;i++){
  if(!blockedAt(pos.x+dx/steps,pos.z,r,blocks,y,height))pos.x+=dx/steps;else collided=true;
  if(!blockedAt(pos.x,pos.z+dz/steps,r,blocks,y,height))pos.z+=dz/steps;else collided=true;
 }return collided;
}
export function lineBlocked(a,b,blocks){
 const dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z;
 for(const o of blocks){if(o.kind==='water')continue;let lo=0,hi=1;for(const [p,d,min,max]of [[a.x,dx,o.x-o.w,o.x+o.w],[a.y,dy,o.bottom,o.top],[a.z,dz,o.z-o.d,o.z+o.d]]){if(Math.abs(d)<1e-8){if(p<min||p>max){hi=-1;break}}else{let t1=(min-p)/d,t2=(max-p)/d;if(t1>t2)[t1,t2]=[t2,t1];lo=Math.max(lo,t1);hi=Math.min(hi,t2)}}if(hi>=Math.max(lo,.001)&&lo<.999&&hi>0)return true}
 const samples=Math.max(1,Math.ceil(Math.hypot(dx,dz)/5));for(let i=1;i<samples;i++){const t=i/samples;if(a.y+dy*t<groundHeight(a.x+dx*t,a.z+dz*t))return true}return false;
}
export function damageVitals(health,armor,damage){const absorbed=Math.min(armor,damage*.75);return {health:Math.max(0,health-damage+absorbed),armor:armor-absorbed}}
export function routeLength(points){let length=0;for(let i=1;i<points.length;i++)length+=Math.hypot(points[i].x-points[i-1].x,points[i].z-points[i-1].z);return length}
export function sampleRoute(points,distance,loop=false){
 const total=routeLength(points);let d=loop?((distance%total)+total)%total:clamp(distance,0,total);
 for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],n=Math.hypot(b.x-a.x,b.z-a.z);if(d<=n||i===points.length-1){const t=n?clamp(d/n,0,1):0;return {x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,yaw:Math.atan2(-(b.x-a.x),-(b.z-a.z))}}d-=n}return {...points[0],yaw:0};
}
export function transitRoute(from,to,line){
 if(from===to)return null;const a=STATIONS.find(s=>s.id===from),b=STATIONS.find(s=>s.id===to);
 if(!a?.lines.includes(line)||!b?.lines.includes(line))return null;
 if(line===1)return [{x:a.x,z:a.z},{x:b.x,z:b.z}];
 const ring=['industry','home','market','base'];const i=ring.indexOf(from),j=ring.indexOf(to);const forward=(j-i+4)%4,backward=(i-j+4)%4,step=forward<=backward?1:-1,points=[a];let k=i;
 while(k!==j){k=(k+step+4)%4;points.push(STATIONS.find(s=>s.id===ring[k]))}return points.map(s=>({x:s.x,z:s.z}));
}
export function chooseExit(v,blocks){for(const [sx,sz]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1]]){const x=v.x+sx*6,z=v.z+sz*6;if(groundHeight(x,z)<1&&!blockedAt(x,z,.4,blocks))return {x,z}}return null}
export function vehicleStep(v,controls,dt,blocks){
 const spec=VEHICLE_TYPES[v.type],previousSpeed=v.speed,previousX=v.x,previousZ=v.z;
 v.speed=clamp(v.speed+(controls.forward*spec.accel-(controls.brake?v.speed*5:v.speed*.22))*dt,-spec.speed*.35,spec.speed);
 const steering=spec.hover||Math.abs(v.speed)>.5?1:0;v.yaw-=controls.steer*spec.turn*dt*steering*(v.speed<-.5?-1:1);
 if(spec.flying){const canLift=spec.hover||Math.abs(v.speed)>spec.speed*.28;v.y=clamp(v.y+(controls.lift>0&&canLift?spec.lift:controls.lift<0?-spec.lift:spec.hover?0:-2)*dt,0,spec.ceiling)}
 const dx=-Math.sin(v.yaw)*v.speed*dt,dz=-Math.cos(v.yaw)*v.speed*dt;
 let collision=moveBody(v,dx,dz,blocks,spec.radius,v.y,3);
 if(v.y<groundHeight(v.x,v.z)+.05&&groundHeight(v.x,v.z)>1){v.x=previousX;v.z=previousZ;if(spec.flying)v.y=Math.max(v.y,groundHeight(previousX,previousZ)+.2);collision=true}
 if(collision)v.speed=-previousSpeed*.08;return collision;
}
