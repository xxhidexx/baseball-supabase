import type { SortOptions, PaginationOptions } from '@/types/search'

interface SortAndPaginationProps {
  sort: SortOptions
  pagination: PaginationOptions
  onSortChange: (sort: SortOptions) => void
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
  currentPageStart: number
  currentPageEnd: number
  filteredCount: number
  totalPlayers: number
}

export default function SortAndPagination({
  sort,
  pagination,
  onSortChange,
  onPageChange,
  onLimitChange,
  currentPageStart,
  currentPageEnd,
  filteredCount,
  totalPlayers,
}: SortAndPaginationProps) {
  const handleSortFieldChange = (field: SortOptions['field']) => {
    // 同じフィールドなら方向を反転、違うフィールドなら昇順に
    const direction = sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc'
    onSortChange({ field, direction })
  }

  const renderPaginationButtons = () => {
    const buttons = []
    const totalPages = pagination.totalPages
    const currentPage = pagination.page

    // 前へボタン
    buttons.push(
      <button
        key="prev"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
      >
        前へ
      </button>
    )

    // ページ番号ボタン
    const maxVisiblePages = 7
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    // 開始ページを調整
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // 最初のページが表示されない場合、省略記号を追加
    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => onPageChange(1)}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
        >
          1
        </button>
      )
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis1" className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300">
            ...
          </span>
        )
      }
    }

    // ページ番号ボタンを生成
    for (let page = startPage; page <= endPage; page++) {
      buttons.push(
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 text-sm font-medium border border-gray-300 ${
            page === currentPage
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'text-gray-700 bg-white hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      )
    }

    // 最後のページが表示されない場合、省略記号を追加
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis2" className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300">
            ...
          </span>
        )
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
        >
          {totalPages}
        </button>
      )
    }

    // 次へボタン
    buttons.push(
      <button
        key="next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
      >
        次へ
      </button>
    )

    return buttons
  }

  const getSortIcon = (field: SortOptions['field']) => {
    if (sort.field !== field) {
      return '↕️' // ソートなし
    }
    return sort.direction === 'asc' ? '⬆️' : '⬇️'
  }

  const sortFields: { field: SortOptions['field']; label: string }[] = [
    { field: 'name', label: '選手名' },
    { field: 'draft_year', label: 'ドラフト年' },
    { field: 'position', label: 'ポジション' },
    { field: 'created_at', label: '作成日' },
    { field: 'updated_at', label: '更新日' },
  ]

  const limitOptions = [10, 20, 50, 100]

  return (
    <div className="bg-white rounded-lg shadow">
      {/* ヘッダー：統計情報とソート */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          {/* 統計情報 */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>
              <strong className="text-gray-900">{filteredCount}</strong> 件の選手
              {filteredCount !== totalPlayers && (
                <span className="text-gray-500">（全 {totalPlayers} 件中）</span>
              )}
            </span>
            {filteredCount > 0 && (
              <span>
                {currentPageStart} - {currentPageEnd} 件表示
              </span>
            )}
          </div>

          {/* ソート・表示件数設定 */}
          <div className="flex items-center space-x-4">
            {/* 表示件数 */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-700">表示件数:</label>
              <select
                value={pagination.limit}
                onChange={(e) => onLimitChange(parseInt(e.target.value))}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                {limitOptions.map((limit) => (
                  <option key={limit} value={limit}>
                    {limit}件
                  </option>
                ))}
              </select>
            </div>

            {/* ソート */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-700">並び順:</label>
              <div className="flex space-x-1">
                {sortFields.map((sortField) => (
                  <button
                    key={sortField.field}
                    onClick={() => handleSortFieldChange(sortField.field)}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                      sort.field === sortField.field
                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                    title={`${sortField.label}で並び替え`}
                  >
                    {sortField.label} {getSortIcon(sortField.field)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ページネーション */}
      {pagination.totalPages > 1 && (
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              ページ {pagination.page} / {pagination.totalPages}
            </div>
            <div className="flex items-center">
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                {renderPaginationButtons()}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* 検索結果なしの場合 */}
      {filteredCount === 0 && (
        <div className="p-8 text-center">
          <div className="text-gray-400 text-lg mb-2">🔍</div>
          <p className="text-gray-600 mb-4">検索条件に一致する選手が見つかりませんでした</p>
          <div className="text-sm text-gray-500">
            <p>検索条件を変更して再度お試しください：</p>
            <ul className="mt-2 space-y-1">
              <li>• 検索キーワードを短くする</li>
              <li>• フィルター条件を緩める</li>
              <li>• 検索モードを「部分一致」に変更する</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
} 