# Firebase 로그인·저장 연결

사용자가 제공한 `login-ccf94` 웹 앱 설정을 연결했습니다. 배포 도메인은 `mingeon101.github.io`이고, 데이터베이스는 `https://login-ccf94-default-rtdb.firebaseio.com`입니다.

## Firebase 콘솔에서 필요한 설정

1. [Authentication → Sign-in method](https://console.firebase.google.com/project/login-ccf94/authentication/providers)에서 **Google**을 활성화하고 지원 이메일을 선택합니다. **Phone**과 **Anonymous(익명)**도 활성화합니다.
2. [Authentication → Settings](https://console.firebase.google.com/project/login-ccf94/authentication/settings)의 **Authorized domains**에 `mingeon101.github.io`를 추가합니다. URL 경로나 `?v=6`을 입력하지 않습니다.
3. 전화번호 인증의 SMS 지역 정책에서 사용할 국가(예: 대한민국)를 허용하고, 프로젝트의 SMS 한도·결제 설정을 확인합니다. 개발 중에는 Firebase의 테스트 전화번호와 테스트 코드를 이용할 수 있습니다. reCAPTCHA는 사용자가 직접 완료합니다.
4. [Realtime Database → Rules](https://console.firebase.google.com/project/login-ccf94/database/login-ccf94-default-rtdb/rules)에서 **기존 다른 앱의 규칙을 보존하면서**, [firebase-rules.fragment.json](firebase-rules.fragment.json)의 `nightfallSaves` 내용을 현재 `rules` 객체의 자식으로 병합해 게시합니다.

브라우저용 Firebase 설정/API 키는 서비스 계정이나 관리자 권한이 아닙니다. 현재 도구에서는 위 콘솔 설정을 조회·변경하거나 규칙을 배포하지 못했습니다. **이 파일과 규칙 파일을 저장소에 올리는 것만으로 Firebase 설정이 적용되지는 않습니다.**

## RTDB 규칙 주의점

규칙 파일은 **전체 데이터베이스 교체본이 아닌 병합용 조각**입니다. 저장 경로는 다음과 같습니다.

```text
nightfallSaves/{Firebase Auth UID}/slot1
```

인증한 본인의 UID만 읽고 쓸 수 있도록 작성했습니다. 기존 루트/상위 경로에 무조건 허용하는 `.read: true`나 `.write: true`가 있으면 자식 규칙만으로 그 허용을 취소할 수 없습니다. 이런 경우 기존 앱들의 필요한 개별 접근을 보존하면서 상위의 포괄 허용을 정리해야 합니다. 다른 사용자 저장을 읽을 수 없고, 미인증 사용자도 접근할 수 없는지 Firebase Rules Playground나 Emulator에서 확인하세요.

필드 범위와 revision 증가를 검사합니다. 다만 싱글플레이 클라이언트 저장이므로 서버가 게임 진행의 진위를 검증하는 부정행위 방지 시스템은 아닙니다.

## 게임에서의 사용

- **로그인 · 저장** 버튼에서 Google·전화번호 로그인 또는 **익명으로 시작**.
- 전화번호는 `01012345678` 또는 `+821012345678`처럼 입력할 수 있습니다. 전송 안내에 동의하고 reCAPTCHA를 완료한 후 인증 문자를 요청합니다.
- 기존 저장이 있으면 **클라우드 불러오기**를 누릅니다. 현재 진행을 사용할 경우 **현재 진행 저장**을 누릅니다. 기존 데이터를 교체할 때는 확인 창을 표시합니다.
- 처음 저장하거나 불러온 뒤, 플레이 중 30초마다 자동 저장합니다. 로그인만으로 이전 계정·게스트의 진행을 새 계정에 자동 복사하지 않습니다.
- 위치, 체력, 방탄복, 소지금, 플레이 시간, 무기·탄약, 제압한 적을 저장합니다. 차량 탑승·비행·지하철 이동 중 저장은 다시 불러올 때 안전한 지상 위치로 복귀합니다. NPC와 교통 흐름은 재생성합니다.
- 동시 기기의 revision이 다르면 자동 덮어쓰기를 중단하고 새 저장 확인을 안내합니다.
- RTDB 권한 거부·네트워크 오류를 저장 성공으로 표시하지 않습니다. 마지막으로 읽거나 쓴 데이터의 로컬 백업도 UID별로 분리하지만, 앱의 불러오기 버튼은 RTDB에서 확인한 저장을 사용합니다.
- Google 로그인과 전화번호 로그인은 Firebase에서 별도 UID가 될 수 있습니다. 이 버전은 계정 연결·자동 병합 기능을 제공하지 않습니다.

익명 계정은 실제 Firebase UID를 발급받아 같은 저장 경로와 규칙을 사용합니다. 같은 브라우저의 로그인 상태를 유지해야 하며 로그아웃·사이트 데이터 삭제 후에는 복구하지 못할 수 있습니다. 다른 계정으로 연결하거나 저장을 이전하는 기능은 없습니다.

## 검증 범위

실제 계정 로그인, reCAPTCHA, SMS 발송, 운영 RTDB 쓰기를 대신 실행하지 않았습니다. 제공된 설정의 콘솔 상태를 확인하기 위한 네트워크 요청도 현재 실행 환경에서 실패했습니다. 자동 검사에서는 모의 SDK로 사용자별 경로, 기존 저장 보호, 충돌 처리, 로그아웃 분리, SMS 동의·재요청 제한·입력 검증을 확인했습니다. 보안 규칙의 실제 서버 적용과 실기기 로그인은 별도 확인이 필요합니다.

공식 문서: [익명 로그인](https://firebase.google.com/docs/auth/web/anonymous-auth), [Google 로그인](https://firebase.google.com/docs/auth/web/google-signin), [전화번호 로그인](https://firebase.google.com/docs/auth/web/phone-auth), [RTDB 사용자별 규칙](https://firebase.google.com/docs/database/security/rules-conditions), [웹 SDK CDN](https://firebase.google.com/docs/web/alt-setup).

V7: 적 300명 저장을 위해 defeatedEnemyIds 검증 상한을 15에서 299로 변경했습니다. 기존 규칙이 게시되어 있다면 이 값도 Firebase 콘솔에서 수정해야 합니다.

V8: RPG는 inventory[4]에 저장됩니다. selected 검증 상한을 4로 변경하고 inventory의 $index 허용값에 문자열 4를 추가하세요. 구버전 4칸 저장은 읽을 때 RPG를 추가하여 이전합니다.

V10: 적 1,000명의 진행 저장을 위해 defeatedEnemyIds 검증 상한을 999로 변경했습니다. 기존 규칙을 적용한 프로젝트는 이 값을 갱신해야 합니다.

V12: 작전·새벽·민간인 사상 수·구금 진행은 civic 필드에 저장합니다. 갱신된 firebase-rules.fragment.json의 slot1.civic 규칙도 병합해야 합니다. 새 규칙을 적용하지 않으면 이전 $other 검증이 civic 저장을 거부합니다.

V13: 4인 협동전은 nightfallRooms 경로를 사용합니다. 통합 규칙 파일에 포함했으며 [MULTIPLAYER-SETUP.md](MULTIPLAYER-SETUP.md)의 서버 설정을 먼저 적용해야 합니다.

V14: 열추적 미사일·플레어를 포함한 협동전 방 버전 14를 지원하려면 nightfallRooms 규칙을 최신 버전으로 갱신하세요.
