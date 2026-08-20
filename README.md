# Skiplet

Skiplet은 macOS용 소형 오디오 플레이어입니다. 앱을 보고 있는 동안 키보드만으로 재생 위치와 볼륨을 빠르게 조절할 수 있습니다.

## 주요 기능

- MP3 파일 선택 및 창 전체 드래그 앤 드롭
- 재생, 일시정지 및 타임라인 탐색
- 앞뒤 이동 간격 설정(기본 10초)
- 볼륨 슬라이더 및 키보드 볼륨 조절
- 사용자 지정 단축키
- 이동 간격, 볼륨 및 단축키 설정 자동 저장
- MP3, M4A, WAV, AAC, OGG, FLAC 지원

## 기본 단축키

단축키는 Skiplet이 가장 앞에 있을 때만 작동합니다.

| 기능 | 키 |
| --- | --- |
| 재생 / 일시정지 | `Space` |
| 뒤로 이동 | `←` |
| 앞으로 이동 | `→` |
| 볼륨 올리기 | `↑` |
| 볼륨 내리기 | `↓` |

앱 오른쪽 위의 설정 버튼에서 각 키를 변경할 수 있습니다.

## 요구 사항

- macOS 12 Monterey 이상
- Node.js 22 이상
- npm

현재 프로젝트는 Intel Mac에서 개발됐습니다. 별도로 아키텍처를 지정하지 않은 일반 빌드는 빌드를 실행하는 Mac의 CPU 아키텍처를 따릅니다.

## 개발 환경 실행

저장소를 클론한 뒤 다음을 실행합니다.

```bash
npm install
npm start
```

Finder에서 실행하려면 최초 한 번 `setup.command`를 실행한 다음 `start.command`를 실행할 수도 있습니다.

```bash
./setup.command
./start.command
```

코드 구문 검사는 다음 명령으로 실행합니다.

```bash
npm run check
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

배포용 디스크 이미지는 다음 명령으로 만듭니다.

```bash
npm run build:dmg
```

결과물은 `dist/` 폴더에 생성됩니다.

Intel과 Apple Silicon을 모두 지원하는 Universal DMG는 다음 명령으로 만듭니다.

```bash
npm run build:dmg:universal
```

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

## 라이선스

이 프로젝트는 [MIT License](LICENSE)로 공개됩니다.
