'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

// 🔥 型定義の威力: Player型の自動生成
type Player = Database['public']['Tables']['players']['Row']

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(false)  // 初期状態はfalseに変更
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [positionFilter, setPositionFilter] = useState('')
  
  const { isAuthenticated, loading: authLoading, userId } = useAuth()
  const supabase = createBrowserSupabaseClient()
  
  // 認証状態を安定した値として取得
  const isAuth = isAuthenticated()

  // 🔥 型定義の威力: フィルター処理の型安全性
  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      const matchesSearch = 
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.affiliation_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        false

      const matchesPosition = 
        !positionFilter || 
        player.position === positionFilter

      return matchesSearch && matchesPosition
    })
  }, [players, searchTerm, positionFilter])

  // ユニークなポジション一覧（null安全）
  const uniquePositions = useMemo(() => {
    const positions = players
      .map(p => p.position)
      .filter((position): position is string => position !== null)
    return Array.from(new Set(positions)).sort()
  }, [players])

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
        const { data, error: fetchError } = await supabase
          .from('players')
          .select('*')

        if (fetchError) {
          setError(`データ取得エラー: ${fetchError.message}`)
          return
        }

        // データを名前順でソート
        const sortedData = (data || []).sort((a, b) => a.name.localeCompare(b.name))
        setPlayers(sortedData)
      } catch (err) {
        setError(`予期しないエラー: ${err instanceof Error ? err.message : '不明なエラー'}`)
      } finally {
        setLoading(false)
      }
    }

    fetchPlayers()
  }, [authLoading, isAuth, supabase]) // 依存配列を修正

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
                登録選手数: {players.length}名 | 表示中: {filteredPlayers.length}名
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/players/add"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                ➕ 新規選手登録
              </Link>
              <Link
                href="/"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                🏠 ホーム
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 検索・フィルター */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">🔍 検索・フィルター</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                選手名・所属で検索
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="田中太郎、東京大学など..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ポジション
              </label>
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">全てのポジション</option>
                {uniquePositions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="text-red-800">
              <strong>エラー:</strong> {error}
            </div>
          </div>
        )}

        {/* ローディング */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">選手データを読み込み中...</p>
          </div>
        ) : (
          <>
            {/* 選手一覧 */}
            {filteredPlayers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500 text-lg">検索条件に一致する選手が見つかりませんでした</p>
                {players.length === 0 && (
                  <div className="mt-4">
                    <Link
                      href="/players/add"
                      className="text-indigo-600 hover:text-indigo-800 underline"
                    >
                      最初の選手を登録してみませんか？
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{player.name}</h3>
                      <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {player.position || '未設定'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      {player.position_detail && (
                        <p><strong>詳細:</strong> {player.position_detail}</p>
                      )}
                      {player.affiliation_type && player.affiliation_name && (
                        <p><strong>所属:</strong> {player.affiliation_type} - {player.affiliation_name}</p>
                      )}
                      {player.draft_year && (
                        <p><strong>ドラフト年:</strong> {player.draft_year}年</p>
                      )}
                      {(player.height || player.weight) && (
                        <p>
                          <strong>体格:</strong> 
                          {player.height && ` ${player.height}`}
                          {player.weight && ` / ${player.weight}`}
                        </p>
                      )}
                    </div>

                    {player.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-700">
                        {player.notes}
                      </div>
                    )}

                    <div className="mt-6 flex justify-between">
                      <Link
                        href={`/players/${player.id}`}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        詳細を見る →
                      </Link>
                      <span className="text-xs text-gray-400">
                        ID: {player.id}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 