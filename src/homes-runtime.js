/* One active 3D home, independent layouts, shared residents and pets. */
function homeSnapshot(){return furn.map(f=>({u:f.uid,k:f.k,x:+f.x.toFixed(3),z:+f.z.toFixed(3),r:f.r,...(f.core?{core:true}:{})}));}
function captureHomeState(){if(!state.homes)return;const snapshot=homeSnapshot();state.furn=snapshot;state.homes.rooms[homeWorld.active].furn=snapshot;state.homes.active=homeWorld.active;}
function applyHomePalette(){
 const def=homeScene(homeWorld.active),choice=state.homes.rooms[def.id].theme;
 if(choice!==undefined)applyTheme(choice,false);else{for(const [k,value]of Object.entries(def.palette))MT[k].color.set(value);for(const k of ['acc','acc2','acc3'])document.documentElement.style.setProperty(`--${k}`,def.palette[k]);}
 if(['loft','palace','zen'].includes(def.id)){
  if(!homeFloorMaps.marble)homeFloorMaps.marble=neutralTex(x=>{x.fillStyle='#fafafa';x.fillRect(0,0,256,256);x.strokeStyle='rgba(120,130,140,.08)';x.lineWidth=2;for(let i=0;i<6;i++){x.beginPath();x.moveTo(i*43,0);x.bezierCurveTo(i*43+45,85,i*43-30,180,i*43+20,256);x.stroke();}},2.8);
  MT.floor.map=homeFloorMaps.marble;
 }else MT.floor.map=def.id==='sakura'?null:homeFloorMaps.wood;
 MT.floor.needsUpdate=true;
}
function prepareHomeScene(id){
 const def=homeScene(id);homeWorld.active=def.id;state.homes.active=def.id;state.journey.room=def.id;
 for(const f of [...furn])removeFurn(f);disposeHomeShell();
 homeWorld.original.forEach(o=>o.visible=def.id==='home');staticBlocks.splice(0,staticBlocks.length,...(def.id==='home'?homeWorld.blocks.map(r=>({...r})):[]));fixedLamps.splice(0,fixedLamps.length,...(def.id==='home'?homeWorld.lamps:[]));
 applyHomePalette();homeWorld.shell=def.id==='home'?null:buildHomeShell(def.id);
 const record=state.homes.rooms[def.id],list=record.furn.filter(s=>CAT[s.k]);
 for(const seed of homeSeed(def.id).filter(s=>['bed','counter','fridge','sinkCab'].includes(s.k)))if(!list.some(s=>s.k===seed.k))list.push(seed);
 for(const s of list)addFurn(s.u,s.k,s.x,s.z,s.r,s.core||['bed','counter','fridge','sink'].includes(s.u));
 rebuildNav();refreshLamps();homeWorld.shell?.updateMatrixWorld(true);syncHomeUI();
 // Discoveries are actual objects in the living space, with ray-castable glows.
 const r=JOURNEY_ROOMS.find(r=>r.id===def.id);
 ['coffee','desk','planters'].forEach((key,i)=>{const f=furn.find(f=>f.k===key);if(!f||!homeWorld.shell)return;const g=new THREE.Group();g.userData.feature={label:r.clues[i].n,clue:i};const m=new THREE.Mesh(G('home:clue',()=>new THREE.OctahedronGeometry(.055)),M('#e5d29b',{emissive:'#f1d395',emissiveIntensity:.8,roughness:.45}));g.add(m);g.position.set(f.x,f.b.g.position.y+({coffee:.49,desk:1.18,planters:.8})[key],f.z+.12);homeWorld.shell.add(g);homeWorld.features.push(g);});
 captureHomeState();
}
function switchHome(id){
 if(!HOME_SCENES.some(s=>s.id===id))return false;
 if(id===homeWorld.active){syncHomeUI();return true;}
 clearTimeout(saveT);captureHomeState();
 if(mini.on)closeMini();if(edit.on)setEdit(false);if(sheetName)closeSheet();
 social.on=false;social.ha=social.ma=null;confetti.visible=false;leaveSeat();mateLeave();hideBubble();bubMT=0;
 H.path=[];H.next=null;H.state='idle';H.mode='preview';MM.path=[];MM.state='idle';MM.think=3;P.path=[];
 prepareHomeScene(id);dress('home');if(hasMate())mateDress('home');
 hero.root.position.set(5.3,0,5.8);unstick(hero.root);mateR.root.position.set(6.1,0,5.8);unstick(mateR.root);petHome();
 H.yaw=.65;auto.t=50;auto.block=blockAt(nowH());
 const def=homeScene(id);setTime(state.time==='auto'?def.time:state.time,false);applyWeather();
 view.wide=true;view.pause=performance.now()+4500;controls.target.set(4.8,def.platform?.85:.5,4);camera.position.copy(controls.target).addScaledVector(new THREE.Vector3(1,.85,1.05).normalize(),Math.min(wideDist(),innerWidth<600?52:23));
 renderChips();renderWho();save();syncHomeUI();SFX.whoosh();say(def.line,5);return true;
}
function syncHomeUI(){
 const def=homeScene(homeWorld.active);if(!$('#homeName'))return;
 $('#homeName').textContent=def.n;$('#homeMood').textContent=JOURNEY_ROOMS.find(r=>r.id===def.id)?.mood||'';
 $('#homeCompanion').textContent=`${CHARS[state.chara].n}和${PETS[state.pet].n}都在这里`;
 $('#homeSceneBadge').dataset.scene=def.id;
}
function homeTalk(){audioStart();const def=homeScene(homeWorld.active);hero.hop=.01;H.mode='preview';say(pick([def.line,`${PETS[state.pet].n}今天也在等你。`,persOf(state.chara).yes]),5);if(count('pat',10))addAff(2);SFX.soft();}
function homePet(){audioStart();petR.hop=.01;PETS[state.pet].kind==='cat'?SFX.meow():SFX.woof();state.pats=(state.pats||0)+1;count('pat',10);if(actOK('pet'))goAct('pet');save();}
function homeFeatureTap(feature){if(feature.clue!==undefined)return jDiscover(feature.clue);if(feature.action&&actOK(feature.action))goAct(feature.action);else homeTalk();toast(feature.label);}
function tickHomeScene(dt,time){
 if(homeWorld.flame){homeWorld.flame.scale.y=.2+Math.sin(time*7)*.025;homeWorld.flame.material.emissiveIntensity=1.3+Math.sin(time*11)*.3;}
 if(homeWorld.water)homeWorld.water.material.color.offsetHSL(0,0,Math.sin(time*.5)*.00004);
 for(const f of homeWorld.features)if(f.userData.feature.clue!==undefined){f.children[0].rotation.y=time*.55;f.children[0].position.y=Math.sin(time*1.6+f.position.x)*.018;f.visible=state.journey.hints;}
 homeWorld.original.forEach(o=>{if(homeWorld.active!=='home')return;const side=o.userData.cutaway;if(side)o.visible=side==='back'?camera.position.z>-.5:camera.position.x>-.5;});
 homeWorld.shell?.traverse(o=>{if(o.userData.cutaway)o.visible=o.userData.cutaway==='back'?camera.position.z>-.5:camera.position.x>-.5;});
}
// The original shell retains its geometry and furniture positions during migration.
for(const node of homeWorld.original){const box=new THREE.Box3().setFromObject(node);if(box.max.y>.8){if(box.max.z<.23)node.userData.cutaway='back';else if(box.max.x<.23)node.userData.cutaway='left';}}
controls.minAzimuthAngle=-Infinity;controls.maxAzimuthAngle=Infinity;
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-home]');if(!b)return;audioStart();const action=b.dataset.home;
 if(action==='map')return jMap();if(action==='talk')return homeTalk();if(action==='pet')return homePet();
 if(action==='tea')return goAct('tea');if(action==='story')return jStory();if(action==='ritual')return jRitualStart();
 if(action==='discover')return jOpen(`<div class="j-dialog-kicker">LITTLE THINGS IN THIS ROOM</div><h2>${homeScene(homeWorld.active).n}的小回响</h2><p>在立体小屋里找到发光的小物，或从这里打开它们的故事。</p><div class="j-choices">${jRoom().clues.map((c,i)=>`<button data-j="clue" data-clue="${i}">${jProgress().found.includes(i)?'✓':'✧'} ${c.n}</button>`).join('')}</div>`,'clues');
 if(action==='journal')return jEnter();
 if(action==='palette'){delete state.homes.rooms[homeWorld.active].theme;applyHomePalette();save();renderSheet();}
});
