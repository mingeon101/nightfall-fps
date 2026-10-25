# NIGHTFALL — 야간 작전

독창적인 브라우저 싱글플레이 FPS 프로토타입. Three.js로 만든 야간 산업 지구에서 AI 적 8명을 제압하고 북쪽 녹색 지점으로 탈출합니다. Call of Duty의 파일이나 자산을 사용하지 않습니다.

## 실행

GitHub Pages에서 실행하거나 폴더를 정적 HTTP 서버로 제공하세요. PC 키보드·마우스 및 WebGL을 지원하는 최신 브라우저가 필요합니다. Three.js는 jsDelivr, 글꼴은 Google Fonts에서 불러오므로 첫 실행에는 인터넷 연결이 필요합니다.

WASD 이동, 마우스 시점, 좌클릭 사격, 우클릭 조준, R 재장전, 왼쪽 Shift 달리기, ESC 일시정지. 마우스 잠금이 제한되면 방향키로 시점을 움직일 수 있습니다. 탄창은 30발이며 예비 탄약은 무제한입니다. 5초 동안 피해를 받지 않으면 체력이 회복됩니다.

## GitHub Pages

저장소 Settings → Pages → Build and deployment에서 **Deploy from a branch**, **main**, **/(root)**를 선택하고 Save를 누르세요. `index.html`이 루트에 있으므로 빌드가 필요 없습니다.

이 버전은 소규모 프로토타입이며 상용 FPS 수준의 그래픽이나 전체 캠페인을 제공하지 않습니다. 모바일 터치 조작은 지원하지 않습니다.