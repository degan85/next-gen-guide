# 커밋 & 푸쉬 실행 계획 — 광고심의 (PRO-ICT-FRT-032)

> 2026-08-09 기준. 회사 저장소 2곳의 미커밋 변경을 반영하는 체크리스트.
> 집(맥북)에서도 이 문서만 보고 실행할 수 있게 명령 포함.

## 체크리스트

```
□ 프론트: 커밋 2개 → push (본인 티켓, 바로 가능)
□ 백엔드: 커밋 3개 → 백엔드팀 한마디 → push
□ 백엔드 커밋 전 확인: application-local.yml 이 스테이징에 없는가 ★
□ MR 설명에 동작 카탈로그(41건)·테스트 목록 첨부
```

## 1. 프론트 (web-admin) — 커밋 2개

브랜치 `feature/degan/PRO-ICT-FRT-032`, 기존 커밋 6개 위에 추가.

**커밋 1 — 기능**: `ad-review/adReviewApi.ts` + `ad-review/index.vue`

```
feat: 광고심의 백엔드 신규 계약 연동 및 화면 결함 정리 (PRO-ICT-FRT-032)

백엔드 연동
- 목록 조인 필드(신청자 이름·사번, 소속경로) 표시, 미매칭 시 ID→등록자 대체
- 신청자 이름/사번 검색칸 활성화 (applicantKeyword)
- 심의필번호 클라이언트 발번 제거 (백엔드 자동발번으로 이관)
- 승인일 전송 제거 (완료 전환 시 백엔드 자동 설정)
- 의견 목록 서버 조회 전환 + 등록 body 단순화({content}만)

화면 결함 정리
- 첨부 삭제 순서 교정: 참조 제거 후 파일 삭제 (고아 참조 방지)
- 광고명 검색어의 %·_ 제거 (LIKE 와일드카드 과다매칭 완화)
- 목업 기반 사원상세 팝업 제거 (가짜 정보 노출 방지)
- alert 큐잉 / addfile 타입 'Y'|'N' 리터럴
```

**커밋 2 — 테스트**: `ad-review/__tests__/`

```
test: 광고심의 행 변환·검색어 가공 계약 테스트 12건 (PRO-ICT-FRT-032)
```

**커밋 금지**: `server/routes/__dev/` (로컬 로그인 우회 — untracked 유지)

## 2. 백엔드 (app-bizmgr) — 커밋 3개

같은 브랜치명. 헤더 수정 1건은 이미 커밋됨.
⚠️ WSL 에서 이 저장소 git 은 매우 느림 — Windows 터미널/IntelliJ 에서 실행.

**커밋 1 — 기능** (4개 파일): `AdvertisementReviewListDTO`(신규) + `AdvertisementReviewService` + `AdvertisementReviewCommentService` + `AdvertisementReviewController`

```
feat: 광고심의 목록 조인·검색·자동발번·승인일·의견 API 구현 (PRO-ICT-FRT-032)

- 목록: 신청자 이름·사번, 소속경로 배치 조인 (ListDTO 신규)
- 신청자 이름/사번 검색 — 동명이인 OR 지원, 매칭 0명 시 빈 결과
- 소속 검색을 경로 prefix 로 확장 (하위조직 포함)
- 심의필번호 자동발번 + 유니크 충돌 재시도
  (save 는 재시도 동작을 위해 의도적으로 @Transactional 미적용 — 주석 참조)
- 완료 전환 시 승인일 자동 설정, 클라이언트 전송값 무시
- 의견 목록 GET 신설(최신순), 등록 body 단순화, 작성자 본인 검증(403)
- 엑셀 다운로드 구현 / 신규 LIKE 조건 escape 적용

생성 파일(DTO·Mapper·CoreService) 무수정 — Service/Controller/신규 파일로만 확장
```

**커밋 2 — 예외 핸들러 (반드시 분리 — 전 도메인 영향)**: `GlobalExceptionHandler`

```
fix: ResponseStatusException 상태코드 보존 핸들러 추가 (PRO-ICT-FRT-032)

catch-all(Exception→500)이 먼저 잡으면 403/400/409 가 전부 500 으로 뭉개짐.
의견 작성자 검증(403)·필수값 검증(400)이 의존. 신규 예외 타입 핸들러 추가만이라
다른 도메인 기존 동작에는 영향 없음.
```

**커밋 3 — 테스트 29건**: `src/test/.../complaintManagement/` + `GlobalExceptionHandlerResponseStatusTest`

```
test: 광고심의 서비스·컨트롤러·예외핸들러 단위 테스트 29건 (PRO-ICT-FRT-032)
```

**절대 커밋 금지**: `application-local.yml` — 로컬 DB 전환분.
커밋되면 팀 전체가 개인 로컬 DB 를 바라보게 됨. `git add .` / IntelliJ "모두 커밋" 주의.

## 3. 푸쉬 순서

1. 프론트 push → 본인 티켓이므로 바로
2. 백엔드는 **팀에 먼저 공유** ("제안 구현 브랜치, 리뷰 부탁") → push
   - 특히 커밋 2(공통 예외 핸들러)는 별도 언급 필수
3. MR 설명: 동작 카탈로그 + 테스트 목록 첨부 → 리뷰어가 계약을 3분에 파악

## 남는 것 (커밋과 무관)

- 워크스루 ③~⑥ (learning-roadmap.md 참조)
- 매니저 결정 D-1~D-6 회신 대기 (기한 8/14)
- 후속 제안: DB 시퀀스 발번, 계정↔인사 매핑, 검색 escape 플랫폼 수정
