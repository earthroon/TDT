import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { canonicalBakemonoRinneJson } from '../../app/legacy-runtime/core/compute/qmap_webgpu/bakemono_rinne_contract_receipt.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export const FORMULA_REL='app/legacy-runtime/shaders/rinne_bakemono_fusion_frag.glsl';
export const UTILITY_REL='app/legacy-runtime/shaders/glsl_util.glsl';
export const WEBGL_VERTEX_SOURCE=`attribute vec2 a_position;\nvarying vec2 v_texCoord;\nvoid main(){\n  v_texCoord = a_position * 0.5 + 0.5;\n  gl_Position = vec4(a_position, 0.0, 1.0);\n}\n`;
const sha=(v)=>createHash('sha256').update(v).digest('hex');
const shaJson=(v)=>sha(canonicalBakemonoRinneJson(v));
export function expandAuthorityWebglFragment(){const formula=fs.readFileSync(path.join(ROOT,FORMULA_REL),'utf8').replace(/\r\n/g,'\n');const utility=fs.readFileSync(path.join(ROOT,UTILITY_REL),'utf8').replace(/\r\n/g,'\n');const marker='#include "glsl_util.glsl"';if((formula.match(new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'))??[]).length!==1)throw Object.assign(new Error('Authority include marker count mismatch'),{code:'E_BKR02_WEBGL_SOURCE_NOT_AUTHORITY'});const expanded=formula.replace(marker,utility);const body={schemaVersion:1,schemaId:'tdt.effect.bakemono-rinne.webgl-include-expansion-manifest.v2',patchId:'TDT-BAKEMONO-RINNE-WGSL-02',formulaSourcePath:FORMULA_REL,utilitySourcePath:UTILITY_REL,formulaSourceDigest:sha(formula),utilitySourceDigest:sha(utility),expandedFragmentDigest:sha(expanded),vertexShaderDigest:sha(WEBGL_VERTEX_SOURCE),includeReplacementCount:1,onlyIncludeSubstitution:true,precisionQualifierPreserved:/precision\s+mediump\s+float\s*;/.test(expanded),webgl2Port:false};return {formula,utility,expanded,vertex:WEBGL_VERTEX_SOURCE,manifest:{...body,manifestDigest:shaJson(body)}};}
