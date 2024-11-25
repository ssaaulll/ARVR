const material_tex = new THREE.MeshBasicMaterial({map: texture});
const box = document.querySelector('#cubrick');
const mesh = box.getObject3D('mesh');
mesh.material = material_tex;