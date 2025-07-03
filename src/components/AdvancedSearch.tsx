import { useState } from 'react'
import type { SearchFilters } from '@/types/search'

interface AdvancedSearchProps {
  filters: SearchFilters
  onFiltersChange: {
    setTextSearch: (text: string) => void
    setSearchMode: (mode: SearchFilters['searchMode']) => void
    setSearchFields: (fields: SearchFilters['searchFields']) => void
    setPositions: (positions: string[]) => void
    setAffiliationTypes: (types: string[]) => void
    setDraftYearRange: (range: { min?: number, max?: number }) => void
    setHeightRange: (range: { min?: number, max?: number }) => void
    setWeightRange: (range: { min?: number, max?: number }) => void
    setHasNotes: (hasNotes: boolean) => void
    setHasPhysicalData: (hasData: boolean) => void
    clearFilters: () => void
  }
  isAdvancedMode: boolean
  onToggleAdvanced: () => void
  activeFilterCount: number
  availablePositions: string[]
  availableAffiliationTypes: string[]
}

export default function AdvancedSearch({
  filters,
  onFiltersChange,
  isAdvancedMode,
  onToggleAdvanced,
  activeFilterCount,
  availablePositions,
  availableAffiliationTypes,
}: AdvancedSearchProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']))

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const handlePositionToggle = (position: string) => {
    const newPositions = filters.positions.includes(position)
      ? filters.positions.filter(p => p !== position)
      : [...filters.positions, position]
    onFiltersChange.setPositions(newPositions)
  }

  const handleAffiliationTypeToggle = (type: string) => {
    const newTypes = filters.affiliationTypes.includes(type)
      ? filters.affiliationTypes.filter(t => t !== type)
      : [...filters.affiliationTypes, type]
    onFiltersChange.setAffiliationTypes(newTypes)
  }

  const handleSearchFieldToggle = (field: SearchFilters['searchFields'][0]) => {
    const newFields = filters.searchFields.includes(field)
      ? filters.searchFields.filter(f => f !== field)
      : [...filters.searchFields, field]
    onFiltersChange.setSearchFields(newFields)
  }

  const SectionHeader = ({ 
    title, 
    sectionKey, 
    icon, 
    count 
  }: { 
    title: string
    sectionKey: string
    icon: string
    count?: number 
  }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 border-b border-gray-200"
    >
      <div className="flex items-center space-x-2">
        <span className="text-lg">{icon}</span>
        <span className="font-medium text-gray-900">{title}</span>
        {count !== undefined && count > 0 && (
          <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full">
            {count}
          </span>
        )}
      </div>
      <svg
        className={`w-5 h-5 transform transition-transform ${
          expandedSections.has(sectionKey) ? 'rotate-180' : ''
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )

  return (
    <div className="bg-white rounded-lg shadow mb-8">
      {/* ヘッダー */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-medium text-gray-900">🔍 検索・フィルター</h2>
            {activeFilterCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                {activeFilterCount} 個のフィルター適用中
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onFiltersChange.clearFilters}
              className="text-gray-500 hover:text-gray-700 text-sm"
              disabled={activeFilterCount === 0}
            >
              🗑️ クリア
            </button>
            <button
              onClick={onToggleAdvanced}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isAdvancedMode
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isAdvancedMode ? '🔧 高度検索ON' : '⚙️ 高度検索'}
            </button>
          </div>
        </div>
      </div>

      {/* 基本検索セクション */}
      <div className="border-b border-gray-200">
        <SectionHeader 
          title="基本検索" 
          sectionKey="basic" 
          icon="🔤"
          count={filters.textSearch ? 1 : 0}
        />
        {expandedSections.has('basic') && (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                検索テキスト
              </label>
              <input
                type="text"
                value={filters.textSearch}
                onChange={(e) => onFiltersChange.setTextSearch(e.target.value)}
                placeholder="選手名、所属名などで検索..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {isAdvancedMode && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    検索モード
                  </label>
                  <div className="flex space-x-4">
                    {[
                      { value: 'partial', label: '部分一致' },
                      { value: 'exact', label: '完全一致' },
                      { value: 'regex', label: '正規表現' },
                    ].map((mode) => (
                      <label key={mode.value} className="flex items-center">
                        <input
                          type="radio"
                          value={mode.value}
                          checked={filters.searchMode === mode.value}
                          onChange={(e) => onFiltersChange.setSearchMode(e.target.value as SearchFilters['searchMode'])}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{mode.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    検索対象フィールド
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'name', label: '選手名' },
                      { value: 'affiliation_name', label: '所属名' },
                      { value: 'notes', label: '備考' },
                      { value: 'position_detail', label: 'ポジション詳細' },
                    ].map((field) => (
                      <button
                        key={field.value}
                        onClick={() => handleSearchFieldToggle(field.value as SearchFilters['searchFields'][0])}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          filters.searchFields.includes(field.value as SearchFilters['searchFields'][0])
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {field.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ポジションフィルター */}
      <div className="border-b border-gray-200">
        <SectionHeader 
          title="ポジション" 
          sectionKey="positions" 
          icon="⚾"
          count={filters.positions.length}
        />
        {expandedSections.has('positions') && (
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              {availablePositions.map((position) => (
                <button
                  key={position}
                  onClick={() => handlePositionToggle(position)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.positions.includes(position)
                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {position}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 所属タイプフィルター */}
      <div className="border-b border-gray-200">
        <SectionHeader 
          title="所属タイプ" 
          sectionKey="affiliations" 
          icon="🏫"
          count={filters.affiliationTypes.length}
        />
        {expandedSections.has('affiliations') && (
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              {availableAffiliationTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleAffiliationTypeToggle(type)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.affiliationTypes.includes(type)
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 高度フィルター（数値範囲） */}
      {isAdvancedMode && (
        <>
          <div className="border-b border-gray-200">
            <SectionHeader 
              title="ドラフト年" 
              sectionKey="draftyear" 
              icon="📅"
              count={filters.draftYearRange.min !== undefined || filters.draftYearRange.max !== undefined ? 1 : 0}
            />
            {expandedSections.has('draftyear') && (
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      開始年
                    </label>
                    <input
                      type="number"
                      value={filters.draftYearRange.min || ''}
                      onChange={(e) => onFiltersChange.setDraftYearRange({
                        ...filters.draftYearRange,
                        min: e.target.value ? parseInt(e.target.value) : undefined
                      })}
                      placeholder="1950"
                      min="1950"
                      max="2030"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      終了年
                    </label>
                    <input
                      type="number"
                      value={filters.draftYearRange.max || ''}
                      onChange={(e) => onFiltersChange.setDraftYearRange({
                        ...filters.draftYearRange,
                        max: e.target.value ? parseInt(e.target.value) : undefined
                      })}
                      placeholder="2030"
                      min="1950"
                      max="2030"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-b border-gray-200">
            <SectionHeader 
              title="身長範囲" 
              sectionKey="height" 
              icon="📏"
              count={filters.heightRange.min !== undefined || filters.heightRange.max !== undefined ? 1 : 0}
            />
            {expandedSections.has('height') && (
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      最低身長 (cm)
                    </label>
                    <input
                      type="number"
                      value={filters.heightRange.min || ''}
                      onChange={(e) => onFiltersChange.setHeightRange({
                        ...filters.heightRange,
                        min: e.target.value ? parseFloat(e.target.value) : undefined
                      })}
                      placeholder="150"
                      min="100"
                      max="250"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      最高身長 (cm)
                    </label>
                    <input
                      type="number"
                      value={filters.heightRange.max || ''}
                      onChange={(e) => onFiltersChange.setHeightRange({
                        ...filters.heightRange,
                        max: e.target.value ? parseFloat(e.target.value) : undefined
                      })}
                      placeholder="220"
                      min="100"
                      max="250"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-b border-gray-200">
            <SectionHeader 
              title="体重範囲" 
              sectionKey="weight" 
              icon="⚖️"
              count={filters.weightRange.min !== undefined || filters.weightRange.max !== undefined ? 1 : 0}
            />
            {expandedSections.has('weight') && (
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      最低体重 (kg)
                    </label>
                    <input
                      type="number"
                      value={filters.weightRange.min || ''}
                      onChange={(e) => onFiltersChange.setWeightRange({
                        ...filters.weightRange,
                        min: e.target.value ? parseFloat(e.target.value) : undefined
                      })}
                      placeholder="40"
                      min="30"
                      max="200"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      最高体重 (kg)
                    </label>
                    <input
                      type="number"
                      value={filters.weightRange.max || ''}
                      onChange={(e) => onFiltersChange.setWeightRange({
                        ...filters.weightRange,
                        max: e.target.value ? parseFloat(e.target.value) : undefined
                      })}
                      placeholder="150"
                      min="30"
                      max="200"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <SectionHeader 
              title="その他の条件" 
              sectionKey="other" 
              icon="⚡"
              count={
                (filters.hasNotes !== undefined ? 1 : 0) + 
                (filters.hasPhysicalData !== undefined ? 1 : 0)
              }
            />
            {expandedSections.has('other') && (
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.hasNotes === true}
                      onChange={(e) => onFiltersChange.setHasNotes(e.target.checked ? true : false)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">備考がある選手のみ</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.hasPhysicalData === true}
                      onChange={(e) => onFiltersChange.setHasPhysicalData(e.target.checked ? true : false)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">身体データがある選手のみ</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
} 