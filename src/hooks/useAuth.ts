'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { createBrowserSupabaseClient } from '@/lib/supabase'

// 🔥 基本的な認証状態管理
type AuthState = {
  user: User | null
  loading: boolean
  error: string | null
}

// 🔧 開発用：環境変数チェック
const isDevelopmentMode = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('your-project-id') || 
         !process.env.NEXT_PUBLIC_SUPABASE_URL ||
         !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    // 🔧 開発用：Supabase未設定時のフォールバック
    if (isDevelopmentMode()) {
      console.warn('🔧 開発モード: Supabase環境変数が設定されていません')
      setAuthState({
        user: null,
        loading: false,
        error: 'Supabase環境変数が設定されていません。.env.localを設定してください。'
      })
      return
    }

    const supabase = createBrowserSupabaseClient()

    // 🔥 初期認証状態取得
    const getInitialSession = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error('認証取得エラー:', error.message)
          setAuthState({
            user: null,
            loading: false,
            error: `認証エラー: ${error.message}`
          })
          return
        }

        setAuthState({
          user,
          loading: false,
          error: null
        })
      } catch (err) {
        console.error('認証初期化エラー:', err)
        setAuthState({
          user: null,
          loading: false,
          error: err instanceof Error ? `認証エラー: ${err.message}` : '認証で予期しないエラーが発生しました'
        })
      }
    }

    getInitialSession()

    // 🔥 認証状態変更の監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('認証状態変更:', event)

        setAuthState({
          user: session?.user || null,
          loading: false,
          error: null
        })
      }
    )

    return () => {
      try {
        subscription?.unsubscribe()
      } catch (err) {
        console.error('認証監視解除エラー:', err)
      }
    }
  }, [])

  // 🔥 ログアウト関数
  const signOut = async (): Promise<{ error: string | null }> => {
    if (isDevelopmentMode()) {
      return { error: 'Supabase未設定のため、ログアウトできません' }
    }

    try {
      const supabase = createBrowserSupabaseClient()
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('ログアウトエラー:', error.message)
        return { error: `ログアウトエラー: ${error.message}` }
      }
      
      return { error: null }
    } catch (err) {
      console.error('ログアウト処理エラー:', err)
      return { 
        error: err instanceof Error ? `ログアウトエラー: ${err.message}` : 'ログアウトで予期しないエラーが発生しました'
      }
    }
  }

  // 🔥 基本的な認証チェック
  const isAuthenticated = (): boolean => {
    return authState.user !== null
  }

  const isAdmin = (): boolean => {
    // 一時的に管理者機能を無効化
    return false
  }

  return {
    // 🔥 認証状態
    ...authState,
    
    // 🔥 認証関数
    signOut,
    isAuthenticated,
    isAdmin,
    
    // 🔥 便利なヘルパー
    userId: authState.user?.id || null,
    username: authState.user?.email?.split('@')[0] || null,
    email: authState.user?.email || null,
    
    // 🔧 開発用
    isDevelopmentMode: isDevelopmentMode(),
  }
}