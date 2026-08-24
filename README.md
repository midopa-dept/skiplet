# Skiplet

Skiplet은 macOS용 소형 오디오 플레이어입니다. 로컬 및 글로벌 단축키로 재생 위치와 볼륨을 빠르게 조절하고, 여러 오디오 파일을 재생목록으로 관리할 수 있습니다.

## 다운로드

최신 안정 버전은 `v1.2.0`입니다. 자신의 Mac에 맞는 DMG를 내려받으세요.

| 버전 | 대상 | 다운로드 |
| --- | --- | --- |
| Universal | Intel 및 Apple Silicon 모두 지원 | [Skiplet-1.2.0-universal.dmg](https://github.com/midopa-dept/skiplet/releases/download/v1.2.0/Skiplet-1.2.0-universal.dmg) |
| Apple Silicon | M1, M2, M3, M4 등 | [Skiplet-1.2.0-arm64.dmg](https://github.com/midopa-dept/skiplet/releases/download/v1.2.0/Skiplet-1.2.0-arm64.dmg) |
| Intel | Intel 프로세서 Mac | [Skiplet-1.2.0-x64.dmg](https://github.com/midopa-dept/skiplet/releases/download/v1.2.0/Skiplet-1.2.0-x64.dmg) |

Mac의 프로세서를 모르겠다면 화면 왼쪽 위의 Apple 메뉴에서 `이 Mac에 관하여`를 확인하거나 Universal 버전을 사용하세요.

DMG를 연 다음 `Skiplet.app`을 `Applications` 폴더로 드래그하면 설치됩니다. 현재 Release 파일은 코드 서명되지 않은 오픈소스 빌드이므로, macOS가 첫 실행을 차단하면 Finder에서 앱을 Control-클릭한 뒤 `열기`를 선택해야 할 수 있습니다.

## 주요 기능

- MP3 파일 선택 및 창 전체 드래그 앤 드롭
- 여러 오디오 파일을 한 번에 선택하거나 드롭해 재생목록 구성
- 현재 곡 강조, 목록 선택 재생, 이전·다음 곡 이동
- 곡 재생이 끝나면 재생목록의 다음 곡 자동 재생
- 재생목록 항목 개별 삭제 및 전체 비우기
- 드래그로 재생목록 순서 변경
- 재생목록 전체·경과·남은 시간 표시
- 다른 창 위에 Skiplet을 유지하는 창 고정
- 재생, 일시정지 및 타임라인 탐색
- 앞뒤 이동 간격 설정(기본 10초)
- 볼륨 슬라이더 및 키보드 볼륨 조절
- 서로 독립적으로 설정 가능한 로컬 및 글로벌 단축키
- 이동 간격, 볼륨 및 단축키 설정 자동 저장
- MP3, M4A, WAV, AAC, OGG, FLAC 지원

## 사용 설명서

### 1. 오디오 파일 추가

재생목록 오른쪽 위의 `파일 추가` 버튼을 누른 뒤 하나 이상의 오디오 파일을 선택하세요. Finder에서 파일 여러 개를 Skiplet 창으로 드래그해도 됩니다.

- 지원 형식: MP3, M4A, WAV, AAC, OGG, FLAC
- 기존 재생목록이 비어 있으면 첫 번째 파일이 자동으로 재생됩니다.
- 이미 곡을 재생 중이라면 새 파일은 기존 재생목록 뒤에 추가됩니다.
- 파일을 드래그하는 동안 재생목록 영역이 청록색으로 강조됩니다.

### 2. 재생 제어

가운데 원형 버튼으로 재생하거나 일시정지할 수 있습니다. 양쪽 이동 버튼은 현재 위치를 지정된 시간만큼 앞뒤로 이동합니다.

- 타임라인을 클릭하거나 드래그하면 원하는 위치로 바로 이동합니다.
- `이동 간격` 입력란에서 앞뒤 이동 시간을 변경할 수 있습니다.
- 기본 이동 간격은 10초이며 1초에서 3600초까지 설정할 수 있습니다.
- 하단 볼륨 슬라이더로 음량을 조절합니다.
- 재생 중에는 상태 배지, 이퀄라이저와 플레이어 왼쪽 강조선이 활성화됩니다.

### 3. 재생목록 관리

재생목록에는 현재 재생 중인 곡이 연두색으로 표시됩니다. 곡 이름을 누르면 해당 곡으로 바로 이동해 재생합니다.

- `이전 곡` 및 `다음 곡` 버튼으로 곡 사이를 이동합니다.
- 항목 오른쪽의 `×`를 누르면 해당 곡만 삭제됩니다.
- `전체 비우기`를 누르면 재생이 중지되고 모든 항목이 제거됩니다.
- 곡 재생이 끝나면 다음 곡이 자동으로 재생됩니다.
- 마지막 곡이 끝나면 재생목록 완료 상태가 표시됩니다.

재생 순서를 바꾸려면 항목을 클릭한 채 원하는 위치의 곡 위로 드래그하세요. 재생 중인 곡을 옮겨도 오디오는 끊기지 않습니다. 재생목록은 앱 실행 중에만 유지되며 앱을 종료하면 초기화됩니다.

### 4. 재생목록 시간 확인

재생목록 위쪽에는 세 가지 시간이 표시됩니다.

| 표시 | 의미 |
| --- | --- |
| 경과 | 앞에서 완료한 곡과 현재 곡의 재생 시간을 합한 값 |
| 남음 | 전체 재생시간에서 현재까지 경과한 시간을 뺀 값 |
| 전체 | 재생목록에 담긴 모든 곡의 총 길이 |

파일을 처음 추가하면 각 파일의 메타데이터를 읽는 동안 전체 시간이 `계산 중…`으로 표시될 수 있습니다. 분석이 끝나면 시간이 자동으로 갱신됩니다. 곡을 추가·삭제하거나 순서를 변경하면 세 값도 다시 계산됩니다.

### 5. 창을 항상 맨 앞에 두기

상단의 핀 버튼을 누르면 Skiplet이 다른 앱의 창보다 앞에 유지됩니다. 활성화된 핀은 연두색으로 표시됩니다. 다시 누르면 일반 창으로 돌아가며 선택한 상태는 앱을 종료한 뒤에도 저장됩니다.

### 6. 로컬 단축키

로컬 단축키는 Skiplet이 가장 앞에 있을 때 작동합니다.

| 기능 | 키 |
| --- | --- |
| 재생 / 일시정지 | `Space` |
| 뒤로 이동 | `←` |
| 앞으로 이동 | `→` |
| 볼륨 올리기 | `↑` |
| 볼륨 내리기 | `↓` |

### 7. 글로벌 단축키

글로벌 단축키는 Skiplet이 뒤에 있어도 작동합니다.

| 기능 | 기본 키 |
| --- | --- |
| 재생 / 일시정지 | `Command + Option + Space` |
| 뒤로 이동 | `Command + Option + ←` |
| 앞으로 이동 | `Command + Option + →` |
| 볼륨 올리기 | `Command + Option + ↑` |
| 볼륨 내리기 | `Command + Option + ↓` |

오른쪽 위의 톱니바퀴 버튼에서 로컬 단축키와 글로벌 단축키를 각각 변경할 수 있습니다. 입력란을 선택하고 원하는 키 조합을 누른 뒤 `모두 저장`을 선택하세요.

- 글로벌 단축키에는 Command, Control, Option 또는 Shift 같은 보조키가 필요합니다.
- macOS나 다른 앱이 이미 사용 중인 조합은 저장되지 않습니다.
- `로컬 초기화`와 `글로벌 초기화`로 각 단축키 묶음만 기본값으로 되돌릴 수 있습니다.

### 8. 설정 저장

볼륨, 이동 간격, 로컬·글로벌 단축키와 창 고정 상태는 자동으로 저장됩니다. 재생목록과 현재 재생 위치는 저장되지 않습니다.

### 9. 첫 실행 및 문제 해결

- macOS가 앱을 차단하면 Finder의 `Applications`에서 Skiplet을 Control-클릭하고 `열기`를 선택하세요.
- 글로벌 단축키가 저장되지 않으면 다른 조합을 사용하세요. macOS 또는 실행 중인 다른 앱이 해당 조합을 점유했을 가능성이 큽니다.
- 파일이 추가되지 않으면 지원되는 확장자인지 확인하세요.
- 소리가 나지 않으면 Skiplet 볼륨과 macOS 시스템 음량을 모두 확인하세요.
- 창이 계속 다른 앱 위에 보이면 상단의 활성화된 핀 버튼을 다시 누르세요.

## 요구 사항

- 앱 실행: macOS 12 Monterey 이상
- 소스 빌드: Git, Node.js 22 이상, npm

현재 프로젝트는 Intel Mac에서 개발됐습니다. 별도로 아키텍처를 지정하지 않은 일반 빌드는 빌드를 실행하는 Mac의 CPU 아키텍처를 따릅니다.

## 저장소 클론 및 개발 환경 실행

### 1. 개발 도구 확인

터미널에서 Git, Node.js, npm이 설치됐는지 확인합니다.

```bash
git --version
node --version
npm --version
```

Node.js 버전은 `v22` 이상이어야 합니다. 앱을 실행만 하는 사용자는 Node.js나 npm을 설치할 필요가 없습니다.

### 2. 저장소 클론

GitHub에서 저장소를 내려받고 프로젝트 폴더로 이동합니다.

```bash
git clone https://github.com/midopa-dept/skiplet.git
cd skiplet
```

### 3. 의존성 설치

`package-lock.json`에 기록된 정확한 버전으로 설치합니다.

```bash
npm ci
```

일반적인 로컬 개발 중 의존성을 갱신해야 한다면 `npm install`을 사용할 수 있지만, 재현 가능한 첫 설치와 CI에서는 `npm ci`를 권장합니다.

### 4. 코드 검사

```bash
npm run check
```

메인 프로세스, preload, renderer JavaScript의 구문을 검사합니다.

### 5. 개발 모드 실행

```bash
npm start
```

Electron 개발 창이 열리면 MP3 파일 선택, 드래그 앤 드롭, 키보드 조작을 테스트할 수 있습니다.

Finder 중심으로 사용하려면 `setup.command`로 의존성을 설치하고 `start.command`로 실행할 수도 있습니다.

```bash
./setup.command
./start.command
```

## `.app` 빌드

의존성을 설치한 뒤 다음 명령을 실행합니다.

```bash
npm run build:app
```

빌드 결과는 CPU 아키텍처에 따라 다음 위치 중 하나에 생성됩니다.

```text
dist/mac/Skiplet.app
dist/mac-arm64/Skiplet.app
```

생성된 `Skiplet.app`을 `/Applications` 폴더로 복사하면 일반 앱처럼 사용할 수 있습니다.

### 단일 아키텍처 빌드

`npm run build:app`은 현재 Mac과 같은 아키텍처의 앱을 만듭니다.

| 빌드 환경 | 결과 아키텍처 | 기본 결과 경로 |
| --- | --- | --- |
| Intel Mac | `x86_64` | `dist/mac/Skiplet.app` |
| Apple Silicon Mac | `arm64` | `dist/mac-arm64/Skiplet.app` |

`x86_64` 앱은 Intel Mac에서 네이티브로 실행됩니다. Apple Silicon에서도 Rosetta 2가 설치돼 있다면 실행할 수 있지만, Apple Silicon에 최적화된 네이티브 실행은 아닙니다. `arm64` 앱은 Apple Silicon 전용이며 Intel Mac에서는 실행되지 않습니다.

## Universal `.app` 빌드

Universal 앱은 하나의 `.app` 안에 Intel용 `x86_64` 코드와 Apple Silicon용 `arm64` 코드를 모두 포함합니다. 사용자의 Mac에 맞는 코드가 자동으로 선택되므로 Intel과 Apple Silicon 모두에서 네이티브로 실행되고, Apple Silicon에서 Rosetta 2가 필요하지 않습니다.

다음 명령으로 Universal 앱을 만듭니다.

```bash
npm run build:universal
```

`electron-builder`는 Intel용과 Apple Silicon용 Electron 바이너리를 각각 내려받고 하나의 앱으로 병합합니다. 결과물은 다음 위치에 생성됩니다.

```text
dist/mac-universal/Skiplet.app
```

Skiplet은 현재 별도의 네이티브 Node 모듈 없이 JavaScript와 Electron API로 구성돼 있어 두 아키텍처의 ASAR 병합을 위한 추가 설정이 필요하지 않습니다.

### Universal 빌드 확인

실행 파일에 두 아키텍처가 모두 포함됐는지 `lipo`로 확인할 수 있습니다.

```bash
lipo -info dist/mac-universal/Skiplet.app/Contents/MacOS/Skiplet
```

정상적인 Universal 앱이라면 출력에 `x86_64`와 `arm64`가 모두 표시됩니다.

```text
Architectures in the fat file: x86_64 arm64
```

Electron Framework도 같은 방법으로 확인할 수 있습니다.

```bash
lipo -info "dist/mac-universal/Skiplet.app/Contents/Frameworks/Electron Framework.framework/Electron Framework"
```

### Universal 빌드의 장단점

| 방식 | 장점 | 단점 |
| --- | --- | --- |
| Universal | 사용자가 아키텍처를 선택할 필요 없이 하나의 앱으로 모두 지원 | 두 아키텍처를 포함하므로 파일 크기가 큼 |
| `x86_64`와 `arm64` 개별 배포 | 각 다운로드 파일이 더 작음 | 사용자가 자신의 Mac에 맞는 파일을 골라야 함 |

일반 사용자에게 GitHub Releases로 하나의 파일만 제공하려면 Universal 빌드가 편리합니다. 다운로드 크기가 중요하다면 `x86_64`와 `arm64` 빌드를 따로 제공하는 편이 효율적입니다.

## `.dmg` 빌드

세 아키텍처용 배포 DMG를 각각 만들 수 있습니다.

```bash
npm run build:dmg:x64
npm run build:dmg:arm64
npm run build:dmg:universal
```

각 명령은 다음 파일을 `dist/`에 생성합니다.

```text
dist/Skiplet-1.2.0-x64.dmg
dist/Skiplet-1.2.0-arm64.dmg
dist/Skiplet-1.2.0-universal.dmg
```

모든 빌드를 연속으로 실행하려면 다음과 같이 실행합니다.

```bash
npm run build:dmg:x64
npm run build:dmg:arm64
npm run build:dmg:universal
```

첫 빌드에서는 대상 아키텍처별 Electron 바이너리를 내려받으므로 시간이 더 걸릴 수 있습니다. `dist/`는 Git에 커밋하지 않으며, 완성된 DMG는 GitHub Release의 바이너리 자산으로 업로드합니다.

DMG는 앱을 담아 전달하기 위한 디스크 이미지입니다. DMG 자체가 앱의 아키텍처를 바꾸는 것은 아니므로, 모든 Mac을 네이티브로 지원하려면 DMG 안의 `Skiplet.app`도 Universal 빌드여야 합니다.

## 프로젝트 구조

```text
assets/             앱 아이콘
src/main.js         Electron 메인 프로세스
src/preload.js      안전한 IPC 브리지
src/renderer.js     플레이어 동작과 UI 상태
src/index.html      화면 구조
src/*.css           화면 스타일
package.json        실행 및 빌드 설정
```

## 설정 저장 위치

Skiplet의 사용자 설정은 Electron의 macOS 사용자 데이터 경로에 JSON으로 저장됩니다. 빌드 산출물이나 저장소에는 사용자 설정이 포함되지 않습니다.

## 개발

Skiplet은 [OpenAI Codex](https://developers.openai.com/codex/)와 함께 설계하고 개발했습니다.

## 변경 이력

버전별 추가 기능과 변경 사항은 [CHANGELOG.md](CHANGELOG.md)에서 확인할 수 있습니다.

## 라이선스

이 프로젝트는 [MIT License](LICENSE)로 공개됩니다.
