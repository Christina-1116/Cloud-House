import test from 'node:test';
import assert from 'node:assert/strict';
import {HOME_SCENES,homeScene,homeFloorAt,restoreHomes} from '../src/homes-model.mjs';
test('legacy furnishings migrate to the original home with purchased positions intact',()=>{
  const old={furn:[{u:'my-sofa',k:'sofa',x:6,z:6,r:90}],theme:2};
  const result=restoreHomes(old);
  assert.deepEqual(result.rooms.home.furn.find(f=>f.u==='my-sofa'),old.furn[0]);
  assert.equal(result.rooms.home.theme,2);
  old.furn[0].x=1;assert.equal(result.rooms.home.furn.find(f=>f.u==='my-sofa').x,6);
});
test('each home starts with its own complete companion furniture and independent save',()=>{
  const homes=restoreHomes({});
  assert.equal(HOME_SCENES.length,10);
  for(const scene of HOME_SCENES){const keys=homes.rooms[scene.id].furn.map(f=>f.k);for(const key of ['bed','counter','petBed','sofa','chairA','chairB','teaset'])assert.ok(keys.includes(key));}
  homes.rooms.winter.furn[0].x=1;assert.notEqual(homes.rooms.coast.furn[0].x,1);
});
test('raised bedrooms can be reached through stairs and unknown scenes use the ground floor',()=>{
  assert.equal(homeFloorAt('loft',8,1),1.5);
  assert.equal(homeFloorAt('loft',5.6,4.3),0);
  const heights=[4.1,3.3,2.5,1.7,.5].map(z=>homeFloorAt('loft',5.6,z));
  for(let i=1;i<heights.length;i++)assert.ok(heights[i]>heights[i-1]);
  assert.equal(homeFloorAt('coast',8,1),0);assert.equal(homeFloorAt('unknown',8,1),0);
});
test('invalid room identifiers and malformed furniture recover without sharing input objects',()=>{
  const saved={homes:{active:'missing',rooms:{coast:{furn:[{u:'bad',k:'sofa',x:NaN,z:2,r:0},{u:'ok',k:'sofa',x:4,z:6,r:90}]}}}};
  const out=restoreHomes(saved);assert.equal(out.active,'home');
  assert.equal(out.rooms.coast.furn.filter(f=>f.u==='bad').length,0);
  assert.ok(out.rooms.coast.furn.some(f=>f.u==='ok'));
  out.rooms.coast.furn.find(f=>f.u==='ok').x=7;assert.equal(saved.homes.rooms.coast.furn[1].x,4);
  assert.equal(homeScene('missing').id,'home');
});
