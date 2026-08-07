/**
 * 광고심의 화면 전용 코드 상수.
 *
 * TODO: 백엔드 공통코드 `AD_TYPE` / `AD_CHANNEL` / `AD_REVIEW_STATUS` 가 등록되면
 *       `packages/shared/src/api/code/` 로 이관하고 `fetch~()` 함수로 교체한다.
 *       (2026-08-06 기준 로컬 DB 공통코드 클래스 398건 중 세 코드가 모두 미등록이라
 *        드롭다운 데이터 소스가 없어 화면 상수로 임시 유지한다.)
 *
 * 형태를 shared 의 기존 공통코드 파일과 동일하게 `{ code, label }` 로 맞춰,
 * 이관 시 XSelect 의 SelectOption(value/label) 매핑 코드를 바꾸지 않아도 되게 한다.
 */

export interface AdReviewCode {
  code: string
  label: string
}

/**
 * 광고구분 — 화면정의서 RM_01_07_01 [1-4].
 * code 값은 BE 공통코드 등록 시 확정되므로, 지금은 라벨과 동일한 한글 문자열을 코드로 쓴다.
 */
export const AD_TYPE_CODES: AdReviewCode[] = [
  { code: "모집", label: "모집" },
  { code: "리쿠르팅", label: "리쿠르팅" },
  { code: "이벤트", label: "이벤트" },
  { code: "상품", label: "상품" },
  { code: "브랜드", label: "브랜드" },
  { code: "교육홍보", label: "교육홍보" },
  { code: "기타", label: "기타" },
]

/** 채널 — 화면정의서 RM_01_07_01 [4-6]. 다중선택 대상이라 목록에서는 콤마로 이어 표시한다. */
export const AD_CHANNEL_CODES: AdReviewCode[] = [
  { code: "문자(SMS)", label: "문자(SMS)" },
  { code: "MMS", label: "MMS" },
  { code: "카카오톡", label: "카카오톡" },
  { code: "홈페이지", label: "홈페이지" },
  { code: "블로그", label: "블로그" },
  { code: "SNS", label: "SNS" },
  { code: "유튜브", label: "유튜브" },
  { code: "배너", label: "배너" },
  { code: "전단지", label: "전단지" },
  { code: "포스터", label: "포스터" },
  { code: "현수막", label: "현수막" },
  { code: "설명회자료", label: "설명회자료" },
  { code: "기타", label: "기타" },
]

/**
 * 심의상태 — 백엔드 enum `AdvertisementReviewStatus` 확정값.
 * 세 코드 중 유일하게 코드 체계가 확정되어 있어 영문 코드를 그대로 쓴다.
 */
export const AD_REVIEW_STATUS_CODES: AdReviewCode[] = [
  { code: "RECEIVED", label: "접수" },
  { code: "REVIEWING", label: "검토중" },
  { code: "SUPPLEMENT", label: "보완요청" },
  { code: "COMPLETED", label: "완료" },
]

// 코드가 목록에 없으면(신규 코드 등) 원본 값을 그대로 노출해 빈칸으로 사라지지 않게 한다.
const toLabel = (codes: AdReviewCode[], code: string | undefined | null): string => {
  if (!code) {
    return ""
  }

  return codes.find((item) => item.code === code)?.label ?? code
}

export const adTypeLabel = (code: string | undefined | null): string => toLabel(AD_TYPE_CODES, code)

export const adChannelLabel = (code: string | undefined | null): string =>
  toLabel(AD_CHANNEL_CODES, code)

export const adReviewStatusLabel = (code: string | undefined | null): string =>
  toLabel(AD_REVIEW_STATUS_CODES, code)
