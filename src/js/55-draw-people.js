/* ---------- people: ~14w x 27h, shaded ---------- */
function drawPerson(x,y,p,frame){
  x=Math.round(x); y=Math.round(y);
  const step=frame%2, bob=step?1:0;
  const [cA,cB,cC]=p.coat, [sk,skS]=p.skin;
  // shadow
  px(x,y-1,14,2,'rgba(0,0,0,.35)');
  // legs & shoes
  if(p.gown){ /* floor-length — no legs */ }
  else if(p.lady&&!p.pants){
    px(x+3,y-9,8,4,cB);                                    // skirt hem
    px(x+4,y-5,2,4,'#c9b8a0'); px(x+8,y-5+(step?-1:0),2,4+(step?1:0),'#c9b8a0');
    px(x+3,y-2,3,2,'#1d1814'); px(x+8,y-2+(step?-1:0),3,2,'#1d1814');
  } else {
    px(x+3,y-9,4,8,cB); px(x+7,y-9+(step?-1:0),4,8+(step?1:0),cB);
    px(x+4,y-9,1,7,cC);                                    // trouser crease
    px(x+2,y-2,4,2,'#1d1814'); px(x+8,y-2+(step?-1:0),4,2,'#1d1814');
  }
  // torso / coat (3-tone)
  const ty=y-19-bob;
  if(p.lady){
    px(x+2,ty,10,11,cA); px(x+2,ty,3,11,cC); px(x+9,ty,3,11,cB);   // dress
    px(x+1,ty+2,2,6,cA); px(x+11,ty+2,2,6,cB);                     // arms
    px(x+5,ty+4,4,1,cC);                                           // waist sash
    if(p.gown){ px(x+2,ty+11,10,6+bob,cA); px(x+1,y-4,12,2,cB); }  // train to the floor
  } else {
    px(x+2,ty,10,10,cA); px(x+2,ty,3,10,cC); px(x+9,ty,3,10,cB);   // coat
    px(x+1,ty+1,2,7,cA); px(x+11,ty+1,2,7,cB);                     // arms
    if(!p.arch){ px(x+6,ty,2,4,'#e9e2d2'); px(x+6,ty+3,2,3,P.rust); // shirt + tie
                 px(x+4,ty,2,2,cC); px(x+8,ty,2,2,cB); }            // lapels
  }
  if(p.bag){ px(x+12,ty+7,4,5,'#4a3120'); px(x+13,ty+6,2,1,'#2a2018'); }
  // head
  const hy=ty-7;
  px(x+4,hy,6,7,sk); px(x+8,hy+1,2,6,skS);
  // hair / hat (named characters bring their own)
  if(p.arch){ /* décor below */ }
  else if(p.hat&&!p.lady){ px(x+3,hy-3,8,3,'#1d1814'); px(x+2,hy,10,1,'#1d1814'); px(x+3,hy-2,8,1,'#3a3430'); }
  else if(p.lady){ px(x+3,hy-2,8,4,p.hair); px(x+3,hy+2,2,3,p.hair); px(x+9,hy+2,2,3,p.hair);
    px(x+3,hy-3,8,2,'#7a3b50'); px(x+10,hy-1,2,2,'#7a3b50'); }     // cloche hat
  else { px(x+3,hy-2,8,3,p.hair); px(x+3,hy,1,3,p.hair); }
  // face
  const g=p.grump;
  px(x+5,hy+2,1,1,'#1d1814'); px(x+7,hy+2,1,1,'#1d1814');          // eyes
  if(g>0.55){ px(x+5,hy+1,2,1,g>0.8?P.bad:'#5a4232'); px(x+7,hy+1,2,1,g>0.8?P.bad:'#5a4232'); } // brows
  if(g>0.8){ px(x+4,hy+4,2,1,'#d5745f'); px(x+8,hy+4,2,1,'#d5745f'); }                          // flushed cheeks
  if(g>0.85 && Math.floor(G.t*6)%2===0){
    px(x+11,hy-4,2,2,'rgba(255,255,255,.55)'); px(x+13,hy-8,3,3,'rgba(255,255,255,.35)');
    px(x+10,hy-9,2,2,'rgba(255,255,255,.25)');
  }
  if(p.arch) drawArchDecor(x,y,ty,hy,p,step);
}

/* per-character props & headwear, layered over the base sprite */
function drawArchDecor(x,y,ty,hy,p,step){
  switch(p.arch){
    case 'bellhop':                                              // pillbox + brass buttons
      px(x+4,hy-3,6,2,'#8a3227'); px(x+4,hy-1,6,1,'#c9a227');
      px(x+6,ty+2,1,1,'#c9a227'); px(x+6,ty+5,1,1,'#c9a227'); break;
    case 'flapper':                                              // swinging fringe + feather headband
      for(let i=0;i<5;i++) px(x+2+i*2,y-9+((i+step)%2),1,2,'#3aa0b5');
      px(x+3,hy-1,8,1,'#f4e8cf'); px(x+9,hy-4,1,3,'#4a9a83'); break;
    case 'salesman':                                             // straw boater + enormous case
      px(x+4,hy-3,6,2,'#d9c98a'); px(x+4,hy-1,6,1,'#7a3b30'); px(x+2,hy,10,1,'#d9c98a');
      px(x+12,ty+5,6,7,'#4a3120'); px(x+14,ty+8,2,1,'#c9a227'); break;
    case 'chef':                                                 // towering toque + neckerchief
      px(x+4,hy-6,6,6,'#ffffff'); px(x+8,hy-6,2,6,'#d8cbb0'); px(x+6,ty,2,2,'#a63d2f'); break;
    case 'aviatrix':                                             // goggles up + silk scarf
      px(x+3,hy,8,1,'#2a2018'); px(x+4,hy-1,2,2,'#4a9a83'); px(x+8,hy-1,2,2,'#4a9a83');
      px(x+2+(step?0:1),ty+1,2,5,'#f4e8cf'); break;
    case 'zora':                                                 // turban, brooch, drifting ectoplasm
      px(x+3,hy-4,8,4,'#584175'); px(x+6,hy-4,1,2,'#c9a227');
      px(x+6+Math.round(Math.sin(G.t*2+p.id)*2),hy-8,1,1,'rgba(200,200,216,.45)'); break;
    case 'flint':                                                // wide-brim fedora + popped collar
      px(x+3,hy-3,8,3,'#2e2a24'); px(x+3,hy-1,8,1,'#1d1814'); px(x+1,hy,12,1,'#2e2a24');
      px(x+2,ty-1,2,2,'#5d574c'); px(x+10,ty-1,2,2,'#5d574c'); break;
    case 'bootlegger':                                           // pinstripes, spats, crate
      px(x+2,hy-3,8,3,'#33383f'); px(x+1,hy,10,1,'#33383f');
      px(x+4,ty+1,1,8,'#f4e8cf'); px(x+7,ty+1,1,8,'#f4e8cf');
      px(x+2,y-3,4,1,'#f4e8cf'); px(x+8,y-3+(step?-1:0),4,1,'#f4e8cf');
      px(x+12,ty+7,5,5,'#8a6540'); px(x+12,ty+9,5,1,'#523821'); break;
    case 'professor':                                            // wild hair, brass specs, book
      px(x+2,hy-3,10,3,'#e8e4da'); px(x+1,hy-2,1,2,'#e8e4da'); px(x+12,hy-2,1,2,'#e8e4da');
      px(x+5,hy+2,1,1,'#c9a227'); px(x+7,hy+2,1,1,'#c9a227'); px(x+6,hy+2,1,1,'#c9a227');
      px(x+12,ty+6,2,3,'#7a3b30'); break;
    case 'diva':                                                 // fur stole, gold trim, aigrette
      px(x+1,ty-1,12,2,'#e8e4da'); px(x+2,ty+9,10,1,'#f0d68a'); px(x+7,hy-6,1,4,'#4a9a83');
      px(x+3,hy-2,8,2,'#2a2018'); break;
    case 'boone':                                                // cream tux, bow tie, trombone
      px(x+3,hy-2,8,2,'#1d1814');
      px(x+4,ty,2,2,'#1d1814'); px(x+8,ty,2,2,'#1d1814'); px(x+6,ty+1,2,1,'#1d1814');
      px(x+12,ty+2,2,8,'#c9a227'); px(x+11,ty-2,3,3,'#f0d68a'); break;
    case 'baroness':                                             // fox collar, pearls, lorgnette
      px(x+3,hy-2,8,2,'#1d1814'); px(x+1,ty-1,12,2,'#c8c2b6');
      px(x+6,ty+2,1,1,'#f4e8cf'); px(x+6,ty+4,1,1,'#f4e8cf'); px(x+6,ty+6,1,1,'#f4e8cf');
      px(x+11,hy+2,2,1,'#c9a227'); break;
    case 'colonel':                                              // pith helmet, walrus mustache, sash
      px(x+3,hy-3,8,2,'#d9c98a'); px(x+1,hy-1,12,1,'#d9c98a');
      px(x+4,hy+3,6,2,'#e8e4da'); px(x+7,hy+2,1,1,'#c9a227');
      px(x+4,ty+2,1,1,'#8c1f2e'); px(x+6,ty+4,1,1,'#8c1f2e'); px(x+8,ty+6,1,1,'#8c1f2e'); break;
    case 'gloria':                                               // platinum waves, choker, sparkle
      px(x+3,hy-2,8,3,'#e8e4da'); px(x+6,ty-1,3,1,'#c8c8d8');
      glow(x+7,y-2,10,'rgba(255,255,255,.14)');
      for(let i=0;i<3;i++){
        const sx2=x+7+Math.round(Math.sin(G.t*4+i*2.1)*8), sy2=hy+Math.round(Math.cos(G.t*3+i*2.1)*9);
        px(sx2,sy2,1,1,'rgba(255,255,255,.7)');
      } break;
    case 'magnifico':                                            // top hat, crimson-lined cape
      px(x+4,hy-5,6,4,'#1d1814'); px(x+4,hy-2,6,1,'#8c1f2e'); px(x+2,hy-1,10,1,'#1d1814');
      px(x+1,ty,1,8,'#8c1f2e'); px(x+12,ty,1,8,'#8c1f2e'); px(x+5,hy+3,4,1,'#1d1814');
      if(p.puffT>0){ const s=Math.round((0.5-p.puffT)*24);
        px(x+7-s/2,y-14-s/2,s,s,'rgba(244,232,207,.35)');
        px(x+7-s/4,y-14-s/4,s/2,s/2,'rgba(244,232,207,.3)'); } break;
    case 'duchess':{                                             // brooch, grey hat — and Bijou
      px(x+3,hy-2,8,2,'#6f6b60'); px(x+6,ty+2,1,1,'#584175');
      const bb=Math.floor(G.t*6+p.id)%2;
      px(x-9,y-5+bb,5,3,'#e0a83c'); px(x-11,y-7+bb,3,3,'#e0a83c');  // Bijou body+head
      px(x-10,y-6+bb,1,1,'#1d1814'); px(x-9,y-8+bb,1,1,'#8c1f2e');  // eye + bow
      px(x-8,y-2,1,2,'#c9922e'); px(x-6,y-2+bb,1,2,'#c9922e');      // trotting legs
      px(x-6,y-8,3,1,'#c9a227'); px(x-3,y-10,3,1,'#c9a227'); px(x,ty+6,2,1,'#c9a227'); // leash
      break; }
  }
}
function moodColor(g){ return g<0.5?P.ok:(g<0.8?P.warn:P.bad); }
function bubble(x,y,txt,g){
  x=Math.round(x); y=Math.round(y);
  const w=Math.max(16,txt.length*8+8);
  px(x-w/2-1,y-16,w+2,16,moodColor(g));
  px(x-w/2,y-15,w,14,P.cream);
  px(x-2,y-1,4,3,P.cream); px(x-3,y-2,6,1,moodColor(g));
  ctx.fillStyle='#1d1814'; ctx.font='10px monospace'; ctx.textAlign='center';
  ctx.fillText(txt,x,y-4);
}
