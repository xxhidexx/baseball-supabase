'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

// 🎯 型定義の威力を体験！
type AuthError = {
  message: string
  details?: string
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)
  const router = useRouter()
  
  const supabase = createBrowserSupabaseClient()

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 🔥 型定義の威力1: signInWithPasswordの返り値型が明確
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError({
          message: 'ログインに失敗しました',
          details: authError.message
        })
        return
      }

      // 🔥 型定義の威力2: data.userの型が自動的に推論される
      if (data.user) {
        console.log('ログイン成功:', data.user.id)
        router.push('/')
      }
    } catch (err) {
      setError({
        message: '予期しないエラーが発生しました',
        details: err instanceof Error ? err.message : '不明なエラー'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async () => {
    if (!email || !password) {
      setError({ message: 'メールアドレスとパスワードを入力してください' })
      return
    }

    setLoading(true)
    try {
      // 🔥 型定義の威力5: signUpの型も明確
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (signUpError) {
        setError({
          message: 'アカウント作成に失敗しました',
          details: signUpError.message
        })
        return
      }

      if (data.user) {
        // 🔥 型定義の威力6: Insert型を使った安全なデータ挿入
        const userInsertData: Database['public']['Tables']['users']['Insert'] = {
          id: data.user.id,
          username: email.split('@')[0], // メールアドレスからユーザー名生成
          email: email,
          is_admin: false
          // created_at は省略可（DEFAULT NOW()）
        }

        const { error: insertError } = await supabase
          .from('users')
          .insert(userInsertData)

        if (insertError) {
          console.error('ユーザープロフィール作成失敗:', insertError)
        }

        alert('アカウントが作成されました！確認メールをチェックしてください。')
      }
    } catch (err) {
      setError({
        message: 'アカウント作成中にエラーが発生しました',
        details: err instanceof Error ? err.message : '不明なエラー'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            野球選手データベース
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            アカウントにログインまたは新規作成
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="text-sm text-red-800">
                <strong>{error.message}</strong>
                {error.details && (
                  <div className="mt-1 text-xs text-red-600">
                    詳細: {error.details}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
            
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              新規作成
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 