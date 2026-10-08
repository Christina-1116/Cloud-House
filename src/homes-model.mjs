// Scene definitions and persistence are independent of Three.js.
const palette=(wall,back,floor,wood,acc,acc2,acc3,fabric)=>({wall,back,floor,wood,wood2:wood,acc,acc2,acc3,fabric,tile:wall,deck:floor,cream:'#faf4e7',rug:fabric});
const raised={x0:6.1,x1:9.6,z0:0,z1:3.2,y:1.5};
const stairs={x0:5.1,x1:6.1,z0:.4,z1:4.2,height:1.5};
export const HOME_SCENES=[
 {id:'home',n:'云端原居',architecture:'original',ambience:'none',time:'day',line:'今天也想和你在窗边坐一会儿。',feature:'云朵信箱',palette:palette('#f5ecdc','#dfe7d3','#efc993','#d4ab77','#a9c097','#e4a89c','#a9cfd6','#f3ead8')},
 {id:'winter',n:'冬日暖炉',architecture:'timber-loft',ambience:'snow',time:'day',line:'雪在外面，我们把热可可留在里面。',feature:'温暖壁炉',platform:raised,stairs,palette:palette('#f2e1c8','#d6cab5','#d9b284','#956b49','#a4af8d','#c4977d','#d2baa0','#e5d3b6')},
 {id:'coast',n:'海盐假日',architecture:'coastal-arches',ambience:'none',time:'day',line:'等风停下来，陪你听一会儿海。',feature:'贝壳风铃',palette:palette('#fff5e5','#d5e8ec','#e8d3ae','#cbb38e','#8db9d0','#bdd6e1','#e6bd98','#e5eef0')},
 {id:'garden',n:'森屿花房',architecture:'glass-conservatory',ambience:'firefly',time:'day',line:'你来了。新开的花想第一个给你看。',feature:'雨后花架',platform:raised,stairs,palette:palette('#f3efdd','#dce7d1','#dbbc8b','#bda276','#91ad7c','#d8b79b','#c6d4a9','#f2ead6')},
 {id:'sakura',n:'樱风茶舍',architecture:'shoji-teahouse',ambience:'petal',time:'day',line:'把茶泡好，再陪你看花落下来。',feature:'樱下茶亭',platform:raised,stairs,palette:palette('#f4e7d3','#e9d8bf','#d9b88a','#ad7f59','#c7b08e','#e7b0b6','#b0bea2','#f2e6d0')},
 {id:'palace',n:'玫瑰旧梦',architecture:'rose-palazzo',ambience:'petal',time:'day',line:'再大的房间，也想给你留一张椅子。',feature:'玫瑰水晶灯',platform:raised,stairs,palette:palette('#fff3dc','#f5e4c8','#ecdac0','#bda071','#dab2b5','#cbb17f','#d2c5ae','#f3e7dc')},
 {id:'loft',n:'星幕阁楼',architecture:'urban-mezzanine',ambience:'firefly',time:'night',line:'整个城市都亮起来了，这盏灯是等你的。',feature:'星城望远镜',platform:raised,stairs,palette:palette('#c9d0da','#adbacd','#cbd0d5','#727d8d','#8eaac2','#b5b8c8','#bfd4dd','#d4dce2')},
 {id:'nordic',n:'风与白昼',architecture:'nordic-arcade',ambience:'none',time:'day',line:'今天没有安排。一起发会儿呆也很好。',feature:'白昼风灯',palette:palette('#faf6ed','#efeadd','#e3d4bb','#c8b496','#d2d7c6','#dbcbbb','#b8c9c5','#f5f0e5')},
 {id:'boho',n:'落日织梦',architecture:'woven-canopy',ambience:'none',time:'dusk',line:'把今天的疲惫放下来，落日还没有走。',feature:'落日织毯',palette:palette('#f6e6ca','#e9d3b2','#d8b58a','#b98f62','#c99975','#cfaa82','#b7a582','#edd9bb')},
 {id:'zen',n:'月白山房',architecture:'moon-gate',ambience:'none',time:'day',line:'不用说什么。你在这里，就很好。',feature:'月门竹影',palette:palette('#f1ecd9','#e1dfca','#d6c8ad','#aa926b','#a9b298','#cbc0a6','#b6bca3','#eee8d7')}
];
export const homeScene=id=>HOME_SCENES.find(scene=>scene.id===id)||HOME_SCENES[0];
export function homeFloorAt(id,x,z){
 const s=HOME_SCENES.find(scene=>scene.id===id);if(!s?.platform)return 0;
 const p=s.platform,t=s.stairs;
 if(x>=p.x0&&x<=p.x1&&z>=p.z0&&z<=p.z1)return p.y;
 if(x>=t.x0&&x<t.x1&&z>=t.z0&&z<=t.z1)return t.height*(t.z1-z)/(t.z1-t.z0);
 return 0;
}
const common=[['counter','counter',2.4,.35,0],['fridge','fridge',4.1,.42,0],['sink','sinkCab',.32,.8,90],['bed','bed',8.45,1.2,0],['nightstand','nightstand',7.25,.4,0],['wardrobe','wardrobe',9,2.85,0],['sofa','sofa',2.45,5.65,0],['coffee','coffee',2.45,6.65,0],['tv','tv',2.45,3.9,0],['rugLiving','rugLiving',2.45,6.25,0],['table','table',4.35,2.05,0],['chairA','chairA',3.9,2.95,180],['chairB','chairB',4.8,2.95,180],['desk','desk',9.2,5,-90],['deskChair','deskChair',8.37,5,90],['bookshelf','bookshelf',9.32,6.25,-90],['petBed','petBed',6.7,6.7,0],['teaset','teaset',6.7,4.6,0],['planters','planters',.5,7,90],['hangChair','hangChair',.7,4,0],['piano','piano',8.3,7,0],['floorLamp','floorLamp',4.5,6.75,0],['bigPlant','bigPlant',4.4,7.55,0],['yoga','yoga',5,5.55,0],['telescope','telescope',4.6,7.45,0],['armchair','armchair',4.1,4.65,0]];
const original=[['bed','bed',8.55,1.12,0],['counter','counter',4.35,.36,0],['fridge','fridge',5.9,.42,0],['sink','sinkCab',.3,.75,90],['sofa','sofa',6.2,6.8,0],['tv','tv',6.2,4.35,0],['coffee','coffee',6.2,5.75,0],['rugLiving','rugLiving',6.2,6,0],['table','table',4.8,2.05,0],['chairA','chairA',4.2,2.95,180],['chairB','chairB',5.35,2.95,180],['desk','desk',.48,4.2,90],['deskChair','deskChair',1.38,4.2,-90],['bookshelf','bookshelf',.3,3.2,90],['petBed','petBed',3.7,6,0],['planters','planters',.55,6.8,90],['teaset','teaset',4.15,4.65,0],['piano','piano',3.75,6.9,0],['telescope','telescope',2.1,7.45,0],['nightstand','nightstand',7.25,.5,0],['wardrobe','wardrobe',9,2.95,0],['tub','tub',1.5,.45,0],['bench','bench',1.5,1.75,0],['armchair','armchair',4.45,6.3,0]];
export function homeSeed(id){
 const layout=(id==='home'?original:common).map(p=>[...p]);
 if(['coast','nordic','boho','zen'].includes(id))layout.push(['tub','tub',8.05,3.05,0]);
 if(id==='coast')layout.push(['aquarium','aquarium',6.05,.36,0]);
 if(id==='boho')layout.push(['record','record',6.05,.4,0]);
 return layout.map(([u,k,x,z,r])=>({u:id==='home'&&u==='bed'?'bed':id==='home'&&u==='counter'?'counter':id==='home'&&u==='fridge'?'fridge':id==='home'&&u==='sink'?'sink':`scene:${id}:${u}`,k,x,z,r,core:true}));
}
const cleanFurniture=list=>Array.isArray(list)?list.filter(f=>f&&typeof f.u==='string'&&typeof f.k==='string'&&Number.isFinite(f.x)&&Number.isFinite(f.z)&&Number.isFinite(f.r)&&f.x>=0&&f.x<=9.6&&f.z>=0&&f.z<=8).map(f=>({...f})):[];
export function restoreHomes(saved){
 const source=saved?.homes,rooms={};
 for(const scene of HOME_SCENES){
  const old=source?.rooms?.[scene.id];
  let furn=old&&Array.isArray(old.furn)?cleanFurniture(old.furn):homeSeed(scene.id);
  let theme=Number.isInteger(old?.theme)&&old.theme>=0&&old.theme<5?old.theme:undefined;
  if(scene.id==='home'&&!old&&Array.isArray(saved?.furn)&&saved.furn.length){
   const legacy=cleanFurniture(saved.furn);furn=legacy.concat(homeSeed('home').filter(seed=>!legacy.some(f=>f.k===seed.k)));
   if(Number.isInteger(saved.theme)&&saved.theme>=0&&saved.theme<5)theme=saved.theme;
  }
  rooms[scene.id]={furn,...(theme!==undefined?{theme}:{} )};
 }
 return {version:1,active:HOME_SCENES.some(s=>s.id===source?.active)?source.active:'home',rooms};
}
