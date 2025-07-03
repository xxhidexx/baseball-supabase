'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

// 🔥 型定義の威力: 完全な型安全性
type Player = Database['public']['Tables']['players']['Row']
type PlayerUpdate = Database['public']['Tables']['players']['Update']

export default function PlayerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const playerId = Array.isArray(params.id) ? params.id[0] : params.id
  
  const { isAuthenticated, loading: authLoading, userId } = useAuth()
  const [player, setPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<PlayerUpdate>>({})
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const supabase = createBrowserSupabaseClient()
  const isAuth = isAuthenticated()

  // 選手データ取得
  useEffect(() => {
    const fetchPlayer = async () => {
      if (authLoading || !isAuth || !playerId) return

      setLoading(true)
      setError(null)

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error: fetchError } = await (supabase as any)
          .from('players')
          .select('*')
          .eq('id', parseInt(playerId))
          .single()

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            setError('選手が見つかりませんでした')
          } else {
            setError(`データ取得エラー: ${fetchError.message}`)
          }
          return
        }

        setPlayer(data)
        setEditData(data)
      } catch (err) {
        setError(`予期しないエラー: ${err instanceof Error ? err.message : '不明なエラー'}`)
      } finally {
        setLoading(false)
      }
    }

    fetchPlayer()
  }, [authLoading, isAuth, playerId, supabase])

  // 編集データ更新
  const handleEditChange = (field: keyof PlayerUpdate, value: string | number | null) => {
    setEditData(prev => ({
      ...prev,
      [field]: value === '' ? null : value
    }))
  }

  // 保存処理
  const handleSave = async () => {
    if (!player || !userId) return

    // 権限チェック: 本人または管理者のみ
    if (player.user_id !== userId) {
      setError('この選手を編集する権限がありません')
      return
    }

    setSaving(true)
    setError(null)

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('players')
        .update({
          ...editData,
          updated_at: new Date().toISOString()
        })
        .eq('id', player.id)

      if (updateError) {
        setError(`更新エラー: ${updateError.message}`)
        return
      }

      // ローカル状態更新
      setPlayer(prev => prev ? { ...prev, ...editData } : null)
      setIsEditing(false)
      
      // 成功メッセージ（一時的表示）
      const successMsg = document.createElement('div')
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded z-50'
      successMsg.textContent = '✅ 保存しました'
      document.body.appendChild(successMsg)
      setTimeout(() => document.body.removeChild(successMsg), 3000)

    } catch (err) {
      setError(`保存中にエラー: ${err instanceof Error ? err.message : '不明なエラー'}`)
    } finally {
      setSaving(false)
    }
  }

  // 削除処理
  const handleDelete = async () => {
    if (!player || !userId) return

    // 権限チェック: 本人または管理者のみ
    if (player.user_id !== userId) {
      setError('この選手を削除する権限がありません')
      return
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: deleteError } = await (supabase as any)
        .from('players')
        .delete()
        .eq('id', player.id)

      if (deleteError) {
        setError(`削除エラー: ${deleteError.message}`)
        return
      }

      // 一覧ページにリダイレクト
      router.push('/players?deleted=true')
    } catch (err) {
      setError(`削除中にエラー: ${err instanceof Error ? err.message : '不明なエラー'}`)
    }
  }

  // 認証確認中
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

  // 未認証
  if (!isAuth) {
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

  // ローディング中
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">選手データを読み込み中...</p>
        </div>
      </div>
    )
  }

  // エラーまたは選手未見つかり
  if (error || !player) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || '選手が見つかりません'}
          </h2>
          <Link
            href="/players"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            ← 選手一覧に戻る
          </Link>
        </div>
      </div>
    )
  }

  const canEdit = player.user_id === userId
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '未設定'
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ⚾ {player.name}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                選手詳細 | ID: {player.id}
              </p>
            </div>
            <div className="flex space-x-3">
              {canEdit && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ✏️ 編集
                </button>
              )}
              <Link
                href="/players"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← 一覧に戻る
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="text-red-800">
              <strong>エラー:</strong> {error}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          {/* 基本情報セクション */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">基本情報</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 選手名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">選手名</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name || ''}
                    onChange={(e) => handleEditChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900">{player.name}</p>
                )}
              </div>

              {/* ポジション */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ポジション</label>
                {isEditing ? (
                  <select
                    value={editData.position || ''}
                    onChange={(e) => handleEditChange('position', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">選択してください</option>
                    <option value="投手">投手</option>
                    <option value="捕手">捕手</option>
                    <option value="一塁手">一塁手</option>
                    <option value="二塁手">二塁手</option>
                    <option value="三塁手">三塁手</option>
                    <option value="遊撃手">遊撃手</option>
                    <option value="左翼手">左翼手</option>
                    <option value="中堅手">中堅手</option>
                    <option value="右翼手">右翼手</option>
                    <option value="内野手">内野手</option>
                    <option value="外野手">外野手</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{player.position || '未設定'}</p>
                )}
              </div>

              {/* ポジション詳細 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ポジション詳細</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.position_detail || ''}
                    onChange={(e) => handleEditChange('position_detail', e.target.value)}
                    placeholder="右投右打、サブマリン等"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                ) : (
                  <p className="text-gray-900">{player.position_detail || '未設定'}</p>
                )}
              </div>

              {/* ドラフト年 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ドラフト年</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editData.draft_year || ''}
                    onChange={(e) => handleEditChange('draft_year', e.target.value ? parseInt(e.target.value) : null)}
                    min="1950"
                    max="2030"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                ) : (
                  <p className="text-gray-900">{player.draft_year ? `${player.draft_year}年` : '未設定'}</p>
                )}
              </div>
            </div>
          </div>

          {/* 所属情報セクション */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">所属情報</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">所属タイプ</label>
                {isEditing ? (
                  <select
                    value={editData.affiliation_type || ''}
                    onChange={(e) => handleEditChange('affiliation_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">選択してください</option>
                    <option value="大学">大学</option>
                    <option value="社会人">社会人</option>
                    <option value="高校">高校</option>
                    <option value="独立リーグ">独立リーグ</option>
                    <option value="その他">その他</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{player.affiliation_type || '未設定'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">所属名</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.affiliation_name || ''}
                    onChange={(e) => handleEditChange('affiliation_name', e.target.value)}
                    placeholder="東京大学、○○会社等"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                ) : (
                  <p className="text-gray-900">{player.affiliation_name || '未設定'}</p>
                )}
              </div>
            </div>
          </div>

          {/* 身体情報セクション */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">身体情報</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">身長</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.height || ''}
                    onChange={(e) => handleEditChange('height', e.target.value)}
                    placeholder="180cm"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                ) : (
                  <p className="text-gray-900">{player.height || '未設定'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">体重</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.weight || ''}
                    onChange={(e) => handleEditChange('weight', e.target.value)}
                    placeholder="75kg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                ) : (
                  <p className="text-gray-900">{player.weight || '未設定'}</p>
                )}
              </div>
            </div>
          </div>

          {/* 備考・メタデータセクション */}
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">備考・その他</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">備考・特記事項</label>
                {isEditing ? (
                  <textarea
                    value={editData.notes || ''}
                    onChange={(e) => handleEditChange('notes', e.target.value)}
                    placeholder="特徴、実績、将来性など..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                ) : (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {player.notes || '特記事項なし'}
                    </p>
                  </div>
                )}
              </div>

              {/* メタデータ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-500">
                <div>
                  <strong>作成日:</strong> {formatDate(player.created_at)}
                </div>
                <div>
                  <strong>更新日:</strong> {formatDate(player.updated_at)}
                </div>
              </div>
            </div>
          </div>

          {/* 編集モード時のアクションボタン */}
          {isEditing && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
              <div className="flex space-x-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? '保存中...' : '✅ 保存'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setEditData(player)
                    setError(null)
                  }}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  キャンセル
                </button>
              </div>

              {canEdit && (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  🗑️ 削除
                </button>
              )}
            </div>
          )}
        </div>

        {/* 削除確認モーダル */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">選手削除の確認</h3>
              <p className="text-gray-700 mb-6">
                「{player.name}」を削除しますか？<br />
                この操作は取り消せません。
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  削除する
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 