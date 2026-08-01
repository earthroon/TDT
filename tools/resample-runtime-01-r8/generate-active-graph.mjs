import {spawnSync} from 'node:child_process';
const result=spawnSync('npm',['run','generate:active-graph-01'],{cwd:new URL('../..',import.meta.url).pathname,stdio:'inherit'});if(result.status!==0)process.exit(result.status??1);
