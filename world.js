import {STATIONS,DISTRICTS,VEHICLE_TYPES} from './core.mjs';
export function buildWorld(T,scene){
 const blocks=[],landmarks=[],vehicles=[],pickups=[],people=[],batches=new Map(),colliders=[];
 let seed=7101;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.85,...extra});
 const m={ground:mat(0x364345),road:mat(0x202b31),concrete:mat(0x78858b),dark:mat(0x26343c),metal:mat(0x596f68,{metalness:.45}),sand:mat(0x8d8a70),blue:mat(0x51758b),red:mat(0x9e6158),white:mat(0xc5d5cf),glass:mat(0x76abbd,{metalness:.5,roughness:.24}),window:mat(0xbac79c,{emissive:0x849968,emissiveIntensity:.8}),green:mat(0x476553),black:mat(0x111e24),yellow:mat(0xe0bc66),violet:mat(0x927a9e)};
 function cube(w,h,d,x,y,z,material=m.concrete,collision=false,parent=null){
  if(parent){const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);parent.add(mesh);return mesh}
  if(!batches.has(material))batches.set(material,[]);batches.get(material).push({w,h,d,x,y,z});
  if(collision)blocks.push({x,z,w:w/2,d:d/2,bottom:y-h/2,top:y+h/2});
 }
 function label(text,x,y,z,color='#d7e8ce',size=15){const c=document.createElement('canvas');c.width=512;c.height=96;const ctx=c.getContext('2d');ctx.fillStyle='#10202ddd';ctx.fillRect(0,0,512,96);ctx.strokeStyle=color;ctx.lineWidth=3;ctx.strokeRect(1,1,510,94);ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 36px sans-serif';ctx.fillText(text,256,49,490);const s=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(c),transparent:true,depthTest:true}));s.position.set(x,y,z);s.scale.set(size,size*96/512,1);scene.add(s);return s}
 cube(860,.5,860,0,-.3,0,m.ground);
 // Roads: an inner ring plus a grid in each quadrant, never through the mountain.
 for(const n of [-340,-240,-140,140,240,340]){cube(19,.04,820,n,.015,0,m.road);cube(820,.04,19,0,.015,n,m.road);for(let k=-400;k<410;k+=18){cube(.22,.06,6,n,.04,k,m.yellow);cube(6,.06,.22,k,.04,n,m.yellow)}}
 const mountain=new T.Mesh(new T.ConeGeometry(108,75,14,3),mat(0x5a6d61,{flatShading:true}));mountain.position.y=37.5;scene.add(mountain);const peak=new T.Mesh(new T.ConeGeometry(20,14,8),m.sand);peak.position.y=68;scene.add(peak);label('중앙산 · CENTRAL PEAK',0,83,0,'#b3d78e',40);
 for(let i=0;i<80;i++){const a=i*2.399,r=112+rand()*16,x=Math.cos(a)*r,z=Math.sin(a)*r;cube(.5,3,.5,x,1.5,z,m.sand);const tree=new T.Mesh(new T.ConeGeometry(2+rand(),6+rand()*3,5),m.green);tree.position.set(x,6,z);scene.add(tree)}
 function building(name,x,z,w,d,h,material=m.concrete,windows=true){cube(w,h,d,x,h/2,z,material,true);cube(w+.6,.6,d+.6,x,h,z,m.dark);if(windows){for(let y=3;y<h-1;y+=3.5)for(let k=-w/2+2;k<w/2-1;k+=3){cube(1.1,1.3,.07,x+k,y,z+d/2+.05,rand()>.42?m.window:m.glass);cube(1.1,1.3,.07,x+k,y,z-d/2-.05,rand()>.42?m.window:m.glass)}}if(name){landmarks.push({name,x,z});label(name,x,Math.min(h+3,28),z,'#d6e3d9',Math.min(20,w+5))}return {x,z,w,d,h}}
 // Dense apartments and civic facilities; entrances open onto the street grid.
 for(const x of [175,205,275,305,375])for(const z of [-180,-205,-275,-305,-375]){if(x>=275&&z<=-275)continue;building(null,x,z,17,17,23+Math.floor(rand()*5)*5,m.concrete)}
 building('한빛 초·중학교',285,-285,46,32,10,m.sand);cube(43,.07,28,285,.08,-315,m.green);for(let i=0;i<3;i++)cube(2,.3,2,274+i*11,.3,-315,m.white);
 building('중앙 경찰서',375,-280,24,28,12,m.blue);building('119 소방서',375,-375,28,27,10,m.red);building('중앙 종합병원',282,-375,44,28,23,m.white);cube(3,10,.3,282,16,-360.6,m.red);cube(9,3,.3,282,16,-360.5,m.red);building('시청 · 관공서',375,-180,27,35,20,m.sand);
 // Industrial quarter: warehouses, container yards, chimneys and factory tanks.
 for(const x of [-190,-290,-380])for(const z of [-190,-285,-380]){building(x===-190&&z===-190?'산업 물류센터':null,x,z,48,38,12+rand()*5,m.metal,false);for(let k=0;k<3;k++)cube(10,3.6,5,x-14+k*13,1.8,z+26,k%2?m.blue:m.red,true)}
 for(const x of [-180,-200,-280]){const chimney=new T.Mesh(new T.CylinderGeometry(2,3,38,10),m.sand);chimney.position.set(x,19,-395);scene.add(chimney);cube(6,.8,6,x,33,-395,m.red)}
 label('산업지구 · INDUSTRIAL',-240,45,-240,'#e1bf8b',42);
 // Shopping quarter: distinct anchors surrounded by a compact retail grid.
 building('NIGHTFALL 백화점',185,185,52,45,30,m.violet);building('CENTRAL 아울렛',285,185,58,40,13,m.sand);building('시티 쇼핑몰',375,185,35,45,24,m.glass);
 for(const x of [180,205,280,310,375])for(const z of [280,310,375]){building(x===280&&z===280?'상업 거리 · RETAIL':null,x,z,18,19,8+rand()*12,rand()>.5?m.concrete:m.red);cube(19,.4,2,x,4,z+10,m.yellow)}
 // Military quarter: long runway, taxiway, hangars, barracks and a control tower.
 cube(34,.08,250,-350,.06,255,m.road);for(let z=145;z<380;z+=16)cube(1,.1,8,-350,.13,z,m.white);for(const x of [-362,-338])for(let z=138;z<380;z+=14)cube(.5,.15,.5,x,.15,z,m.window);
 building('공항 격납고',-395,195,34,48,18,m.metal,false);building('제2 격납고',-395,295,34,48,18,m.metal,false);building('공항 터미널',-290,110,42,22,12,m.glass);building('군사 관제탑',-292,185,15,15,32,m.concrete);cube(23,6,20,-292,31,185,m.glass,true);
 building('군사기지 · 지휘부',-185,190,40,32,15,m.sand);building('병영',-190,285,40,30,10,m.sand);building('군수 창고',-285,375,45,25,11,m.metal,false);
 for(const z of [275,300,325]){cube(18,1.2,1,-290,.6,z,m.sand,true);cube(4,1.2,1,-260,.6,z,m.sand,true)}
 for(const d of DISTRICTS)label(d.name,d.x,40,d.z,d.color,32);
 // Subway tunnels really sit below the ground. L1 is above the L2 ring.
 function tunnelSegment(a,b,y,color){const dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz),x=(a.x+b.x)/2,z=(a.z+b.z)/2,horizontal=Math.abs(dx)>Math.abs(dz);cube(horizontal?length+5:7,.3,horizontal?7:length+5,x,y-.3,z,m.dark);cube(horizontal?length+5:7,.3,horizontal?7:length+5,x,y+5,z,m.dark);for(const side of [-1,1]){cube(horizontal?length+5:.25,5,horizontal?.25:length+5,x+(horizontal?0:side*3.6),y+2.3,z+(horizontal?side*3.6:0),m.concrete);cube(horizontal?length:.1,.1,horizontal?.1:length,x+(horizontal?0:side*1),y+.1,z+(horizontal?side*1:0),m.metal)}for(let d=0;d<length;d+=25){const t=d/length;cube(horizontal?1:3,.08,horizontal?3:1,a.x+dx*t,y+4.7,a.z+dz*t,color)}}
 tunnelSegment(STATIONS[0],STATIONS[1],-10,m.blue);for(let i=0;i<4;i++)tunnelSegment(STATIONS[i],STATIONS[(i+1)%4],-17,m.green);
 for(const s of STATIONS){cube(8,4,5,s.x,2,s.z+12,m.dark);cube(8.4,.4,5.4,s.x,4.2,s.z+12,s.lines.length===2?m.blue:m.green);label(`Ⓜ ${s.name} ${s.lines.join('·')}호선`,s.x,6.5,s.z+12,'#8acdec',19);cube(8,.1,8,s.x,.1,s.z+12,m.glass);landmarks.push({name:'Ⓜ '+s.name,x:s.x,z:s.z+12})}
 // Shared articulated humanoid rigs, with shoulder and hip pivots.
 function person(x,z,enemy=false,index=0){const root=new T.Group(),body=new T.Group();root.position.set(x,0,z);root.add(body);scene.add(root);const cloth=enemy?m.sand:[m.blue,m.red,m.violet,m.white][index%4],skin=mat(0xb39a7a);cube(.58,.65,.32,0,1.15,0,cloth,false,body);cube(.32,.32,.30,0,1.69,0,skin,false,body);if(enemy){cube(.4,.17,.37,0,1.87,0,m.dark,false,body);cube(.48,.46,.39,0,1.17,-.02,m.metal,false,body)}
  const legs=[],arms=[];for(const side of [-1,1]){const hip=new T.Group();hip.position.set(side*.17,.85,0);body.add(hip);cube(.22,.8,.24,0,-.4,0,cloth,false,hip);cube(.24,.14,.36,0,-.78,-.05,m.black,false,hip);legs.push(hip);const shoulder=new T.Group();shoulder.position.set(side*.4,1.42,0);body.add(shoulder);cube(.19,.58,.22,0,-.28,0,cloth,false,shoulder);arms.push(shoulder)}
  let weapon=null,muzzle=null,mag=null;if(enemy){weapon=new T.Group();weapon.position.set(0,-.38,-.28);arms[1].add(weapon);cube(.13,.15,.5,0,0,0,m.black,false,weapon);cube(.06,.06,.4,0,.01,-.42,m.black,false,weapon);mag=cube(.08,.22,.13,0,-.16,.02,m.dark,false,weapon);muzzle=new T.Mesh(new T.ConeGeometry(.12,.35,5),new T.MeshBasicMaterial({color:0xffd887}));muzzle.rotation.x=-Math.PI/2;muzzle.position.set(0,.01,-.72);muzzle.visible=false;weapon.add(muzzle)}
  const p={root,body,legs,arms,weapon,muzzle,mag,enemy,hp:100,ammo:8,reloading:0,cool:1+rand()*2,recoil:0,death:0,phase:rand()*6,origin:{x,z},target:{x:x+12,z},flee:0};root.userData.actor=p;people.push(p);return p;
 }
 // Combat cells keep the large city populated without attacking across districts.
 for(const d of DISTRICTS)for(const [dx,dz]of [[-9,-88],[8,-25],[-7,35],[8,90]]){const x=(d.x<0?-240:240)+dx,z=(d.z<0?-240:240)+dz;person(x,z,true)}
 for(let i=0;i<32;i++){const side=i%2?1:-1,x=side*(i%4<2?140:240)+((i%3)-1)*5,z=-380+(i%16)*48;person(x,z,false,i)}
 function vehicle(type,x,z,yaw=0,traffic=false,index=0){const root=new T.Group();root.position.set(x,0,z);root.rotation.y=yaw;scene.add(root);const spec=VEHICLE_TYPES[type],paint=type==='car'?[m.blue,m.red,m.white,m.yellow][index%4]:m.green;let rotor=null,turret=null;
  if(type==='car'){cube(2.2,.8,4.5,0,.8,0,paint,false,root);cube(1.9,.85,2.2,0,1.6,.15,m.glass,false,root);cube(2,.12,2.3,0,2.05,.15,paint,false,root);for(const x of [-.75,.75])cube(.45,.25,.07,x,.9,-2.27,m.window)}
  if(type==='tank'){cube(3.8,1.2,6,0,1,0,paint,false,root);for(const x of [-1.8,1.8])cube(.7,1.4,5.8,x,.7,0,m.black,false,root);turret=new T.Group();turret.position.y=2;root.add(turret);cube(2.6,.85,2.7,0,0,0,paint,false,turret);cube(.24,.24,5,0,.1,-3,paint,false,turret)}
  if(type==='plane'||type==='fighter'){const big=type==='plane';cube(big?2.7:1.4,big?2.5:1.2,big?14:10,0,big?2.6:1.8,0,paint,false,root);cube(big?18:10,.22,big?3:2,0,big?2.8:1.7,1,paint,false,root);cube(big?7:5,.18,2,0,big?4:2.8,big?5:4,paint,false,root);cube(.22,big?3:2,2,0,big?4.2:3,big?5:4,paint,false,root);cube(big?1.8:1,.7,2,0,big?3.8:2.6,-3,m.glass,false,root)}
  if(type==='helicopter'){cube(2.4,2.2,4,0,2.1,0,paint,false,root);cube(2.2,1.4,1.3,0,2.2,-2,m.glass,false,root);cube(.55,.6,6,0,2.4,4,paint,false,root);cube(.2,2,1.4,0,3,6.5,paint,false,root);rotor=new T.Group();rotor.position.y=3.6;root.add(rotor);cube(11,.08,.3,0,0,0,m.black,false,rotor);cube(.3,.08,11,0,0,0,m.black,false,rotor);for(const x of [-1.4,1.4])cube(.15,.15,4.7,x,.4,0,m.dark,false,root)}
  if(type!=='tank'&&type!=='helicopter')for(const x of [-1.15,1.15])for(const z of [-1.35,1.35]){const wheel=new T.Mesh(new T.CylinderGeometry(.48,.48,.28,10),m.black);wheel.rotation.z=Math.PI/2;wheel.position.set(x,.48,z);root.add(wheel)}
  const v={type,root,rotor,turret,x,z,y:0,yaw,speed:0,traffic,trafficOffset:index*71,occupied:false,origin:{x,z,yaw,traffic},cool:0};vehicles.push(v);return v;
 }
 for(let i=0;i<12;i++)vehicle('car',i%2?-140:140,300-i*48,0,true,i);
 vehicle('car',235,-116,0,false,3);vehicle('car',-235,-115,0,false,2);vehicle('car',220,116,0,false,0);
 vehicle('tank',-263,260);vehicle('tank',-263,318);vehicle('helicopter',-190,345);vehicle('fighter',-350,325);vehicle('plane',-350,215);
 cube(14,.06,14,-190,.07,345,m.dark);for(const x of [-192,-188])cube(.6,.12,7,x,.13,345,m.white);cube(4,.12,.6,-190,.13,345,m.white);
 function pickup(kind,x,z,weapon=0){const root=new T.Group();root.position.set(x,.8,z);scene.add(root);const color=kind==='armor'?0x7ad8f5:kind==='medkit'?0xf5ada0:kind==='ammo'?0xe3c67b:0xc6ed8b,material=mat(color,{emissive:color,emissiveIntensity:.3});if(kind==='weapon'){cube(.25,.22,1.8,0,0,0,material,false,root);cube(.14,.4,.18,0,-.2,.2,m.dark,false,root)}else cube(.8,.65,.45,0,0,0,material,false,root);const ring=new T.Mesh(new T.RingGeometry(.7,.82,16),new T.MeshBasicMaterial({color,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=-.75;root.add(ring);pickups.push({kind,x,z,weapon,root,respawn:0})}
 pickup('weapon',224,-115,1);pickup('armor',228,-115);pickup('ammo',232,-115);pickup('medkit',236,-115);
 for(const d of DISTRICTS){pickup('armor',d.x<0?-230:230,d.z<0?-225:225);pickup('ammo',d.x<0?-230:230,d.z<0?-215:215)}
 pickup('weapon',-230,-180,2);pickup('weapon',230,180,3);pickup('weapon',-230,180,3);pickup('medkit',260,-350);pickup('medkit',250,300);
 // Animated physical train models stay in the underground tunnels.
 function train(color){const root=new T.Group();scene.add(root);const material=mat(color);for(let i=0;i<2;i++){cube(2.5,2.6,10,0,1.4,i*11,material,false,root);cube(2.1,1, .06,0,2,-5.05+i*11,m.window,false,root);for(const side of [-1,1])for(let z=-3;z<=3;z+=2)cube(.04,1,1.2,side*1.27,2,z+i*11,m.glass,false,root)}return root}
 const trains=[{line:1,root:train(0x548bc0),distance:0},{line:2,root:train(0x72a269),distance:0}];
 // One instanced draw per material for thousands of architectural details.
 const transform=new T.Object3D();for(const [material,parts]of batches){const inst=new T.InstancedMesh(new T.BoxGeometry(1,1,1),material,parts.length);parts.forEach((p,i)=>{transform.position.set(p.x,p.y,p.z);transform.scale.set(p.w,p.h,p.d);transform.updateMatrix();inst.setMatrixAt(i,transform.matrix)});inst.computeBoundingSphere();scene.add(inst);colliders.push(inst)}
 return {blocks,landmarks,vehicles,pickups,people,trains,m,cube,label,rand};
}
