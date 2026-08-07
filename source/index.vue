<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import XButton from "@x/shared/components/XButton.vue"
import XPopup from "@x/shared/components/XPopup.vue"
import XTextButton from "@x/shared/components/XTextButton.vue"
import XInput from "@x/shared/components/XInput.vue"
import XInputFile from "@x/shared/components/XInputFile.vue"
import XSelect from "@x/shared/components/XSelect.vue"
import XFormSection from "@x/shared/components/XFormSection.vue"
import XFormRow from "@x/shared/components/XFormRow.vue"
import XFormBox from "@x/shared/components/XFormBox.vue"
import XIconTextButton from "@x/shared/components/XIconTextButton.vue"
import type { SelectOption } from "@x/shared/components/XSelect.vue"
import SplitView from "~/components/split-view/SplitView.vue"
import { VueGrid } from "~/components/VueGrid"
import type { GridColumnDef } from "~/components/VueGrid"
import XCalendar from "@x/shared/components/XCalendar.vue"
import { seedEmployees } from "~/pages/sales-hr/organization-management/employee.mock"
import type { EmployeeRow } from "~/components/employee-search-popup/types"
import OrgPathCell from "~/components/org-path-cell/OrgPathCell.vue"
import {
  fetchManagerDetail,
  PersonalInfoDetailPopup,
  type PersonalInfoDetailData,
} from "~/components/personal-info-detail"
import { type PersonalInfoChangeRequestRow } from "~/pages/sales-hr/personal-information/personal-info-change-request/personalInfoChangeRequestSampleData"
import { useDepartmentOrgSearch } from "~/pages/sales-hr/organization-management/useDepartmentOrgSearch"
import type { OrgRow } from "~/pages/sales-hr/organization-management/organizationManagementApi"
import OrgSearchPopup from "~/pages/sales-hr/organization-management/OrgSearchPopup.vue"
import { openReleaseNoticePrintWindow } from "~/components/release-notice-print-window/releaseNoticePrintWindow"
import icn_16_copy from "@x/shared/images/icons/icn_16_copy.svg"
import XEditor from "@x/shared/components/XEditor"
import XComment from "@x/shared/components/XComment"
import type { XCommentData } from "@x/shared/components/XComment"
import type { JSONContent } from "@x/shared/components/XEditor"
import XTooltipText from "@x/shared/components/XTooltipText.vue"
import XMultiSelect from "@x/shared/components/XMultiSelect.vue"
import type { MultiSelectOption, MultiSelectValue } from "@x/shared/components/XMultiSelect.vue"
import {
  deleteAdReviewFile,
  downloadAdReviewFile,
  fetchAdReviewExcel,
  generateNextReviewNumber,
  toAdReviewRows,
  uploadAdReviewFile,
  useAdReviewDetailQuery,
  useAdReviewListQuery,
  useDeleteAdReviewCommentMutation,
  useRegisterAdReviewCommentMutation,
  useRegisterAdReviewMutation,
  useUpdateAdReviewCommentMutation,
  useUpdateAdReviewMutation,
  type AdReviewDateType,
  type AdReviewListParams,
  type AdReviewRow,
  type AdReviewUpdatePayload,
} from "./adReviewApi"
import { AD_CHANNEL_CODES, AD_REVIEW_STATUS_CODES, AD_TYPE_CODES } from "./adReviewCodes"

// ==========================================
// 1. 상태 및 반응형 데이터 선언 (최상단 배치)
// ==========================================
const isSplitOpen = ref(false)
const currentView = ref<"requestAdreview" | "detailAdreview">("requestAdreview")
const splitPanelTitle = ref<string>("광고심의 등록")

// 검색 조건 및 기타 팝업 상태
// 검색폼 전용 상태 — 등록/상세 폼의 adTypeSelect 와 분리해 둔다.
// (분리 전에는 ref 하나를 공유해서 검색조건을 바꾸면 등록 폼 값까지 같이 바뀌었다.)
const searchAdType = ref<string | number | null>("")
const searchStatus = ref<string | number | null>("")
// XSelect 가 string | number | null 을 emit 하므로 좁은 유니온으로 두면 v-model 타입이 어긋난다.
const searchDateType = ref<string | number | null>("approval" satisfies AdReviewDateType)

// 등록 폼 상태 (RM_01_07_01_01)
const registerAdType = ref<string | number | null>(null)
const registerChannels = ref<MultiSelectValue[]>([])
const registerAdName = ref<string>("")
const registerOrgName = ref<string>("")
const registerOrgId = ref<string>("")
// XEditor 는 v-model(JSON) 과 별개로 ref 의 getHTML() 로 저장용 HTML 을 뽑는다.
const registerEditorRef = ref<InstanceType<typeof XEditor> | null>(null)
const registerEditorContent = ref<JSONContent>({ type: "doc", content: [] })
// 등록 시점에는 refId(광고심의 id)가 없어 파일을 보관했다가 저장 성공 후 업로드한다.
// TODO: 명세는 다건 첨부 — 퍼블 XInputFile 이 단일 선택이라 우선 1건만 지원.
const registerFile = ref<File | null>(null)

// 상세 폼 상태 (RM_01_07_01_02) — 접수정보 + 광고 심의 정보
const detailId = ref<string | null>(null)
const detailAdType = ref<string | number | null>(null)
const detailChannels = ref<MultiSelectValue[]>([])
const detailAdName = ref<string>("")
const detailEditorRef = ref<InstanceType<typeof XEditor> | null>(null)
const detailEditorContent = ref<JSONContent>({ type: "doc", content: [] })
const detailReviewStatus = ref<string | number | null>(null)
const detailMarketingResult = ref<string | number | null>(null)
const detailConsumerResult = ref<string | number | null>(null)
const detailComplianceResult = ref<string | number | null>(null)
const detailValidityStart = ref<Date | null>(null)
const detailValidityEnd = ref<Date | null>(null)

// 검색폼 기간
const startDate = ref<Date | null>(null)
const endDate = ref<Date | null>(new Date())
const searchTxt = ref<string>("")
const searchTxt2 = ref<string>("")
const employeeRows = ref<EmployeeRow[]>(seedEmployees())
const isEmployeeDetailPopupOpen = ref<boolean>(false)
const employeeDetailData = ref<PersonalInfoDetailData | null>(null)
const filterOrg = ref<string>("")
// 조회 파라미터는 조직 ID 를 요구하는데 filterOrg 에는 표시용 조직명이 담기므로 별도로 보관한다.
const filterOrgId = ref<string>("")
const {
  departmentOrgRows,
  departmentOrgTree,
  isDepartmentOrgSearchOpen,
  openDepartmentOrgSearch,
  closeDepartmentOrgSearch,
  selectDepartmentOrg,
} = useDepartmentOrgSearch(filterOrg)

// 셀렉트 옵션 데이터들
// 코드 목록은 adReviewCodes.ts 가 단일 출처다. "전체" 같은 화면 가공 옵션은 여기서만 덧붙인다.
const ALL_OPTION: SelectOption = { label: "전체", value: "" }
const toSelectOptions = (codes: { code: string; label: string }[]): SelectOption[] =>
  codes.map((item) => ({ label: item.label, value: item.code }))

// 등록/상세 폼용 — 실제 코드만 노출한다.
const adTypeSelectOptions: SelectOption[] = toSelectOptions(AD_TYPE_CODES)
// 채널은 다중선택(화면정의서 [1-4]) — XMultiSelect 옵션 형태로 변환.
const channelMultiOptions: MultiSelectOption[] = AD_CHANNEL_CODES.map((item) => ({
  label: item.label,
  value: item.code,
}))
// 검색폼용 — 조건 해제를 위해 "전체" 를 앞에 붙인다.
const searchAdTypeOptions: SelectOption[] = [ALL_OPTION, ...adTypeSelectOptions]
const searchStatusOptions: SelectOption[] = [ALL_OPTION, ...toSelectOptions(AD_REVIEW_STATUS_CODES)]
const dateSelectOptions: SelectOption[] = [
  { label: "최종승인일", value: "approval" },
  { label: "작성일", value: "application" },
]
// 심의상태 — 상세 폼용(전체 없음). 명세 [2-1] 접수/검토중/보완요청/완료.
const reviewStatusOptions: SelectOption[] = toSelectOptions(AD_REVIEW_STATUS_CODES)
// TODO [미확정]: 마케팅/소비자보호부/준법지원부 결과 공통코드 그룹이 미정 —
// 화면정의서 표시값 기준 임시 옵션. 코드 확정 시 adReviewCodes.ts 로 이동.
const reviewResultOptions: SelectOption[] = [
  { label: "검토중", value: "검토중" },
  { label: "보완요청", value: "보완요청" },
  { label: "결재", value: "결재" },
]

// 의견 — 등록/수정/삭제는 API 연동, 목록은 세션 로컬 누적.
// TODO: 백엔드에 의견 목록 조회가 없다(단건 응답에 comments 미포함, 목록 엔드포인트 부재).
//       BE 지원 시 이 로컬 배열을 조회 결과로 교체한다. 지금은 이 세션에서 등록한
//       의견만 보이고 새로고침하면 사라진다.
const detailComments = ref<XCommentData[]>([])
const detailCommentsAdmin = ref(true)

// ==========================================
// 목록 조회 (RM_01_07_01)
// ==========================================
// 조회 버튼을 눌러야 반영되는 "적용된" 검색조건. 입력 중에는 재조회하지 않는다.
const appliedSearchCriteria = ref<AdReviewListParams>({})
const adReviewListQuery = useAdReviewListQuery(appliedSearchCriteria)
const gridData = computed<AdReviewRow[]>(() => toAdReviewRows(adReviewListQuery.data.value ?? []))

// XSelect 값은 string | number | null 이라 빈 선택을 undefined 로 눌러 전송에서 빼낸다.
const toStringParam = (value: string | number | null): string | undefined => {
  const text = value === null ? "" : String(value)

  return text || undefined
}

// XCalendar 는 Date 를 주는데 백엔드는 yyyy-MM-dd 문자열을 받는다.
const toDateParam = (value: Date | null): string | undefined => {
  if (!value) {
    return undefined
  }

  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

const toParams = (): AdReviewListParams => {
  const from = toDateParam(startDate.value)
  const to = toDateParam(endDate.value)
  // 구분검색 선택값에 따라 기간 조건을 최종승인일/작성일 중 한쪽에만 건다.
  // 선택이 비어 있으면 화면정의서 기본값인 최종승인일 기준으로 본다.
  const isApproval = searchDateType.value !== ("application" satisfies AdReviewDateType)
  const keyword = searchTxt2.value.trim()

  return {
    organizationId: filterOrgId.value || undefined,
    adType: toStringParam(searchAdType.value),
    reviewStatus: toStringParam(searchStatus.value),
    // TODO: 백엔드에 광고명/심의필번호 통합 검색(OR)이 없어 광고명 LIKE 로만 조회한다.
    //       `%` 를 감싸면 백엔드가 equal 대신 like 로 처리한다.
    adName: keyword ? `%${keyword}%` : undefined,
    approvalDateFrom: isApproval ? from : undefined,
    approvalDateTo: isApproval ? to : undefined,
    applicationDateFrom: isApproval ? undefined : from,
    applicationDateTo: isApproval ? undefined : to,
  }
}

const search = (): void => {
  appliedSearchCriteria.value = toParams()
}

// 조직검색 팝업은 검색폼(소속 필터)과 등록폼(신청자 소속)이 공유한다 — 열 때 대상 지정.
const orgSearchTarget = ref<"filter" | "register">("filter")
const openOrgSearchFor = (target: "filter" | "register"): void => {
  orgSearchTarget.value = target
  openDepartmentOrgSearch()
}
const onSelectDepartmentOrg = (row: OrgRow): void => {
  if (orgSearchTarget.value === "register") {
    registerOrgId.value = row.id
    registerOrgName.value = row.name
    closeDepartmentOrgSearch()
    return
  }

  // 조회 파라미터는 조직 ID 를 요구하는데 팝업 헬퍼는 조직명만 채워 주므로 ID 를 따로 보관.
  filterOrgId.value = row.id
  selectDepartmentOrg(row)
}

// 공통 alert 팝업 (이 저장소는 공통 composable 없이 페이지마다 XPopup 을 감싼다)
const showCommonAlertPopup = ref(false)
const commonAlertContent = ref("")
const openCommonAlert = (content: string): void => {
  commonAlertContent.value = content
  showCommonAlertPopup.value = true
}
const closeCommonAlert = (): void => {
  showCommonAlertPopup.value = false
}

const downloadExcel = async (): Promise<void> => {
  try {
    await fetchAdReviewExcel(appliedSearchCriteria.value)
  } catch {
    // 백엔드 generateExcel() 미구현 상태라 현재는 500 이 떨어진다.
    openCommonAlert("엑셀 다운로드에 실패했습니다.")
  }
}

// ==========================================
// 등록 (RM_01_07_01_01)
// ==========================================
// 신청자 표시 — accessToken 페이로드에서 로그인 사용자를 꺼낸다(client 전용).
// TODO: Keycloak 계정 ↔ SalesPersonnel 매핑 API 가 생기면 applicantId 를 실제 PK 로 교체한다.
//       (2026-08-07 확인: JWT 에는 preferred_username(로그인 ID) 만 있고 사번이 없어
//        /api/humanResource/salesPersonnel/contacts 로도 본인 인사레코드를 특정할 수 없다.)
const loginUserName = ref<string>("")
const loginUserId = ref<string>("")

/**
 * JWT 페이로드(base64url) 디코드.
 *
 * atob() 는 결과를 latin1 바이트 문자열로 돌려줘서 한글이 깨진다("경미 김" → "ê²½ë¯¸ ê¹€").
 * 각 문자의 코드포인트를 바이트로 되돌린 뒤 TextDecoder 로 UTF-8 해석해야 한다.
 * base64url 은 패딩이 생략될 수 있어 atob 에 넘기기 전에 4의 배수로 채운다.
 */
const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  const part = token.split(".")[1]
  if (!part) return null
  const base64 = part.replace(/-/g, "+").replace(/_/g, "/")
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=")
  const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0))
  return JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>
}

const asText = (value: unknown): string => (typeof value === "string" ? value : "")

onMounted(() => {
  try {
    const token = sessionStorage.getItem("accessToken")
    const payload = token ? decodeJwtPayload(token) : null
    loginUserId.value = asText(payload?.preferred_username)
    loginUserName.value = asText(payload?.name) || loginUserId.value
  } catch {
    loginUserName.value = ""
    loginUserId.value = ""
  }
})

const formatDate = (value: Date): string => {
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  return `${value.getFullYear()}-${month}-${day}`
}
// 작성일 — 시스템 일자 자동 표시(명세 [1-2]).
const todayText = formatDate(new Date())

const resetRegisterForm = (): void => {
  registerAdType.value = null
  registerChannels.value = []
  registerAdName.value = ""
  registerOrgId.value = ""
  registerOrgName.value = ""
  registerFile.value = null
  registerEditorContent.value = { type: "doc", content: [] }
  registerEditorRef.value?.clear()
}

const registerMutation = useRegisterAdReviewMutation()

const validateRegisterForm = (): string | null => {
  if (!registerAdType.value) return "광고구분을 선택해 주세요."
  if (registerChannels.value.length === 0) return "채널을 선택해 주세요."
  if (!registerAdName.value.trim()) return "광고명을 입력해 주세요."
  const html = registerEditorRef.value?.getHTML() ?? ""
  // tiptap 빈 문서는 "<p></p>" 로 나오므로 태그 제거 후 실제 텍스트 유무로 판단.
  if (!html.replace(/<[^>]*>/g, "").trim()) return "내용을 입력해 주세요."
  if (!registerOrgId.value) return "소속을 선택해 주세요."
  return null
}

const saveRegister = async (): Promise<void> => {
  const invalidMessage = validateRegisterForm()
  if (invalidMessage) {
    openCommonAlert(invalidMessage)
    return
  }

  try {
    // TODO: 심의필번호는 백엔드 자동발번 구현 시 페이로드에서 제거.
    const reviewNumber = await generateNextReviewNumber()

    const saved = await registerMutation.mutateAsync({
      reviewNumber,
      adType: String(registerAdType.value),
      adName: registerAdName.value.trim(),
      channels: registerChannels.value.map(String),
      adContent: registerEditorRef.value?.getHTML() ?? "",
      applicationDate: todayText,
      organizationId: registerOrgId.value,
      // 미전송 시 신청자 컬럼이 빈 값으로 남는다. applicantId 는 느슨한 참조(FK 제약 없음)라
      // 로그인 ID 를 그대로 넣는다 — 백엔드 감사 필드 createdBy 와 같은 값이 된다.
      // TODO: 실제 SalesPersonnel PK(PERSO_*)로 교체. 위 loginUserId 주석 참조.
      applicantId: loginUserId.value || undefined,
      reviewStatus: "RECEIVED",
    })

    // 첨부파일은 저장으로 refId 가 생긴 뒤 업로드하고, 파일 ID 를 본건에 반영한다.
    if (registerFile.value && saved.id) {
      try {
        const uploaded = await uploadAdReviewFile(registerFile.value, saved.id)
        if (uploaded.id) {
          await updateMutation.mutateAsync({
            id: saved.id,
            payload: { adFileIds: [uploaded.id] },
          })
        }
      } catch {
        // 본건 저장은 이미 완료 — 첨부만 실패했음을 알리고 상세에서 재시도하게 한다.
        openCommonAlert("등록은 완료되었으나 첨부파일 업로드에 실패했습니다.")
      }
    }

    openCommonAlert(`저장되었습니다. (심의필번호: ${saved.reviewNumber ?? reviewNumber})`)
    resetRegisterForm()

    // 명세 [2-1]: 저장 완료 후 광고심의 상세 화면으로 이동.
    if (saved.id) {
      openDetail(saved.id)
    } else {
      closeSplitView()
    }
  } catch (error) {
    openCommonAlert(error instanceof Error ? error.message : "저장에 실패했습니다.")
  }
}

// ==========================================
// 상세 (RM_01_07_01_02)
// ==========================================
const detailQuery = useAdReviewDetailQuery(detailId)
const updateMutation = useUpdateAdReviewMutation()

const parseDate = (value?: string): Date | null => {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const openDetail = (id: string): void => {
  detailId.value = id
  // 대상이 바뀌면 이전 건에서 쌓인 세션 의견을 비운다.
  detailComments.value = []
  openSplitPanel("광고심의상세")
}

// 단건 응답이 오면 상세 폼을 채운다. (수정 저장 후 invalidate 재조회 시에도 최신값 반영)
watch(
  () => detailQuery.data.value,
  (dto) => {
    if (!dto || currentView.value !== "detailAdreview") return

    detailAdType.value = dto.adType ?? null
    detailChannels.value = [...(dto.channels ?? [])]
    detailAdName.value = dto.adName ?? ""
    detailReviewStatus.value = dto.reviewStatus ?? null
    detailMarketingResult.value = dto.marketingResult ?? null
    detailConsumerResult.value = dto.consumerProtectionResult ?? null
    detailComplianceResult.value = dto.complianceResult ?? null
    detailValidityStart.value = parseDate(dto.validityStartDate)
    detailValidityEnd.value = parseDate(dto.validityEndDate)
    // XEditor 는 setContent 로 저장된 HTML 을 그대로 로드한다.
    detailEditorRef.value?.setContent(dto.adContent ?? "")
  },
  { immediate: true }
)

// 접수정보 저장 — 신청자·관리자 공통 수정 범위(명세 [1]).
const saveDetailReception = async (): Promise<void> => {
  if (!detailId.value) return

  const html = detailEditorRef.value?.getHTML() ?? ""
  const payload: AdReviewUpdatePayload = {
    adType: detailAdType.value ? String(detailAdType.value) : undefined,
    adName: detailAdName.value.trim() || undefined,
    channels: detailChannels.value.map(String),
    adContent: html.replace(/<[^>]*>/g, "").trim() ? html : undefined,
  }

  try {
    await updateMutation.mutateAsync({ id: detailId.value, payload })
    openCommonAlert("접수정보가 저장되었습니다.")
  } catch (error) {
    openCommonAlert(error instanceof Error ? error.message : "저장에 실패했습니다.")
  }
}

// 광고 심의 정보 저장 — 관리자(준법) 수정 범위(명세 [2]). 권한 분기는 [미확정]이라 미적용.
const saveDetailReview = async (): Promise<void> => {
  if (!detailId.value) return

  // 완료 저장 시 유효기간 필수(명세 [2-4]).
  if (
    detailReviewStatus.value === "COMPLETED" &&
    (!detailValidityStart.value || !detailValidityEnd.value)
  ) {
    openCommonAlert("완료 상태로 저장하려면 유효기간을 입력해 주세요.")
    return
  }

  const payload: AdReviewUpdatePayload = {
    reviewStatus: detailReviewStatus.value ? String(detailReviewStatus.value) : undefined,
    marketingResult: detailMarketingResult.value ? String(detailMarketingResult.value) : undefined,
    consumerProtectionResult: detailConsumerResult.value
      ? String(detailConsumerResult.value)
      : undefined,
    complianceResult: detailComplianceResult.value
      ? String(detailComplianceResult.value)
      : undefined,
    validityStartDate: detailValidityStart.value
      ? formatDate(detailValidityStart.value)
      : undefined,
    validityEndDate: detailValidityEnd.value ? formatDate(detailValidityEnd.value) : undefined,
    // TODO: 최종승인일(approvalDate)은 COMPLETED 전환 시 백엔드 자동 설정이 명세이나 미구현 상태 —
    //       BE 구현 전까지 완료 처리 당일을 함께 보낸다.
    ...(detailReviewStatus.value === "COMPLETED" && !detailQuery.data.value?.approvalDate
      ? { approvalDate: todayText }
      : {}),
  }

  try {
    await updateMutation.mutateAsync({ id: detailId.value, payload })
    openCommonAlert("광고 심의 정보가 저장되었습니다.")
  } catch (error) {
    openCommonAlert(error instanceof Error ? error.message : "저장에 실패했습니다.")
  }
}

// ==========================================
// 상세 첨부파일
// ==========================================
// 기존 첨부는 파일 ID 만 내려온다(메타 조회 API 부재) — 순번으로 표시하고 파일명은 다운로드 시 복원.
const detailFileIds = computed<string[]>(() => detailQuery.data.value?.adFileIds ?? [])

const onDetailFileChange = async (file: File): Promise<void> => {
  if (!detailId.value) return

  try {
    const uploaded = await uploadAdReviewFile(file, detailId.value)
    if (uploaded.id) {
      await updateMutation.mutateAsync({
        id: detailId.value,
        payload: { adFileIds: [...detailFileIds.value, uploaded.id] },
      })
    }
  } catch (error) {
    openCommonAlert(error instanceof Error ? error.message : "첨부파일 업로드에 실패했습니다.")
  }
}

const removeDetailFile = async (fileId: string): Promise<void> => {
  if (!detailId.value) return

  try {
    await deleteAdReviewFile(fileId)
    await updateMutation.mutateAsync({
      id: detailId.value,
      payload: { adFileIds: detailFileIds.value.filter((id) => id !== fileId) },
    })
  } catch (error) {
    openCommonAlert(error instanceof Error ? error.message : "첨부파일 삭제에 실패했습니다.")
  }
}

const downloadDetailFile = async (fileId: string): Promise<void> => {
  try {
    await downloadAdReviewFile(fileId)
  } catch {
    openCommonAlert("첨부파일 다운로드에 실패했습니다.")
  }
}

// ==========================================
// 의견 (A6~A8)
// ==========================================
const registerCommentMutation = useRegisterAdReviewCommentMutation()
const updateCommentMutation = useUpdateAdReviewCommentMutation()
const deleteCommentMutation = useDeleteAdReviewCommentMutation()

const onCommentSubmit = async (content: string): Promise<void> => {
  if (!detailId.value || !content.trim()) return

  try {
    const saved = await registerCommentMutation.mutateAsync({
      reviewId: detailId.value,
      content: content.trim(),
    })

    // 목록 조회 API 가 없어 응답을 세션 목록에 직접 반영한다(최신순 상단 — 명세 [4-3]).
    detailComments.value = [
      {
        id: saved.id ?? `local-${Date.now()}`,
        author: saved.createdBy || loginUserName.value || "-",
        authorId: "",
        createdAt: saved.createDate ?? "",
        content: saved.content ?? content.trim(),
        isMine: true,
      },
      ...detailComments.value,
    ]
  } catch (error) {
    openCommonAlert(error instanceof Error ? error.message : "의견 등록에 실패했습니다.")
  }
}

const onCommentUpdate = async (id: string, content: string): Promise<void> => {
  if (!detailId.value || !content.trim()) return

  try {
    await updateCommentMutation.mutateAsync({
      reviewId: detailId.value,
      commentId: id,
      content: content.trim(),
    })
    detailComments.value = detailComments.value.map((comment) =>
      comment.id === id ? { ...comment, content: content.trim() } : comment
    )
  } catch (error) {
    // 명세 [4-3]상 수정 불가이나 BE 는 열려 있음 — 작성자 검증(403)도 BE 미구현. 정책 확정 시 조정.
    openCommonAlert(error instanceof Error ? error.message : "의견 수정에 실패했습니다.")
  }
}

const onCommentDelete = async (id: string): Promise<void> => {
  if (!detailId.value) return

  try {
    await deleteCommentMutation.mutateAsync({ reviewId: detailId.value, commentId: id })
    detailComments.value = detailComments.value.filter((comment) => comment.id !== id)
  } catch (error) {
    openCommonAlert(error instanceof Error ? error.message : "의견 삭제에 실패했습니다.")
  }
}

// 그리드 컬럼
const gridColumn: GridColumnDef<AdReviewRow>[] = [
  {
    accessorKey: "no",
    header: "NO",
    meta: { minWidth: 65, width: 65, align: "center" },
  },
  {
    accessorKey: "applicantName",
    header: "신청자",
    meta: { minWidth: 140, align: "center" },
  },
  {
    accessorKey: "orgPath",
    header: "소속경로",
    meta: { minWidth: 140, align: "left", headerAlign: "center" },
  },
  {
    accessorKey: "adType",
    header: "광고구분",
    meta: { minWidth: 140, align: "center" },
  },
  {
    accessorKey: "adName",
    header: "광고명",
    meta: { minWidth: 200, align: "left", headerAlign: "center" },
  },
  {
    accessorKey: "addfile",
    header: "첨부파일",
    meta: { minWidth: 90, align: "center" },
  },
  {
    accessorKey: "channel",
    header: "채널",
    meta: { minWidth: 120, align: "center" },
  },
  {
    accessorKey: "reviewStatus",
    header: "심의상태",
    meta: { minWidth: 180, align: "center" },
  },
  {
    accessorKey: "deliberationCompletedNum",
    header: "심의필 번호",
    meta: { minWidth: 150, align: "center" },
  },
  {
    accessorKey: "expirationDate",
    header: "유효기간",
    meta: { minWidth: 140, align: "center" },
  },
  {
    accessorKey: "approvalDate",
    header: "최종승인일",
    meta: { minWidth: 100, align: "center" },
  },
  {
    accessorKey: "preparationDate",
    header: "작성일",
    meta: { minWidth: 100, align: "center" },
  },

  {
    accessorKey: "detailView",
    header: "상세보기",
    meta: { minWidth: 80, align: "center" },
  },
]

// ==========================================
// 2. 기능 구현 함수 정의 (하단 배치)
// ==========================================
// 취소 (닫기)
const closeSplitView = () => {
  isSplitOpen.value = false
}

// 우측 패널 신청
const openSplitPanel = (type: "광고심의" | "광고심의상세") => {
  if (type === "광고심의") {
    currentView.value = "requestAdreview"
    splitPanelTitle.value = `광고심의 등록`
    // 이전 입력이 남지 않도록 열 때마다 등록 폼을 비운다.
    resetRegisterForm()
  } else {
    currentView.value = "detailAdreview"
    splitPanelTitle.value = `광고심의 상세`
  }
  isSplitOpen.value = true
}

// 증빙 서류 미리보기
const handlePrintPreview = () => {
  openReleaseNoticePrintWindow({
    title: "첨부파일 미리보기",
    closeButtonText: "닫기",
    printButtonText: "인쇄",
    // 여기서 BE에서 받아올 데이터를 contentHtml에 넣어주시면 됩니다.
    contentHtml: `<p>증빙서류 미리보기입니다.</p>`,
  })
}

// 에디터 — 차단 링크 안내(등록/상세 공용)
const editorLinkAlert = ref<string>("")
const onEditorLinkBlocked = (href: string, reason: "protocol" | "format"): void => {
  editorLinkAlert.value = `차단된 링크: ${href} (사유: ${reason})`
  setTimeout(() => {
    editorLinkAlert.value = ""
  }, 3000)
}

const createEmployeeDetailFallbackRow = (
  row: PersonalInfoChangeRequestRow,
  name: string,
  code: string
): EmployeeRow => ({
  id: `detail-${code}`,
  empCode: code,
  name,
  orgPath: "영업조직>제5사업본부>빅스타>강남지점",
  position: "LP",
  careerPath: "LP",
  phone: "",
  status: row.progressStatus === "취소" ? "해촉" : "위촉",
  contractDate: "",
  monthsActive: 0,
  startDate: "",
})

const onEmployeeDetailRequestChangeClick = (): void => {
  void navigateTo("/sales-hr/personal-information/personal-info-change-request")
}

const openEmployeeDetail = async (
  row: PersonalInfoChangeRequestRow,
  name: string,
  code: string
) => {
  isEmployeeDetailPopupOpen.value = false

  const employeeRow =
    employeeRows.value.find((employee) => employee.empCode === code) ??
    createEmployeeDetailFallbackRow(row, name, code)

  employeeDetailData.value = fetchManagerDetail(code, employeeRow)
  isEmployeeDetailPopupOpen.value = true
}

definePageMeta({
  // path: "/internal-control/ad-review",
  programId: "PRO-ICT-FRT-032",
  label: "광고심의",
})
</script>

<template>
  <SplitView v-model:open="isSplitOpen" @close="closeSplitView">
    <div class="fx fd-c ai-fs r-g20 page-content">
      <header class="fx fd-c r-g10 as-stch">
        <p class="con-title">광고심의</p>
        <div class="fx ai-c search-line">
          <div class="fx ai-c c-g10 f_no">
            <XInput
              v-model="filterOrg"
              placeholder="소속"
              search
              readonly
              size="sm"
              min-width="160"
              max-width="160"
              @click="openOrgSearchFor('filter')"
            />
            <!-- TODO: 백엔드 검색 DTO 에 신청자 이름/사번 필드가 없어 조회에 사용할 수 없다.
                 BE 지원 추가 시 disabled 를 풀고 toParams() 에 연결한다. -->
            <XInput
              v-model="searchTxt"
              placeholder="이름/사번 (준비중)"
              size="sm"
              max-width="150"
              min-width="150"
              disabled
            />
            <XInput
              v-model="searchTxt2"
              placeholder="광고명"
              size="sm"
              max-width="150"
              min-width="150"
              @keyup.enter="search"
            />
            <XSelect
              v-model="searchAdType"
              :options="searchAdTypeOptions"
              size="sm"
              max-width="150"
              placeholder="광고구분"
            />
            <XSelect
              v-model="searchStatus"
              :options="searchStatusOptions"
              size="sm"
              max-width="150"
              placeholder="심의상태"
            />

            <XSelect
              v-model="searchDateType"
              :options="dateSelectOptions"
              size="sm"
              max-width="130"
              placeholder="구분검색"
            />
            <XCalendar
              v-model="startDate"
              size="sm"
              placeholder="시작일"
              min-width="130"
              max-width="130"
            />
            <span class="dash">~</span>
            <XCalendar
              v-model="endDate"
              size="sm"
              placeholder="종료일"
              min-width="130"
              max-width="130"
              popover-align="right"
            />
            <XButton size="sm" variants="grey" @click="search">조회</XButton>
          </div>
        </div>
      </header>
      <div class="fx ai-c jc-sb as-stch">
        <XButton size="sm" variants="ghost" @click="downloadExcel">엑셀다운로드</XButton>
        <div class="fx ai-c btn-box">
          <XButton size="sm" @click="openSplitPanel('광고심의')">등록</XButton>
        </div>
      </div>
      <!-- VueGrid 는 가상 스크롤이라 DOM 에 의존한다. SSR 하이드레이션 불일치를 막기 위해 ClientOnly 로 감싼다. -->
      <ClientOnly>
        <VueGrid
          :data="gridData"
          :columns="gridColumn"
          :keyboard-navigation="true"
          :sticky-header="true"
          :resizable="true"
          scrollbar-mode="thin"
          row-key="id"
          :config="{
            pagination: {
              pageSize: 50,
              pageSizes: [50, 100, 200],
            },
          }"
        >
          <!-- TODO: 목록 응답에 신청자 이름·사번이 없어 applicantId 를 그대로 노출한다.
               BE 가 applicantName 조인 필드를 내려주면 표시 형식을 이름(사번)으로 되돌린다. -->
          <template #cell-applicantName="{ row }">
            <XTextButton
              v-if="row.applicantName"
              size="sm"
              variants="link"
              @click="
                openEmployeeDetail(
                  row as unknown as PersonalInfoChangeRequestRow,
                  row.applicantName,
                  row.applicantCode
                )
              "
            >
              {{
                row.applicantCode ? `${row.applicantName}(${row.applicantCode})` : row.applicantName
              }}
            </XTextButton>
          </template>

          <template #cell-orgPath="{ value }">
            <OrgPathCell :path="String(value ?? '')" />
          </template>

          <template #cell-addfile="{ row }">
            <template v-if="row.addfile === 'Y'">
              <XIconTextButton :src="icn_16_copy" :icon-size="16" @click="handlePrintPreview" />
            </template>
          </template>

          <template #cell-detailView="{ row }">
            <XButton size="xxs" variants="ghost" @click="openDetail(row.id)"> 상세 </XButton>
          </template>

          <template #cell-adName="{ value }">
            <XTooltipText teleport :toast-label="String(value)">
              <template #label>{{ String(value) }}</template>
            </XTooltipText>
          </template>
        </VueGrid>
      </ClientOnly>
    </div>

    <template #aside="{ close }">
      <SplitPanel :title="splitPanelTitle">
        <template #actions>
          <XButton v-if="currentView === 'detailAdreview'" size="sm" variants="grey" @click="close"
            >닫기</XButton
          >
          <XButton v-if="currentView === 'requestAdreview'" size="sm" variants="grey" @click="close"
            >취소</XButton
          >
          <XButton
            v-if="currentView === 'requestAdreview'"
            size="sm"
            :disabled="registerMutation.isPending.value"
            @click="saveRegister"
            >저장</XButton
          >
        </template>
        <!-- 분할화면 : 광고심의 등록 -->
        <div v-if="currentView === 'requestAdreview'" class="fx fd-c r-g20">
          <h3 class="request-complaint-title type-form">접수정보</h3>
          <XFormSection>
            <XFormRow>
              <XFormBox variant="label" required :size="11">신청자</XFormBox>
              <XFormBox variant="value">
                <p class="txt">{{ loginUserName || "-" }}</p>
              </XFormBox>
              <XFormBox variant="label" required :size="11">작성일</XFormBox>
              <XFormBox variant="value">
                <p class="txt">{{ todayText }}</p>
              </XFormBox>
            </XFormRow>

            <!-- TODO: 명세는 신청자 소속 자동 표시. 로그인 사용자 → SalesPersonnel/조직 매핑
                 API 가 없어 임시로 조직검색 팝업으로 직접 선택한다. (organizationId 필수) -->
            <XFormRow>
              <XFormBox variant="label" required :size="11">소속</XFormBox>
              <XFormBox variant="value" size="full">
                <XInput
                  v-model="registerOrgName"
                  placeholder="소속 선택"
                  search
                  readonly
                  size="sm"
                  @click="openOrgSearchFor('register')"
                />
              </XFormBox>
            </XFormRow>

            <XFormRow>
              <XFormBox variant="label" required :size="11">광고구분</XFormBox>
              <XFormBox variant="value">
                <XSelect
                  v-model="registerAdType"
                  :options="adTypeSelectOptions"
                  size="sm"
                  placeholder="광고구분"
                />
              </XFormBox>
              <XFormBox variant="label" required :size="11">채널</XFormBox>
              <XFormBox variant="value">
                <XMultiSelect
                  v-model="registerChannels"
                  :options="channelMultiOptions"
                  size="sm"
                  placeholder="채널 선택"
                />
              </XFormBox>
            </XFormRow>

            <XFormRow>
              <XFormBox variant="label" required :size="11">광고명</XFormBox>
              <XFormBox variant="value" size="full">
                <XInput v-model="registerAdName" size="sm" placeholder="광고명을 입력해주세요." />
              </XFormBox>
            </XFormRow>

            <XFormRow>
              <XFormBox variant="label" required :size="11">내용</XFormBox>
              <XFormBox variant="value" size="full">
                <ClientOnly>
                  <XEditor
                    ref="registerEditorRef"
                    v-model="registerEditorContent"
                    placeholder="여기에 입력하세요"
                    :min-height="200"
                    @link-blocked="onEditorLinkBlocked"
                  />
                </ClientOnly>
              </XFormBox>
            </XFormRow>

            <!-- 저장 성공 후 refId 로 업로드된다. TODO: 다건 첨부는 UI 확장 필요(현재 1건). -->
            <XFormRow>
              <XFormBox variant="label" :size="11"><p class="txt">첨부파일</p></XFormBox>
              <XFormBox variant="value" size="full">
                <XInputFile
                  variants="ghost"
                  size="sm"
                  accept="image/*"
                  file-name-show
                  :thumbnail-show="true"
                  :max-size="100"
                  @change="(file) => (registerFile = file)"
                  @clear="registerFile = null"
                >
                  파일 선택
                </XInputFile>
              </XFormBox>
            </XFormRow>
          </XFormSection>
        </div>

        <!-- 분할화면 : 광고심의 상세 -->
        <div v-else-if="currentView === 'detailAdreview'" class="fx fd-c r-g20">
          <h3 class="request-complaint-title type-form">접수정보</h3>
          <XFormSection>
            <XFormRow>
              <XFormBox variant="label" required :size="11">신청자</XFormBox>
              <!-- TODO: 응답에 신청자 이름 조인 필드가 없어 applicantId 를 그대로 노출한다.
                   목록과 동일하게, 값이 없는 과거 건은 감사 필드 createdBy 로 대체한다. -->
              <XFormBox variant="value">
                <p class="txt">
                  {{ detailQuery.data.value?.applicantId || detailQuery.data.value?.createdBy || "-" }}
                </p>
              </XFormBox>
              <XFormBox variant="label" required :size="11">작성일</XFormBox>
              <XFormBox variant="value">
                <p class="txt">{{ detailQuery.data.value?.applicationDate || "-" }}</p>
              </XFormBox>
            </XFormRow>

            <XFormRow>
              <XFormBox variant="label" required :size="11">광고구분</XFormBox>
              <XFormBox variant="value">
                <XSelect
                  v-model="detailAdType"
                  :options="adTypeSelectOptions"
                  size="sm"
                  placeholder="광고구분"
                />
              </XFormBox>
              <XFormBox variant="label" required :size="11">채널</XFormBox>
              <XFormBox variant="value">
                <XMultiSelect
                  v-model="detailChannels"
                  :options="channelMultiOptions"
                  size="sm"
                  placeholder="채널 선택"
                />
              </XFormBox>
            </XFormRow>

            <XFormRow>
              <XFormBox variant="label" required :size="11">광고명</XFormBox>
              <XFormBox variant="value" size="full">
                <XInput v-model="detailAdName" size="sm" placeholder="광고명을 입력해주세요." />
              </XFormBox>
            </XFormRow>

            <XFormRow>
              <XFormBox variant="label" required :size="11">내용</XFormBox>
              <XFormBox variant="value" size="full">
                <ClientOnly>
                  <XEditor
                    ref="detailEditorRef"
                    v-model="detailEditorContent"
                    placeholder="여기에 입력하세요"
                    :min-height="200"
                    @link-blocked="onEditorLinkBlocked"
                  />
                </ClientOnly>
              </XFormBox>
            </XFormRow>

            <XFormRow>
              <XFormBox variant="label" :size="11"><p class="txt">첨부파일</p></XFormBox>
              <XFormBox variant="value" size="full">
                <div class="fx fd-c r-g10">
                  <!-- 파일명 메타 조회 API 가 없어 순번으로 표시 — 클릭 시 원본 파일명으로 다운로드된다. -->
                  <div v-if="detailFileIds.length" class="fx ai-c c-g10">
                    <template v-for="(fileId, index) in detailFileIds" :key="fileId">
                      <XTextButton size="sm" variants="link" @click="downloadDetailFile(fileId)">
                        첨부파일 {{ index + 1 }}
                      </XTextButton>
                      <XTextButton size="sm" variants="grey" @click="removeDetailFile(fileId)">
                        삭제
                      </XTextButton>
                    </template>
                  </div>
                  <!-- 선택 즉시 업로드 후 본건 adFileIds 에 반영된다. -->
                  <XInputFile
                    variants="ghost"
                    size="sm"
                    accept="image/*"
                    :max-size="100"
                    @change="onDetailFileChange"
                  >
                    파일 선택
                  </XInputFile>
                </div>
              </XFormBox>
            </XFormRow>
          </XFormSection>

          <div class="fx ai-c jc-fe btn-box">
            <XButton
              size="sm"
              :disabled="updateMutation.isPending.value"
              @click="saveDetailReception"
              >저장</XButton
            >
          </div>
          <h3 class="request-complaint-title">광고 심의 정보</h3>
          <XFormSection>
            <XFormRow>
              <XFormBox variant="label" required :size="11">최종 심의상태</XFormBox>
              <!-- TODO [미확정]: 준법지원부 담당자만 수정 가능 — 권한 정책 확정 시 분기 적용. -->
              <XFormBox variant="value" size="full">
                <XSelect
                  v-model="detailReviewStatus"
                  :options="reviewStatusOptions"
                  size="sm"
                  placeholder="심의상태"
                  max-width="180"
                />
              </XFormBox>
            </XFormRow>

            <XFormRow>
              <XFormBox variant="label" required :size="11">마케팅</XFormBox>
              <XFormBox variant="value">
                <XSelect
                  v-model="detailMarketingResult"
                  :options="reviewResultOptions"
                  size="sm"
                  placeholder="마케팅 선택"
                />
              </XFormBox>
              <XFormBox variant="label" :size="11"><p class="txt">결재일시</p></XFormBox>
              <!-- TODO: 부서별 결재자/결재일시 필드가 백엔드에 없어 표시할 수 없다. BE 요청 항목. -->
              <XFormBox variant="value"><p class="txt">-</p></XFormBox>
            </XFormRow>

            <XFormRow>
              <XFormBox variant="label" required :size="11">소비자보호부</XFormBox>
              <XFormBox variant="value">
                <XSelect
                  v-model="detailConsumerResult"
                  :options="reviewResultOptions"
                  size="sm"
                  placeholder="소비자보호부"
                />
              </XFormBox>
              <XFormBox variant="label" :size="11"><p class="txt">결재일시</p></XFormBox>
              <XFormBox variant="value"><p class="txt">-</p></XFormBox>
            </XFormRow>

            <XFormRow>
              <XFormBox variant="label" :size="11">준법지원부</XFormBox>
              <XFormBox variant="value">
                <XSelect
                  v-model="detailComplianceResult"
                  :options="reviewResultOptions"
                  size="sm"
                  placeholder="준법지원부"
                />
              </XFormBox>
              <XFormBox variant="label" :size="11"><p class="txt">결재일시</p></XFormBox>
              <XFormBox variant="value"><p class="txt">-</p></XFormBox>
            </XFormRow>

            <XFormRow>
              <XFormBox variant="label" required :size="11">유효기간</XFormBox>
              <XFormBox variant="value">
                <XCalendar
                  v-model="detailValidityStart"
                  size="sm"
                  placeholder="시작일"
                  min-width="130"
                  max-width="130"
                />
                <span class="dash">~</span>
                <XCalendar
                  v-model="detailValidityEnd"
                  size="sm"
                  placeholder="종료일"
                  min-width="130"
                  max-width="130"
                  popover-align="right"
                />
              </XFormBox>
            </XFormRow>

            <XFormRow>
              <XFormBox variant="label" :size="11">심의필 번호</XFormBox>
              <XFormBox variant="value">
                <p class="txt">{{ detailQuery.data.value?.reviewNumber || "-" }}</p>
              </XFormBox>
              <XFormBox variant="label" :size="11"><p class="txt">최종승인일</p></XFormBox>
              <XFormBox variant="value">
                <p class="txt">{{ detailQuery.data.value?.approvalDate || "-" }}</p>
              </XFormBox>
            </XFormRow>
          </XFormSection>
          <div class="fx ai-c jc-fe btn-box">
            <XButton size="sm" :disabled="updateMutation.isPending.value" @click="saveDetailReview"
              >저장</XButton
            >
          </div>

          <!-- TODO: BE 의견 목록 조회 부재 — 이 세션에서 등록한 의견만 표시된다. -->
          <XComment
            :comments="detailComments"
            :is-admin="detailCommentsAdmin"
            submit-label="입력"
            placeholder="광고 심의 관련 의견을 남겨 주세요."
            @submit="onCommentSubmit"
            @update="onCommentUpdate"
            @delete="onCommentDelete"
          />
        </div>
      </SplitPanel>
    </template>
  </SplitView>

  <PersonalInfoDetailPopup
    v-if="employeeDetailData"
    v-model="isEmployeeDetailPopupOpen"
    :data="employeeDetailData"
    @request-change-click="onEmployeeDetailRequestChangeClick"
  />

  <!-- 소속 클릭 시 조직검색 팝업 -->
  <OrgSearchPopup
    :show="isDepartmentOrgSearchOpen"
    :rows="departmentOrgRows"
    :tree="departmentOrgTree"
    @select="onSelectDepartmentOrg"
    @close="closeDepartmentOrgSearch"
  />

  <XPopup
    :show="showCommonAlertPopup"
    :content="commonAlertContent"
    type="alert"
    @confirm="closeCommonAlert"
    @close="closeCommonAlert"
  />
</template>

<style scoped src="../internal-control.scss"></style>
