/* Rounded kittens with actual three-dimensional coats, faces, paws and tails. */
const petMaterials = new Map();
function petMaterial(key, make) {
  if (!petMaterials.has(key)) petMaterials.set(key, make());
  return petMaterials.get(key);
}
function releasePetGeometry(rig) {
  // Builder primitives and shared materials belong to the game caches.
  if (rig.b) for (const geometry of rig.b.own) geometry.dispose();
  rig.paws = []; rig.eyes = []; rig.ears = [];
}
function catCoat(def, x, y, z, part) {
  const chest = part === 'chest' || part === 'muzzle';
  if (def.coat === 'point') return part === 'tail' || part === 'paw' || part === 'ear' || (part === 'head' && z > .25 && Math.hypot(x * .8, y + .05) < .79) ? def.dark : def.c;
  if (def.coat === 'ragdoll') {
    if (chest || part === 'paw') return def.c2;
    if (part === 'ear' || part === 'tail') return def.dark;
    if (part === 'head' && z > .3) return Math.abs(x) < .18 + Math.max(0, -y) * .52 ? def.c2 : def.dark;
  }
  if (def.coat === 'tuxedo') {
    if (chest || part === 'paw' || (part === 'head' && z > .4 && Math.abs(x) < .14 + Math.max(0, -y) * .62)) return def.c2;
    return def.c;
  }
  if (def.coat === 'calico') {
    if (chest || part === 'paw' || (part === 'head' && z > .6 && Math.abs(x) < .2)) return def.c2;
    const patch = Math.sin(x * 4 + z * 3 + y * 2) + Math.cos(y * 5 - z * 2);
    return patch > .55 ? def.orange : patch < -.25 ? def.dark : def.c;
  }
  if (chest && !['black', 'gray'].includes(def.coat)) return def.c2;
  if (part === 'paw' && ['tabby', 'golden', 'white'].includes(def.coat)) return def.c2;
  if (def.coat === 'tabby' && part !== 'muzzle' && Math.sin(y * 24 + x * 5 + z * 4) > .86 && (part === 'tail' || z < .45 || y > .35)) return def.dark;
  if (def.coat === 'golden' && part === 'head' && z > .6 && y < -.2) return def.c2;
  return def.c;
}
function catColor(def, x, y, z, part, light = 0) {
  const hex = catCoat(def, x, y, z, part);
  const key = `color:${hex}`;
  const base = petMaterial(key, () => new THREE.Color(hex));
  return base.clone().lerp(new THREE.Color('#fff6e8'), light);
}
function catFur(b, parent, def, center, axes, part, count, length = def.fur, surface = null) {
  const material = petMaterial(`coat:${def.id}`, () => new THREE.MeshPhysicalMaterial({
    color:'#ffffff', vertexColors:true, roughness:.92, sheen:1, sheenRoughness:.65,
    sheenColor:new THREE.Color('#f4e5d2'), bumpMap:fuzzTex, bumpScale:.0012,
  }));
  const base = surface?.geometry || new THREE.SphereGeometry(1, 40, 28), attr = base.attributes.position, colors = [];
  for (let i=0; i<attr.count; i++) catColor(def,attr.getX(i),attr.getY(i),attr.getZ(i),part).toArray(colors, i*3);
  base.setAttribute('color',new THREE.Float32BufferAttribute(colors,3)); b.own.push(base);
  const mesh = new THREE.Mesh(base,material);mesh.position.copy(center);mesh.scale.copy(axes);
  mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);
  const vertices=[], shades=[], normals=[], uv=[];
  let seed=17 + def.sprite*313;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const v=new THREE.Vector3(), n=new THREE.Vector3(), tangent=new THREE.Vector3(), start=new THREE.Vector3(), middle=new THREE.Vector3(), tip=new THREE.Vector3(), across=new THREE.Vector3();
  const emit=(p,color,u,w)=>{p.toArray(vertices,vertices.length);color.toArray(shades,shades.length);n.toArray(normals,normals.length);uv.push(u,w);};
  for(let i=0;i<count;i++) {
    const y=1-2*(i+.5)/count, radius=Math.sqrt(1-y*y), angle=i*2.39996323+random()*.25;
    v.set(Math.cos(angle)*radius,y,Math.sin(angle)*radius);
    // Keep the eyes and nose clear; the face is framed by cheek and brow fur.
    if(part==='head'&&v.z>.69&&v.y<.4&&v.y>-.55&&Math.abs(v.x)<.6)continue;
    if(surface) {
      const t=(i+.5)/count, axis=surface.curve.getTangent(t), u=new THREE.Vector3().crossVectors(axis,new THREE.Vector3(0,0,1)).normalize(), w=new THREE.Vector3().crossVectors(axis,u).normalize();
      n.copy(u).multiplyScalar(Math.cos(angle)).addScaledVector(w,Math.sin(angle));
      start.copy(surface.curve.getPoint(t)).addScaledVector(n,surface.radius*(1-.45*t));v.set(Math.cos(angle),t*2-1,Math.sin(angle));
    } else {
      n.set(v.x/axes.x,v.y/axes.y,v.z/axes.z).normalize();
      start.copy(v).multiply(axes).add(center);
    }
    tangent.set(-n.z,0,n.x).normalize();if(tangent.lengthSq()<.1)tangent.set(1,0,0);
    across.crossVectors(n,tangent).normalize().multiplyScalar(.00055+random()*.00055);
    const len=length*(.55+random()*.75), bend=(random()-.5)*len*.45;
    middle.copy(start).addScaledVector(n,len*.58).addScaledVector(tangent,bend*.4);
    tip.copy(start).addScaledVector(n,len).addScaledVector(tangent,bend);tip.y-=len*.15;
    const dark=catColor(def,v.x,v.y,v.z,part,.01+random()*.055), light=catColor(def,v.x,v.y,v.z,part,.09+random()*.07);
    const a=start.clone().sub(across),c=start.clone().add(across),d=middle.clone().addScaledVector(across,.55),e=middle.clone().addScaledVector(across,-.55);
    emit(a,dark,0,0);emit(c,dark,1,0);emit(d,light,1,.55);
    emit(a,dark,0,0);emit(d,light,1,.55);emit(e,light,0,.55);
    emit(e,light,0,.55);emit(d,light,1,.55);emit(tip,light,.5,1);
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(shades,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));b.own.push(geo);
  const furMat=petMaterial(`fibers:${def.id}`,()=>new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95,side:THREE.DoubleSide}));
  const fur=new THREE.Mesh(geo,furMat);fur.receiveShadow=true;parent.add(fur);
  b.g.userData.furCount=(b.g.userData.furCount||0)+vertices.length/27;
}
function catCurve(b,parent,points,radius,color) {
  const geo=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),16,radius,5,false);
  b.own.push(geo);const m=new THREE.Mesh(geo,M(color,{roughness:.68}));parent.add(m);return m;
}
function catEar(b,parent,def,side) {
  const group=new THREE.Group();parent.add(group);group.position.set(side*.135,.108,-.005);group.rotation.set(-.08,side*-.16,side*-.16);
  const shape=new THREE.Shape();shape.moveTo(-.071,0);shape.quadraticCurveTo(-.066,.06,-.022,.142);shape.quadraticCurveTo(0,.176,.022,.14);shape.quadraticCurveTo(.071,.055,.071,0);shape.closePath();
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:.025,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:3,steps:1,curveSegments:10});b.own.push(geometry);
  const outer=new THREE.Mesh(geometry,PL(catCoat(def,side,.8,.2,'ear')));outer.castShadow=true;group.add(outer);
  const inner=new THREE.Mesh(geometry,PL('#dc9696'));inner.scale.set(.64,.7,.2);inner.position.set(0,.017,.042);group.add(inner);
  // Small fur fans soften the pointed silhouette without covering the pink ear.
  catFur(b,group,def,new THREE.Vector3(0,.01,.002),new THREE.Vector3(.068,.025,.038),'ear',210,def.fur*.7);
  return group;
}
function buildSoftCat(rig,def) {
  if(rig.b)rig.body.remove(rig.b.g);
  const b=rig.b=new Builder(),g=b.g;rig.body.add(g);rig.def=def;g.scale.setScalar(.98);g.userData.petId=def.id;
  catFur(b,g,def,new THREE.Vector3(0,.21,-.03),new THREE.Vector3(.15,.19,.175),'body',2300);
  catFur(b,g,def,new THREE.Vector3(0,.26,.096),new THREE.Vector3(.13,.137,.068),'chest',850,def.fur*1.15);
  const head=rig.head=new THREE.Group();head.name='cat-head';head.position.set(0,.4,.12);g.add(head);
  catFur(b,head,def,new THREE.Vector3(),new THREE.Vector3(.19,.172,.153),'head',3400,def.fur*1.12);
  rig.ears=[-1,1].map(side=>catEar(b,head,def,side));
  rig.eyes=[];
  const glass=petMaterial('cat:glass',()=>new THREE.MeshPhysicalMaterial({color:'#100f10',roughness:.055,clearcoat:1,clearcoatRoughness:.03}));
  for(const side of [-1,1]) {
    const eye=new THREE.Group();eye.name='cat-eye';eye.position.set(side*.083,.016,.139);eye.rotation.y=side*.2;head.add(eye);rig.eyes.push(eye);
    const eyeball=b.sph(.057,glass,0,0,0,1,1.08,.52);eye.add(eyeball);
    const iris=b.tor(.045,.0058,M(def.iris,{roughness:.25,metalness:.12}),0,-.002,.027);eye.add(iris);
    const pupil=b.sph(.041,glass,0,.004,.028,1,1.05,.26);eye.add(pupil);
    for(const [x,y,r] of [[-.018,.024,.013],[.02,-.019,.005]]){const shine=b.sph(r,M('#ffffff',{roughness:.08,emissive:'#ffffff',emissiveIntensity:.22}),x,y,.044,1,1,.25);shine.castShadow=false;eye.add(shine);}
    catFur(b,head,def,new THREE.Vector3(side*.035,-.054,.145),new THREE.Vector3(.05,.037,.031),'muzzle',160,.01);
    const cheek=b.sph(.03,M('#efa6a5',{transparent:true,opacity:.6,roughness:1}),side*.125,-.035,.12,1,.65,.15);head.add(cheek);cheek.rotation.y=side*.4;cheek.castShadow=false;
    for(let j=0;j<3;j++)catCurve(b,head,[[side*.047,-.057-j*.008,.166],[side*.123,-.051-j*.01,.171],[side*.19,-.033-j*.018,.162]],.0008,def.coat==='black'?'#c9b7ab':'#d4c7b7');
  }
  const nose=b.sph(.013,M(def.coat==='point'||def.coat==='black'?'#9e645e':'#e39c9b',{roughness:.38}),0,-.035,.184,1.1,.66,.65);head.add(nose);
  catCurve(b,head,[[0,-.042,.18],[0,-.058,.179]],.0014,'#ad8174');
  for(const side of [-1,1])catCurve(b,head,[[0,-.057,.178],[side*.012,-.066,.172],[side*.024,-.058,.166]],.0012,'#ad8174');
  rig.paws=[];
  for(const z of [-.12,.12])for(const side of [-1,1]) {
    const paw=new THREE.Group();paw.position.set(side*(z<0?.095:.073),.052,z);g.add(paw);rig.paws.push(paw);
    catFur(b,paw,def,new THREE.Vector3(),new THREE.Vector3(.047,.05,.06),'paw',170,.012);
    if(z>0)catFur(b,paw,def,new THREE.Vector3(0,.053,-.008),new THREE.Vector3(.036,.065,.04),'paw',180,.016);
    for(const t of [-1,1])catCurve(b,paw,[[t*.013,-.012,.056],[t*.014,.001,.059],[t*.012,.016,.051]],.0007,def.coat==='point'?'#8d6752':'#c8b9a7');
  }
  const tail=rig.tail=new THREE.Group();tail.name='cat-tail';tail.position.set(.085,.145,-.147);tail.rotation.y=-.28;g.add(tail);
  const curve=new THREE.CatmullRomCurve3([[0,0,0],[.035,.12,-.04],[.075,.26,-.07],[.075,.36,-.045],[.057,.4,-.015]].map(p=>new THREE.Vector3(...p)));
  const radius=.061,geometry=new THREE.TubeGeometry(curve,32,radius,16,false),positions=geometry.attributes.position,point=new THREE.Vector3();
  for(let i=0;i<positions.count;i++) {const t=Math.floor(i/17)/32,center=curve.getPoint(t);point.fromBufferAttribute(positions,i).sub(center).multiplyScalar(1-.45*t).add(center);positions.setXYZ(i,point.x,point.y,point.z);}
  geometry.computeVertexNormals();
  catFur(b,tail,def,new THREE.Vector3(),new THREE.Vector3(1,1,1),'tail',1600,def.fur*1.25,{curve,geometry,radius});
  catFur(b,tail,def,curve.getPoint(1),new THREE.Vector3(.034,.038,.034),'tail',170,def.fur);
}
