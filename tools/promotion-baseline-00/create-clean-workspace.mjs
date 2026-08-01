import os from 'node:os';
import path from 'node:path';
import { ROOT, cleanCopy, parseArg } from './lib.mjs';

const label = parseArg('label', 'workspace');
const destination = path.resolve(parseArg('destination', path.join(os.tmpdir(), 'dadum-promotion-baseline-00', label)));
cleanCopy(ROOT, destination);
console.log(destination);
