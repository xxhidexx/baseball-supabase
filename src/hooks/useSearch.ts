import { useReducer, useCallback, useMemo } from 'react'
import type { Database } from '@/lib/supabase'
import {
  SearchState,
  SearchAction,
  SearchFilters,
  SortOptions,
  defaultSearchState,
  calculateTotalPages,
  isFilterActive,
  getActiveFilterCount,
} from '@/types/search'

type Player = Database['public']['Tables']['players']['Row']

// 🔥 検索状態管理Reducer
const searchReducer = (state: SearchState, action: SearchAction): SearchState => {
  switch (action.type) {
    case 'SET_TEXT_SEARCH':
      return {
        ...state,
        filters: { ...state.filters, textSearch: action.payload },
        pagination: { ...state.pagination, page: 1 }, // ページをリセット
      }
    
    case 'SET_SEARCH_MODE':
      return {
        ...state,
        filters: { ...state.filters, searchMode: action.payload },
        pagination: { ...state.pagination, page: 1 },
      }
    
    case 'SET_SEARCH_FIELDS':
      return {
        ...state,
        filters: { ...state.filters, searchFields: action.payload },
        pagination: { ...state.pagination, page: 1 },
      }
    
    case 'SET_POSITIONS':
      return {
        ...state,
        filters: { ...state.filters, positions: action.payload },
        pagination: { ...state.pagination, page: 1 },
      }
    
    case 'SET_AFFILIATION_TYPES':
      return {
        ...state,
        filters: { ...state.filters, affiliationTypes: action.payload },
        pagination: { ...state.pagination, page: 1 },
      }
    
    case 'SET_DRAFT_YEAR_RANGE':
      return {
        ...state,
        filters: { ...state.filters, draftYearRange: action.payload },
        pagination: { ...state.pagination, page: 1 },
      }
    
    case 'SET_HEIGHT_RANGE':
      return {
        ...state,
        filters: { ...state.filters, heightRange: action.payload },
        pagination: { ...state.pagination, page: 1 },
      }
    
    case 'SET_WEIGHT_RANGE':
      return {
        ...state,
        filters: { ...state.filters, weightRange: action.payload },
        pagination: { ...state.pagination, page: 1 },
      }
    
    case 'SET_HAS_NOTES':
      return {
        ...state,
        filters: { ...state.filters, hasNotes: action.payload },
        pagination: { ...state.pagination, page: 1 },
      }
    
    case 'SET_HAS_PHYSICAL_DATA':
      return {
        ...state,
        filters: { ...state.filters, hasPhysicalData: action.payload },
        pagination: { ...state.pagination, page: 1 },
      }
    
    case 'SET_SORT':
      return {
        ...state,
        sort: action.payload,
        pagination: { ...state.pagination, page: 1 },
      }
    
    case 'SET_PAGE':
      return {
        ...state,
        pagination: { ...state.pagination, page: action.payload },
      }
    
    case 'SET_LIMIT':
      return {
        ...state,
        pagination: {
          ...state.pagination,
          limit: action.payload,
          page: 1,
          totalPages: calculateTotalPages(state.pagination.totalCount, action.payload),
        },
      }
    
    case 'SET_TOTAL_COUNT':
      return {
        ...state,
        pagination: {
          ...state.pagination,
          totalCount: action.payload,
          totalPages: calculateTotalPages(action.payload, state.pagination.limit),
        },
      }
    
    case 'TOGGLE_ADVANCED_MODE':
      return {
        ...state,
        isAdvancedMode: !state.isAdvancedMode,
      }
    
    case 'CLEAR_FILTERS':
      return {
        ...defaultSearchState,
        isAdvancedMode: state.isAdvancedMode,
      }
    
    default:
      return state
  }
}

// 🔥 フィルタリング・ソート・ページネーション処理
const applyFilters = (players: Player[], filters: SearchFilters): Player[] => {
  return players.filter((player) => {
    // テキスト検索
    if (filters.textSearch) {
      const searchValue = filters.textSearch.toLowerCase()
      let textMatch = false

      for (const field of filters.searchFields) {
        const fieldValue = player[field]
        if (fieldValue) {
          const normalizedValue = fieldValue.toLowerCase()
          
          switch (filters.searchMode) {
            case 'partial':
              if (normalizedValue.includes(searchValue)) textMatch = true
              break
            case 'exact':
              if (normalizedValue === searchValue) textMatch = true
              break
            case 'regex':
              try {
                const regex = new RegExp(searchValue, 'i')
                if (regex.test(normalizedValue)) textMatch = true
              } catch {
                // 無効な正規表現の場合は部分一致にフォールバック
                if (normalizedValue.includes(searchValue)) textMatch = true
              }
              break
          }
        }
      }
      
      if (!textMatch) return false
    }

    // ポジションフィルター
    if (filters.positions.length > 0) {
      if (!player.position || !filters.positions.includes(player.position)) {
        return false
      }
    }

    // 所属タイプフィルター
    if (filters.affiliationTypes.length > 0) {
      if (!player.affiliation_type || !filters.affiliationTypes.includes(player.affiliation_type)) {
        return false
      }
    }

    // ドラフト年範囲フィルター
    if (filters.draftYearRange.min !== undefined || filters.draftYearRange.max !== undefined) {
      const draftYear = player.draft_year
      if (draftYear === null) return false
      
      if (filters.draftYearRange.min !== undefined && draftYear < filters.draftYearRange.min) {
        return false
      }
      if (filters.draftYearRange.max !== undefined && draftYear > filters.draftYearRange.max) {
        return false
      }
    }

    // 身長範囲フィルター
    if (filters.heightRange.min !== undefined || filters.heightRange.max !== undefined) {
      const height = player.height ? parseFloat(player.height.replace(/[^\d.]/g, '')) : null
      if (height === null) return false
      
      if (filters.heightRange.min !== undefined && height < filters.heightRange.min) {
        return false
      }
      if (filters.heightRange.max !== undefined && height > filters.heightRange.max) {
        return false
      }
    }

    // 体重範囲フィルター
    if (filters.weightRange.min !== undefined || filters.weightRange.max !== undefined) {
      const weight = player.weight ? parseFloat(player.weight.replace(/[^\d.]/g, '')) : null
      if (weight === null) return false
      
      if (filters.weightRange.min !== undefined && weight < filters.weightRange.min) {
        return false
      }
      if (filters.weightRange.max !== undefined && weight > filters.weightRange.max) {
        return false
      }
    }

    // 備考フィルター
    if (filters.hasNotes !== undefined) {
      const hasNotes = player.notes !== null && player.notes.trim() !== ''
      if (hasNotes !== filters.hasNotes) return false
    }

    // 身体データフィルター
    if (filters.hasPhysicalData !== undefined) {
      const hasPhysicalData = (player.height !== null && player.height.trim() !== '') || 
                              (player.weight !== null && player.weight.trim() !== '')
      if (hasPhysicalData !== filters.hasPhysicalData) return false
    }

    return true
  })
}

const applySorting = (players: Player[], sort: SortOptions): Player[] => {
  return [...players].sort((a, b) => {
    let comparison = 0

    switch (sort.field) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      
      case 'draft_year':
        const yearA = a.draft_year ?? 0
        const yearB = b.draft_year ?? 0
        comparison = yearA - yearB
        break
      
      case 'created_at':
        const dateA = new Date(a.created_at ?? 0).getTime()
        const dateB = new Date(b.created_at ?? 0).getTime()
        comparison = dateA - dateB
        break
      
      case 'updated_at':
        const updateA = new Date(a.updated_at ?? 0).getTime()
        const updateB = new Date(b.updated_at ?? 0).getTime()
        comparison = updateA - updateB
        break
      
      case 'position':
        const posA = a.position ?? ''
        const posB = b.position ?? ''
        comparison = posA.localeCompare(posB)
        break
      
      default:
        comparison = 0
    }

    return sort.direction === 'desc' ? -comparison : comparison
  })
}

const applyPagination = (players: Player[], page: number, limit: number): Player[] => {
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  return players.slice(startIndex, endIndex)
}

// 🔥 高度な検索機能のカスタムフック
export const useSearch = (allPlayers: Player[]) => {
  const [state, dispatch] = useReducer(searchReducer, defaultSearchState)

  // フィルタリング、ソート、ページネーションを適用
  const processedPlayers = useMemo(() => {
    // 1. フィルタリング
    const filteredPlayers = applyFilters(allPlayers, state.filters)
    
    // 2. 総件数更新（副作用だが、パフォーマンス上ここで実行）
    if (filteredPlayers.length !== state.pagination.totalCount) {
      dispatch({ type: 'SET_TOTAL_COUNT', payload: filteredPlayers.length })
    }
    
    // 3. ソート
    const sortedPlayers = applySorting(filteredPlayers, state.sort)
    
    // 4. ページネーション
    const paginatedPlayers = applyPagination(
      sortedPlayers, 
      state.pagination.page, 
      state.pagination.limit
    )
    
    return {
      players: paginatedPlayers,
      totalCount: filteredPlayers.length,
      allFilteredPlayers: filteredPlayers, // エクスポート用
    }
  }, [allPlayers, state.filters, state.sort, state.pagination.page, state.pagination.limit, state.pagination.totalCount])

  // アクションクリエーター（useCallbackで最適化）
  const setTextSearch = useCallback((text: string) => 
    dispatch({ type: 'SET_TEXT_SEARCH', payload: text }), [])
  
  const setSearchMode = useCallback((mode: SearchFilters['searchMode']) => 
    dispatch({ type: 'SET_SEARCH_MODE', payload: mode }), [])
  
  const setSearchFields = useCallback((fields: SearchFilters['searchFields']) => 
    dispatch({ type: 'SET_SEARCH_FIELDS', payload: fields }), [])
  
  const setPositions = useCallback((positions: string[]) => 
    dispatch({ type: 'SET_POSITIONS', payload: positions }), [])
  
  const setAffiliationTypes = useCallback((types: string[]) => 
    dispatch({ type: 'SET_AFFILIATION_TYPES', payload: types }), [])
  
  const setDraftYearRange = useCallback((range: SearchFilters['draftYearRange']) => 
    dispatch({ type: 'SET_DRAFT_YEAR_RANGE', payload: range }), [])
  
  const setHeightRange = useCallback((range: SearchFilters['heightRange']) => 
    dispatch({ type: 'SET_HEIGHT_RANGE', payload: range }), [])
  
  const setWeightRange = useCallback((range: SearchFilters['weightRange']) => 
    dispatch({ type: 'SET_WEIGHT_RANGE', payload: range }), [])
  
  const setHasNotes = useCallback((hasNotes: boolean) => 
    dispatch({ type: 'SET_HAS_NOTES', payload: hasNotes }), [])
  
  const setHasPhysicalData = useCallback((hasData: boolean) => 
    dispatch({ type: 'SET_HAS_PHYSICAL_DATA', payload: hasData }), [])
  
  const setSort = useCallback((sort: SortOptions) => 
    dispatch({ type: 'SET_SORT', payload: sort }), [])
  
  const setPage = useCallback((page: number) => 
    dispatch({ type: 'SET_PAGE', payload: page }), [])
  
  const setLimit = useCallback((limit: number) => 
    dispatch({ type: 'SET_LIMIT', payload: limit }), [])
  
  const toggleAdvancedMode = useCallback(() => 
    dispatch({ type: 'TOGGLE_ADVANCED_MODE' }), [])
  
  const clearFilters = useCallback(() => 
    dispatch({ type: 'CLEAR_FILTERS' }), [])

  const actions = useMemo(() => ({
    setTextSearch,
    setSearchMode,
    setSearchFields,
    setPositions,
    setAffiliationTypes,
    setDraftYearRange,
    setHeightRange,
    setWeightRange,
    setHasNotes,
    setHasPhysicalData,
    setSort,
    setPage,
    setLimit,
    toggleAdvancedMode,
    clearFilters,
  }), [
    setTextSearch,
    setSearchMode,
    setSearchFields,
    setPositions,
    setAffiliationTypes,
    setDraftYearRange,
    setHeightRange,
    setWeightRange,
    setHasNotes,
    setHasPhysicalData,
    setSort,
    setPage,
    setLimit,
    toggleAdvancedMode,
    clearFilters,
  ])

  // 統計情報
  const stats = useMemo(() => ({
    isFilterActive: isFilterActive(state.filters),
    activeFilterCount: getActiveFilterCount(state.filters),
    totalPlayers: allPlayers.length,
    filteredCount: processedPlayers.totalCount,
    currentPageStart: (state.pagination.page - 1) * state.pagination.limit + 1,
    currentPageEnd: Math.min(
      state.pagination.page * state.pagination.limit, 
      processedPlayers.totalCount
    ),
  }), [state.filters, state.pagination, allPlayers.length, processedPlayers.totalCount])

  return {
    // 状態
    state,
    
    // 処理済みデータ
    players: processedPlayers.players,
    allFilteredPlayers: processedPlayers.allFilteredPlayers,
    
    // アクション
    actions,
    
    // 統計
    stats,
  }
} 