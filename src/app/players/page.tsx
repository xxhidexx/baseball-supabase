'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useSearch } from '@/hooks/useSearch'
import AdvancedSearch from '@/components/AdvancedSearch'
import SortAndPagination from '@/components/SortAndPagination'

// 🔥 型定義の威力: データベースの型安全性
type Player = Database['public']['Tables']['players']['Row']

function PlayersContent() {
  const [allPlayers, setAllPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false)
  
  const { isAuthenticated, loading: authLoading } = useAuth()
  const searchParams = useSearchParams()
  const supabase = createBrowserSupabaseClient()
  
  // 認証状態を安定した値として取得
  const isAuth = isAuthenticated()

  // 🔥 高度な検索機能フック
  const {
    state: searchState,
    players: displayedPlayers,
    actions: searchActions,
    stats: searchStats,
  } = useSearch(allPlayers)

  // URLパラメータから削除成功を確認
  useEffect(() => {
    if (searchParams.get('deleted') === 'true') {
      setShowDeleteSuccess(true)
      // 3秒後に非表示
      setTimeout(() => setShowDeleteSuccess(false), 3000)
    }
  }, [searchParams])

  // 利用可能なオプションの計算
  const availableOptions = useMemo(() => {
    const positions = allPlayers
      .map(p => p.position)
      .filter((position): position is string => position !== null)
    
    const affiliationTypes = allPlayers
      .map(p => p.affiliation_type)
      .filter((type): type is string => type !== null)

    return {
      positions: Array.from(new Set(positions)).sort(),
      affiliationTypes: Array.from(new Set(affiliationTypes)).sort(),
    }
  }, [allPlayers])

  useEffect(() => {
    const fetchPlayers = async () => {
      // authLoadingが終了していて、かつ認証済みの場合のみデータ取得
      if (authLoading || !isAuth) {
        return
      }

      setLoading(true)
      setError(null)

      try {
        // 🔥 型定義の威力: 自動補完で正確なクエリ作成
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error: fetchError } = await (supabase as any)
          .from('players')
          .select('*')
          .order('created_at', { ascending: false }) // 最新順で取得

        if (fetchError) {
          setError(`データ取得エラー: ${fetchError.message}`)
          return
        }

        setAllPlayers(data || [])
      } catch (err) {
        setError(`予期しないエラー: ${err instanceof Error ? err.message : '不明なエラー'}`)
      } finally {
        setLoading(false)
      }
    }

    fetchPlayers()
  }, [authLoading, isAuth, supabase])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">認証確認中...</p>
        </div>
      </div>
    )
  }

  if (!authLoading && !isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">ログインが必要です</h2>
          <Link 
            href="/login"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            ログインページへ
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">⚾ 選手データベース</h1>
              <p className="mt-1 text-sm text-gray-500">
                登録選手数: {searchStats.totalPlayers}名 | 
                {searchStats.isFilterActive && `フィルター後: ${searchStats.filteredCount}名 | `}
                表示中: {searchStats.currentPageStart}-{searchStats.currentPageEnd}
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/players/add"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
              >
                <span>➕</span>
                <span>新規選手登録</span>
              </Link>
              <Link
                href="/"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <span>🏠</span>
                <span>ホーム</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 削除成功通知 */}
        {showDeleteSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <div className="text-green-800">
              <strong>✅ 削除完了:</strong> 選手が正常に削除されました
            </div>
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="text-red-800">
              <strong>❌ エラー:</strong> {error}
            </div>
          </div>
        )}

        {/* ローディング表示 */}
        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-center text-blue-800">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span>データを読み込み中...</span>
            </div>
          </div>
        )}

        {/* 🔥 高度な検索・フィルターパネル */}
        <AdvancedSearch
          filters={searchState.filters}
          onFiltersChange={searchActions}
          isAdvancedMode={searchState.isAdvancedMode}
          onToggleAdvanced={searchActions.toggleAdvancedMode}
          activeFilterCount={searchStats.activeFilterCount}
          availablePositions={availableOptions.positions}
          availableAffiliationTypes={availableOptions.affiliationTypes}
        />

        {/* 🔥 ソート・ページネーション */}
        <SortAndPagination
          sort={searchState.sort}
          pagination={searchState.pagination}
          onSortChange={searchActions.setSort}
          onPageChange={searchActions.setPage}
          onLimitChange={searchActions.setLimit}
          currentPageStart={searchStats.currentPageStart}
          currentPageEnd={searchStats.currentPageEnd}
          filteredCount={searchStats.filteredCount}
          totalPlayers={searchStats.totalPlayers}
        />

        {/* 選手一覧グリッド */}
        {searchStats.filteredCount > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {displayedPlayers.map((player) => (
              <Link
                key={player.id}
                href={`/players/${player.id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {player.name}
                    </h3>
                    {player.position && (
                      <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full">
                        {player.position}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    {player.affiliation_name && (
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-2">🏫</span>
                        <span>{player.affiliation_name}</span>
                        {player.affiliation_type && (
                          <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {player.affiliation_type}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {player.draft_year && (
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-2">📅</span>
                        <span>{player.draft_year}年ドラフト</span>
                      </div>
                    )}
                    
                    {(player.height || player.weight) && (
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-2">📏</span>
                        <span>
                          {player.height && `${player.height}`}
                          {player.height && player.weight && ' / '}
                          {player.weight && `${player.weight}`}
                        </span>
                      </div>
                    )}
                    
                    {player.position_detail && (
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-2">⚾</span>
                        <span className="text-xs">{player.position_detail}</span>
                      </div>
                    )}
                  </div>
                  
                  {player.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {player.notes}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                    <span>
                      作成: {new Date(player.created_at || '').toLocaleDateString('ja-JP')}
                    </span>
                    <span className="text-indigo-600 group-hover:text-indigo-800 transition-colors">
                      詳細を見る →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Loading component
function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="mt-2 text-gray-600">読み込み中...</p>
      </div>
    </div>
  )
}

// Main component with Suspense
export default function PlayersPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PlayersContent />
    </Suspense>
  )
} 