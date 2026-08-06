# 🛠️ Vue.js 실습 튜토리얼 — 로컬에서 따라하기

문법만 읽으면 안 늘어요. **민원관리 미니앱**을 로컬에서 직접 만들어봅니다.
각 Step의 코드를 `App.vue`에 통째로 붙여넣고 → 브라우저 확인 → 다음 Step으로.

> 문법이 헷갈리면 가이드 사이트의 "💚 Vue.js 3 기본 문법" 섹션을 같이 보세요.

## Step 0. 프로젝트 생성 & 실행

**준비물:** Node.js 18 이상, VS Code + Vue 확장(Volar)

```bash
# 원하는 폴더에서
npm create vue@latest

# 질문 나오면:
#   Project name: vue-practice
#   TypeScript?          → Yes  ✅ (나머지는 전부 No)

cd vue-practice
npm install
npm run dev
# → http://localhost:5173 열어서 확인
```

실습은 `src/App.vue` 하나만 계속 수정합니다. 열어서 내용 전부 지우고 시작하세요.
(`src/main.ts`에서 `import './assets/main.css'` 줄은 지워두면 기본 스타일 간섭이 없어요.)

## Step 1. 목록 그리기 — ref + v-for

```vue
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
```

**확인:** 목록 3건이 보이면 성공. 배열에 한 줄 추가해보고 화면이 바로 바뀌는지 보세요.

## Step 2. 등록 폼 — reactive + v-model

Step 1 코드에 **추가**:

```vue
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
```

**확인:** 입력 후 Enter 또는 등록 버튼 → 목록에 추가되고 입력창이 비워지면 성공.

## Step 3. 처리 / 삭제 — 배열 조작 + 조건부 스타일

```vue
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
```

**확인:** 처리완료 → 취소선, 삭제 → 목록에서 제거되면 성공.

## Step 4. 검색 + 통계 — computed

```vue
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
```

**확인:** 검색어 입력하면 목록이 실시간으로 걸러지고, 처리완료를 누르면 미처리 건수가 줄면 성공.

## Step 5. 컴포넌트 분리 — Props & Emit

목록 한 줄을 자식 컴포넌트로 분리합니다. `src/components/ComplaintCard.vue` 새 파일:

```vue
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
```

`App.vue`에서 사용:

```vue
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
```

**확인:** 동작이 Step 4와 똑같으면 성공. 데이터는 부모가 소유하고, 자식은 **Props로 받고 Emit으로 요청**만 합니다 — 실무 화면 구조가 전부 이 패턴이에요.

## Step 6. 가짜 API 연동 — 로딩/에러 상태

실무의 API 호출 패턴을 흉내냅니다. 백엔드 없이 `setTimeout`으로 지연을 재현:

```vue
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
```

**확인:** 새로고침하면 1초간 "로딩 중..."이 보였다가 목록이 나타나면 성공.
`resolve`를 `reject`로 바꿔서 에러 화면과 재시도 버튼도 확인해보세요.

## 도전 과제 (스스로 해보기)

1. **상태 필터**: `전체 / OPEN / CLOSED` 버튼을 만들어 computed로 필터링
2. **watch 활용**: 검색어가 바뀔 때마다 `console.log`로 이전값 → 새값 출력
3. **localStorage 저장**: 새로고침해도 목록이 유지되게 (`watch` + `JSON.stringify`)
4. **접수일 표시**: `Complaint` 타입에 `createdAt` 추가하고 목록에 날짜 출력

여기까지 하면 Vue 기본 문법의 90%를 손으로 써본 겁니다.
실무 코드(`views/` 페이지)를 열어보면 이 구조가 그대로 보일 거예요.
