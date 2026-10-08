const petPreview = { renderer:null, scene:null, camera:null, model:null, angle:-18, drag:null };
function renderPetChoices() {
  const selected=PETS[state.pet];
  const card=(c,i)=>`<button class="card pet-card" data-pet="${i}" aria-pressed="${i===state.pet}" aria-label="选择${c.n}，${c.breed||'小狗'}">${c.kind==='cat'?`<span class="pet-portrait" aria-hidden="true" style="background-image:url('${JOURNEY_ART['cats-grid.webp']}');background-position:${c.sprite%3*50}% ${Math.floor(c.sprite/3)*50}%"></span>`:`<img src="${c.thumb}" alt="">`}<b>${c.n}</b><span>${c.breed||'小狗'}</span><em class="pet-selected">${i===state.pet?'✓ 陪伴中':'选择它'}</em></button>`;
  return `<div class="pet-showcase"><div class="pet-preview" id="petPreview" aria-label="${selected.n}的可旋转3D模型"></div><div class="pet-intro"><span class="pet-kicker">A LITTLE FRIEND</span><h3>${selected.n}</h3><p>${selected.note||'把快乐摇成一条小尾巴。'}</p><span class="pet-breed">${selected.breed||'小狗'} · 正在陪你</span><label class="pet-turn" for="petTurn">拖动看看它，或转动滑杆<input id="petTurn" type="range" min="-180" max="180" value="${petPreview.angle}" aria-label="旋转宠物3D预览"></label></div></div><div class="sec pet-section-title">九位软绒朋友 <small>任选一只，马上陪你回家</small></div><div class="cards pet-cats" role="group" aria-label="九种小猫">${PETS.map((c,i)=>c.kind==='cat'?card(c,i):'').join('')}</div><div class="sec">还有两位摇尾巴的老朋友</div><div class="cards pet-dogs">${PETS.map((c,i)=>c.kind==='dog'?card(c,i):'').join('')}</div>`;
}
function renderPetPreview() {
  const host=$('#petPreview');if(!host||!petPreview.renderer||$('#sheet').hidden)return;
  const width=host.clientWidth,height=host.clientHeight;
  if(!width||!height)return;
  petPreview.renderer.setSize(width,height,false);petPreview.camera.aspect=width/height;petPreview.camera.updateProjectionMatrix();
  if(petPreview.model)petPreview.model.rotation.y=petPreview.angle*D2R;
  petPreview.renderer.render(petPreview.scene,petPreview.camera);
}
function mountPetPreview() {
  const host=$('#petPreview');if(!host)return;
  if(!petPreview.renderer) {
    const R=petPreview.renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});R.setPixelRatio(Math.min(devicePixelRatio||1,2));R.toneMapping=THREE.NeutralToneMapping;R.toneMappingExposure=1.04;
    const S=petPreview.scene=new THREE.Scene();S.environment=scene.environment;S.environmentIntensity=.7;
    S.add(new THREE.HemisphereLight('#fff9ef','#d9c4b4',2));
    const key=new THREE.DirectionalLight('#fff8ee',3.3);key.position.set(-2,3,4);S.add(key);
    const rim=new THREE.DirectionalLight('#d2e7f1',2.2);rim.position.set(2,2,-2);S.add(rim);
    petPreview.camera=new THREE.PerspectiveCamera(29,1,.05,10);
    const cv=document.createElement('canvas');cv.width=cv.height=128;const x=cv.getContext('2d'),gradient=x.createRadialGradient(64,64,4,64,64,63);gradient.addColorStop(0,'rgba(84,70,55,.24)');gradient.addColorStop(1,'rgba(84,70,55,0)');x.fillStyle=gradient;x.fillRect(0,0,128,128);
    const shadow=new THREE.Mesh(new THREE.PlaneGeometry(.58,.53),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false}));shadow.rotation.x=-PI/2;shadow.position.y=-.004;S.add(shadow);
    const canvas=R.domElement;canvas.setAttribute('aria-hidden','true');
    canvas.addEventListener('pointerdown',e=>{petPreview.drag={x:e.clientX,angle:petPreview.angle};canvas.setPointerCapture(e.pointerId);});
    canvas.addEventListener('pointermove',e=>{if(!petPreview.drag)return;petPreview.angle=clamp(petPreview.drag.angle+(e.clientX-petPreview.drag.x)*.8,-180,180);if($('#petTurn'))$('#petTurn').value=petPreview.angle;renderPetPreview();});
    const end=()=>{petPreview.drag=null;};canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
  }
  if(petPreview.model)petPreview.scene.remove(petPreview.model);
  // Share the selected live pet's geometry; rebuilding owns and releases it once.
  petPreview.model=petR.b.g.clone(true);petPreview.scene.add(petPreview.model);
  petPreview.model.traverse(object=>{if(object.name==='cat-eye')object.scale.y=1;if(object.name==='cat-head'||object.name==='cat-tail')object.rotation.z=0;});
  const cat=petR.def.kind==='cat';petPreview.camera.position.set(0,cat?.35:.28,cat?1.58:1.1);petPreview.camera.lookAt(0,cat?.31:.19,0);
  host.append(petPreview.renderer.domElement);renderPetPreview();
}
document.addEventListener('input',e=>{if(e.target.id==='petTurn'){petPreview.angle=+e.target.value;renderPetPreview();}});
addEventListener('resize',renderPetPreview);
