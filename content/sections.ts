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
    id: "jpa",
    icon: "🗄️",
    title: "JPA 패턴 (엔티티 설계)",
    content: `
### 1. LifecycleEntity — 모든 엔티티의 부모

\`\`\`java
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class LifecycleEntity {
    @CreatedBy    private String createdBy;
    @CreatedDate  private LocalDateTime createdAt;
    @LastModifiedBy  private String updatedBy;
    @LastModifiedDate private LocalDateTime updatedAt;
    private String deleteYn = "N";
}
\`\`\`

모든 데이터에 "누가/언제 만들고 수정했는지" 자동 기록. 삭제도 실제로 안 지우고 플래그만 바꿈.

### 2. 소프트 딜리트 패턴

\`\`\`java
@Entity
@Table(name = "tb_rm__complaint")
@DynamicUpdate
@Where(clause = "delete_yn = 'N'")  // ← 핵심!
public class Complaint extends LifecycleEntity {
    @Id private String complaintId;
    private String title;
}
\`\`\`

- \`@Where\`: 조회 시 자동으로 \`WHERE delete_yn = 'N'\` 추가
- 삭제 = \`entity.setDeleteYn("Y")\` → DB에 데이터 남아있음
- **왜?** 금융 시스템은 데이터 보존 의무. 실수로 지워도 복구 가능

### 3. SINGLE_TABLE 상속 — 한 테이블에 여러 타입

\`\`\`java
// 부모
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "personnel_type")
public abstract class Personnel extends LifecycleEntity {
    @Id private String personnelId;
    private String name;
    private String phone;
}

// 자식 1: 영업 사원
@Entity @DiscriminatorValue("SALES")
public class SalesPersonnel extends Personnel {
    private String branchCode;
    private String licenseNo;
}

// 자식 2: 본사 직원
@Entity @DiscriminatorValue("HOME_OFFICE")
public class HomeOfficePersonnel extends Personnel {
    private String department;
    private String employeeNo;
}
\`\`\`

- 테이블 1개 \`tb_hr__personnel\`에 \`personnel_type\` 컬럼으로 구분
- JOIN 없이 빠르게 조회 가능, 차세대에서 표준 패턴

### 4. 연관관계 — 같은 도메인 vs 다른 도메인

**같은 도메인 → @ManyToOne (강한 참조)**
\`\`\`java
@Entity
public class SalesLicense extends LifecycleEntity {
    @ManyToOne(fetch = FetchType.LAZY)          // ← 지연 로딩!
    @JoinColumn(name = "personnel_id", nullable = false)
    private SalesPersonnel personnel;           // 실제 객체 참조
}
// 사용: license.getPersonnel().getName()  → 자동 JOIN
\`\`\`

**다른 도메인 → String FK (느슨한 참조)**
\`\`\`java
@Entity
public class Complaint extends LifecycleEntity {
    private String organizationId;  // ← 그냥 String!
    private String contractId;      // ← 그냥 String!
    // 필요하면 서비스에서 별도 조회
}
\`\`\`

- **같은 도메인(HR 안에서):** 항상 같이 쓰니까 FK로 묶어서 편하게
- **다른 도메인(RM → HR):** 결합 최소화 → 마이크로서비스로 쪼개기 쉽게

### 5. NanoId PK 생성

\`\`\`java
// 형식: {PREFIX}_{NanoId 14자}  →  VARCHAR(25)
// 예: COMPL_xZ9pQr4mWs7kLn

@PrePersist
protected void generateId() {
    if (this.complaintId == null) {
        this.complaintId = "COMPL_" + NanoIdUtils.randomNanoId(
            new SecureRandom(),
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".toCharArray(),
            14
        );
    }
}
\`\`\`

- UUID 대신 NanoId: 더 짧고 URL-safe
- PREFIX로 어느 엔티티 PK인지 바로 식별 가능

### 6. @DynamicUpdate — 바뀐 것만 UPDATE

\`\`\`java
@Entity
@DynamicUpdate  // ← 이거!
public class Complaint extends LifecycleEntity {
    private String title;
    private String content;
    private String status;
}

// title만 바꿨을 때:
// ✅ DynamicUpdate: UPDATE ... SET title = ? WHERE id = ?
// ❌ 없으면:       UPDATE ... SET title=?, content=?, status=? WHERE id = ?
\`\`\`

### 7. UniqueKey — 중복 방지

\`\`\`java
@Table(
    name = "tb_hr__personnel",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_personnel_resident",
            columnNames = {"resident_number"}    // 주민번호 중복 방지
        ),
        @UniqueConstraint(
            name = "uk_org_association",
            columnNames = {"organization_id", "association_type"}  // 복합 UK
        )
    }
)
\`\`\`

### 8. Repository 패턴

\`\`\`java
// 인터페이스만 만들면 구현은 Spring이 자동 생성
public interface ComplaintRepository
        extends JpaRepository<Complaint, String> {

    // 메서드명 규칙으로 쿼리 자동 생성
    List<Complaint> findByOrganizationId(String orgId);

    // 복잡한 건 @Query
    @Query("SELECT c FROM Complaint c WHERE c.status = :status")
    List<Complaint> findBySearch(@Param("status") String status);
}
\`\`\`

### 엔티티 작성 체크리스트

\`\`\`
1. LifecycleEntity 상속
2. @Entity, @Table(name = "tb_{도메인}__{엔티티}")
3. @DynamicUpdate, @Where(clause = "delete_yn = 'N'")
4. PK: {PREFIX}_NanoId14자, VARCHAR(25)
5. 필드 정의 (같은 도메인은 @ManyToOne, 다른 도메인은 String)
6. UK 정의 (@UniqueConstraint)
7. Repository 인터페이스 생성
\`\`\`
`,
  },
  {
    id: "java-core",
    icon: "☕",
    title: "Java 핵심 문법 (::, record, Stream)",
    content: `
### 1. \`::\` 메서드 참조 (Method Reference)

람다(Lambda)를 더 짧게 쓰는 문법. \`::\` 왼쪽은 "누구의", 오른쪽은 "어떤 메서드"

\`\`\`java
// 이 둘은 완전히 같은 의미
.map(sp -> sp.getName())         // 람다
.map(SalesPersonnel::getName)    // 메서드 참조 (더 짧게)
\`\`\`

**4가지 형태:**

\`\`\`java
// ① 인스턴스의 메서드 → 클래스명::메서드
list.stream()
    .map(Personnel::getName)     // = p -> p.getName()
    .filter(String::isEmpty)     // = s -> s.isEmpty()

// ② 특정 객체의 메서드 → 객체::메서드
String prefix = "KB_";
list.stream()
    .map(prefix::concat)         // = s -> prefix.concat(s)

// ③ 정적(static) 메서드 → 클래스명::메서드
list.stream()
    .map(String::valueOf)        // = x -> String.valueOf(x)
    .map(Integer::parseInt)      // = s -> Integer.parseInt(s)

// ④ 생성자 → 클래스명::new
list.stream()
    .map(ComplaintDto::new)      // = data -> new ComplaintDto(data)
\`\`\`

**실전 예시:**
\`\`\`java
// 전체 영업사원 중 재직자 이름 목록
List<String> names = personnelRepository.findAll().stream()
    .filter(p -> p.getStatus() == AppointmentStatus.EMPLOYED)
    .map(Personnel::getName)          // :: 사용
    .sorted(String::compareTo)        // :: 사용
    .toList();

// 엔티티 → DTO 변환
List<ComplaintDto> dtos = complaints.stream()
    .map(ComplaintDto::from)          // static 메서드 참조
    .toList();
\`\`\`

### 2. Java 21 record — 불변 데이터 클래스

**Before (50줄):**
\`\`\`java
public class ComplaintDto {
    private final String id;
    private final String title;
    private final String status;
    // + 생성자 + getter 3개 + equals + hashCode + toString
    // ... 50줄 ...
}
\`\`\`

**After (1줄):**
\`\`\`java
public record ComplaintDto(String id, String title, String status) {}
\`\`\`

**자동 생성되는 것:**
- \`private final\` 필드 3개
- 전체 인자 생성자
- \`id()\`, \`title()\`, \`status()\` 접근자 (**get 안 붙음!**)
- \`equals()\`, \`hashCode()\`, \`toString()\`

\`\`\`java
// 생성
ComplaintDto dto = new ComplaintDto("COMPL_abc", "민원제목", "진행중");

// 접근 — getName()이 아니라 name()!
String id = dto.id();          // "COMPL_abc"
String title = dto.title();    // "민원제목"

// toString 자동
System.out.println(dto);
// → ComplaintDto[id=COMPL_abc, title=민원제목, status=진행중]

// equals 자동 — 필드값이 같으면 같은 객체
ComplaintDto dto2 = new ComplaintDto("COMPL_abc", "민원제목", "진행중");
dto.equals(dto2);  // true!
\`\`\`

**record에 메서드 추가도 가능:**
\`\`\`java
public record ComplaintResponse(
    String id,
    String title,
    String status,
    LocalDateTime createdAt
) {
    // 엔티티 → DTO 변환 팩토리 메서드
    public static ComplaintResponse from(Complaint c) {
        return new ComplaintResponse(
            c.getComplaintId(),
            c.getTitle(),
            c.getStatus().name(),
            c.getCreatedAt()
        );
    }
}
\`\`\`

**record vs class — 언제 뭘 쓰나:**

| | record | class |
|---|---|---|
| 용도 | 데이터 운반 (DTO, 값 객체) | 행동 + 상태 (엔티티, 서비스) |
| 가변성 | 불변 (값 변경 불가) | 가변 (setter 가능) |
| JPA 엔티티? | 못 씀 | 사용 |
| API DTO? | 최적 | 가능하지만 번거로움 |

**정리: Entity는 class, DTO는 record**

### 3. Stream API — 컬렉션 함수형 처리

\`\`\`java
// 기본 흐름: 소스 → 중간연산(lazy) → 최종연산(trigger)
List<String> result = complaints.stream()    // 소스
    .filter(c -> c.getStatus() == OPEN)      // 중간: 걸러내기
    .map(Complaint::getTitle)                // 중간: 변환
    .sorted()                                // 중간: 정렬
    .toList();                               // 최종: 실행!
\`\`\`

**핵심: Lazy 평가 (게으른 실행)**

- 중간 연산(filter, map, sorted)은 **호출해도 실행 안 됨**
- 최종 연산(toList, count, forEach) 호출 시 **한 번에 실행**
- 100만 건에서 3건만 필요? → 3건 찾으면 나머지 97만 건은 처리 안 함

**자주 쓰는 연산:**

\`\`\`java
// filter — 조건에 맞는 것만
.filter(p -> p.getAge() > 30)

// map — 변환
.map(Personnel::getName)          // 객체 → 이름
.map(name -> name.toUpperCase())  // 이름 → 대문자

// sorted — 정렬
.sorted()                         // 자연 순서
.sorted(Comparator.comparing(Personnel::getName))  // 특정 필드

// distinct — 중복 제거
.distinct()

// limit / skip — 페이징
.skip(20).limit(10)               // 21~30번째

// collect / toList — 결과 수집
.toList()                                           // 리스트로
.collect(Collectors.joining(", "))                   // 문자열로
.collect(Collectors.groupingBy(Personnel::getBranch)) // 그룹핑
\`\`\`
`,
  },
  {
    id: "vue-basics",
    icon: "💚",
    title: "Vue.js 3 기본 문법",
    content: `
### 1. 파일 구조 — Composition API

\`\`\`vue
<script setup lang="ts">
// 여기에 로직 (변수, 함수, API 호출 등)
</script>

<template>
  <!-- 여기에 HTML -->
</template>

<style scoped>
/* 여기에 CSS (이 컴포넌트에만 적용) */
</style>
\`\`\`

차세대에서는 **Composition API + \`<script setup>\`** 필수. Options API(옛날 \`data()/methods\` 방식)는 사용 금지.

### 2. 반응형 데이터 — ref와 reactive

Vue의 핵심: **데이터가 바뀌면 화면이 자동으로 바뀜**

**ref — 단일 값:**
\`\`\`vue
<script setup lang="ts">
import { ref } from 'vue'

const name = ref('대근')       // ref()로 감싸면 반응형
const count = ref(0)
const isLoading = ref(false)

const changeName = () => {
  name.value = '새이름'         // JS에서는 .value 필요!
  count.value++
}
</script>

<template>
  <p>{{ name }}</p>             <!-- template에서는 .value 불필요! -->
  <p>{{ count }}</p>
  <button @click="changeName">변경</button>
</template>
\`\`\`

**제일 헷갈리는 포인트:**
\`\`\`typescript
// JS/TS 코드에서 → .value 필요
name.value = '새이름'

// template(HTML)에서 → .value 불필요
{{ name }}
\`\`\`

**reactive — 객체:**
\`\`\`vue
<script setup lang="ts">
import { reactive } from 'vue'

const form = reactive({
  title: '',
  content: '',
  status: 'DRAFT'
})

const updateTitle = () => {
  form.title = '새 제목'      // reactive는 .value 안 붙임!
}
</script>

<template>
  <input v-model="form.title" />
</template>
\`\`\`

### 3. 템플릿 문법 — 화면 그리기

\`\`\`vue
<template>
  <!-- 텍스트 출력 -->
  <p>{{ name }}</p>

  <!-- 속성 바인딩: v-bind 또는 : (단축) -->
  <img :src="imageUrl" />
  <button :disabled="isLoading">저장</button>
  <div :class="{ active: isActive }">...</div>

  <!-- 조건부 렌더링 -->
  <div v-if="status === 'LOADING'">로딩 중...</div>
  <div v-else-if="status === 'ERROR'">에러 발생</div>
  <div v-else>데이터 표시</div>

  <!-- v-show: display:none으로 숨김 (DOM은 남아있음) -->
  <div v-show="isVisible">토글</div>

  <!-- 반복 (:key 필수!) -->
  <li v-for="item in complaints" :key="item.id">
    {{ item.title }} — {{ item.status }}
  </li>

  <!-- 이벤트 -->
  <button @click="handleSave">저장</button>
  <button @click="handleDelete(item.id)">삭제</button>
  <input @keyup.enter="handleSearch" />

  <!-- 양방향 바인딩 -->
  <input v-model="form.title" />
</template>
\`\`\`

**v-if vs v-show:**
- \`v-if\`: 조건 false면 DOM에서 아예 제거 → 자주 안 바뀌는 조건에
- \`v-show\`: display:none으로 숨김 → 자주 토글되는 것에 (탭, 모달)

### 4. computed — 캐싱된 계산값

\`\`\`vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const complaints = ref([
  { title: '민원1', status: 'OPEN' },
  { title: '민원2', status: 'CLOSED' },
  { title: '민원3', status: 'OPEN' },
])

// complaints가 바뀔 때만 자동 재계산 (캐싱됨)
const openCount = computed(() => {
  return complaints.value.filter(c => c.status === 'OPEN').length
})
</script>

<template>
  <p>미처리 민원: {{ openCount }}건</p>
</template>
\`\`\`

### 5. watch — 데이터 변화 감지

\`\`\`vue
<script setup lang="ts">
import { ref, watch } from 'vue'

const searchKeyword = ref('')
const selectedStatus = ref('ALL')

// searchKeyword가 바뀔 때마다 실행
watch(searchKeyword, (newVal, oldVal) => {
  console.log(oldVal, '→', newVal)
  fetchComplaints(newVal)
})

// 여러 값 동시에 감시
watch([searchKeyword, selectedStatus], ([keyword, status]) => {
  fetchComplaints(keyword, status)
})

// 즉시 실행 + 감시
watch(searchKeyword, (val) => {
  fetchComplaints(val)
}, { immediate: true })  // 마운트 시 바로 1번 실행
</script>
\`\`\`

### 6. 라이프사이클

\`\`\`vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

// 컴포넌트가 화면에 나타난 후 (가장 많이 씀!)
onMounted(() => {
  fetchData()  // API 호출은 보통 여기서
})

// 컴포넌트가 제거될 때 (정리 작업)
onUnmounted(() => {
  clearInterval(timer)
})
</script>
\`\`\`

실무에서 90%는 **onMounted**만 씀 — 페이지 들어올 때 데이터 불러오기.

### 7. Props & Emit — 부모 ↔ 자식 통신

**부모 → 자식: Props**
\`\`\`vue
<!-- 자식: ComplaintCard.vue -->
<script setup lang="ts">
type Props = {
  complaint: {
    id: string
    title: string
    status: string
  }
}
const props = defineProps<Props>()
</script>
\`\`\`

**자식 → 부모: Emit**
\`\`\`vue
<script setup lang="ts">
const emit = defineEmits<{
  delete: [id: string]
}>()

const handleDelete = () => {
  emit('delete', props.complaint.id)
}
</script>
\`\`\`

**부모에서 사용:**
\`\`\`vue
<ComplaintCard
  :complaint="item"
  @delete="handleDelete"
/>
\`\`\`

데이터 흐름: **부모→자식은 Props, 자식→부모는 Emit**

### 8. API 호출 패턴

\`\`\`vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

type Complaint = { id: string; title: string; status: string }

const complaints = ref<Complaint[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

const fetchComplaints = async () => {
  isLoading.value = true
  error.value = null
  try {
    const res = await fetch('/api/rm/complaint')
    complaints.value = await res.json()
  } catch (e) {
    error.value = '데이터 로딩 실패'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => fetchComplaints())
</script>

<template>
  <div v-if="isLoading">로딩 중...</div>
  <div v-else-if="error">{{ error }}</div>
  <ul v-else>
    <li v-for="c in complaints" :key="c.id">
      {{ c.title }}
    </li>
  </ul>
</template>
\`\`\`

### 치트시트

\`\`\`
반응형:   ref(값)          → .value로 접근
          reactive({...})  → 바로 접근
화면:     {{ 변수 }}        → 텍스트
          :속성="값"        → 속성 바인딩
          @이벤트="함수"    → 이벤트
          v-if / v-for     → 조건/반복
          v-model          → 양방향
계산:     computed(() => ...)  → 캐싱된 계산값
감시:     watch(대상, 콜백)    → 변화 감지
생명주기: onMounted(() => ...) → 마운트 후
통신:     defineProps          → 부모→자식
          defineEmits          → 자식→부모
타입:     type 쓰기 (interface ❌)
\`\`\`
`,
  },
  {
    id: "vue-tutorial",
    icon: "🛠️",
    title: "Vue.js 실습 튜토리얼 — 로컬에서 따라하기",
    content: `
문법만 읽으면 안 늘어요. **민원관리 미니앱**을 로컬에서 직접 만들어봅니다.
각 Step의 코드를 \`App.vue\`에 통째로 붙여넣고 → 브라우저 확인 → 다음 Step으로.

### Step 0. 프로젝트 생성 & 실행

**준비물:** Node.js 18 이상, VS Code + Vue 확장(Volar)

\`\`\`bash
# 원하는 폴더에서
npm create vue@latest

# 질문 나오면:
#   Project name: vue-practice
#   TypeScript?          → Yes  ✅ (나머지는 전부 No)

cd vue-practice
npm install
npm run dev
# → http://localhost:5173 열어서 확인
\`\`\`

실습은 \`src/App.vue\` 하나만 계속 수정합니다. 열어서 내용 전부 지우고 시작하세요.
(\`src/main.ts\`에서 \`import './assets/main.css'\` 줄은 지워두면 기본 스타일 간섭이 없어요.)

### Step 1. 목록 그리기 — ref + v-for

\`\`\`vue
<script setup lang="ts">
import { ref } from 'vue'

type Complaint = {
  id: number
  title: string
  status: 'OPEN' | 'CLOSED'
}

const complaints = ref<Complaint[]>([
  { id: 1, title: '보험금 지급 지연 문의', status: 'OPEN' },
  { id: 2, title: '설계사 불완전판매 신고', status: 'CLOSED' },
  { id: 3, title: '앱 로그인 오류', status: 'OPEN' },
])
</script>

<template>
  <h1>민원 관리</h1>
  <ul>
    <li v-for="c in complaints" :key="c.id">
      {{ c.title }} — {{ c.status }}
    </li>
  </ul>
  <p v-if="complaints.length === 0">민원이 없습니다.</p>
</template>
\`\`\`

**확인:** 목록 3건이 보이면 성공. 배열에 한 줄 추가해보고 화면이 바로 바뀌는지 보세요.

### Step 2. 등록 폼 — reactive + v-model

Step 1 코드에 **추가**:

\`\`\`vue
<script setup lang="ts">
import { ref, reactive } from 'vue'
// ... Step 1의 type, complaints 그대로 ...

const form = reactive({ title: '' })
let nextId = 4

const handleAdd = () => {
  if (!form.title.trim()) {
    alert('제목을 입력하세요')
    return
  }
  complaints.value.push({
    id: nextId++,
    title: form.title,
    status: 'OPEN',
  })
  form.title = ''   // 입력창 비우기
}
</script>

<template>
  <h1>민원 관리</h1>

  <input v-model="form.title" placeholder="민원 제목" @keyup.enter="handleAdd" />
  <button @click="handleAdd">등록</button>

  <ul>
    <li v-for="c in complaints" :key="c.id">
      {{ c.title }} — {{ c.status }}
    </li>
  </ul>
</template>
\`\`\`

**확인:** 입력 후 Enter 또는 등록 버튼 → 목록에 추가되고 입력창이 비워지면 성공.

### Step 3. 처리 / 삭제 — 배열 조작 + 조건부 스타일

\`\`\`vue
<script setup lang="ts">
// ... 기존 코드에 추가 ...

const handleClose = (id: number) => {
  const target = complaints.value.find(c => c.id === id)
  if (target) target.status = 'CLOSED'
}

const handleDelete = (id: number) => {
  complaints.value = complaints.value.filter(c => c.id !== id)
}
</script>

<template>
  <!-- 목록 부분만 교체 -->
  <ul>
    <li v-for="c in complaints" :key="c.id" :class="{ closed: c.status === 'CLOSED' }">
      {{ c.title }}
      <button v-if="c.status === 'OPEN'" @click="handleClose(c.id)">처리완료</button>
      <button @click="handleDelete(c.id)">삭제</button>
    </li>
  </ul>
</template>

<style scoped>
.closed {
  text-decoration: line-through;
  color: #999;
}
</style>
\`\`\`

**확인:** 처리완료 → 취소선, 삭제 → 목록에서 제거되면 성공.

### Step 4. 검색 + 통계 — computed

\`\`\`vue
<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
// ... 기존 코드에 추가 ...

const keyword = ref('')

// keyword나 complaints가 바뀔 때만 자동 재계산
const filtered = computed(() =>
  complaints.value.filter(c => c.title.includes(keyword.value))
)

const openCount = computed(
  () => complaints.value.filter(c => c.status === 'OPEN').length
)
</script>

<template>
  <h1>민원 관리 <small>(미처리 {{ openCount }}건)</small></h1>

  <input v-model="keyword" placeholder="검색어" />

  <!-- v-for 대상을 complaints → filtered로 교체 -->
  <ul>
    <li v-for="c in filtered" :key="c.id" :class="{ closed: c.status === 'CLOSED' }">
      ...
    </li>
  </ul>
</template>
\`\`\`

**확인:** 검색어 입력하면 목록이 실시간으로 걸러지고, 처리완료를 누르면 미처리 건수가 줄면 성공.

### Step 5. 컴포넌트 분리 — Props & Emit

목록 한 줄을 자식 컴포넌트로 분리합니다. \`src/components/ComplaintCard.vue\` 새 파일:

\`\`\`vue
<script setup lang="ts">
type Complaint = {
  id: number
  title: string
  status: 'OPEN' | 'CLOSED'
}

const props = defineProps<{ complaint: Complaint }>()

const emit = defineEmits<{
  close: [id: number]
  remove: [id: number]
}>()
</script>

<template>
  <li :class="{ closed: props.complaint.status === 'CLOSED' }">
    {{ props.complaint.title }}
    <button v-if="props.complaint.status === 'OPEN'" @click="emit('close', props.complaint.id)">
      처리완료
    </button>
    <button @click="emit('remove', props.complaint.id)">삭제</button>
  </li>
</template>

<style scoped>
.closed {
  text-decoration: line-through;
  color: #999;
}
</style>
\`\`\`

\`App.vue\`에서 사용:

\`\`\`vue
<script setup lang="ts">
import ComplaintCard from './components/ComplaintCard.vue'
// handleClose, handleDelete는 그대로 둠
</script>

<template>
  <ul>
    <ComplaintCard
      v-for="c in filtered"
      :key="c.id"
      :complaint="c"
      @close="handleClose"
      @remove="handleDelete"
    />
  </ul>
</template>
\`\`\`

**확인:** 동작이 Step 4와 똑같으면 성공. 데이터는 부모가 소유하고, 자식은 **Props로 받고 Emit으로 요청**만 합니다 — 실무 화면 구조가 전부 이 패턴이에요.

### Step 6. 가짜 API 연동 — 로딩/에러 상태

실무의 API 호출 패턴을 흉내냅니다. 백엔드 없이 \`setTimeout\`으로 지연을 재현:

\`\`\`vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 가짜 API — 1초 뒤 데이터 반환
const fetchComplaints = (): Promise<Complaint[]> =>
  new Promise(resolve =>
    setTimeout(() => resolve([
      { id: 1, title: '보험금 지급 지연 문의', status: 'OPEN' },
      { id: 2, title: '설계사 불완전판매 신고', status: 'CLOSED' },
    ]), 1000)
  )

const complaints = ref<Complaint[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

const loadData = async () => {
  isLoading.value = true
  error.value = null
  try {
    complaints.value = await fetchComplaints()
  } catch (e) {
    error.value = '데이터 로딩 실패'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => loadData())
</script>

<template>
  <div v-if="isLoading">로딩 중...</div>
  <div v-else-if="error">{{ error }} <button @click="loadData">재시도</button></div>
  <ul v-else>
    <ComplaintCard v-for="c in filtered" :key="c.id" :complaint="c"
      @close="handleClose" @remove="handleDelete" />
  </ul>
</template>
\`\`\`

**확인:** 새로고침하면 1초간 "로딩 중..."이 보였다가 목록이 나타나면 성공.
\`resolve\`를 \`reject\`로 바꿔서 에러 화면과 재시도 버튼도 확인해보세요.

### 도전 과제 (스스로 해보기)

1. **상태 필터**: \`전체 / OPEN / CLOSED\` 버튼을 만들어 computed로 필터링
2. **watch 활용**: 검색어가 바뀔 때마다 \`console.log\`로 이전값 → 새값 출력
3. **localStorage 저장**: 새로고침해도 목록이 유지되게 (\`watch\` + \`JSON.stringify\`)
4. **접수일 표시**: \`Complaint\` 타입에 \`createdAt\` 추가하고 목록에 날짜 출력

여기까지 하면 위 "Vue.js 3 기본 문법" 섹션의 90%를 손으로 써본 겁니다.
실무 코드(\`views/\` 페이지)를 열어보면 이 구조가 그대로 보일 거예요.
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
