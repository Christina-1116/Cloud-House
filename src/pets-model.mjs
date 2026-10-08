export const PETS = [
  { id: 'cat0', n: '云绒', kind: 'cat', breed: '纯白长毛', note: '像一团会呼噜的云。', c: '#f9f3e8', c2: '#fffaf2', dark: '#e9ddd0', iris: '#b77c35', fur: .039, coat: 'white', sprite: 0 },
  { id: 'cat1', n: '橘座', kind: 'cat', breed: '橘色虎斑', note: '晒过太阳的暖橘色。', c: '#dfa05d', c2: '#fff1dd', dark: '#b97439', iris: '#b97f35', fur: .025, coat: 'tabby', sprite: 1 },
  { id: 'cat2', n: '煤球', kind: 'cat', breed: '灰色英短', note: '圆圆的脸，安静的陪伴。', c: '#98908d', c2: '#c3b7ac', dark: '#70676a', iris: '#bc843b', fur: .023, coat: 'gray', sprite: 2 },
  { id: 'dog0', n: '豆包', kind: 'dog', c: '#e2b47a', c2: '#fbf3e6' },
  { id: 'dog1', n: '汤圆', kind: 'dog', c: '#fbf7f0', c2: '#e9d9c4' },
  { id: 'cat3', n: '花花', kind: 'cat', breed: '三花猫', note: '每一块花色都是小小惊喜。', c: '#f8eedf', c2: '#fff8ec', dark: '#574841', orange: '#cf8d46', iris: '#b67e36', fur: .032, coat: 'calico', sprite: 3 },
  { id: 'cat4', n: '奶糖', kind: 'cat', breed: '奶牛猫', note: '穿着小礼服的淘气朋友。', c: '#484342', c2: '#fff5e9', dark: '#2c2a2b', iris: '#b77b34', fur: .031, coat: 'tuxedo', sprite: 4 },
  { id: 'cat5', n: '暹罗', kind: 'cat', breed: '暹罗猫', note: '蓝眼睛里藏着一片小天空。', c: '#e7c9a5', c2: '#f5dfc2', dark: '#684836', iris: '#69b9e5', fur: .025, coat: 'point', sprite: 5 },
  { id: 'cat6', n: '布偶', kind: 'cat', breed: '布偶猫', note: '软绵绵地，把心事接住。', c: '#e6d7c6', c2: '#fff7ee', dark: '#ab8c79', iris: '#73c0e9', fur: .039, coat: 'ragdoll', sprite: 6 },
  { id: 'cat7', n: '金渐层', kind: 'cat', breed: '金渐层猫', note: '一小勺蜂蜜色的温柔。', c: '#e7ac61', c2: '#fff0d6', dark: '#b98547', iris: '#ae8139', fur: .03, coat: 'golden', sprite: 7 },
  { id: 'cat8', n: '墨墨', kind: 'cat', breed: '黑猫', note: '夜色很软，它也是。', c: '#463b38', c2: '#695650', dark: '#2a2527', iris: '#bc853c', fur: .031, coat: 'black', sprite: 8 },
];
// Keep the five legacy slots intact; new cats use stable IDs as well as indices.
export function restorePetSelection(saved) {
  const byId = PETS.findIndex(pet => pet.id === saved?.petId);
  if (byId >= 0) return byId;
  return Number.isInteger(saved?.pet) && saved.pet >= 0 && saved.pet < PETS.length ? saved.pet : 0;
}
