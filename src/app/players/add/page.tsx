'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

// 🔥 型定義の威力: Insert型で必須フィールドが明確
type PlayerInsert = Database['public']['Tables']['players']['Insert']

export default function AddPlayerPage() {
  const router = useRouter()
  const { isAuthenticated, userId, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 🔥 型定義の威力: フォーム状態もInsert型に準拠
  const [formData, setFormData] = useState<Omit<PlayerInsert, 'user_id' | 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    position: '',
    position_detail: '',
    affiliation_type: '',
    affiliation_name: '',
    draft_year: null,
    height: '',
    weight: '',
    notes: ''
  })

  const supabase = createBrowserSupabaseClient()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!userId) {
      setError('ユーザーIDが取得できませんでした')
      return
    }

    if (!formData.name.trim()) {
      setError('選手名は必須です')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // 🔥 型定義の威力: Insert型で型安全なデータ作成
      const playerData: PlayerInsert = {
        ...formData,
        user_id: userId,
        // 空文字をnullに変換（Supabaseの要求に合わせて）
        position: formData.position || null,
        position_detail: formData.position_detail || null,
        affiliation_type: formData.affiliation_type || null,
        affiliation_name: formData.affiliation_name || null,
        height: formData.height || null,
        weight: formData.weight || null,
        notes: formData.notes || null
      }

      const { error: insertError } = await supabase
        .from('players')
        .insert(playerData)

      if (insertError) {
        setError(`登録エラー: ${insertError.message}`)
        return
      }

      // 成功時は選手一覧ページへリダイレクト
      router.push('/players')
      
    } catch (err) {
      setError(`予期しないエラー: ${err instanceof Error ? err.message : '不明なエラー'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

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

  if (!isAuthenticated()) {
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">➕ 新規選手登録</h1>
              <p className="mt-1 text-sm text-gray-500">
                選手の基本情報を入力してください
              </p>
            </div>
            <Link
              href="/players"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← 一覧に戻る
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* エラー表示 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-800">
                  <strong>エラー:</strong> {error}
                </div>
              </div>
            )}

            {/* 基本情報 */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">基本情報</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  選手名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="田中太郎"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ポジション
                  </label>
                  <select
                    value={formData.position || ''}
                    onChange={(e) => handleInputChange('position', e.target.value)}
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ポジション詳細
                  </label>
                  <input
                    type="text"
                    value={formData.position_detail || ''}
                    onChange={(e) => handleInputChange('position_detail', e.target.value)}
                    placeholder="右投右打、サブマリン等"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* 所属情報 */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">所属情報</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    所属タイプ
                  </label>
                  <select
                    value={formData.affiliation_type || ''}
                    onChange={(e) => handleInputChange('affiliation_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">選択してください</option>
                    <option value="大学">大学</option>
                    <option value="社会人">社会人</option>
                    <option value="高校">高校</option>
                    <option value="独立リーグ">独立リーグ</option>
                    <option value="その他">その他</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    所属名
                  </label>
                  <input
                    type="text"
                    value={formData.affiliation_name || ''}
                    onChange={(e) => handleInputChange('affiliation_name', e.target.value)}
                    placeholder="東京大学、○○会社等"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ドラフト年
                </label>
                <input
                  type="number"
                  value={formData.draft_year || ''}
                  onChange={(e) => handleInputChange('draft_year', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="2024"
                  min="1950"
                  max="2030"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* 身体情報 */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900">身体情報</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    身長
                  </label>
                  <input
                    type="text"
                    value={formData.height || ''}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    placeholder="180cm"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    体重
                  </label>
                  <input
                    type="text"
                    value={formData.weight || ''}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    placeholder="75kg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* 備考 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                備考・特記事項
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="特徴、実績、将来性など..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* 送信ボタン */}
            <div className="flex justify-end space-x-4">
              <Link
                href="/players"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {loading ? '登録中...' : '選手を登録'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 