import { createBrowserClient, createServerClient } from '@supabase/ssr'

// 🔥 実際のSupabaseプロジェクトから自動生成された型定義！
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      player_stats: {
        Row: {
          at_bats: number | null
          batting_average: number | null
          created_at: string | null
          era: number | null
          games_played: number | null
          hits: number | null
          home_runs: number | null
          id: number
          losses: number | null
          player_id: number
          rbis: number | null
          saves: number | null
          strikeouts: number | null
          updated_at: string | null
          wins: number | null
          year: number
        }
        Insert: {
          at_bats?: number | null
          batting_average?: number | null
          created_at?: string | null
          era?: number | null
          games_played?: number | null
          hits?: number | null
          home_runs?: number | null
          id?: number
          losses?: number | null
          player_id: number
          rbis?: number | null
          saves?: number | null
          strikeouts?: number | null
          updated_at?: string | null
          wins?: number | null
          year: number
        }
        Update: {
          at_bats?: number | null
          batting_average?: number | null
          created_at?: string | null
          era?: number | null
          games_played?: number | null
          hits?: number | null
          home_runs?: number | null
          id?: number
          losses?: number | null
          player_id?: number
          rbis?: number | null
          saves?: number | null
          strikeouts?: number | null
          updated_at?: string | null
          wins?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "player_stats_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_team_history: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: number
          jersey_number: number | null
          player_id: number
          position: string | null
          start_date: string
          team_id: number
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: number
          jersey_number?: number | null
          player_id: number
          position?: string | null
          start_date: string
          team_id: number
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: number
          jersey_number?: number | null
          player_id?: number
          position?: string | null
          start_date?: string
          team_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "player_team_history_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_team_history_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          affiliation_name: string | null
          affiliation_type: string | null
          created_at: string | null
          draft_year: number | null
          height: string | null
          id: number
          name: string
          notes: string | null
          position: string | null
          position_detail: string | null
          updated_at: string | null
          user_id: string
          weight: string | null
        }
        Insert: {
          affiliation_name?: string | null
          affiliation_type?: string | null
          created_at?: string | null
          draft_year?: number | null
          height?: string | null
          id?: number
          name: string
          notes?: string | null
          position?: string | null
          position_detail?: string | null
          updated_at?: string | null
          user_id: string
          weight?: string | null
        }
        Update: {
          affiliation_name?: string | null
          affiliation_type?: string | null
          created_at?: string | null
          draft_year?: number | null
          height?: string | null
          id?: number
          name?: string
          notes?: string | null
          position?: string | null
          position_detail?: string | null
          updated_at?: string | null
          user_id?: string
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          division: string | null
          founded_year: number | null
          home_stadium: string | null
          id: number
          league: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          division?: string | null
          founded_year?: number | null
          home_stadium?: string | null
          id?: number
          league?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          division?: string | null
          founded_year?: number | null
          home_stadium?: string | null
          id?: number
          league?: string | null
          name?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_admin: boolean | null
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_admin?: boolean | null
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_admin?: boolean | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

// 環境変数チェック
function isDevelopmentMode(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !url || !key || url.includes('your-project-url') || key.includes('your-anon-key')
}

// 🌐 クライアントサイド用のSupabaseクライアント
export function createBrowserSupabaseClient() {
  if (isDevelopmentMode()) {
    // 開発モード: ダミーの設定で基本機能のみ提供
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signUp: async () => ({ data: { user: null }, error: new Error('開発モード: Supabase未設定') }),
        signInWithPassword: async () => ({ data: { user: null }, error: new Error('開発モード: Supabase未設定') }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: null } }),
      },
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: null, error: new Error('開発モード: Supabase未設定') }),
        update: () => ({ data: null, error: new Error('開発モード: Supabase未設定') }),
        delete: () => ({ data: null, error: new Error('開発モード: Supabase未設定') }),
      }),
    }
  }

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// 🖥️ サーバーサイド用のSupabaseクライアント
export async function createServerSupabaseClient() {
  const { cookies } = await import('next/headers')
  
  if (isDevelopmentMode()) {
    // 開発モード: ダミーの設定
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
      },
      from: () => ({
        select: () => ({ data: [], error: null }),
      }),
    }
  }

  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component内ではcookie設定が制限される場合がある
          }
        },
      },
    }
  )
}

// デフォルトクライアント（互換性のため）
export const supabase = createBrowserSupabaseClient() 