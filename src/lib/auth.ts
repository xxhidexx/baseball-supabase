import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

// 🔥 型定義: ユーザー情報の型安全性
type AuthUser = Database['public']['Tables']['users']['Row']
type SafeUser = {
  id: string
  username: string | null
  email: string | null
  is_admin: boolean
}

// 🔥 キャッシュされた認証ヘルパー - セキュアな実装
export const getCurrentUser = cache(async (): Promise<SafeUser | null> => {
  try {
    const supabase = createServerSupabaseClient()
    
    // Supabase認証からユーザー取得
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    // プロフィール情報を安全に取得
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, username, email, is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      // 認証ユーザーは存在するが、プロフィールがない場合の安全な対処
      return {
        id: user.id,
        username: null,
        email: user.email || null,
        is_admin: false
      }
    }

    // 🔥 セキュリティ: 最小限の情報のみ返却（DTO pattern）
    return {
      id: profile.id,
      username: profile.username,
      email: profile.email,
      is_admin: profile.is_admin
    }
  } catch (error) {
    console.error('認証エラー:', error)
    return null
  }
})

// 🔥 管理者権限チェック
export const isAdmin = cache(async (): Promise<boolean> => {
  const user = await getCurrentUser()
  return user?.is_admin === true
})

// 🔥 認証済みチェック
export const isAuthenticated = cache(async (): Promise<boolean> => {
  const user = await getCurrentUser()
  return user !== null
})

// 🔥 セキュアなユーザーID取得
export const getCurrentUserId = cache(async (): Promise<string | null> => {
  const user = await getCurrentUser()
  return user?.id || null
})

// 🔥 セキュアなユーザー情報取得（権限チェック付き）
export const getUserDTO = cache(async (userId: string): Promise<SafeUser | null> => {
  try {
    const currentUser = await getCurrentUser()
    
    // 本人または管理者のみアクセス可能
    if (!currentUser || (currentUser.id !== userId && !currentUser.is_admin)) {
      return null
    }

    const supabase = createServerSupabaseClient()
    const { data: profile, error } = await supabase
      .from('users')
      .select('id, username, email, is_admin')
      .eq('id', userId)
      .single()

    if (error || !profile) {
      return null
    }

    return {
      id: profile.id,
      username: profile.username,
      email: profile.email,
      is_admin: profile.is_admin
    }
  } catch (error) {
    console.error('ユーザー取得エラー:', error)
    return null
  }
}) 