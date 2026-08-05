"use client";

import {
  Section,
  SubSection,
  Table,
  CodeBlock,
  Badge,
} from "./components/Section";
import AuthGate from "./components/AuthGate";

const NAV = [
  { id: "overview", icon: "🏗️", label: "아키텍처 개요" },
  { id: "backend", icon: "☕", label: "백엔드" },
  { id: "frontend", icon: "🖥️", label: "프론트엔드" },
  { id: "git", icon: "🌿", label: "Git 브랜치 전략" },
  { id: "cicd", icon: "🚀", label: "CI/CD" },
  { id: "quality", icon: "✅", label: "품질 관리" },
  { id: "entity", icon: "📐", label: "엔티티 설계" },
  { id: "stack", icon: "📦", label: "기술 스택" },
];

export default function Home() {
  return (
    <AuthGate>
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <nav className="hidden lg:flex flex-col w-64 fixed top-0 left-0 h-full bg-[var(--card-bg)] border-r border-[var(--card-border)] p-6 gap-1 z-10">
        <div className="mb-8">
          <h1 className="text-lg font-bold text-[var(--heading)]">
            차세대 개발 가이드
          </h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            KB라이프파트너스
          </p>
        </div>
        {NAV.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
          >
            <span>{item.icon}</span>
            {item.label}
          </a>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--card-border)] px-8 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--heading)]">
                🏢 차세대 시스템 개발 가이드
              </h1>
              <p className="text-sm text-[var(--muted)]">
                v0.2 · 2026-04-14 기준 · 엑스솔콥코리아 소스코드 표준
              </p>
            </div>
            <div className="hidden sm:flex gap-2">
              <Badge color="accent">Spring Boot 3.5</Badge>
              <Badge color="success">Vue 3</Badge>
              <Badge>Java 21</Badge>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-8 py-8 space-y-4">
          {/* 아키텍처 개요 */}
          <Section id="overview" icon="🏗️" title="아키텍처 개요" defaultOpen={true}>
            <p className="text-[var(--muted)]">
              차세대 시스템은{" "}
              <strong className="text-[var(--foreground)]">
                도메인 중심 설계 + ElastiCore 코드 생성
              </strong>{" "}
              파이프라인 기반입니다. 엔티티 명세(blueprint)를 작성하면 elcore가
              Entity, DTO, Repository 등의 코드를 자동 생성합니다.
            </p>
            <CodeBlock title="핵심 개념">
{`엔티티 명세(blueprint)  →  ElastiCore(elcore)  →  자동 생성 코드
     .md 문서           코드 생성기         Entity / DTO / Repo

📌 명세를 잘 쓰는 것 = 개발의 절반`}
            </CodeBlock>
            <SubSection title="도메인 영역">
              <Table
                headers={["도메인", "코드", "설명"]}
                rows={[
                  ["인적자원 (HR)", "HR_01_xx", "위촉후보자, 발령, 선발평가, 해촉신청 등"],
                  ["조직", "ORG", "지점/팀 코드, KB라이프 원장 연동"],
                  ["내부통제", "RM_01_xx", "민원관리, 광고심의, BQI, 위규행위 등"],
                ]}
              />
            </SubSection>
          </Section>

          {/* 백엔드 */}
          <Section id="backend" icon="☕" title="백엔드 (Spring Boot / Java 21)">
            <SubSection title="패키지 구조">
              <CodeBlock>
{`kr.co.kblp.erp
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
        └── port/         # 포트 인터페이스`}
              </CodeBlock>
            </SubSection>

            <SubSection title="네이밍 규칙">
              <Table
                headers={["대상", "규칙", "예시"]}
                rows={[
                  ["Entity", "PascalCase", "ReceiptInfo"],
                  ["Service", "{도메인}Service", "ReceiptInfoService"],
                  ["Controller", "{도메인}Controller", "ReceiptInfoController"],
                  ["Repository", "{도메인}Repository", "ReceiptInfoRepository"],
                  ["CRUD 메서드", "create / save / findById / update / delete", ""],
                  ["Boolean 메서드", "is{조건} / has{조건} / check{조건}", ""],
                  ["변수", "camelCase", "receiptDate"],
                  ["상수", "SNAKE_CASE_UPPER", "MAX_RETRY_COUNT"],
                  ["테이블명", "tb_{도메인}__{엔티티}", "tb_ct_receipt_info"],
                  ["컬럼명", "snake_case", "rcp_info_id"],
                ]}
              />
            </SubSection>

            <SubSection title="PK ID 생성 방식">
              <CodeBlock>
{`형식: {PREFIX}_{NanoId 14자}  (총 20자 이내)
컬럼: VARCHAR(25) 통일

PREFIX 예시:
  Contract            → CONTR → CONTR_xZ9pQr4mWs7kLn
  ContractCustomer    → CONCU
  HomeOfficePersonnel → HOFOP → HOFOP_aB3dEf7HiJk2mN
  Organization        → ORGAN → ORGAN_uR2tMp8vXnLj5h

PREFIX 규칙: CamelCase 각 단어 앞글자 (최대 5자)
난수: NanoId + SecureRandom (a-z, A-Z, 0-9)
충돌확률: 62^14 ≈ 1.2×10²⁵ → 사실상 0`}
              </CodeBlock>
            </SubSection>

            <SubSection title="코드 스타일">
              <div className="flex gap-4 flex-wrap">
                <Badge color="accent">들여쓰기: 4 스페이스</Badge>
                <Badge color="accent">한 줄 최대: 120자</Badge>
                <Badge color="accent">중괄호: K&R 스타일</Badge>
              </div>
            </SubSection>

            <SubSection title="어노테이션 패턴">
              <CodeBlock title="컨트롤러">
{`@RestController
@RequestMapping("/api/contract/receiptInfo")
@RequiredArgsConstructor
@Tag(name = "ReceiptInfo (접수)")`}
              </CodeBlock>
              <CodeBlock title="엔티티">
{`@Entity
@Table(name="tb_ct_receipt_info")
@DynamicUpdate
@Where(clause = "delete_yn = 'N'")  // 소프트 딜리트
@Getter @Setter @NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)`}
              </CodeBlock>
            </SubSection>

            <SubSection title="Import 순서">
              <Table
                headers={["순서", "패키지"]}
                rows={[
                  ["1", "java.* (표준)"],
                  ["2", "Third-party (lombok 등)"],
                  ["3", "org.springframework.*"],
                  ["4", "kr.co.kblp.* (프로젝트)"],
                ]}
              />
            </SubSection>
          </Section>

          {/* 프론트엔드 */}
          <Section id="frontend" icon="🖥️" title="프론트엔드 (Vue.js 3 / TypeScript)">
            <SubSection title="프로젝트 구조">
              <CodeBlock>
{`src/
├── api/          # API 호출 (도메인별)
├── assets/       # 정적 리소스
├── core/         # 재사용 컴포넌트 + 유틸 + 타입
├── styles/       # 스타일시트
├── types/        # 전역 타입
└── views/        # 페이지 (도메인별)`}
              </CodeBlock>
            </SubSection>

            <SubSection title="네이밍 규칙">
              <Table
                headers={["대상", "규칙", "예시"]}
                rows={[
                  ["페이지 컴포넌트", "PascalCase + 기능명", "ReceiptInfoList.vue"],
                  ["재사용 컴포넌트", "Sb 접두사 + PascalCase", "SbContainer.vue, SbGrid.vue"],
                  ["폴더", "kebab-case", "receipt-info/"],
                  ["Vue 파일", "PascalCase", "ReceiptInfoList.vue"],
                  ["TS 파일", "camelCase", "receiptInfoApi.ts"],
                  ["함수", "동사 + 명사", "statusCheck(), handleRowDoubleClick()"],
                ]}
              />
            </SubSection>

            <SubSection title="TypeScript 규칙">
              <div className="space-y-2">
                <p>
                  <Badge color="warning">type 사용</Badge>{" "}
                  <span className="text-[var(--muted)]">
                    — interface가 아닌 <code>type</code> 키워드로 정의
                  </span>
                </p>
                <p>
                  <Badge color="accent">strict 모드</Badge>{" "}
                  <span className="text-[var(--muted)]">— target/module: ESNext</span>
                </p>
                <p>
                  <Badge color="accent">경로 별칭</Badge>{" "}
                  <span className="text-[var(--muted)]">
                    — <code>@/*</code> → <code>src/*</code>
                  </span>
                </p>
              </div>
            </SubSection>

            <SubSection title="UI 컴포넌트">
              <p className="text-[var(--muted)]">
                <strong className="text-[var(--foreground)]">Wijmo</strong> (상용,{" "}
                <code>@mescius/wijmo</code>): 그리드/차트 전용
              </p>
              <p className="text-[var(--muted)] mt-1">
                <strong className="text-[var(--foreground)]">Sb 컴포넌트</strong>: Container, Group, Box, Text 등 자체 제작
              </p>
              <p className="text-[var(--muted)] mt-1">
                <strong className="text-[var(--foreground)]">Composition API</strong> (
                <code>&lt;script setup lang=&quot;ts&quot;&gt;</code>) 필수
              </p>
            </SubSection>
          </Section>

          {/* Git 브랜치 전략 */}
          <Section id="git" icon="🌿" title="Git 브랜치 전략" defaultOpen={true}>
            <SubSection title="브랜치 구조">
              <CodeBlock>
{`main              ← 프로덕션 (운영 배포)
  └── develop         ← 개발 통합 (기본 기준)
        ├── feature/{개발자ID}/{티켓번호}   ← 기능 개발
        └── bugfix/{개발자ID}/{티켓번호}    ← 버그 수정`}
              </CodeBlock>
            </SubSection>

            <SubSection title="작업 흐름 (실전 예시)">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className="flex-none w-8 h-8 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center text-sm font-bold">1</span>
                  <div className="flex-1">
                    <p className="font-medium text-[var(--heading)]">develop에서 브랜치 생성</p>
                    <CodeBlock>
{`git checkout develop
git pull origin develop
git checkout -b feature/degan/RM-42`}
                    </CodeBlock>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex-none w-8 h-8 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center text-sm font-bold">2</span>
                  <div className="flex-1">
                    <p className="font-medium text-[var(--heading)]">코드 작성 → 커밋 (여러 번 OK)</p>
                    <CodeBlock>
{`git commit -m "feat: 광고심의 엔티티 및 리포지토리 생성"
git commit -m "feat: 광고심의 목록 조회 API 구현"
git commit -m "test: 광고심의 목록 조회 단위 테스트 추가"
git commit -m "fix: 응답 DTO 필드명 오타 수정"`}
                    </CodeBlock>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex-none w-8 h-8 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center text-sm font-bold">3</span>
                  <div className="flex-1">
                    <p className="font-medium text-[var(--heading)]">Push → MR(Merge Request) 생성</p>
                    <CodeBlock>
{`git push origin feature/degan/RM-42
# → GitLab에서 MR 생성 (Source → develop)`}
                    </CodeBlock>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex-none w-8 h-8 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center text-sm font-bold">4</span>
                  <div className="flex-1">
                    <p className="font-medium text-[var(--heading)]">코드 리뷰 → 수정 → Merge</p>
                    <CodeBlock>
{`# 리뷰 피드백 반영
git commit -m "refactor: 리뷰 반영 - 서비스 레이어 분리"
git push origin feature/degan/RM-42
# → 승인 후 GitLab에서 Merge 버튼`}
                    </CodeBlock>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="flex-none w-8 h-8 rounded-full bg-[var(--success)]/20 text-[var(--success)] flex items-center justify-center text-sm font-bold">5</span>
                  <div className="flex-1">
                    <p className="font-medium text-[var(--heading)]">운영 배포 (PM/팀장)</p>
                    <CodeBlock>
{`git checkout main
git merge develop
git tag RL20260805-1
git push origin main --tags
# → PRD 수동 배포 트리거`}
                    </CodeBlock>
                  </div>
                </div>
              </div>
            </SubSection>

            <SubSection title="커밋 메시지 컨벤션">
              <CodeBlock title="형식">
{`{type}: {subject}

{body}     ← 선택사항

{footer}   ← 선택사항`}
              </CodeBlock>
              <Table
                headers={["type", "용도", "예시"]}
                rows={[
                  ["feat", "새 기능 추가", "feat: 민원 등록 API 구현"],
                  ["fix", "버그 수정", "fix: 날짜 포맷 변환 에러 수정"],
                  ["refactor", "리팩토링", "refactor: 서비스 메서드 분리"],
                  ["test", "테스트 추가/수정", "test: 조직 조회 단위 테스트"],
                  ["docs", "문서", "docs: API 명세서 업데이트"],
                  ["style", "코드 스타일", "style: import 순서 정리"],
                  ["chore", "빌드/설정 잡일", "chore: Gradle 의존성 업데이트"],
                ]}
              />
            </SubSection>

            <SubSection title="매일 루틴">
              <CodeBlock>
{`1. git pull origin develop          ← 아침에 최신 코드 받기
2. git checkout -b feature/degan/XX ← 작업 시작
3. 코드 짜고 커밋 (feat/fix/...)    ← 작업 중
4. git push → MR 생성               ← 작업 끝
5. 리뷰 받고 merge                   ← 완료`}
              </CodeBlock>
            </SubSection>
          </Section>

          {/* CI/CD */}
          <Section id="cicd" icon="🚀" title="CI/CD (GitLab + Docker Swarm)">
            <SubSection title="파이프라인 5단계">
              <div className="flex flex-col gap-2">
                {[
                  { step: "1. test", desc: "Gradle 단위 테스트", color: "accent" as const },
                  { step: "2. sonarqube-check", desc: "코드 품질 분석", color: "warning" as const },
                  { step: "3. build", desc: "JAR 생성", color: "accent" as const },
                  { step: "4. package", desc: "Docker 이미지 → Harbor", color: "accent" as const },
                  { step: "5. deploy", desc: "Docker Swarm Rolling Update", color: "success" as const },
                ].map((p) => (
                  <div key={p.step} className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[var(--background)]">
                    <Badge color={p.color}>{p.step}</Badge>
                    <span className="text-sm">{p.desc}</span>
                  </div>
                ))}
              </div>
            </SubSection>

            <SubSection title="배포 환경">
              <Table
                headers={["환경", "트리거", "방식"]}
                rows={[
                  ["DEV", "develop 브랜치 push", "자동"],
                  ["PRD", "RL* 태그 생성", "수동"],
                ]}
              />
            </SubSection>
          </Section>

          {/* 품질 관리 */}
          <Section id="quality" icon="✅" title="품질 관리">
            <SubSection title="SonarQube 기준">
              <Table
                headers={["항목", "기준"]}
                rows={[
                  ["Critical/Blocker 이슈", "0건"],
                  ["코드 커버리지", "≥ 70%"],
                  ["코드 중복률", "≤ 15%"],
                  ["메서드 복잡도", "≤ 10"],
                ]}
              />
            </SubSection>

            <SubSection title="보안 요구사항">
              <div className="space-y-2">
                {[
                  "SQL Injection: PreparedStatement 강제",
                  "XSS: Spring Security 기본 설정",
                  "인증: JWT 토큰 기반",
                  "의존성 보안: OWASP Dependency Check (CVSS ≥7.0 → 0건)",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <Badge color="danger">필수</Badge>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </SubSection>

            <SubSection title="코드 리뷰">
              <Table
                headers={["유형", "주기", "도구"]}
                rows={[
                  ["정기 리뷰", "2주 단위", "Claude Opus 4.6 + SonarQube"],
                  ["PR 리뷰", "feature → develop merge 시", "필수"],
                  ["핫픽스", "배포 후", "사후 리뷰"],
                ]}
              />
            </SubSection>

            <SubSection title="백엔드 체크리스트">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                {[
                  "도메인 기반 패키지 구조",
                  "ElastiCORE 모델 준수",
                  "네이밍 규칙 일관성",
                  "트랜잭션 범위 적절성",
                  "예외 처리 일관성",
                  "API 문서화 (@Operation, @ApiResponse)",
                  "보안 취약점 없음",
                  "테스트 코드 작성",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm py-1">
                    <span className="text-[var(--muted)]">☐</span>
                    {item}
                  </div>
                ))}
              </div>
            </SubSection>

            <SubSection title="프론트엔드 체크리스트">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                {[
                  "TypeScript 타입 정의",
                  "컴포넌트 재사용성",
                  "반응형 데이터 적절성",
                  "메모리 누수 없음",
                  "접근성 준수",
                  "브라우저 호환성",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm py-1">
                    <span className="text-[var(--muted)]">☐</span>
                    {item}
                  </div>
                ))}
              </div>
            </SubSection>
          </Section>

          {/* 엔티티 설계 */}
          <Section id="entity" icon="📐" title="엔티티 설계 규칙">
            <SubSection title="소프트 딜리트">
              <CodeBlock>
{`// 모든 엔티티에 적용
@Where(clause = "delete_yn = 'N'")

// 실제 삭제 대신 플래그 변경
entity.setDeleteYn("Y");`}
              </CodeBlock>
            </SubSection>

            <SubSection title="테이블/컬럼 명명">
              <CodeBlock>
{`테이블: tb_{도메인코드}__{엔티티_snake_case}
  예: tb_ct__receipt_info       (계약 도메인)
      tb_hr__sales_personnel    (인사 도메인)
      tb_rm__complaint          (내부통제 도메인)

컬럼: snake_case
  예: rcp_info_id, created_at, delete_yn

PK: {PREFIX}_NanoId14자  →  VARCHAR(25)`}
              </CodeBlock>
            </SubSection>

            <SubSection title="Audit 필드 (공통)">
              <CodeBlock>
{`@CreatedBy        → created_by    (생성자)
@CreatedDate      → created_at    (생성일시)
@LastModifiedBy   → updated_by    (수정자)
@LastModifiedDate → updated_at    (수정일시)
                  → delete_yn     (삭제여부, 기본 'N')`}
              </CodeBlock>
            </SubSection>
          </Section>

          {/* 기술 스택 */}
          <Section id="stack" icon="📦" title="기술 스택 요약">
            <SubSection title="백엔드">
              <Table
                headers={["기술", "버전", "용도"]}
                rows={[
                  ["Java", "21", "메인 언어"],
                  ["Spring Boot", "3.5.0", "프레임워크"],
                  ["Gradle", "8.8", "빌드"],
                  ["PostgreSQL", "latest", "메인 DB"],
                  ["Redis", "-", "세션/캐시"],
                  ["Kafka", "-", "메시지 큐"],
                  ["gRPC + Armeria", "-", "서비스 간 통신"],
                  ["ElastiCore", "2.0.x", "코드 생성 프레임워크"],
                  ["Spring AI", "-", "OpenAI + Anthropic 통합"],
                ]}
              />
            </SubSection>

            <SubSection title="프론트엔드">
              <Table
                headers={["기술", "버전", "용도"]}
                rows={[
                  ["Vue.js", "3.2.45", "프레임워크"],
                  ["TypeScript", "4.9.3", "타입 안전성"],
                  ["Vite", "4.0.1", "빌드/dev서버"],
                  ["Wijmo", "5.x", "상용 그리드/차트"],
                  ["Playwright", "-", "E2E 테스트"],
                ]}
              />
            </SubSection>

            <SubSection title="인프라">
              <Table
                headers={["구분", "도구"]}
                rows={[
                  ["컨테이너", "Docker"],
                  ["오케스트레이션", "Docker Swarm"],
                  ["레지스트리", "Harbor (Private)"],
                  ["CI/CD", "GitLab CI/CD"],
                  ["코드 품질", "SonarQube"],
                ]}
              />
            </SubSection>
          </Section>

          {/* Footer */}
          <footer className="text-center py-8 text-sm text-[var(--muted)]">
            <p>KB라이프파트너스 차세대 시스템 개발 표준 가이드라인</p>
            <p className="mt-1">
              원본: 엑스솔콥코리아 소스코드 표준 개발 가이드라인 v0.2 (2026-04-14)
            </p>
          </footer>
        </div>
      </main>
    </div>
    </AuthGate>
  );
}
