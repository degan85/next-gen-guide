/**
 * 광고심의(RM_01_07) API — 목록 조회 / 엑셀 다운로드.
 *
 * 백엔드 계약은 로컬 `GET /biz/v3/api-docs` 기준이다.
 * API 명세서(`API명세서_광고심의_RM_01_07.md`)에 적힌 `keyword` / `searchText` / `dateType`
 * 파라미터는 실제 구현에 존재하지 않으므로 아래 필드명을 따른다.
 */

import { computed, type Ref } from "vue"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/vue-query"
import { http } from "@x/shared/api/http"
import { adChannelLabel, adReviewStatusLabel, adTypeLabel } from "./adReviewCodes"

const API_BASE = "/api/complaintManagement/advertisementReviews"

// 백엔드 pageSize: int 바인딩용 — Integer.MAX_VALUE.
// 목록이 GET 이라 http.get 이 봉투의 page 메타를 버리고, page 를 받으려면 shared 에
// getPaged 를 추가해야 한다. 공통 수정 없이 가기 위해 전체를 받아 VueGrid 클라이언트
// 페이징으로 처리한다. (menuManagementApi·insurerManagementApi 등과 동일한 전략)
const FETCH_ALL_PAGE_SIZE = 2147483647

/** 구분검색 — 기간 조건을 최종승인일/작성일 중 어디에 걸지 결정한다. */
export type AdReviewDateType = "approval" | "application"

export interface AdReviewListParams {
  /** 소속 조직 ID. 완전일치 — 하위 조직은 포함되지 않는다. */
  organizationId?: string
  adType?: string
  reviewStatus?: string
  /** 광고명. 값에 `%` 가 있으면 백엔드가 LIKE 로 처리한다. */
  adName?: string
  approvalDateFrom?: string
  approvalDateTo?: string
  applicationDateFrom?: string
  applicationDateTo?: string
}

/** 백엔드 AdvertisementReviewDTO. `@JsonInclude(NON_NULL)` 이라 대부분 optional 로 내려온다. */
export interface AdvertisementReviewDto {
  id?: string
  reviewNumber?: string
  reviewStatus?: string
  adType?: string
  adName?: string
  channels?: string[]
  adFileIds?: string[]
  adContent?: string
  applicationDate?: string
  applicantId?: string
  organizationId?: string
  approvalDate?: string
  complianceResult?: string
  consumerProtectionResult?: string
  marketingResult?: string
  validityStartDate?: string
  validityEndDate?: string
  createdBy?: string
  createDate?: string
  lastModifiedBy?: string
  lastModifiedDate?: string
}

/** 광고심의 신청(A3) 요청 본문 — 백엔드 @NotNull 필드를 전부 포함해야 한다. */
export interface AdReviewRegisterPayload {
  /** TODO: 백엔드 자동발번 구현 전까지 클라이언트가 채워 보낸다(DTO @NotNull). */
  reviewNumber: string
  adType: string
  adName: string
  channels: string[]
  /** 에디터 HTML. */
  adContent: string
  /** yyyy-MM-dd. 시스템 일자 기준 자동. */
  applicationDate: string
  organizationId: string
  applicantId?: string
  /** 등록 시 접수(RECEIVED) 고정 — 명세 [2-1]. */
  reviewStatus: "RECEIVED"
}

/** 그리드 행. 키 이름은 기존 퍼블 컬럼 정의를 그대로 유지한다. */
export interface AdReviewRow {
  id: string
  no: number
  applicantName: string
  applicantCode: string
  orgPath: string
  adType: string
  adName: string
  addfile: string
  channel: string
  reviewStatus: string
  deliberationCompletedNum: string
  expirationDate: string
  approvalDate: string
  preparationDate: string
  detailView: string
}

// 유효기간은 시작·종료가 모두 있을 때만 노출한다(심의 완료 건에만 값이 있음).
const toPeriod = (from?: string, to?: string): string => (from && to ? `${from}~${to}` : "")

const toAdReviewRow = (dto: AdvertisementReviewDto, index: number): AdReviewRow => ({
  id: dto.id ?? "",
  no: index + 1,
  // TODO: 백엔드 목록 응답에 applicantName(이름+사번)·organizationPath(소속경로) 조인 필드가
  //       추가되면 교체한다. 현재는 ID 만 내려와 ID 를 그대로 노출한다.
  //       applicantId 를 채우기 전에 등록된 건은 값이 없어, 감사 필드 createdBy 로 대체한다.
  applicantName: dto.applicantId || dto.createdBy || "",
  applicantCode: "",
  orgPath: dto.organizationId ?? "",
  adType: adTypeLabel(dto.adType),
  adName: dto.adName ?? "",
  addfile: (dto.adFileIds?.length ?? 0) > 0 ? "Y" : "N",
  channel: (dto.channels ?? []).map(adChannelLabel).join(", "),
  reviewStatus: adReviewStatusLabel(dto.reviewStatus),
  deliberationCompletedNum: dto.reviewNumber ?? "",
  expirationDate: toPeriod(dto.validityStartDate, dto.validityEndDate),
  approvalDate: dto.approvalDate ?? "",
  preparationDate: dto.applicationDate ?? "",
  detailView: "",
})

export const toAdReviewRows = (list: AdvertisementReviewDto[]): AdReviewRow[] =>
  list.map(toAdReviewRow)

/**
 * 검색 파라미터를 쿼리스트링으로 조립한다.
 * 목록 API 가 `@ModelAttribute` 바인딩이라 body 가 아닌 쿼리로 보내야 한다.
 * 빈 값은 키 자체를 빼서 백엔드가 조건 없음으로 처리하게 한다.
 */
const buildQueryString = (params: AdReviewListParams): string => {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value))
    }
  })

  // 화면정의서 RM_01_07_01 [3] — 작성일 기준 최신순 정렬.
  query.set("sortColumn", "applicationDate")
  query.set("sortAscending", "false")

  return query.toString()
}

const fetchAdReviewList = (params: AdReviewListParams): Promise<AdvertisementReviewDto[]> => {
  const query = buildQueryString(params)

  return http.get<AdvertisementReviewDto[]>(
    `${API_BASE}?${query}&pageNumber=0&pageSize=${FETCH_ALL_PAGE_SIZE}`,
    { auth: true }
  )
}

/**
 * 엑셀 다운로드. 목록과 동일한 검색조건을 그대로 넘긴다(페이징 파라미터 제외).
 *
 * NOTE: 2026-08-06 기준 백엔드 `AdvertisementReviewService.generateExcel()` 이
 *       UnsupportedOperationException 을 던져 500 이 난다. 엔드포인트 자체는 존재하므로
 *       백엔드 구현이 끝나면 이 코드는 수정 없이 동작한다.
 */
export const fetchAdReviewExcel = async (params: AdReviewListParams): Promise<void> => {
  const { blob, fileName } = await http.getDownload(
    `${API_BASE}/excel?${buildQueryString(params)}`,
    {
      auth: true,
    }
  )

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = fileName || "광고심의.xlsx"
  anchor.click()
  URL.revokeObjectURL(url)
}

/**
 * 심의필번호 임시 발번 — `제YYYY-MM-NNNNN호`, 월별 순번.
 *
 * TODO: 자동발번은 백엔드 책임(명세 A3)이지만 아직 미구현이고 DTO 가 @NotNull 이라
 *       클라이언트가 채워야 저장이 된다. 같은 달 목록을 조회해 최대 순번+1 을 쓰는
 *       임시 방식이라 동시 등록 시 충돌(reviewNumber UNIQUE 위반) 가능성이 있다.
 *       백엔드 발번 구현 시 이 함수와 호출부를 제거한다.
 */
export const generateNextReviewNumber = async (): Promise<string> => {
  const now = new Date()
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  const prefix = `제${yearMonth}-`

  const rows = await http.get<AdvertisementReviewDto[]>(
    `${API_BASE}?reviewNumber=${encodeURIComponent(`%${prefix}%`)}&pageNumber=0&pageSize=${FETCH_ALL_PAGE_SIZE}`,
    { auth: true }
  )

  const maxSeq = rows.reduce((acc, row) => {
    const matched = /-(\d{5})호$/.exec(row.reviewNumber ?? "")
    return matched?.[1] ? Math.max(acc, Number(matched[1])) : acc
  }, 0)

  return `${prefix}${String(maxSeq + 1).padStart(5, "0")}호`
}

const registerAdReview = (payload: AdReviewRegisterPayload): Promise<AdvertisementReviewDto> =>
  http.post<AdvertisementReviewDto>(API_BASE, payload, { auth: true })

const fetchAdReview = (id: string): Promise<AdvertisementReviewDto> =>
  http.get<AdvertisementReviewDto>(`${API_BASE}/${encodeURIComponent(id)}`, { auth: true })

/**
 * 광고심의 수정(A4) 요청 본문.
 * 신청자는 접수정보만, 관리자(준법)는 심의정보까지 수정 — 권한 분기는 [미확정]이라
 * 화면에서는 모두 편집 가능하게 두고 정책 확정 시 조인다. reviewNumber 는 수정 불가라 보내지 않는다.
 */
export interface AdReviewUpdatePayload {
  adType?: string
  adName?: string
  channels?: string[]
  adContent?: string
  adFileIds?: string[]
  applicationDate?: string
  organizationId?: string
  reviewStatus?: string
  complianceResult?: string
  consumerProtectionResult?: string
  marketingResult?: string
  validityStartDate?: string
  validityEndDate?: string
  /** TODO: COMPLETED 전환 시 백엔드 자동 설정이 명세이나 미구현 — BE 구현 시 제거. */
  approvalDate?: string
}

const updateAdReview = (
  id: string,
  payload: AdReviewUpdatePayload
): Promise<AdvertisementReviewDto> =>
  http.put<AdvertisementReviewDto>(`${API_BASE}/${encodeURIComponent(id)}`, payload, { auth: true })

// ==========================================
// 첨부파일 — 공통 uploadFile API (insurerManagementApi 와 동일 패턴)
// ==========================================
const UPLOAD_FILE_BASE = "/api/system/uploadFile"
// UploadFile.uploadType 은 @Size(max=10) — 10자 이내.
const UPLOAD_TYPE = "ADRV_FILE"

interface UploadFileDto {
  id?: string
  fileOrgName?: string
}

/** 광고심의 건(refId)에 파일 1개를 업로드하고 UploadFile id 를 받는다. */
export const uploadAdReviewFile = (file: File, refId: string): Promise<UploadFileDto> => {
  const formData = new FormData()
  formData.append("file", file)

  return http.postForm<UploadFileDto>(
    `${UPLOAD_FILE_BASE}/single/${UPLOAD_TYPE}/${encodeURIComponent(refId)}`,
    formData,
    { auth: true }
  )
}

export const deleteAdReviewFile = (fileId: string): Promise<void> =>
  http.delete(`${UPLOAD_FILE_BASE}/single/${encodeURIComponent(fileId)}`, { auth: true })

/**
 * 첨부 다운로드 — 파일명은 Content-Disposition 에서 파싱한다.
 * (uploadFile 메타 단건 조회 API 가 없어 다운로드 전에는 원본 파일명을 알 수 없다.)
 */
export const downloadAdReviewFile = async (fileId: string): Promise<void> => {
  const { blob, fileName } = await http.getDownload(
    `${UPLOAD_FILE_BASE}/download/${encodeURIComponent(fileId)}`,
    { auth: true }
  )

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = fileName || "첨부파일"
  anchor.click()
  URL.revokeObjectURL(url)
}

// ==========================================
// 의견 (A6~A8)
// ==========================================
export interface AdReviewCommentDto {
  id?: string
  content?: string
  createdBy?: string
  createDate?: string
}

/**
 * 의견 등록 — 백엔드 CommentDTO 의 `advertisementReview`(중첩 객체)가 @NotNull 이라
 * path 의 {id} 와 별개로 본문에도 `{ advertisementReview: { id } }` 를 넣어야 400 이 나지 않는다.
 * (실측 확인: content/advertisementReviewId 만 보내면 400 "advertisementReview=널이어서는 안됩니다")
 * TODO: 백엔드가 path 변수로 채우도록 개선되면 중첩 객체 제거.
 */
const registerAdReviewComment = (reviewId: string, content: string): Promise<AdReviewCommentDto> =>
  http.post<AdReviewCommentDto>(
    `${API_BASE}/${encodeURIComponent(reviewId)}/comments`,
    { advertisementReview: { id: reviewId }, content },
    { auth: true }
  )

const updateAdReviewComment = (
  reviewId: string,
  commentId: string,
  content: string
): Promise<AdReviewCommentDto> =>
  http.put<AdReviewCommentDto>(
    `${API_BASE}/${encodeURIComponent(reviewId)}/comments/${encodeURIComponent(commentId)}`,
    { advertisementReview: { id: reviewId }, content },
    { auth: true }
  )

const deleteAdReviewComment = (reviewId: string, commentId: string): Promise<void> =>
  http.delete(
    `${API_BASE}/${encodeURIComponent(reviewId)}/comments/${encodeURIComponent(commentId)}`,
    { auth: true }
  )

export const adReviewKeys = {
  all: ["adReview"] as const,
  list: (params: AdReviewListParams) => ["adReview", "list", params] as const,
  detail: (id: string) => ["adReview", "detail", id] as const,
}

export const useRegisterAdReviewCommentMutation = () =>
  useMutation({
    mutationFn: ({ reviewId, content }: { reviewId: string; content: string }) =>
      registerAdReviewComment(reviewId, content),
  })

export const useUpdateAdReviewCommentMutation = () =>
  useMutation({
    mutationFn: ({
      reviewId,
      commentId,
      content,
    }: {
      reviewId: string
      commentId: string
      content: string
    }) => updateAdReviewComment(reviewId, commentId, content),
  })

export const useDeleteAdReviewCommentMutation = () =>
  useMutation({
    mutationFn: ({ reviewId, commentId }: { reviewId: string; commentId: string }) =>
      deleteAdReviewComment(reviewId, commentId),
  })

export const useAdReviewDetailQuery = (id: Ref<string | null>) =>
  useQuery({
    queryKey: computed(() => adReviewKeys.detail(id.value ?? "")),
    queryFn: () => fetchAdReview(id.value ?? ""),
    // 상세 패널이 열려 대상 id 가 정해졌을 때만 조회한다.
    enabled: computed(() => Boolean(id.value)),
  })

export const useUpdateAdReviewMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdReviewUpdatePayload }) =>
      updateAdReview(id, payload),
    // 목록·상세 캐시를 함께 무효화해 수정 결과가 양쪽에 반영되게 한다.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adReviewKeys.all }),
  })
}

export const useRegisterAdReviewMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: registerAdReview,
    // 등록 성공 시 목록을 무효화해 재조회로 새 행이 반영되게 한다.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adReviewKeys.all }),
  })
}

export const useAdReviewListQuery = (params: Ref<AdReviewListParams>) =>
  useQuery({
    queryKey: computed(() => adReviewKeys.list(params.value)),
    queryFn: () => fetchAdReviewList(params.value),
    // 검색조건 변경 중 이전 결과를 유지해 그리드가 깜빡이지 않게 한다.
    placeholderData: keepPreviousData,
  })
