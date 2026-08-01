# TDT-BUILD-LOCK-01

## Canonical Dependency Lock Recovery / Immutable npm ci / Registry·Cache Input Identity / Install Graph Reproducibility / Lock Mutation Zero Seal

```text
SPEC STATUS: READY FOR BAKE
SPEC ID: TDT-BUILD-LOCK-01
TARGET PROJECT: DadumDadum Export Runtime
PARENT LINEAGE: TDT-EXPORT-PROMOTION-03
CANONICAL PACKAGE MANAGER: npm 10.9.2
CANONICAL NODE: 22.16.0
CANONICAL TARGET: win32-x64
LOCKFILE VERSION: 3
FINAL PROMOTION TARGET: DEPENDENCY_LOCK_PROMOTED
```

---

## 0. 목적

본 명세는 손상되거나 오래된 `package-lock.json`을 단순 재생성하는 절차가 아니다.

다음 다섯 권위를 하나의 재현 가능한 영수증 사슬로 봉인한다.

1. `package.json`이 선언한 직접 의존성의 정확 버전 권위
2. `package-lock.json`이 소유하는 전체 전이 의존성 그래프 권위
3. Lock과 Package Tarball을 제공한 Registry·npm 설정·Cache 입력 권위
4. 동일 입력에서 수행한 오프라인 `npm ci` A/B의 설치 그래프 재현성
5. Lock 생성·설치·검증 과정에서 `package.json`과 `package-lock.json`의 바이트가 변하지 않았다는 Mutation Zero 증거

최종 목표는 다음 상태다.

```text
package.json exact direct graph
= package-lock.json root graph
= lock transitive graph
= frozen cache closure
= offline npm ci run A
= offline npm ci run B
```

이 등식이 하나라도 깨지면 `DEPENDENCY_LOCK_PROMOTED`를 발급하지 않는다.

---

## 1. 현재 소스 감사 결과

### 1.1 확정된 현 상태

| 항목 | 관측값 | 판정 |
|---|---:|---|
| `package-lock.json` 형식 | lockfileVersion 3 | 형식 자체는 유효 |
| Lock package entry | 360개, root 제외 | 기존 전이 그래프 존재 |
| Direct version policy | `package.json`은 exact | PASS |
| Root graph parity | 불일치 12건 | BLOCKED |
| Existing lock integrity 누락 | 0 | 기존 항목 범위에서 PASS |
| Existing lock resolved 누락 | 0 | 기존 항목 범위에서 PASS |
| Toolchain profile | Node 22.16.0 / npm 10.9.2 | PASS |
| Canonical target | win32-x64 | 선언 완료 |
| Observed registry transport | 내부 npm proxy | 2026-07-25에 HTTP 503 관측 |
| Production build admission | Lock Gate에서 종료 | 정상 Fail-Closed |

### 1.2 Root graph 불일치 12건

| Group | Package | `package.json` 기대 | 기존 Lock root |
|---|---|---:|---:|
| `dependencies` | `jszip` | `3.10.1` | `^3.10.1` |
| `dependencies` | `pako` | `2.1.0` | `^2.1.0` |
| `dependencies` | `pinia` | `3.0.1` | `누락` |
| `dependencies` | `sharp` | `0.33.2` | `^0.33.2` |
| `dependencies` | `vue` | `3.5.40` | `누락` |
| `devDependencies` | `@napi-rs/cli` | `2.18.4` | `누락` |
| `devDependencies` | `@vitejs/plugin-vue` | `6.0.7` | `누락` |
| `devDependencies` | `electron` | `29.0.0` | `^29.0.0` |
| `devDependencies` | `electron-builder` | `24.13.3` | `^24.13.3` |
| `devDependencies` | `typescript` | `5.9.3` | `누락` |
| `devDependencies` | `vite` | `8.1.5` | `누락` |
| `devDependencies` | `vue-tsc` | `3.2.2` | `누락` |

### 1.3 현재 Lock을 직접 편집하지 않는 이유

기존 Lock은 일부 패키지의 전체 전이 그래프를 아예 갖고 있지 않다. Root 항목만 exact version으로 고쳐도 다음은 증명되지 않는다.

- 누락된 Vue·Pinia·Vite 계열의 실제 전이 그래프
- Peer dependency 선택 결과
- OS·CPU별 Optional package closure
- Package Tarball의 `integrity`와 `resolved`
- npm 10.9.2가 실제로 선택한 Hoisted install layout

따라서 JSON 수동 편집, 다른 프로젝트 Lock 복사, Root 섹션만 패치하는 방식은 전부 금지한다.

---

## 2. 명세 범위

### 2.1 포함 범위

- Canonical Dependency Input Profile
- Ambient npm 설정 격리와 Secret Redaction
- Registry Transport Identity와 Logical Lock Host 분리
- Lock Candidate의 격리 생성
- Root graph와 전이 그래프 검증
- Package Tarball Cache Closure 수집과 봉인
- 동일 Frozen Cache를 사용한 Offline `npm ci` A/B
- Node Modules Instance Graph와 Content Digest 비교
- Peer·Optional·Extraneous Package 검증
- Lifecycle Script 실행 0 증명
- `package.json`·Lock Mutation Zero
- Expected-old-SHA 기반 Lock Atomic Promotion
- Build ID와 Dependency Graph Digest 재발급

### 2.2 제외 범위

- Vite Production Bundle 실행
- Electron Binary 다운로드·패키징
- Native Decoder `.node` 빌드
- Sharp·Electron Postinstall 실행
- 취약점 Audit 결과를 Promotion Gate로 사용하는 것
- Package License 법률 판단
- EP03 Cross-format E2E

Lifecycle Script가 필요한 Binary Bootstrap은 후속 Build Emit·Package 단계가 소유한다. BUILD-LOCK-01의 Canonical `npm ci`는 `--ignore-scripts`를 강제한다.

---

## 3. 규범 용어

| 용어 | 의미 |
|---|---|
| MUST | 위반 시 즉시 Fail-Closed |
| MUST NOT | 수행되면 결과 전부 무효 |
| SHOULD | 예외 사유와 Receipt가 있을 때만 변경 가능 |
| Candidate Lock | 검증 전 임시 Lock, 제품 권위 없음 |
| Promoted Lock | 전체 Gate를 통과해 원본 경로에 Atomic Replace된 Lock |
| Logical Lock Host | Lock `resolved`에 기록되는 정규 Host |
| Transport Registry | npm이 실제 HTTP 요청을 보낸 Registry |
| Cache Closure | Candidate Lock이 참조하는 Package Tarball 전체 집합 |
| Frozen Cache | Cache Closure가 봉인된 후 재현성 검증에 사용되는 입력 |
| Install Graph | `node_modules`에 설치된 Package Instance 집합 |
| Content Graph | Package Instance 내부 파일·Symlink·Digest 집합 |
| Mutation Zero | 권위 파일의 실행 전후 Raw SHA-256이 동일한 상태 |

---

## 4. SSOT 소유권

| 권위 | SSOT | 비권위 정보 |
|---|---|---|
| 직접 의존성 이름·버전 | `package.json` | 기존 Lock root |
| 전이 의존성 선택 | Promoted `package-lock.json` | `node_modules` 추론 |
| Node·npm 버전 | `tools/toolchain-profile.json` | 호스트 기본 버전 |
| Registry·Cache 모드 | `tools/dependency-input-profile.json` | 사용자의 `.npmrc` |
| npm Effective Config | Sanitized Config Receipt | 콘솔 출력 |
| Tarball bytes | Frozen Cache Closure | Registry 최신 상태 |
| Install 결과 | Run A/B Install Manifest | `npm ls` 단독 출력 |
| Lock Promotion | Lock Promotion Receipt | 파일 존재 여부 |
| Build identity | Runtime Manifest의 Dependency Digest | Commit timestamp |

### 4.1 Ambient 설정 금지

다음은 권위 입력으로 암묵 상속할 수 없다.

- 사용자 `~/.npmrc`
- 전역 npmrc
- 셸에 남아 있는 임의 `NPM_CONFIG_*`
- 이전 프로젝트가 채운 공유 Cache
- IDE가 주입한 Proxy
- 사용자의 `NODE_OPTIONS`

Runner는 격리된 `HOME`, `NPM_CONFIG_USERCONFIG`, `NPM_CONFIG_GLOBALCONFIG`, `NPM_CONFIG_CACHE`를 명시해야 한다.

---

## 5. 상태 머신

```text
UNASSESSED
  ↓
INPUT_PROFILE_SEALED
  ↓
REGISTRY_IDENTITY_VERIFIED
  ↓
LOCK_CANDIDATE_GENERATED
  ↓
LOCK_GRAPH_VERIFIED
  ↓
CACHE_CLOSURE_VERIFIED
  ↓
OFFLINE_CI_A_VERIFIED
  ↓
OFFLINE_CI_B_VERIFIED
  ↓
INSTALL_REPRODUCIBILITY_VERIFIED
  ↓
LOCK_MUTATION_ZERO_VERIFIED
  ↓
DEPENDENCY_LOCK_PROMOTED
```

어느 단계에서든 실패하면 상태는 `BLOCKED`가 되며 이전 PASS 단계와 실패 이유를 Receipt에 남긴다.

### 5.1 비정규 전이 금지

- Registry가 실패했다고 다른 Registry로 자동 전환 금지
- Online Cache 수집 실패 후 Shared Cache 재사용 금지
- Linux에서 통과한 설치 결과를 win32-x64 Receipt로 승격 금지
- `npm install` 성공만으로 `npm ci` 재현성 생략 금지
- Run A만 통과하고 Run B 생략 금지
- Candidate Lock을 검증 전에 원본 Lock에 덮어쓰기 금지

---

## 6. Canonical Dependency Input Profile v1

경로: `tools/dependency-input-profile.json`

```json
{
  "schemaVersion": 1,
  "profileId": "dadum.dependency-input.win32-x64-v1",
  "nodeVersion": "22.16.0",
  "npmVersion": "10.9.2",
  "lockfileVersion": 3,
  "targetPlatform": "win32",
  "targetArch": "x64",
  "installStrategy": "hoisted",
  "directVersionPolicy": "exact-semver-v1",
  "peerPolicy": "strict-no-legacy-v1",
  "lifecyclePolicy": "ignore-all-during-lock-proof-v1",
  "recoveryMode": "registry-online-then-frozen-cache-v1",
  "logicalResolvedHostPolicy": "canonical-npmjs-v1",
  "registryIdentityRef": "tools/registry-input-profile.json",
  "cachePolicyId": "project-closure-frozen-cache-v1",
  "networkPolicy": "registry-only-during-acquisition-v1",
  "offlineReplayRequired": true,
  "offlineReplayCount": 2,
  "lockMutationPolicy": "raw-byte-zero-v1"
}
```

### 6.1 Recovery Mode

허용 모드는 정확히 둘이다.

| Mode | 용도 | Network | Promotion 가능 |
|---|---|---:|---:|
| `registry-online-then-frozen-cache-v1` | Registry에서 Candidate와 Cache Closure 확보 | Acquisition 단계만 허용 | 가능 |
| `frozen-cache-replay-only-v1` | 이미 봉인된 Cache로 Lock·Install 재검증 | 전면 금지 | 가능 |

`prefer-offline`이나 실패 시 Online으로 돌아가는 Hybrid 모드는 금지한다.

---

## 7. npm Configuration Authority

### 7.1 Canonical npmrc

경로: `tools/npmrc.lock-recovery`

```ini
save-exact=true
package-lock=true
lockfile-version=3
install-strategy=hoisted
legacy-peer-deps=false
strict-peer-deps=true
ignore-scripts=true
audit=false
fund=false
update-notifier=false
foreground-scripts=false
omit-lockfile-registry-resolved=false
replace-registry-host=npmjs
strict-ssl=true
```

Registry URL과 Credential은 이 파일에 평문 저장하지 않는다. Registry URL은 Profile이 제공하고, Credential은 실행 시 Secret Channel이 주입한다.

### 7.2 Effective Config Projection

다음 필드만 Sanitized Receipt에 포함한다.

- `registry`의 normalized origin digest
- Scope registry 이름과 origin digest
- `strict-ssl`
- CA file content digest
- `replace-registry-host`
- `install-strategy`
- `legacy-peer-deps`
- `strict-peer-deps`
- `ignore-scripts`
- `package-lock`
- `lockfile-version`
- `offline`·`prefer-offline`·`prefer-online`
- Fetch retry·timeout policy
- Proxy 존재 여부와 proxy origin digest

다음은 Receipt에 값이나 Hash를 기록하지 않는다.

- `_authToken`
- `_password`
- `username`
- Client certificate private key
- OTP

Credential은 `credentialPresent:true|false`와 `credentialSourceId`만 기록한다.

### 7.3 Environment Projection

허용된 `NPM_CONFIG_*` 외 변수가 발견되면 실패한다. `NODE_OPTIONS`는 빈 문자열이어야 한다. `CI`, `PATH`, 격리 HOME, Temp 경로는 값 대신 정책 ID와 digest만 기록한다.

---

## 8. Registry Identity v1

### 8.1 Logical Host와 Transport Registry 분리

현재 Lock의 `resolved`는 `registry.npmjs.org`를 가리키지만 실제 npm 요청은 Proxy를 통과할 수 있다. 두 값은 같은 필드로 뭉개지 않는다.

```text
logicalResolvedHost
= package-lock.json에 기록되는 URL Host

transportRegistryOrigin
= npm이 실제 HTTP 요청을 보내는 Registry Origin
```

Receipt 필드:

```json
{
  "registryProfileId": "dadum.registry-input-v1",
  "transportOriginSha256": "...",
  "logicalResolvedHostPolicy": "canonical-npmjs-v1",
  "tlsPeerCertificateSha256": "...",
  "strictSsl": true,
  "scopedRegistryDigests": {},
  "credentialPresent": true,
  "credentialSourceId": "process-secret-channel-v1",
  "fallbackRegistryUsed": false
}
```

### 8.2 Registry 실패 정책

- `401`·`403`: Credential Blocker
- `404`: Package/Version Blocker
- `429`: Retry Budget 소진 후 Blocker
- `5xx`: 동일 Registry에 한정된 Retry 후 Blocker
- DNS·TLS 실패: Blocker

Registry를 자동 변경하지 않는다. Registry Profile을 변경하려면 새 Profile Digest와 새 Recovery Run이 필요하다.

---

## 9. Lock Recovery Transaction

### 9.1 작업 공간

원본 프로젝트에서 `npm install`을 직접 실행하지 않는다.

```text
<temp>/build-lock-01/<runId>/
├─ input/
│  ├─ package.json
│  ├─ package-lock.before.json
│  ├─ npmrc.lock-recovery
│  └─ input-profile.json
├─ recovery/
│  └─ package-lock.candidate.json
├─ cache-acquire/
├─ cache-frozen/
├─ ci-a/
└─ ci-b/
```

### 9.2 Input CAS

Runner 시작 시 다음 SHA를 고정한다.

- `packageJsonBeforeSha256`
- `packageLockBeforeSha256`
- `toolchainProfileSha256`
- `dependencyInputProfileSha256`
- `canonicalNpmrcSha256`
- `registryInputProfileSha256`

실행 도중 원본 SHA가 바뀌면 Stale Run으로 실패한다.

### 9.3 Candidate 생성 명령

Runner가 격리 Workspace에서 다음과 동등한 명령을 실행한다.

```text
npm install
  --package-lock-only
  --ignore-scripts
  --audit=false
  --fund=false
  --save-exact
  --package-lock=true
  --install-strategy=hoisted
  --strict-peer-deps=true
  --legacy-peer-deps=false
```

명령 전후 `package.json` Raw SHA는 동일해야 한다.

### 9.4 Candidate Lock 기본 조건

- `lockfileVersion === 3`
- `packages[""]`가 `package.json` 직접 그래프와 정확히 일치
- 직접 의존성 버전은 Exact SemVer
- 모든 Non-link package는 `resolved`와 `integrity` 보유
- `resolved`는 HTTPS 또는 명시적 허용 Source Protocol
- Absolute local path 금지
- Undeclared workspace link 금지
- Lock root의 name·version이 package.json과 일치
- Peer closure가 strict policy에서 유효
- npm이 경고한 peer override 0

---

## 10. Dependency Graph Digests

### 10.1 Direct Graph Digest

```text
directGraphDigest
= SHA256(canonical-json({dependencies, devDependencies, optionalDependencies, peerDependencies}))
```

### 10.2 Lock Semantic Graph Digest

각 Lock Package Entry에서 다음만 Canonical Record로 사용한다.

- Relative package path
- name·version
- resolved
- integrity
- link
- dev·optional·devOptional
- dependencies·optionalDependencies·peerDependencies
- peerDependenciesMeta
- engines·os·cpu·libc
- bin
- hasInstallScript

Raw Lock SHA와 Semantic Graph Digest를 둘 다 기록한다. Raw SHA는 바이트 정체성, Semantic Digest는 그래프 의미 정체성을 소유한다.

### 10.3 Source Protocol Policy

| Source | 기본 정책 |
|---|---|
| HTTPS npm tarball | 허용 |
| `file:` | 명시적 project-relative local package만 예외 가능 |
| `link:` | 금지 |
| `git+ssh:` | 금지 |
| Git commit-pinned HTTPS | 예외 Receipt가 있을 때만 허용 |
| HTTP | 금지 |
| Registry tag, 예: `latest` | 직접 의존성에서 금지 |

현재 `dependency-policy-exceptions.json`은 빈 배열이므로 예외는 0개여야 한다.

---

## 11. Lifecycle Script Inventory

Candidate Lock의 모든 Package Tarball을 대상으로 다음을 조사한다.

- `preinstall`
- `install`
- `postinstall`
- `prepare`
- `binding.gyp`
- `hasInstallScript`

BUILD-LOCK-01의 A/B `npm ci`는 `--ignore-scripts`이므로 실행 카운트는 반드시 0이다.

Script 보유 Package는 별도 Inventory로 남기고 후속 단계가 명시적으로 실행한다. Electron·Sharp·Native Addon 관련 Script가 존재하더라도 Lock Reproducibility 증명과 섞지 않는다.

Receipt:

```json
{
  "lifecyclePolicyId": "ignore-all-during-lock-proof-v1",
  "packagesWithLifecycleScripts": [],
  "executedLifecycleScriptCount": 0,
  "unexpectedScriptExecutionDetected": false
}
```

---

## 12. Cache Closure Acquisition

### 12.1 Cache 입력 구조

Registry Online 단계에서 Candidate Lock이 참조하는 모든 Tarball을 전용 Cache에 확보한다.

공유 사용자 Cache 전체를 복사하지 않는다. Project Lock에서 도달 가능한 Content만 Closure로 추출한다.

### 12.2 Cache Record

각 Tarball Record:

```json
{
  "packageId": "name@version",
  "lockPath": "node_modules/name",
  "resolvedLogicalUrlSha256": "...",
  "integrity": "sha512-...",
  "tarballByteLength": 0,
  "tarballSha256": "...",
  "cacheContentKey": "...",
  "transportRegistryProfileId": "dadum.registry-input-v1"
}
```

### 12.3 Frozen Cache Digest

```text
cacheClosureDigest
= SHA256(canonical-json(sorted tarball records))
```

Cache 경로, mtime, npm log, access timestamp는 Digest에 포함하지 않는다.

### 12.4 Cache Mutation 규칙

A/B Run은 Frozen Cache의 복제본을 사용한다. npm이 Index·Log를 갱신할 수는 있지만 다음은 변하면 안 된다.

- Lock에서 도달 가능한 Content Blob 집합
- 각 Blob의 Byte Length
- 각 Blob의 SHA-256
- 각 Blob의 SRI

새 Content Blob이 추가되면 Offline Network Leakage 또는 Cache Incompleteness로 실패한다.

---

## 13. Immutable Offline npm ci A/B

### 13.1 Canonical Target Host

최종 Install Reproducibility Receipt는 실제 `win32-x64` Host에서만 발급한다.

Linux Host는 Candidate Lock·Cache Closure를 준비할 수 있지만 상태 상한은 `CACHE_CLOSURE_VERIFIED`다. `--os=win32 --cpu=x64`만으로 실제 Windows 설치 Receipt를 대체할 수 없다.

### 13.2 Run 명령

A와 B는 서로 다른 깨끗한 Workspace에서 동일 명령을 실행한다.

```text
npm ci
  --offline
  --ignore-scripts
  --audit=false
  --fund=false
  --install-strategy=hoisted
  --strict-peer-deps=true
  --legacy-peer-deps=false
  --cache <run-local-frozen-cache-copy>
```

### 13.3 Run 격리

- 서로 다른 Workspace
- 서로 다른 npm Cache 복제본
- 동일 Candidate Lock bytes
- 동일 Canonical npmrc
- 동일 Toolchain
- 동일 Target Host
- 동일 Locale·Timezone
- Network Socket 차단
- 실행 전 `node_modules` 부재
- 실행 후 `npm ls --all` invalid·extraneous 0

---

## 14. Install Graph Manifest v1

### 14.1 Package Instance Record

```json
{
  "relativePath": "node_modules/pkg",
  "name": "pkg",
  "version": "1.2.3",
  "packageJsonSha256": "...",
  "lockIntegrity": "sha512-...",
  "lockResolvedSha256": "...",
  "dev": true,
  "optional": false,
  "peer": false,
  "os": [],
  "cpu": [],
  "contentDigest": "..."
}
```

### 14.2 Content Manifest

Package Instance 내부 파일을 Relative Path 순으로 기록한다.

- Regular file: path·byteLength·SHA-256
- Symlink/Junction: path·normalized target
- Directory는 기록하지 않음
- mtime·ctime·inode 제외
- Run-specific npm logs 제외
- `node_modules/.cache`는 존재 자체를 금지

Windows `.cmd` Shim과 실행 Wrapper도 Content에 포함한다. 동일 Target Host A/B이므로 Byte가 달라지면 재현성 실패다.

### 14.3 Graph 비교

다음이 모두 일치해야 한다.

- Package Instance count
- Relative package paths
- name·version
- Package JSON SHA
- Per-package Content Digest
- Whole Install Graph Digest
- Optional Package inclusion set
- Peer placement set
- `.bin` command set
- `node_modules/.package-lock.json` semantic digest

---

## 15. Lock Mutation Zero

### 15.1 권위 파일

- `package.json`
- Candidate `package-lock.json`
- `tools/toolchain-profile.json`
- `tools/dependency-input-profile.json`
- `tools/npmrc.lock-recovery`
- `tools/registry-input-profile.json`

### 15.2 검증 시점

각 파일의 Raw SHA를 다음 시점에 비교한다.

1. Recovery 시작 전
2. Candidate 생성 후
3. Cache Closure 생성 후
4. Offline CI A 후
5. Offline CI B 후
6. Promotion 직전

`npm ci`가 Lock을 수정하면 설치 자체가 성공했더라도 실패다.

### 15.3 원본 Lock Atomic Promotion

Promotion은 CAS 방식으로 수행한다.

```text
current package-lock SHA
== expectedOldPackageLockSha256

이면
candidate temp file fsync
→ same-volume atomic rename
→ promoted file readback SHA
→ promotion receipt write
```

현재 Lock SHA가 달라졌으면 `E_LOCK_STALE_BASE`로 중단한다.

---

## 16. Required Runtime Tools

베이크 시 다음 도구를 추가한다.

| 도구 | 역할 |
|---|---|
| `tools/run-build-lock-01.mjs` | 전체 Transaction Orchestrator |
| `tools/capture-npm-config-identity.mjs` | Sanitized Effective Config Receipt |
| `tools/generate-lock-candidate.mjs` | 격리 Candidate 생성 |
| `tools/verify-lock-graph-v2.mjs` | Root·Transitive·Protocol 검증 |
| `tools/acquire-project-cache-closure.mjs` | Candidate 도달 Tarball 수집 |
| `tools/verify-cache-closure.mjs` | SRI·SHA·Completeness 검증 |
| `tools/run-offline-npm-ci-replay.mjs` | A/B Offline CI |
| `tools/generate-install-graph-manifest.mjs` | Installed Graph·Content Manifest |
| `tools/verify-install-reproducibility.mjs` | A/B Digest 비교 |
| `tools/verify-lock-mutation-zero.mjs` | Raw Byte Mutation 검증 |
| `tools/promote-package-lock-cas.mjs` | Lock Atomic Promotion |
| `tools/gate-build-lock-01.mjs` | 정적 72 Gate |

### 16.1 package.json Scripts

```json
{
  "verify:build-lock-input": "node tools/capture-npm-config-identity.mjs",
  "generate:lock-candidate": "node tools/generate-lock-candidate.mjs",
  "verify:lock-graph-v2": "node tools/verify-lock-graph-v2.mjs",
  "generate:cache-closure": "node tools/acquire-project-cache-closure.mjs",
  "verify:cache-closure": "node tools/verify-cache-closure.mjs",
  "verify:offline-ci-replay": "node tools/run-offline-npm-ci-replay.mjs",
  "verify:install-reproducibility": "node tools/verify-install-reproducibility.mjs",
  "verify:lock-mutation-zero": "node tools/verify-lock-mutation-zero.mjs",
  "promote:package-lock-cas": "node tools/promote-package-lock-cas.mjs",
  "verify:build-lock-01": "node tools/gate-build-lock-01.mjs",
  "build-lock:recover": "node tools/run-build-lock-01.mjs"
}
```

기존 `verify:dependency-lock`은 BUILD-LOCK-01의 Final Receipt를 검증하도록 재귀속한다.

---

## 17. Receipt Schemas

### 17.1 Lock Candidate Receipt

```json
{
  "schemaVersion": 1,
  "specId": "TDT-BUILD-LOCK-01",
  "runId": "...",
  "status": "LOCK_CANDIDATE_GENERATED",
  "packageJsonSha256": "...",
  "oldPackageLockSha256": "...",
  "candidatePackageLockSha256": "...",
  "lockfileVersion": 3,
  "directGraphDigest": "...",
  "lockSemanticGraphDigest": "...",
  "packageEntryCount": 0,
  "rootGraphExact": true,
  "integrityMissing": [],
  "resolvedMissing": [],
  "packageJsonMutated": false
}
```

### 17.2 Offline CI Run Receipt

```json
{
  "schemaVersion": 1,
  "runLabel": "A",
  "targetPlatform": "win32",
  "targetArch": "x64",
  "offline": true,
  "networkAttemptCount": 0,
  "lifecycleScriptExecutionCount": 0,
  "packageLockBeforeSha256": "...",
  "packageLockAfterSha256": "...",
  "packageJsonBeforeSha256": "...",
  "packageJsonAfterSha256": "...",
  "installInstanceCount": 0,
  "installGraphDigest": "...",
  "installContentDigest": "...",
  "invalidPackageCount": 0,
  "extraneousPackageCount": 0,
  "status": "OFFLINE_CI_A_VERIFIED"
}
```

### 17.3 Final Promotion Receipt

```json
{
  "schemaVersion": 1,
  "specId": "TDT-BUILD-LOCK-01",
  "status": "DEPENDENCY_LOCK_PROMOTED",
  "toolchainProfileDigest": "...",
  "dependencyInputProfileDigest": "...",
  "registryIdentityDigest": "...",
  "sanitizedNpmConfigDigest": "...",
  "cacheClosureDigest": "...",
  "oldPackageLockSha256": "...",
  "promotedPackageLockSha256": "...",
  "directGraphDigest": "...",
  "lockSemanticGraphDigest": "...",
  "runAInstallGraphDigest": "...",
  "runBInstallGraphDigest": "...",
  "runAInstallContentDigest": "...",
  "runBInstallContentDigest": "...",
  "installGraphsEqual": true,
  "installContentsEqual": true,
  "lockMutationZero": true,
  "packageJsonMutationZero": true,
  "networkAttemptDuringReplay": false,
  "lifecycleScriptsExecuted": false,
  "atomicPromotionVerified": true,
  "promotionReceiptDigest": "..."
}
```

---

## 18. Stable Error Registry

| Error | 의미 |
|---|---|
| `E_LOCK_INPUT_PROFILE_MISSING` | Dependency Input Profile 부재 |
| `E_LOCK_INPUT_PROFILE_DIGEST_MISMATCH` | Profile Digest 불일치 |
| `E_LOCK_RECOVERY_MODE_AMBIGUOUS` | Online/Offline 모드가 동시에 활성 |
| `E_LOCK_TOOLCHAIN_NODE_MISMATCH` | Node 버전 불일치 |
| `E_LOCK_TOOLCHAIN_NPM_MISMATCH` | npm 버전 불일치 |
| `E_LOCK_TARGET_HOST_MISMATCH` | 최종 CI Host가 win32-x64 아님 |
| `E_LOCK_AMBIENT_NPM_CONFIG` | 허용되지 않은 NPM_CONFIG 환경 |
| `E_LOCK_NODE_OPTIONS_PRESENT` | NODE_OPTIONS 오염 |
| `E_LOCK_CONFIG_SECRET_LEAK` | Receipt나 Log에 Credential 노출 |
| `E_LOCK_REGISTRY_IDENTITY_MISMATCH` | Registry Profile과 실제 Transport 불일치 |
| `E_LOCK_SCOPE_REGISTRY_UNDECLARED` | 선언되지 않은 Scope Registry |
| `E_LOCK_REGISTRY_FALLBACK_USED` | Silent Registry Fallback 감지 |
| `E_LOCK_REGISTRY_AUTH_REQUIRED` | Registry 인증 실패 |
| `E_LOCK_REGISTRY_UNAVAILABLE` | Registry 5xx/DNS/TLS 실패 |
| `E_LOCK_PACKAGE_VERSION_NOT_FOUND` | Package/Version 404 |
| `E_LOCK_STALE_BASE` | 실행 중 원본 Lock 또는 package.json 변경 |
| `E_LOCK_PACKAGE_JSON_MUTATED` | Candidate 생성 중 package.json 변이 |
| `E_LOCK_LOCKFILE_VERSION_MISMATCH` | Lockfile v3 아님 |
| `E_LOCK_ROOT_GRAPH_MISMATCH` | Root dependency graph 불일치 |
| `E_LOCK_DIRECT_VERSION_NON_EXACT` | 직접 버전이 Exact SemVer 아님 |
| `E_LOCK_INTEGRITY_MISSING` | Non-link Entry integrity 누락 |
| `E_LOCK_RESOLVED_MISSING` | Non-link Entry resolved 누락 |
| `E_LOCK_UNSUPPORTED_SOURCE_PROTOCOL` | 금지 Source Protocol |
| `E_LOCK_ABSOLUTE_LOCAL_PATH` | Absolute local dependency 경로 |
| `E_LOCK_PEER_GRAPH_INVALID` | Strict peer closure 실패 |
| `E_LOCK_PEER_OVERRIDE_DETECTED` | npm peer override 발생 |
| `E_LOCK_TARBALL_INTEGRITY_FAILURE` | Tarball SRI 불일치 |
| `E_LOCK_CACHE_CLOSURE_INCOMPLETE` | Lock 도달 Tarball 누락 |
| `E_LOCK_CACHE_CONTENT_MUTATED` | Frozen Cache Content 변이 |
| `E_LOCK_OFFLINE_REPLAY_NETWORK_ATTEMPT` | Offline CI가 Network 요청 |
| `E_LOCK_LIFECYCLE_SCRIPT_EXECUTED` | Scriptless CI에서 Lifecycle 실행 |
| `E_LOCK_NPM_CI_MUTATED_LOCK` | npm ci가 Lock Byte 변이 |
| `E_LOCK_NPM_CI_MUTATED_PACKAGE_JSON` | npm ci가 package.json 변이 |
| `E_LOCK_INSTALL_GRAPH_DIVERGED` | A/B Package Instance Graph 불일치 |
| `E_LOCK_INSTALL_CONTENT_DIVERGED` | A/B 설치 파일 Content 불일치 |
| `E_LOCK_OPTIONAL_SET_DIVERGED` | A/B Optional Package Set 불일치 |
| `E_LOCK_BIN_SET_DIVERGED` | A/B .bin Command Set 불일치 |
| `E_LOCK_EXTRANEOUS_PACKAGE` | Extraneous Package 존재 |
| `E_LOCK_INVALID_PACKAGE` | npm ls invalid Package 존재 |
| `E_LOCK_DIRTY_WORKSPACE` | Run 시작 시 node_modules 또는 잔여 파일 존재 |
| `E_LOCK_ATOMIC_REPLACE_FAILED` | Lock Atomic Replace 실패 |
| `E_LOCK_PROMOTED_READBACK_MISMATCH` | 승격 후 Lock SHA 불일치 |
| `E_LOCK_RECEIPT_STALE` | Receipt 입력 SHA가 현재 파일과 불일치 |
| `E_LOCK_CANDIDATE_NOT_PROMOTABLE` | 필수 단계 미통과 Candidate 승격 시도 |

모든 Error는 Stable Error Registry에 등록하며 임의 문자열 throw를 금지한다.

---

## 19. Static Gate Matrix

| Gate | 요구사항 |
|---:|---|
| GATE-BL01-01 | BUILD-LOCK-01 Spec 파일이 저장소에 존재한다. |
| GATE-BL01-02 | Package Manager가 npm@10.9.2로 exact 고정된다. |
| GATE-BL01-03 | Node Engine이 22.16.0으로 exact 고정된다. |
| GATE-BL01-04 | Lockfile Version 정책이 3으로 고정된다. |
| GATE-BL01-05 | Canonical Target이 win32-x64다. |
| GATE-BL01-06 | 직접 dependency 버전이 모두 Exact SemVer다. |
| GATE-BL01-07 | 직접 devDependency 버전이 모두 Exact SemVer다. |
| GATE-BL01-08 | Dependency Policy Exception이 0개다. |
| GATE-BL01-09 | Dependency Input Profile이 존재한다. |
| GATE-BL01-10 | Registry Input Profile이 존재한다. |
| GATE-BL01-11 | Canonical npmrc가 존재한다. |
| GATE-BL01-12 | Canonical npmrc에 save-exact=true가 있다. |
| GATE-BL01-13 | Canonical npmrc에 strict-peer-deps=true가 있다. |
| GATE-BL01-14 | Canonical npmrc에 legacy-peer-deps=false가 있다. |
| GATE-BL01-15 | Canonical npmrc에 ignore-scripts=true가 있다. |
| GATE-BL01-16 | Canonical npmrc에 audit=false가 있다. |
| GATE-BL01-17 | Canonical npmrc에 fund=false가 있다. |
| GATE-BL01-18 | Canonical npmrc에 install-strategy=hoisted가 있다. |
| GATE-BL01-19 | Canonical npmrc에 replace-registry-host 정책이 있다. |
| GATE-BL01-20 | Credential을 npmrc에 저장하지 않는다. |
| GATE-BL01-21 | Effective Config Sanitizer가 Auth Key를 Redact한다. |
| GATE-BL01-22 | Unknown NPM_CONFIG 환경을 Reject한다. |
| GATE-BL01-23 | NODE_OPTIONS를 Reject한다. |
| GATE-BL01-24 | Online과 Offline Recovery Mode가 배타적이다. |
| GATE-BL01-25 | Registry Fallback을 금지한다. |
| GATE-BL01-26 | Logical Host와 Transport Origin을 분리한다. |
| GATE-BL01-27 | Registry Origin은 Receipt에서 Digest로 기록한다. |
| GATE-BL01-28 | Candidate 생성은 격리 Workspace에서 수행한다. |
| GATE-BL01-29 | 원본 프로젝트에서 npm install을 직접 실행하지 않는다. |
| GATE-BL01-30 | Candidate 생성 전 Input CAS를 고정한다. |
| GATE-BL01-31 | Candidate 생성 후 package.json Mutation을 검사한다. |
| GATE-BL01-32 | Root graph exact parity를 검사한다. |
| GATE-BL01-33 | Lockfile Version을 검사한다. |
| GATE-BL01-34 | Non-link integrity 누락을 검사한다. |
| GATE-BL01-35 | Non-link resolved 누락을 검사한다. |
| GATE-BL01-36 | Unsupported Source Protocol을 검사한다. |
| GATE-BL01-37 | Absolute Local Path를 검사한다. |
| GATE-BL01-38 | Peer Graph를 strict policy로 검사한다. |
| GATE-BL01-39 | Lifecycle Script Inventory를 생성한다. |
| GATE-BL01-40 | Lock proof에서 Lifecycle Script 실행 0을 강제한다. |
| GATE-BL01-41 | Lock 도달 Tarball Closure를 생성한다. |
| GATE-BL01-42 | Tarball SRI를 검증한다. |
| GATE-BL01-43 | Tarball SHA-256을 검증한다. |
| GATE-BL01-44 | Cache Closure Digest를 생성한다. |
| GATE-BL01-45 | Cache Path와 mtime을 Digest에서 제외한다. |
| GATE-BL01-46 | Offline CI A를 별도 Workspace에서 실행한다. |
| GATE-BL01-47 | Offline CI B를 별도 Workspace에서 실행한다. |
| GATE-BL01-48 | A/B가 별도 Cache 복제본을 사용한다. |
| GATE-BL01-49 | A/B가 동일 Frozen Content Closure를 사용한다. |
| GATE-BL01-50 | Offline Replay Network Attempt를 검출한다. |
| GATE-BL01-51 | Canonical Promotion은 win32-x64 Host에서만 허용한다. |
| GATE-BL01-52 | Install Package Instance Manifest를 생성한다. |
| GATE-BL01-53 | Install Package Content Manifest를 생성한다. |
| GATE-BL01-54 | Package Instance Path를 비교한다. |
| GATE-BL01-55 | Package name/version을 비교한다. |
| GATE-BL01-56 | Per-package Content Digest를 비교한다. |
| GATE-BL01-57 | Whole Install Graph Digest를 비교한다. |
| GATE-BL01-58 | Optional Package Set을 비교한다. |
| GATE-BL01-59 | Peer Placement Set을 비교한다. |
| GATE-BL01-60 | .bin Command Set을 비교한다. |
| GATE-BL01-61 | Extraneous Package 0을 요구한다. |
| GATE-BL01-62 | Invalid Package 0을 요구한다. |
| GATE-BL01-63 | Run A 전후 Lock Raw SHA를 비교한다. |
| GATE-BL01-64 | Run B 전후 Lock Raw SHA를 비교한다. |
| GATE-BL01-65 | Run A/B 전후 package.json Raw SHA를 비교한다. |
| GATE-BL01-66 | Promotion은 expected-old-SHA CAS를 사용한다. |
| GATE-BL01-67 | Promotion은 same-volume atomic rename을 사용한다. |
| GATE-BL01-68 | Promoted Lock readback SHA를 검증한다. |
| GATE-BL01-69 | Final Promotion Receipt를 생성한다. |
| GATE-BL01-70 | Runtime Build ID가 새 Lock Digest를 포함한다. |
| GATE-BL01-71 | 기존 verify:dependency-lock가 Final Receipt를 확인한다. |
| GATE-BL01-72 | Source Candidate가 Production Pointer를 변경하지 못한다. |

---

## 20. Runtime Test Matrix

| Test | 시나리오 |
|---:|---|
| TEST-BL01-001 | 정상 Registry Profile을 읽는다. |
| TEST-BL01-002 | Profile Digest 변조를 거부한다. |
| TEST-BL01-003 | Unknown Recovery Mode를 거부한다. |
| TEST-BL01-004 | Online·Offline 동시 활성화를 거부한다. |
| TEST-BL01-005 | Node 버전 불일치를 거부한다. |
| TEST-BL01-006 | npm 버전 불일치를 거부한다. |
| TEST-BL01-007 | Linux Host에서 Final Promotion을 거부한다. |
| TEST-BL01-008 | Windows x64 Host를 승인한다. |
| TEST-BL01-009 | Unknown NPM_CONFIG 변수를 거부한다. |
| TEST-BL01-010 | NODE_OPTIONS 존재를 거부한다. |
| TEST-BL01-011 | Auth Token을 Log에서 Redact한다. |
| TEST-BL01-012 | Password를 Log에서 Redact한다. |
| TEST-BL01-013 | Registry Origin Raw Value를 Public Receipt에서 감춘다. |
| TEST-BL01-014 | Scope Registry 미선언을 거부한다. |
| TEST-BL01-015 | Registry Silent Fallback을 감지한다. |
| TEST-BL01-016 | Registry 401을 Auth Blocker로 분류한다. |
| TEST-BL01-017 | Registry 404를 Version Blocker로 분류한다. |
| TEST-BL01-018 | Registry 429 Retry Budget 소진을 검증한다. |
| TEST-BL01-019 | Registry 503을 Availability Blocker로 분류한다. |
| TEST-BL01-020 | TLS 실패를 Blocker로 분류한다. |
| TEST-BL01-021 | Candidate Workspace가 깨끗한지 검사한다. |
| TEST-BL01-022 | 잔여 node_modules를 거부한다. |
| TEST-BL01-023 | 원본 package.json SHA 변경을 감지한다. |
| TEST-BL01-024 | 원본 Lock SHA 변경을 감지한다. |
| TEST-BL01-025 | package-lock-only 명령 성공을 기록한다. |
| TEST-BL01-026 | package-lock-only가 package.json을 바꾸면 거부한다. |
| TEST-BL01-027 | Lockfile v2 Candidate를 거부한다. |
| TEST-BL01-028 | Lockfile v3 Candidate를 승인한다. |
| TEST-BL01-029 | Root dependency 누락을 감지한다. |
| TEST-BL01-030 | Root dependency 초과를 감지한다. |
| TEST-BL01-031 | Root exact version mismatch를 감지한다. |
| TEST-BL01-032 | Caret direct dependency를 거부한다. |
| TEST-BL01-033 | Tilde direct dependency를 거부한다. |
| TEST-BL01-034 | Tag direct dependency를 거부한다. |
| TEST-BL01-035 | Integrity 누락 Entry를 거부한다. |
| TEST-BL01-036 | Resolved 누락 Entry를 거부한다. |
| TEST-BL01-037 | HTTP tarball을 거부한다. |
| TEST-BL01-038 | Absolute file path dependency를 거부한다. |
| TEST-BL01-039 | git+ssh dependency를 거부한다. |
| TEST-BL01-040 | 허용된 HTTPS tarball을 승인한다. |
| TEST-BL01-041 | Strict peer conflict를 거부한다. |
| TEST-BL01-042 | Peer override 경고를 거부한다. |
| TEST-BL01-043 | Optional dependency metadata를 보존한다. |
| TEST-BL01-044 | OS 제한 metadata를 보존한다. |
| TEST-BL01-045 | CPU 제한 metadata를 보존한다. |
| TEST-BL01-046 | Lifecycle Script 보유 Package를 Inventory한다. |
| TEST-BL01-047 | ignore-scripts Run에서 실행 Count 0을 검증한다. |
| TEST-BL01-048 | 의도적 Script Marker 실행을 감지한다. |
| TEST-BL01-049 | Lock 도달 Tarball 전체를 Cache에 찾는다. |
| TEST-BL01-050 | Cache Tarball 누락을 거부한다. |
| TEST-BL01-051 | Tarball SRI 변조를 감지한다. |
| TEST-BL01-052 | Tarball SHA 변조를 감지한다. |
| TEST-BL01-053 | 중복 Tarball Content를 Content Address로 합친다. |
| TEST-BL01-054 | Cache Closure Digest 정렬 결정성을 검증한다. |
| TEST-BL01-055 | Cache mtime 변경이 Closure Digest를 바꾸지 않음을 검증한다. |
| TEST-BL01-056 | Cache Content 변경이 Closure Digest를 바꿈을 검증한다. |
| TEST-BL01-057 | Run A가 offline flag로 실행된다. |
| TEST-BL01-058 | Run B가 offline flag로 실행된다. |
| TEST-BL01-059 | Run A Network Attempt를 감지한다. |
| TEST-BL01-060 | Run B Network Attempt를 감지한다. |
| TEST-BL01-061 | Run A Lock Mutation을 감지한다. |
| TEST-BL01-062 | Run B Lock Mutation을 감지한다. |
| TEST-BL01-063 | Run A package.json Mutation을 감지한다. |
| TEST-BL01-064 | Run B package.json Mutation을 감지한다. |
| TEST-BL01-065 | Run A Lifecycle Execution을 감지한다. |
| TEST-BL01-066 | Run B Lifecycle Execution을 감지한다. |
| TEST-BL01-067 | Run A Install Graph Manifest를 생성한다. |
| TEST-BL01-068 | Run B Install Graph Manifest를 생성한다. |
| TEST-BL01-069 | 동일 Package Instance Count를 승인한다. |
| TEST-BL01-070 | Package Instance Count 차이를 거부한다. |
| TEST-BL01-071 | Package Path 차이를 거부한다. |
| TEST-BL01-072 | Package Version 차이를 거부한다. |
| TEST-BL01-073 | Package JSON Digest 차이를 거부한다. |
| TEST-BL01-074 | Per-package Content Digest 차이를 거부한다. |
| TEST-BL01-075 | Whole Content Digest 일치를 승인한다. |
| TEST-BL01-076 | Optional Package Set 차이를 거부한다. |
| TEST-BL01-077 | Peer Placement 차이를 거부한다. |
| TEST-BL01-078 | .bin Command Set 차이를 거부한다. |
| TEST-BL01-079 | Extraneous Package를 거부한다. |
| TEST-BL01-080 | Invalid Package를 거부한다. |
| TEST-BL01-081 | node_modules/.cache 생성을 거부한다. |
| TEST-BL01-082 | Symlink Target 차이를 거부한다. |
| TEST-BL01-083 | Windows cmd shim 차이를 거부한다. |
| TEST-BL01-084 | node_modules/.package-lock semantic mismatch를 거부한다. |
| TEST-BL01-085 | A/B 동일 Install Graph를 승인한다. |
| TEST-BL01-086 | A/B 동일 Content Graph를 승인한다. |
| TEST-BL01-087 | Old Lock SHA CAS 성공을 검증한다. |
| TEST-BL01-088 | Stale Old Lock SHA CAS를 거부한다. |
| TEST-BL01-089 | Atomic Rename 실패 시 원본 Lock을 보존한다. |
| TEST-BL01-090 | Promoted Lock readback mismatch를 거부한다. |
| TEST-BL01-091 | Promotion Receipt Digest를 재현한다. |
| TEST-BL01-092 | 동일 입력에서 Final Receipt가 결정론적으로 재현된다. |
| TEST-BL01-093 | Promoted Lock으로 verify:dependency-lock가 PASS한다. |
| TEST-BL01-094 | 새 Lock Digest가 Runtime Build ID를 변경한다. |
| TEST-BL01-095 | Lock Promotion이 Production Pointer를 건드리지 않음을 검증한다. |
| TEST-BL01-096 | Source Status가 DEPENDENCY_LOCK_PROMOTED로만 상승함을 검증한다. |

---

## 21. Required Artifacts

| Artifact | 내용 |
|---|---|
| `TDT_BUILD_LOCK_01_INPUT_PROFILE_RECEIPT.json` | Dependency Input Profile과 Digest |
| `TDT_BUILD_LOCK_01_NPM_CONFIG_IDENTITY_REPORT.json` | Sanitized Effective npm Config |
| `TDT_BUILD_LOCK_01_REGISTRY_IDENTITY_REPORT.json` | Transport Registry·Logical Host 증거 |
| `TDT_BUILD_LOCK_01_OLD_LOCK_FORENSIC_REPORT.json` | 기존 Lock 12개 mismatch와 그래프 상태 |
| `TDT_BUILD_LOCK_01_LOCK_CANDIDATE_RECEIPT.json` | Candidate Lock 생성 증거 |
| `TDT_BUILD_LOCK_01_LOCK_GRAPH_REPORT.json` | Root·Transitive·Protocol 검증 |
| `TDT_BUILD_LOCK_01_LIFECYCLE_SCRIPT_INVENTORY.json` | Script 보유 Package 목록 |
| `TDT_BUILD_LOCK_01_CACHE_CLOSURE_MANIFEST.json` | Lock 도달 Tarball Manifest |
| `TDT_BUILD_LOCK_01_CACHE_CLOSURE_REPORT.json` | Cache Completeness·Digest |
| `TDT_BUILD_LOCK_01_OFFLINE_CI_A_RECEIPT.json` | A Run 실행 증거 |
| `TDT_BUILD_LOCK_01_OFFLINE_CI_B_RECEIPT.json` | B Run 실행 증거 |
| `TDT_BUILD_LOCK_01_INSTALL_GRAPH_A.json` | A Package Instance Manifest |
| `TDT_BUILD_LOCK_01_INSTALL_GRAPH_B.json` | B Package Instance Manifest |
| `TDT_BUILD_LOCK_01_INSTALL_REPRODUCIBILITY_REPORT.json` | A/B 비교 |
| `TDT_BUILD_LOCK_01_LOCK_MUTATION_ZERO_REPORT.json` | 권위 파일 Raw SHA Timeline |
| `TDT_BUILD_LOCK_01_PROMOTION_RECEIPT.json` | Atomic Lock Promotion 영수증 |
| `TDT_BUILD_LOCK_01_REPRODUCIBILITY_REPORT.json` | 동일 입력 반복 실행 결과 |
| `TDT_BUILD_LOCK_01_FIX_RECEIPT.json` | 전체 적용 요약과 Source Seal |
| `TDT_BUILD_LOCK_01_FINAL_VERIFY.txt` | Gate·Runtime Test 로그 |
| `TDT_BUILD_LOCK_01_PACKAGE_LOCK_PATCH.diff` | 기존 Lock 대비 Candidate Diff |

Registry raw URL, Credential, 사용자 HOME 절대 경로는 Public Artifact에 포함하지 않는다.

---

## 22. Promotion Gate

### 22.1 `DEPENDENCY_LOCK_PROMOTED` 필수 조건

- Toolchain Profile PASS
- Dependency Input Profile PASS
- Sanitized npm Config PASS
- Registry Identity PASS
- Candidate Lock Root Graph Exact
- Candidate Lockfile v3
- Integrity Missing 0
- Resolved Missing 0
- Unsupported Source 0
- Peer Conflict 0
- Cache Closure Complete
- Tarball SRI·SHA PASS
- win32-x64 Offline CI A PASS
- win32-x64 Offline CI B PASS
- A/B Install Graph 동일
- A/B Install Content 동일
- Extraneous·Invalid 0
- Lifecycle Script Execution 0
- Offline Network Attempt 0
- Package JSON Mutation Zero
- Lock Mutation Zero
- Expected-old-SHA CAS PASS
- Atomic Replace·Readback PASS
- Final Receipt Determinism PASS

### 22.2 상태 상한

| 현재 가능한 증거 | 상태 상한 |
|---|---|
| Registry가 여전히 503 | `INPUT_PROFILE_SEALED` |
| Candidate Lock 생성, Cache 미완성 | `LOCK_GRAPH_VERIFIED` |
| Linux에서 Offline A/B만 실행 | `CACHE_CLOSURE_VERIFIED` |
| Windows A만 실행 | `OFFLINE_CI_A_VERIFIED` |
| Windows A/B 동일, Lock 미교체 | `LOCK_MUTATION_ZERO_VERIFIED` |
| Atomic Promotion까지 완료 | `DEPENDENCY_LOCK_PROMOTED` |

### 22.3 금지된 PASS 문구

- Registry 503인데 “Lock 복구 완료”
- Root만 수동 수정하고 “Graph 일치”
- `npm install` 한 번 성공하고 “재현 가능”
- Linux A/B 결과로 “win32-x64 install verified”
- `npm ci`가 Lock을 바꿨는데 “immutable”
- Cache가 계속 변하는데 “frozen cache”

---

## 23. 베이크 시 적용 순서

```text
BL01-01 Existing Lock Forensic Snapshot
BL01-02 Dependency Input Profile
BL01-03 Canonical npmrc / Config Sanitizer
BL01-04 Registry Identity Probe
BL01-05 Isolated Lock Candidate Generator
BL01-06 Lock Graph Verifier v2
BL01-07 Lifecycle Script Inventory
BL01-08 Project Cache Closure Acquisition
BL01-09 Frozen Cache Verifier
BL01-10 Offline npm ci Run A
BL01-11 Offline npm ci Run B
BL01-12 Install Graph / Content Reproducibility
BL01-13 Lock Mutation Zero Timeline
BL01-14 Atomic Package Lock CAS Promotion
BL01-15 Runtime Manifest / Build ID Reissue
BL01-16 Parent EP01~EP03 Regression
BL01-17 Final Receipt / Diff / Inventory / ZIP Seal
```

---

## 24. 부모 회귀 요구

Lock Promotion 후 다음을 전부 재실행한다.

- R7 Export Truth
- EW01~EW07
- EP01~EP03
- Stable Error Registry
- Strict TypeScript
- Runtime Manifest Determinism
- Worker Manifest Determinism
- Promotion Pointer Verification

새 Lock은 Build ID를 변경해야 하지만 Export Runtime 의미·Worker Identity·Promotion Pointer active 값은 변경하면 안 된다.

---

## 25. 완료 정의

BUILD-LOCK-01은 다음 문장을 증명할 때 완료다.

> `package.json`의 exact direct graph에서 npm 10.9.2가 생성한 Lock v3가 Registry·Cache 입력 신원과 함께 봉인되었고, 동일 Frozen Cache를 사용한 실제 win32-x64 Offline `npm ci` 두 번이 같은 Package Instance·Content Graph를 생성했으며, 모든 실행 전후에 `package.json`과 Lock의 Raw Byte Mutation이 0이고, Candidate가 expected-old-SHA CAS를 통해 원자적으로 Promoted Lock이 되었다.

이 문장을 증명하지 못하면 `package-lock.json`은 복구 후보일 뿐 Production Build 입력이 아니다.

---

## 26. 후속 단계

```text
TDT-BUILD-EMIT-01

Production Vite Emit /
Worker-WASM Closure /
Static COI Runtime Route /
Emitted Artifact Identity Seal
```

BUILD-LOCK-01이 `DEPENDENCY_LOCK_PROMOTED`를 발급한 뒤에만 BUILD-EMIT-01이 Production Vite Build를 시작할 수 있다.
