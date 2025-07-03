'use client'

import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

export default function HomePage() {
  const { 
    loading, 
    isAuthenticated, 
    username, 
    email, 
    isAdmin, 
    signOut,
    error,
    isDevelopmentMode
  } = useAuth()

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      alert(`ログアウトエラー: ${error}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">認証状態を確認中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                ⚾ 野球選手データベース
              </h1>
              <p className="text-gray-600">
                アマチュア野球選手の情報管理システム
              </p>
              {isDevelopmentMode && (
                <div className="mt-2 p-2 bg-yellow-100 rounded-md">
                  <p className="text-sm text-yellow-800">
                    🔧 <strong>開発モード</strong>: Supabaseプロジェクトが未設定です
                  </p>
                </div>
              )}
            </div>
            
            {isAuthenticated() && (
              <div className="flex items-center space-x-4">
                {/* 🔥 型定義の威力: username, email, isAdminの型が保証されている */}
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {username}
                    {isAdmin() && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        管理者
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">{email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  ログアウト
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">


        {/* 🔧 開発モード用エラー表示 */}
        {error && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  開発環境セットアップが必要
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>{error}</p>
                  <p className="mt-2">
                    このデモでは型定義の威力を体験できます：
                  </p>
                  <ul className="mt-1 list-disc list-inside">
                    <li>TypeScriptによる型安全性</li>
                    <li>自動補完機能</li>
                    <li>コンパイル時エラー検出</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isAuthenticated() ? (
          /* 未ログイン時 */
          <div className="text-center">
            <div className="mx-auto max-w-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ようこそ！
              </h2>
              <p className="text-gray-600 mb-8">
                野球選手の情報を管理・検索できるシステムです。
                {isDevelopmentMode ? 
                  'デモでは型定義の威力を体験できます。' : 
                  'ご利用にはログインが必要です。'
                }
              </p>
              {!isDevelopmentMode && (
                <Link
                  href="/login"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  ログイン / 新規登録
                </Link>
              )}
            </div>
          </div>
        ) : (
          /* ログイン時 */
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ダッシュボード
              </h2>
              
              {/* 🔥 型定義の威力: Database型を活用した型安全な表示 */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* 選手一覧カード */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-blue-900 mb-2">
                        選手一覧
                      </h3>
                      <p className="text-blue-700 text-sm mb-4">
                        登録された選手情報を閲覧・管理
                      </p>
                      <Link
                        href="/players"
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                      >
                        選手一覧を見る
                      </Link>
                    </div>

                    {/* 選手追加カード */}
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-green-900 mb-2">
                        選手追加
                      </h3>
                      <p className="text-green-700 text-sm mb-4">
                        新しい選手情報を登録
                      </p>
                      <Link
                        href="/players/add"
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                      >
                        選手を追加
                      </Link>
                    </div>

                    {/* 管理者専用機能 */}
                    {isAdmin() && (
                      <div className="bg-red-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-red-900 mb-2">
                          管理者機能
                        </h3>
                        <p className="text-red-700 text-sm mb-4">
                          システム管理・ユーザー管理
                        </p>
                        <Link
                          href="/admin"
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                        >
                          管理画面
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 最近の活動 */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  最近の活動
                </h3>
                <div className="text-gray-500 text-sm">
                  <p>ここに最近の選手追加・更新履歴などが表示されます</p>
                  <p className="mt-2">
                    Database型定義により、型安全な実装が可能になります 🎉
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}


      </main>
    </div>
  )
}
