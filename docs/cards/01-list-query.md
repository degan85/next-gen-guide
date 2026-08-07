# 결정 카드 ① — 목록 조회 (조인·검색·하위조직)

> 워크스루 완료: 2026-08-07. 코드 위치: 광고심의 Service/Controller (회사 저장소).
> 이 카드는 일반화된 패턴만 담는다 — 원문 코드는 회사 저장소에서.

## 배경 — 문제가 뭐였나

신청자·소속이 FK가 아니라 **문자열 컬럼**(느슨한 참조). JPA가 자동 조인을 못 하니:
목록에 ID 그대로 노출 / 이름 검색 불가 / 소속 검색이 완전일치(하위조직 미포함).

---

## 결정 1: 응답 DTO를 상속으로 확장

```
문제   : 응답에 이름·소속경로 필드를 추가해야 하는데 DTO 는 코드 생성기가 재생성
선택지 : (a) 생성 DTO 직접 수정  (b) 상속한 새 클래스  (c) Map 반환
선택   : (b) — ListDTO extends 생성DTO
이유   : (a)는 다음 재생성 때 날아감. (c)는 타입 안전성 상실
핵심규칙: 생성 파일(DTO·Mapper·CoreService·Q)은 불가침, Service·Controller·신규 파일로만 확장
```

## 결정 2: SQL 조인 대신 "배치 조회 후 채우기"

```
문제   : 느슨한 참조라 엔티티 레벨 조인이 없음
선택지 : (a) 라이브러리 crossJoin API (SQL LEFT JOIN)  (b) 3쿼리 배치 조회
선택   : (b)
이유   : 기존 조회 파이프라인(toSpec + findAll)을 한 글자도 안 바꿈.
        페이지당 3쿼리 고정(N+1 아님 — ID 모아서 IN 두 방).
        repository mock 만으로 단위 테스트 가능
버린 것 : 조인 컬럼(이름)으로 정렬 불가 — 화면 요구에 없어서 감수
예상 Q  : "N+1 아니에요?" → 행마다 조회가 아니라 페이지당 IN 2회 고정
```

```java
// 패턴: 페이지 조회 → 참조키 수집 → IN 배치 조회 → Map 으로 채움
Page<Entity> page = repo.findAll(spec, pageable);            // 쿼리 1
Set<String> refs = collectRefs(page);
List<Person> people = personRepo.findAll(idOrNumberIn(refs)); // 쿼리 2
Map<String, Person> byRef = indexByBothKeys(people);
page.map(e -> fillDto(e, byRef.get(e.getRef())));            // 조회 없음
```

## 결정 3: 참조값을 PK와 사번 양쪽으로 매칭

```
문제   : 느슨한 참조 컬럼에 PK·사번·로그인ID 가 섞여 저장돼 있음 (실데이터 확인)
선택   : 매칭 맵을 id 와 personnelNumber 두 키로 구성. 둘 다 아니면 null
       → 표시 대체(fallback)는 프론트 책임 (뭘 보여줄지는 표현 계층 결정)
```

## 결정 4: 이름 검색 = 선조회 → IN

```
문제   : 검색 DTO(재생성 파일)에 이름 필드가 없음
선택   : 인원을 키워드로 먼저 찾고, 그 id+사번 목록을 IN 조건으로
공짜효과: 동명이인 OR 검색이 자동 해결 (매칭 인원 전부 IN 에 들어감)
최적화 : 매칭 0명이면 목록 쿼리 생략하고 즉시 빈 페이지
파라미터: 검색 DTO 대신 @RequestParam 으로 수신 (DTO 재생성 회피 — 정석은 DSL 수정)
```

## 결정 5: 하위조직 = 경로 prefix 확장 ★미묘 포인트

```
문제   : 조직 검색이 ID 완전일치라 상위 조직 선택 시 하위 건이 안 나옴
선택   : 조직의 경로 컬럼(Materialized Path)을 LIKE 'path%' 로 확장 → 조직 ID 목록 → IN
★함정  : 원본 검색 DTO 의 organizationId 를 비워야(null) 한다.
        안 비우면 생성된 toSpec 이 "완전일치" 조건을 또 걸어서
        IN 과 AND 로 묶여 결국 완전일치로 되돌아감.
        → 이 부수효과를 검증하는 테스트가 따로 있음
```

## 결정 6: 새 LIKE 조건은 전부 이스케이프

```
문제   : 생성된 Mapper 의 LIKE 는 escape 미지정 — 사용자 입력의 % _ 가 와일드카드로 샘
제약   : Mapper 는 재생성 파일이라 못 고침
선택   : 새로 만드는 조건에만 escapeLike + cb.like(path, pattern, '\\') 적용
        (세 번째 인자가 escape 문자 선언 — 이게 없으면 \% 를 보내도 소용없음)
잔여   : 기존 Mapper 경로(광고명 검색)는 미해결 — 플랫폼 차원 이슈로 백엔드팀 전달
```

---

## 문법 노트

- `r.<String>get("name")` — Criteria 의 `Path<Object>` 는 `cb.like` 에 못 들어감. 타입 명시 필요
- `Specification` 은 `(root, query, cb) -> Predicate` 함수형 인터페이스. `.and()` 로 합성
- `cb.conjunction()` — "항상 참" 조건. 스펙 합성의 시작점(항등원)으로 씀
- `BeanUtils.copyProperties(src, dst)` — 같은 이름 프로퍼티 복사. 부모→자식 DTO 채울 때

## 이 덩어리를 지키는 테스트 (계약)

- 키워드 매칭 0명 → 목록 쿼리 없이 빈 페이지
- PK 참조·사번 참조·미매칭 값 3행 → 이름/사번/경로 각각 올바르게, 미매칭은 null
- 조직 확장 → 부수효과로 검색 DTO 의 organizationId 가 비워짐
