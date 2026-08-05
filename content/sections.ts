export type SectionData = {
  id: string;
  icon: string;
  title: string;
  defaultOpen?: boolean;
  content: string;
};

export const sections: SectionData[] = [
  {
    id: "overview",
    icon: "🏗️",
    title: "아키텍처 개요",
    defaultOpen: true,
    content: `
차세대 시스템은 **도메인 중심 설계 + ElastiCore 코드 생성** 파이프라인 기반입니다.
엔티티 명세(blueprint)를 작성하면 elcore가 Entity, DTO, Repository 등의 코드를 자동 생성합니다.

\`\`\`
엔티티 명세(blueprint)  →  ElastiCore(elcore)  →  자동 생성 코드
     .md 문서           코드 생성기         Entity / DTO / Repo

📌 명세를 잘 쓰는 것 = 개발의 절반
\`\`\`

### 도메인 영역

| 도메인 | 코드 | 설명 |
|--------|------|------|
| 인적자원 (HR) | HR_01_xx | 위촉후보자, 발령, 선발평가, 해촉신청 등 |
| 조직 | ORG | 지점/팀 코드, KB라이프 원장 연동 |
| 내부통제 | RM_01_xx | 민원관리, 광고심의, BQI, 위규행위 등 |
`,
  },
  {
    id: "backend",
    icon: "☕",
    title: "백엔드 (Spring Boot / Java 21)",
    content: `
### 패키지 구조

\`\`\`
kr.co.kblp.erp
├── common/          # 공통 (AOP, 예외처리, 유틸, 서비스)
├── config/          # 설정 (보안, 캐시, Swagger)
└── domain/          # 도메인별 모듈
    └── {도메인}/
        ├── control/      # 컨트롤러
        ├── service/      # 서비스
        ├── repository/   # 레포지토리
        ├── entity/       # 엔티티
        ├── dto/          # DTO
        ├── enums/        # Enum
        └── port/         # 포트 인터페이스
\`\`\`

### 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| Entity | PascalCase | \`ReceiptInfo\` |
| Service | {도메인}Service | \`ReceiptInfoService\` |
| Controller | {도메인}Controller | \`ReceiptInfoController\` |
| Repository | {도메인}Repository | \`ReceiptInfoRepository\` |
| CRUD 메서드 | create / save / findById / update / delete | |
| Boolean 메서드 | is{조건} / has{조건} / check{조건} | |
| 변수 | camelCase | \`receiptDate\` |
| 상수 | SNAKE_CASE_UPPER | \`MAX_RETRY_COUNT\` |
| 테이블명 | tb_{도메인}__{엔티티} | \`tb_ct_receipt_info\` |
| 컬럼명 | snake_case | \`rcp_info_id\` |

### PK ID 생성 방식

\`\`\`
형식: {PREFIX}_{NanoId 14자}  (총 20자 이내)
컬럼: VARCHAR(25) 통일

PREFIX 예시:
  Contract            → CONTR → CONTR_xZ9pQr4mWs7kLn
  ContractCustomer    → CONCU
  HomeOfficePersonnel → HOFOP → HOFOP_aB3dEf7HiJk2mN
  Organization        → ORGAN → ORGAN_uR2tMp8vXnLj5h

PREFIX 규칙: CamelCase 각 단어 앞글자 (최대 5자)
난수: NanoId + SecureRandom (a-z, A-Z, 0-9)
충돌확률: 62^14 ≈ 1.2×10²⁵ → 사실상 0
\`\`\`

### 코드 스타일

- 들여쓰기: **4 스페이스** (탭 X)
- 한 줄 최대: **120자**
- 중괄호: **K&R 스타일** (같은 줄 시작)

### 어노테이션 패턴

**컨트롤러:**
\`\`\`java
@RestController
@RequestMapping("/api/contract/receiptInfo")
@RequiredArgsConstructor
@Tag(name = "ReceiptInfo (접수)")
\`\`\`

**엔티티:**
\`\`\`java
@Entity
@Table(name="tb_ct_receipt_info")
@DynamicUpdate
@Where(clause = "delete_yn = 'N'")  // 소프트 딜리트
@Getter @Setter @NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
\`\`\`

### Import 순서

| 순서 | 패키지 |
|------|--------|
| 1 | java.* (표준) |
| 2 | Third-party (lombok 등) |
| 3 | org.springframework.* |
| 4 | kr.co.kblp.* (프로젝트) |
`,
  },
  {
    id: "frontend",
    icon: "🖥️",
    title: "프론트엔드 (Vue.js 3 / TypeScript)",
    content: `
### 프로젝트 구조

\`\`\`
src/
├── api/          # API 호출 (도메인별)
├── assets/       # 정적 리소스
├── core/         # 재사용 컴포넌트 + 유틸 + 타입
├── styles/       # 스타일시트
├── types/        # 전역 타입
└── views/        # 페이지 (도메인별)
\`\`\`

### 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 페이지 컴포넌트 | PascalCase + 기능명 | \`ReceiptInfoList.vue\` |
| 재사용 컴포넌트 | Sb 접두사 + PascalCase | \`SbContainer.vue\`, \`SbGrid.vue\` |
| 폴더 | kebab-case | \`receipt-info/\` |
| Vue 파일 | PascalCase | \`ReceiptInfoList.vue\` |
| TS 파일 | camelCase | \`receiptInfoApi.ts\` |
| 함수 | 동사 + 명사 | \`statusCheck()\`, \`handleRowDoubleClick()\` |

### TypeScript 규칙

- **\`type\` 사용** — interface가 아닌 \`type\` 키워드로 정의
- **strict 모드** — target/module: ESNext
- **경로 별칭** — \`@/*\` → \`src/*\`

### UI 컴포넌트

- **Wijmo** (상용, \`@mescius/wijmo\`): 그리드/차트 전용
- **Sb 컴포넌트**: Container, Group, Box, Text 등 자체 제작
- **Composition API** (\`<script setup lang="ts">\`) 필수
`,
  },
  {
    id: "git",
    icon: "🌿",
    title: "Git 브랜치 전략",
    defaultOpen: true,
    content: `
### 브랜치 구조

\`\`\`
main              ← 프로덕션 (운영 배포)
  └── develop         ← 개발 통합 (기본 기준)
        ├── feature/{개발자ID}/{티켓번호}   ← 기능 개발
        └── bugfix/{개발자ID}/{티켓번호}    ← 버그 수정
\`\`\`

### 작업 흐름 (실전 예시)

**Step 1. develop에서 브랜치 생성**

\`\`\`bash
git checkout develop
git pull origin develop
git checkout -b feature/degan/RM-42
\`\`\`

**Step 2. 코드 작성 → 커밋 (여러 번 OK)**

\`\`\`bash
git commit -m "feat: 광고심의 엔티티 및 리포지토리 생성"
git commit -m "feat: 광고심의 목록 조회 API 구현"
git commit -m "test: 광고심의 목록 조회 단위 테스트 추가"
git commit -m "fix: 응답 DTO 필드명 오타 수정"
\`\`\`

**Step 3. Push → MR(Merge Request) 생성**

\`\`\`bash
git push origin feature/degan/RM-42
# → GitLab에서 MR 생성 (Source → develop)
\`\`\`

**Step 4. 코드 리뷰 → 수정 → Merge**

\`\`\`bash
# 리뷰 피드백 반영
git commit -m "refactor: 리뷰 반영 - 서비스 레이어 분리"
git push origin feature/degan/RM-42
# → 승인 후 GitLab에서 Merge 버튼
\`\`\`

**Step 5. 운영 배포 (PM/팀장)**

\`\`\`bash
git checkout main
git merge develop
git tag RL20260805-1
git push origin main --tags
# → PRD 수동 배포 트리거
\`\`\`

### 커밋 메시지 컨벤션

\`\`\`
{type}: {subject}

{body}     ← 선택사항
{footer}   ← 선택사항
\`\`\`

| type | 용도 | 예시 |
|------|------|------|
| feat | 새 기능 추가 | \`feat: 민원 등록 API 구현\` |
| fix | 버그 수정 | \`fix: 날짜 포맷 변환 에러 수정\` |
| refactor | 리팩토링 | \`refactor: 서비스 메서드 분리\` |
| test | 테스트 추가/수정 | \`test: 조직 조회 단위 테스트\` |
| docs | 문서 | \`docs: API 명세서 업데이트\` |
| style | 코드 스타일 | \`style: import 순서 정리\` |
| chore | 빌드/설정 잡일 | \`chore: Gradle 의존성 업데이트\` |

### 매일 루틴

\`\`\`
1. git pull origin develop          ← 아침에 최신 코드 받기
2. git checkout -b feature/degan/XX ← 작업 시작
3. 코드 짜고 커밋 (feat/fix/...)    ← 작업 중
4. git push → MR 생성               ← 작업 끝
5. 리뷰 받고 merge                   ← 완료
\`\`\`
`,
  },
  {
    id: "cicd",
    icon: "🚀",
    title: "CI/CD (GitLab + Docker Swarm)",
    content: `
### 파이프라인 5단계

| 단계 | 설명 |
|------|------|
| 1. test | Gradle 단위 테스트 |
| 2. sonarqube-check | 코드 품질 분석 |
| 3. build | JAR 생성 |
| 4. package | Docker 이미지 → Harbor |
| 5. deploy | Docker Swarm Rolling Update |

### 배포 환경

| 환경 | 트리거 | 방식 |
|------|--------|------|
| DEV | develop 브랜치 push | 자동 ⚡ |
| PRD | RL* 태그 생성 | 수동 🔒 |
`,
  },
  {
    id: "quality",
    icon: "✅",
    title: "품질 관리",
    content: `
### SonarQube 기준

| 항목 | 기준 |
|------|------|
| Critical/Blocker 이슈 | 0건 |
| 코드 커버리지 | ≥ 70% |
| 코드 중복률 | ≤ 15% |
| 메서드 복잡도 | ≤ 10 |

### 보안 요구사항

- 🔴 SQL Injection: PreparedStatement 강제
- 🔴 XSS: Spring Security 기본 설정
- 🔴 인증: JWT 토큰 기반
- 🔴 의존성 보안: OWASP Dependency Check (CVSS ≥7.0 → 0건)

### 코드 리뷰

| 유형 | 주기 | 도구 |
|------|------|------|
| 정기 리뷰 | 2주 단위 | Claude Opus 4.6 + SonarQube |
| PR 리뷰 | feature → develop merge 시 | 필수 |
| 핫픽스 | 배포 후 | 사후 리뷰 |

결과 공유: Confluence

### 백엔드 체크리스트

- ☐ 도메인 기반 패키지 구조
- ☐ ElastiCORE 모델 준수
- ☐ 네이밍 규칙 일관성
- ☐ 트랜잭션 범위 적절성
- ☐ 예외 처리 일관성
- ☐ API 문서화 (@Operation, @ApiResponse)
- ☐ 보안 취약점 없음
- ☐ 테스트 코드 작성

### 프론트엔드 체크리스트

- ☐ TypeScript 타입 정의
- ☐ 컴포넌트 재사용성
- ☐ 반응형 데이터 적절성
- ☐ 메모리 누수 없음
- ☐ 접근성 준수
- ☐ 브라우저 호환성
`,
  },
  {
    id: "entity",
    icon: "📐",
    title: "엔티티 설계 규칙",
    content: `
### 소프트 딜리트

\`\`\`java
// 모든 엔티티에 적용
@Where(clause = "delete_yn = 'N'")

// 실제 삭제 대신 플래그 변경
entity.setDeleteYn("Y");
\`\`\`

### 테이블/컬럼 명명

\`\`\`
테이블: tb_{도메인코드}__{엔티티_snake_case}
  예: tb_ct__receipt_info       (계약 도메인)
      tb_hr__sales_personnel    (인사 도메인)
      tb_rm__complaint          (내부통제 도메인)

컬럼: snake_case
  예: rcp_info_id, created_at, delete_yn

PK: {PREFIX}_NanoId14자  →  VARCHAR(25)
\`\`\`

### Audit 필드 (공통)

\`\`\`
@CreatedBy        → created_by    (생성자)
@CreatedDate      → created_at    (생성일시)
@LastModifiedBy   → updated_by    (수정자)
@LastModifiedDate → updated_at    (수정일시)
                  → delete_yn     (삭제여부, 기본 'N')
\`\`\`
`,
  },
  {
    id: "stack",
    icon: "📦",
    title: "기술 스택 요약",
    content: `
### 백엔드

| 기술 | 버전 | 용도 |
|------|------|------|
| Java | 21 | 메인 언어 |
| Spring Boot | 3.5.0 | 프레임워크 |
| Gradle | 8.8 | 빌드 |
| PostgreSQL | latest | 메인 DB |
| Redis | - | 세션/캐시 |
| Kafka | - | 메시지 큐 |
| gRPC + Armeria | - | 서비스 간 통신 |
| ElastiCore | 2.0.x | 코드 생성 프레임워크 |
| Spring AI | - | OpenAI + Anthropic 통합 |

### 프론트엔드

| 기술 | 버전 | 용도 |
|------|------|------|
| Vue.js | 3.2.45 | 프레임워크 |
| TypeScript | 4.9.3 | 타입 안전성 |
| Vite | 4.0.1 | 빌드/dev서버 |
| Wijmo | 5.x | 상용 그리드/차트 |
| Playwright | - | E2E 테스트 |

### 인프라

| 구분 | 도구 |
|------|------|
| 컨테이너 | Docker |
| 오케스트레이션 | Docker Swarm |
| 레지스트리 | Harbor (Private) |
| CI/CD | GitLab CI/CD |
| 코드 품질 | SonarQube |
`,
  },
];
