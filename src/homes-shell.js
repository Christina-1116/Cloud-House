/* Actual architectural geometry. Only one themed shell is mounted at a time. */
const homeWorld={active:'home',shell:null,original:houseRoot.children.slice(),blocks:staticBlocks.map(r=>({...r})),lamps:fixedLamps.map(l=>({...l})),features:[],owned:[],instances:[],flame:null,water:null};
const homeGroundAt=(x,z)=>homeFloorAt(homeWorld.active,x,z);
const homeFloorMaps={wood:MT.floor.map,marble:null};
function homeWall(b,group,w,h,d,x,y,z,material,side){const m=b.box(w,h,d,material,x,y,z,.025);group.add(m);m.userData.cutaway=side;return m;}
function homeBeam(b,a,c,r=.035,col='wood'){
 const av=new THREE.Vector3(...a),cv=new THREE.Vector3(...c),v=cv.clone().sub(av);
 const m=b.put(G('home:beam',()=>new THREE.CylinderGeometry(1,1,1,10)),col);m.position.copy(av).add(cv).multiplyScalar(.5);m.scale.set(r,v.length(),r);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return m;
}
function homeArch(b,cx,cz,wide,height,col,axis='back',base=0){
 const r=wide/2,cy=base+height-r,points=[];
 for(let i=0;i<=32;i++){const a=PI-i/32*PI;points.push(axis==='back'?new THREE.Vector3(cx+Math.cos(a)*r,cy+Math.sin(a)*r,cz):new THREE.Vector3(cx,cy+Math.sin(a)*r,cz+Math.cos(a)*r));}
 const geometry=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),32,.043,7,false);b.own.push(geometry);const arch=new THREE.Mesh(geometry,b.m(col));arch.castShadow=true;b.g.add(arch);
 for(const s of [-1,1])homeBeam(b,axis==='back'?[cx+s*r,base,cz]:[cx,base,cz+s*r],axis==='back'?[cx+s*r,cy,cz]:[cx,cy,cz+s*r],.043,col);
}
function homeRail(b,x0,z0,x1,z1,y,col='wood',glass=false){
 const length=Math.hypot(x1-x0,z1-z0),n=Math.ceil(length/.38);homeBeam(b,[x0,y+.66,z0],[x1,y+.66,z1],.026,col);
 if(glass){const m=b.box(Math.abs(x1-x0)||.025,.55,Math.abs(z1-z0)||.025,GLASS,(x0+x1)/2,y+.07,(z0+z1)/2,.01);m.castShadow=false;}
 for(let i=0;i<=n;i++){const t=i/n;homeBeam(b,[lerp(x0,x1,t),y,z0+(z1-z0)*t],[lerp(x0,x1,t),y+.68,z0+(z1-z0)*t],.018,col);}
}
function homeInstances(b,key,color,items){
 const mesh=new THREE.InstancedMesh(G('home:leaf',()=>new THREE.SphereGeometry(1,10,7)),M(color,{roughness:.8}),items.length),dummy=new THREE.Object3D();
 items.forEach((v,i)=>{dummy.position.set(...v.slice(0,3));dummy.scale.set(...v.slice(3,6));dummy.rotation.set(v[6]||0,v[7]||0,v[8]||0);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.instanceMatrix.needsUpdate=true;mesh.castShadow=false;mesh.receiveShadow=true;b.g.add(mesh);homeWorld.instances.push(mesh);return mesh;
}
function homeVine(b,x,y,z,length=2,flowers=false,axis='x'){
 const leaves=[],petals=[];
 for(let i=0;i<18;i++){const t=i/17,cx=x+(axis==='x'?t*length:0),cz=z+(axis==='z'?t*length:0),cy=y-.12*Math.sin(t*PI);if(i)homeBeam(b,[x+(axis==='x'?(i-1)/17*length:0),y-.12*Math.sin((i-1)/17*PI),z+(axis==='z'?(i-1)/17*length:0)],[cx,cy,cz],.008,LEAF2);for(const s of [-1,1])leaves.push([cx,cy-.02,cz+s*.09,.105,.023,.055,0,s*.4,s*.35]);if(flowers&&i%3===0)for(let j=0;j<5;j++){const a=j/5*PI*2;petals.push([cx+Math.cos(a)*.055,cy+.02,cz+Math.sin(a)*.055,.042,.021,.031]);}}
 homeInstances(b,'leaf',LEAF,leaves);if(petals.length)homeInstances(b,'flower','#efc3bd',petals);
}
function homePendant(b,x,y,z,type='paper'){
 const white=M('#fff1d3',{emissive:'#ffe5ab',emissiveIntensity:.4,roughness:.65});homeBeam(b,[x,y+.65,z],[x,y,z],.009,'wood2');
 if(type==='crystal'){b.tor(.3,.027,BRASS,x,y,z).rotation.x=PI/2;for(let i=0;i<8;i++){const a=i/8*PI*2;homeBeam(b,[x,y+.17,z],[x+Math.cos(a)*.3,y-.06,z+Math.sin(a)*.3],.014,BRASS);b.sph(.048,white,x+Math.cos(a)*.3,y-.11,z+Math.sin(a)*.3,1,1.6,1);b.sph(.025,GLASS,x+Math.cos(a)*.3,y-.22,z+Math.sin(a)*.3,1,2,1);}}
 else{b.sph(.27,white,x,y,z,1,.78,1);for(let i=0;i<7;i++)b.tor(Math.sqrt(1-((i-3)/4)**2)*.27,.003,'cream',x,y+(i-3)*.05,z).rotation.x=PI/2;}
 fixedLamps.push({p:new THREE.Vector3(x,y-.12,z),color:'#ffdfae'});
}
function homeCloudBase(b){
 b.box(HX+.35,.35,HZ+.35,'cream',HX/2,-.39,HZ/2,.12);
 const items=[];for(let i=0;i<38;i++){const a=i/38*PI*2,c=Math.cos(a),s=Math.sin(a),k=1/Math.max(Math.abs(c)/(HX/2+.22),Math.abs(s)/(HZ/2+.22)),r=.5+(i%4)*.09;items.push([HX/2+c*k,-.75-(i%3)*.09,HZ/2+s*k,r,r*.72,r]);}items.push([4.8,-1.5,4,4.7,.65,3.9]);homeInstances(b,'cloud','#fcfbf5',items);
}
function homeCity(b){
 const windowGeo=G('home:city-window',()=>new THREE.BoxGeometry(.07,.11,.01)),windows=[];
 for(let i=0;i<22;i++){const x=-12+i*1.2,z=-10-(i%3)*2,h=2.8+(i*7%8)*.8,w=.5+(i%3)*.15;b.box(w,h,.7,M(['#626f8a','#7b8ba4','#9ca7bc'][i%3],{roughness:.6}),x,-5.5,z,.02);for(let yy=-5;yy<-5.5+h-.2;yy+=.33)for(let xx=-w*.35;xx<=w*.35;xx+=.2)windows.push([x+xx,yy,z+.356]);}
 const mesh=new THREE.InstancedMesh(windowGeo,M('#efdfb6',{emissive:'#eecb86',emissiveIntensity:.7}),windows.length),dummy=new THREE.Object3D();windows.forEach((p,i)=>{dummy.position.set(...p);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});b.g.add(mesh);homeWorld.instances.push(mesh);
}
function homeCherry(b,x,z){
 homeBeam(b,[x,0,z],[x+.15,2.7,z],.09,'wood2');const flowers=[];
 for(let k=0;k<7;k++){const a=k*2.4,px=x+Math.cos(a)*(.55+(k%2)*.25),pz=z+Math.sin(a)*.5,py=2.3+(k%3)*.2;homeBeam(b,[x+.1,1.3,z],[px,py,pz],.024,'wood2');for(let j=0;j<20;j++){const aa=j*2.4,rr=.08+Math.sqrt(j/20)*.35;flowers.push([px+Math.cos(aa)*rr,py+Math.sin(j*1.7)*.15,pz+Math.sin(aa)*rr,.12,.065,.095]);}}
 homeInstances(b,'cherry','#f0c2cd',flowers);
}
function homeFeature(b,label,pos,action){const group=new THREE.Group();group.position.set(...pos);group.userData.feature={label,action};b.g.add(group);homeWorld.features.push(group);return group;}
function buildHomeShell(id){
 const def=homeScene(id),b=new Builder();b.g.name=`home-shell-${id}`;b.g.userData.architecture=def.architecture;homeWorld.owned=b.own;homeWorld.features=[];homeWorld.instances=[];
 if(id==='home'){return null;}
 homeCloudBase(b);
 const floor=b.box(HX,.08,HZ,'floor',HX/2,-.08,HZ/2,.018);floor.receiveShadow=true;
 const height=def.platform?4.05:2.7;
 const back=new THREE.Group(),left=new THREE.Group();back.userData.cutaway='back';left.userData.cutaway='left';b.g.add(back,left);
 homeWall(b,back,HX,.15,.16,4.8,0,-.08,'wall','back');homeWall(b,back,HX,.2,.17,4.8,height-.2,-.08,'wood','back');
 for(const x of [0,3.05,6.1,9.6])homeWall(b,back,.14,height,.16,x,0,-.08,id==='loft'?'wood2':'wood','back');
 homeWall(b,left,.16,.18,HZ, -.08,0,4,'wall','left');homeWall(b,left,.16,.18,HZ,-.08,2.58,4,'wood','left');for(const z of [0,2.6,5.2,8])homeWall(b,left,.15,2.7,.15,-.08,0,z,'wood','left');
 // Large glazed panes allow an actual view into the cloud world.
 for(const x of [1.5,4.55,7.85]){const glass=b.box(2.9,height-.36,.012,GLASS,x,.18,-.065,.005);glass.castShadow=false;back.add(glass);for(let k=1;k<=3;k++)homeWall(b,back,.025,height-.36,.04,x-1.45+k*.725,.18,.02,'cream','back');}
 for(const z of [1.3,3.9,6.6]){const glass=b.box(.012,2.42,2.45,GLASS,-.06,.2,z,.004);glass.castShadow=false;left.add(glass);}
 homeRail(b,0,8,9.6,8,0,'wood',id==='loft');homeRail(b,9.6,8,9.6,0,0,'wood',id==='loft');
 if(def.platform){
  const p=def.platform,t=def.stairs;b.box(p.x1-p.x0,.13,p.z1-p.z0,'floor',(p.x0+p.x1)/2,p.y-.13,(p.z0+p.z1)/2,.018);
  for(const x of [p.x0+.15,p.x1-.2])homeBeam(b,[x,0,p.z1-.12],[x,p.y-.08,p.z1-.12],.055,'wood');
  for(let i=0;i<16;i++){const d=(t.z1-t.z0)/16,z=t.z1-(i+.5)*d,y=(i+1)/16*t.height;b.box(t.x1-t.x0,.08,d+.012,id==='loft'?'wood2':'wood',(t.x0+t.x1)/2,y-.08,z,.018);}
  for(let i=0;i<=8;i++){const z=lerp(t.z1,t.z0,i/8),y=homeGroundAt((t.x0+t.x1)/2,z);homeBeam(b,[t.x0,y,z],[t.x0,y+.65,z],.018,'wood');}
  homeBeam(b,[t.x0-.035,.63,t.z1],[t.x0-.035,t.height+.65,t.z0],.025,'wood');
  homeRail(b,p.x0,p.z1,p.x1,p.z1,p.y,id==='palace'?BRASS:'wood',id==='loft');
  homeBeam(b,[p.x0,.7,t.z0],[p.x0,p.y+.7,t.z0],.022,'wood');
 }
 if(['winter','garden','sakura'].includes(id)){for(const x of [0,3.05,6.1,9.6])homeBeam(b,[x,height,0],[x,height,2.7],.055,'wood');homeBeam(b,[0,2.7,8],[0,3.5,4],.045,'wood');homeBeam(b,[0,3.5,4],[0,2.7,0],.045,'wood');}
 if(id==='winter'){
  // A stone hearth with a dimensional chimney, logs and glowing coals.
  const f=homeFeature(b,def.feature,[.1,0,2.65],'cocoa');const hb=new Builder();hb.box(.3,3,.95,'wall',0,0,0,.04);hb.box(.43,.12,1.05,'wood',.02,1.35,0,.025);hb.box(.35,1.1,.75,M('#7d7368',{roughness:1}),.13,.15,0,.018);hb.box(.08,.63,.58,M('#443930'),.32,.23,0,.015);
  for(let k=0;k<4;k++)homeBeam(hb,[.4,.28,-.25+k*.14],[.4,.4,.12+k*.07],.055,'wood2');const flame=hb.sph(.14,M('#ffb957',{emissive:'#ef7c30',emissiveIntensity:1.8,transparent:true,opacity:.8}),.43,.5,0,.35,1.65,.8);homeWorld.flame=flame;f.add(hb.g);homeWorld.owned.push(...hb.own);
  for(const z of [1,4,6.7])homeVine(b,-.08,2.8,z,1.2,true,'z');b.box(.6,.12,8.1,'cream',-.08,2.66,4,.055);
 }else if(id==='coast'){
  for(const x of [1.5,4.55,7.85])homeArch(b,x,.04,2.9,2.6,'cream');homeArch(b,.02,3.9,2.5,2.65,'cream','left');
  const f=homeFeature(b,def.feature,[.42,2.45,5.55],'swing');const fb=new Builder();homeBeam(fb,[-.22,0,0],[.22,0,0],.009,'wood');for(let k=0;k<5;k++){homeBeam(fb,[-.18+k*.09,0,0],[-.18+k*.09,-.22-(k%2)*.08,0],.002,WHITE);fb.sph(.035,WHITE,-.18+k*.09,-.25-(k%2)*.08,0,1,.5,.7);}f.add(fb.g);
  const sea=b.box(35,.02,11,M('#8bbdcd',{metalness:.18,roughness:.3}),4,-2.1,-8,.005);homeWorld.water=sea;for(let i=0;i<12;i++)b.box(2.5+(i%3),.012,.025,M('#cde3df',{transparent:true,opacity:.7}),-8+i*2,-2.07,-8+(i%4)*1.4,.008);
 }else if(id==='garden'){
  for(const z of [0,2.6,5.2,8])homeArch(b,-.04,z,2.3,3.3,'wood','left');for(const x of [1.5,4.55,7.85])homeArch(b,x,0,2.9,height,'wood');
  for(const x of [0,3.05,6.1,9.6]){homeVine(b,x,2.8,.1,2.7,true,'z');b.plant(x<.2?.3:x,0,7.7,1.7,'cream');}
  for(const z of [1.4,3.5,6])b.plant(-.45,0,z,2.8,'cream');homeVine(b,6.2,3.65,.1,3.2,true);homeFeature(b,def.feature,[-.3,0,3.5],'water');
 }else if(id==='sakura'){
  for(const x of [1.5,4.55,7.85]){const paper=b.box(2.75,height-.38,.012,M('#f2e8d6',{transparent:true,opacity:.66,roughness:1}),x,.18,-.04,.004);back.add(paper);for(let y=.4;y<height;y+=.4)homeWall(b,back,2.8,.016,.025,x,y,.012,'wood','back');for(let k=1;k<8;k++)homeWall(b,back,.015,height-.4,.025,x-1.4+k*.35,.18,.018,'wood','back');}
  for(let x=.4;x<9;x+=1.15)for(let z=.4;z<7.7;z+=1.5){const tile=b.box(1.12,.015,1.47,M((Math.round(x*10)+Math.round(z*10))%2?'#d8c89b':'#e0d0a8'),x+.13,0,z,.004);}
  homeCherry(b,-.5,6.5);homeCherry(b,10.2,.5);homeFeature(b,def.feature,[-.5,1.4,6.5],'tea');
 }else if(id==='palace'){
  for(const x of [1.5,4.55,7.85])homeArch(b,x,.02,2.7,height-.05,BRASS);for(const x of [.13,3.05,6.1,9.48]){homeWall(b,back,.26,height,.27,x,0,.1,'cream','back');homeWall(b,back,.36,.12,.36,x,.12,.1,BRASS,'back');homeWall(b,back,.38,.14,.35,x,height-.3,.1,BRASS,'back');}
  for(let y=.32;y<height-.15;y+=.62)homeWall(b,back,9.4,.025,.028,4.8,y,.11,BRASS,'back');homePendant(b,3.8,2.65,5.3,'crystal');homePendant(b,7.85,3.6,1.3,'crystal');homeVine(b,6.1,3.8,.13,3.1,true);homeFeature(b,def.feature,[3.8,2.45,5.3],'tea');
 }else if(id==='loft'){
  for(const x of [0,3.05,6.1,9.6])homeWall(b,back,.08,height,.17,x,0,.07,'wood2','back');for(const y of [.2,1.7,3,4])homeWall(b,back,9.6,.04,.15,4.8,y,.04,'wood2','back');homeCity(b);homePendant(b,3.7,2.4,5.3);homeFeature(b,def.feature,[4.6,1,7.45],'stargaze');
 }else if(id==='nordic'){
  for(const x of [1.5,4.55,7.85])homeArch(b,x,.04,2.75,2.65,'cream');for(let i=0;i<24;i++)homeWall(b,left,.07,2.5,.028,.03,.15,.15+i*.1,'wood','left');
  homePendant(b,2.45,2.28,5.65);homePendant(b,6.7,2.25,4.6);b.plant(6.5,0,.3,2,'cream');homeFeature(b,def.feature,[2.45,2.25,5.65],'sofa_read');
 }else if(id==='boho'){
  for(const x of [1.5,4.55,7.85])homeArch(b,x,.03,2.7,2.65,'wood');for(const x of [0,4.8,9.6]){homeBeam(b,[x,0,0],[x,2.65,0],.065,'wood');homeBeam(b,[x,2.65,0],[x,2.65,3],.055,'wood');}
  for(let i=0;i<24;i++){const x=.3+i*.105;homeBeam(b,[x,2.2,.14],[x,1.6-Math.sin(i*.6)*.12,.14],.004,'cream');if(i<23)homeBeam(b,[x,1.9,.14],[x+.105,1.8,.14],.004,'cream');}
  homePendant(b,2.45,2.25,5.65);homeVine(b,.1,2.7,.2,3.9,false);b.plant(6.4,0,.35,2,'cream');homeFeature(b,def.feature,[1.1,0,7.45],'swing');
 }else if(id==='zen'){
  // A fully geometric moon gate, visible from both sides.
  const gate=b.tor(1.06,.105,'wood',.035,1.3,3.6);gate.rotation.y=PI/2;
  for(let i=0;i<15;i++){const x=-.65-(i%3)*.12,z=.5+i*.45,h=1.9+(i%4)*.21;homeBeam(b,[x,0,z],[x,h,z],.035,'acc');for(let y=.3;y<h;y+=.38)b.tor(.036,.008,'wood',x,y,z).rotation.x=PI/2;}
  const pond=b.box(2.8,.035,1.4,M('#b9cec1',{metalness:.25,roughness:.18}),1.6,-.05,8.65,.015);homeWorld.water=pond;for(let i=0;i<7;i++)b.sph(.17,'wood2',.4+i*.4,-.07,8.1+(i%2)*.4,1,.35,.7);
  homePendant(b,6.7,2.3,4.6);homeFeature(b,def.feature,[.08,1.3,3.6],'tea');
 }
 if(['coast','nordic','boho','zen'].includes(id)){for(const x of [7.55,9.35])homeBeam(b,[x,0,.25],[x,2.3,.25],.024,'wood');homeBeam(b,[7.55,2.3,.25],[9.35,2.3,.25],.025,'wood');homeVine(b,7.55,2.3,.25,1.8,id==='coast');}
 homePendant(b,4.35,2.35,2.05,id==='palace'?'crystal':'paper');
 houseRoot.add(b.g);return b.g;
}
function disposeHomeShell(){
 if(!homeWorld.shell)return;homeWorld.shell.removeFromParent();for(const g of homeWorld.owned)g.dispose();homeWorld.shell=null;homeWorld.owned=[];homeWorld.instances=[];homeWorld.flame=null;homeWorld.water=null;
}
