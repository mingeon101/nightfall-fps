const finite=(v,f=0)=>typeof v==='number'&&Number.isFinite(v)?v:f;
const bound=(v,a,b,f=a)=>Math.max(a,Math.min(b,finite(v,f)));
export function normalizeSave(value){
 if(!value||typeof value!=='object'||value.schemaVersion!==1||!value.player||!Array.isArray(value.inventory)||![4,5].includes(value.inventory.length))throw Error('지원하지 않거나 손상된 저장 데이터입니다.');
 const p=value.player;return {schemaVersion:1,worldVersion:6,playSeconds:bound(value.playSeconds,0,1e9),player:{x:bound(p.x,-3390,3390,220),z:bound(p.z,-3390,3390,-115),health:bound(p.health,1,100,100),armor:bound(p.armor,0,100),wallet:Math.floor(bound(p.wallet,0,1e9,50000))},selected:Math.floor(bound(value.selected,0,4)),inventory:Array.from({length:5},(_,i)=>value.inventory[i]??{owned:true,ammo:1,reserve:8}).map((it,i)=>({owned:i===0||it?.owned===true,ammo:Math.floor(bound(it?.ammo,0,[30,40,8,5,1][i])),reserve:Math.floor(bound(it?.reserve,0,100000))})),defeatedEnemyIds:[...new Set((Array.isArray(value.defeatedEnemyIds)?value.defeatedEnemyIds:[]).filter(i=>Number.isInteger(i)&&i>=0&&i<500))].sort((a,b)=>a-b)};
}
export function localSaveKey(uid){if(typeof uid!=='string'||!uid||/[.#$\[\]/]/.test(uid))throw Error('유효하지 않은 사용자입니다.');return 'nightfall:v1:'+uid+':slot1'}
export function normalizePhone(input){let p=String(input).trim().replace(/[\s()-]/g,'');if(/^01[016789]\d{7,8}$/.test(p))p='+82'+p.slice(1);if(!/^\+[1-9]\d{7,14}$/.test(p))throw Error('국가번호를 포함한 전화번호를 입력하세요. 예: +82 10 1234 5678');return p}
export function shouldWriteRevision(current,expected){return (Number.isInteger(current?.revision)?current.revision:0)===expected}
