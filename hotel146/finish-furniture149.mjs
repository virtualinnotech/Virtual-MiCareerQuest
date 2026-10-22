import {io} from '../rivian147/prepare.mjs';
import {upholstery} from './finishes149.mjs';
import {prune,dedup,weld} from '../../work/browser/node_modules/@gltf-transform/functions/dist/index.js';
const path=new URL('./assets/couch.glb',import.meta.url).pathname,doc=await io.read(path);
await upholstery(doc);await doc.transform(prune(),dedup(),weld());await io.write(path,doc);
console.log('Couch finished with cylindrical velvet upholstery UVs.');
