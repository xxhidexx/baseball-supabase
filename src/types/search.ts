// 🔥 高度な検索・フィルター機能の型定義

export interface SearchFilters {
  // テキスト検索
  textSearch: string
  searchMode: 'partial' | 'exact' | 'regex'
  searchFields: ('name' | 'affiliation_name' | 'notes' | 'position_detail')[]
  
  // カテゴリーフィルター
  positions: string[]
  affiliationTypes: string[]
  
  // 数値範囲フィルター
  draftYearRange: {
    min?: number
    max?: number
  }
  heightRange: {
    min?: number
    max?: number
  }
  weightRange: {
    min?: number
    max?: number
  }
  
  // その他フィルター
  hasNotes?: boolean // 備考がある選手のみ
  hasPhysicalData?: boolean // 身長・体重データがある選手のみ
}

export interface SortOptions {
  field: 'name' | 'draft_year' | 'created_at' | 'updated_at' | 'position'
  direction: 'asc' | 'desc'
}

export interface PaginationOptions {
  page: number
  limit: number
  totalCount: number
  totalPages: number
}

export interface SearchState {
  filters: SearchFilters
  sort: SortOptions
  pagination: PaginationOptions
  isAdvancedMode: boolean
}

// 検索アクションの型定義
export type SearchAction = 
  | { type: 'SET_TEXT_SEARCH'; payload: string }
  | { type: 'SET_SEARCH_MODE'; payload: SearchFilters['searchMode'] }
  | { type: 'SET_SEARCH_FIELDS'; payload: SearchFilters['searchFields'] }
  | { type: 'SET_POSITIONS'; payload: string[] }
  | { type: 'SET_AFFILIATION_TYPES'; payload: string[] }
  | { type: 'SET_DRAFT_YEAR_RANGE'; payload: SearchFilters['draftYearRange'] }
  | { type: 'SET_HEIGHT_RANGE'; payload: SearchFilters['heightRange'] }
  | { type: 'SET_WEIGHT_RANGE'; payload: SearchFilters['weightRange'] }
  | { type: 'SET_HAS_NOTES'; payload: boolean }
  | { type: 'SET_HAS_PHYSICAL_DATA'; payload: boolean }
  | { type: 'SET_SORT'; payload: SortOptions }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_LIMIT'; payload: number }
  | { type: 'TOGGLE_ADVANCED_MODE' }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_TOTAL_COUNT'; payload: number }

// デフォルト値
export const defaultSearchFilters: SearchFilters = {
  textSearch: '',
  searchMode: 'partial',
  searchFields: ['name', 'affiliation_name'],
  positions: [],
  affiliationTypes: [],
  draftYearRange: {},
  heightRange: {},
  weightRange: {},
  hasNotes: undefined,
  hasPhysicalData: undefined,
}

export const defaultSortOptions: SortOptions = {
  field: 'name',
  direction: 'asc',
}

export const defaultPaginationOptions: PaginationOptions = {
  page: 1,
  limit: 20,
  totalCount: 0,
  totalPages: 0,
}

export const defaultSearchState: SearchState = {
  filters: defaultSearchFilters,
  sort: defaultSortOptions,
  pagination: defaultPaginationOptions,
  isAdvancedMode: false,
}

// ユーティリティ関数
export const calculateTotalPages = (totalCount: number, limit: number): number => {
  return Math.ceil(totalCount / limit)
}

export const isFilterActive = (filters: SearchFilters): boolean => {
  return (
    filters.textSearch !== '' ||
    filters.positions.length > 0 ||
    filters.affiliationTypes.length > 0 ||
    filters.draftYearRange.min !== undefined ||
    filters.draftYearRange.max !== undefined ||
    filters.heightRange.min !== undefined ||
    filters.heightRange.max !== undefined ||
    filters.weightRange.min !== undefined ||
    filters.weightRange.max !== undefined ||
    filters.hasNotes !== undefined ||
    filters.hasPhysicalData !== undefined
  )
}

export const getActiveFilterCount = (filters: SearchFilters): number => {
  let count = 0
  if (filters.textSearch !== '') count++
  if (filters.positions.length > 0) count++
  if (filters.affiliationTypes.length > 0) count++
  if (filters.draftYearRange.min !== undefined || filters.draftYearRange.max !== undefined) count++
  if (filters.heightRange.min !== undefined || filters.heightRange.max !== undefined) count++
  if (filters.weightRange.min !== undefined || filters.weightRange.max !== undefined) count++
  if (filters.hasNotes !== undefined) count++
  if (filters.hasPhysicalData !== undefined) count++
  return count
} 