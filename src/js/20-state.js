/* ---------- state ---------- */
const HS_KEY='grandAscentHS2';   // v2: 1920s tip scale — old dollar-era scores retired
let wheelInv=localStorage.getItem('grandAscentWheelInv')==='1';   // scroll direction preference, persists
let G;
function reset(){
  G={
    state:'title', t:0,
    pos:0, vel:0,               // pos in floor units, 0 = lobby
    floors:5, cap:3, base:0, justDug:false,
    scheme:(G&&G.scheme)||'manual',             // 'manual' (arrows + wheel) | 'auto' (click floors)
    autoTarget:null, dev:false, devBuf:'',
    up:{}, offers:null, pickSel:0, graceT:0, silk:false, flawless:0,
    transferDur:XFER_BASE,
    doorT:0, doorOpen:false,    // doorT 0..1 openness
    transfer:null, transferT:0, // passenger mid-doorway
    pax:[], spawnT:3, spawnId:0,
    tips:0, delivered:0, nextFloorAt:8, strikes:0,
    maxFloor:0, camY:0, msg:null, msgT:0, shake:0,
    hs:JSON.parse(localStorage.getItem(HS_KEY)||'{"floor":0,"tips":0}'),
  };
}
reset();

function say(txt,t=2.4){ G.msg=txt; G.msgT=t; }
function floorName(f){ return f===0?'L':(f<0?'B'+(-f):''+f); }
const BASEMENTS=[
  {name:"WU'S LAUNDRY",   sign:'#4a9a83'},
  {name:'THE VELVET ROOM',sign:'#d5533c'},
  {name:'THE BLIND TIGER',sign:'#e0a83c'},
];
