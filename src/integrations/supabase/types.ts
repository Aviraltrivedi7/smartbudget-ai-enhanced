export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          preferred_language: string | null
          currency: string | null
          avatar_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          preferred_language?: string | null
          currency?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          preferred_language?: string | null
          currency?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string | null
          name: string
          icon: string | null
          color: string | null
          type: 'income' | 'expense'
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          icon?: string | null
          color?: string | null
          type: 'income' | 'expense'
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          icon?: string | null
          color?: string | null
          type?: 'income' | 'expense'
          created_at?: string | null
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          title: string
          amount: number
          category_id: string | null
          category_name: string | null
          transaction_type: 'income' | 'expense'
          date: string
          description: string | null
          location: string | null
          receipt_url: string | null
          tags: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          amount: number
          category_id?: string | null
          category_name?: string | null
          transaction_type: 'income' | 'expense'
          date?: string
          description?: string | null
          location?: string | null
          receipt_url?: string | null
          tags?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          amount?: number
          category_id?: string | null
          category_name?: string | null
          transaction_type?: 'income' | 'expense'
          date?: string
          description?: string | null
          location?: string | null
          receipt_url?: string | null
          tags?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          name: string
          amount: number
          period: 'monthly' | 'weekly' | 'yearly'
          start_date: string
          end_date: string | null
          alert_percentage: number | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          name: string
          amount: number
          period?: 'monthly' | 'weekly' | 'yearly'
          start_date?: string
          end_date?: string | null
          alert_percentage?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          name?: string
          amount?: number
          period?: 'monthly' | 'weekly' | 'yearly'
          start_date?: string
          end_date?: string | null
          alert_percentage?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      savings_goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          target_amount: number
          current_amount: number | null
          target_date: string | null
          priority: number | null
          is_completed: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          target_amount: number
          current_amount?: number | null
          target_date?: string | null
          priority?: number | null
          is_completed?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          target_amount?: number
          current_amount?: number | null
          target_date?: string | null
          priority?: number | null
          is_completed?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      bill_reminders: {
        Row: {
          id: string
          user_id: string
          title: string
          amount: number
          due_date: string
          recurring_type: 'none' | 'weekly' | 'monthly' | 'yearly'
          category_id: string | null
          is_paid: boolean | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          amount: number
          due_date: string
          recurring_type?: 'none' | 'weekly' | 'monthly' | 'yearly'
          category_id?: string | null
          is_paid?: boolean | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          amount?: number
          due_date?: string
          recurring_type?: 'none' | 'weekly' | 'monthly' | 'yearly'
          category_id?: string | null
          is_paid?: boolean | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_type: string
          title: string
          description: string | null
          points: number | null
          unlocked_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          achievement_type: string
          title: string
          description?: string | null
          points?: number | null
          unlocked_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          achievement_type?: string
          title?: string
          description?: string | null
          points?: number | null
          unlocked_at?: string | null
        }
      }
      user_preferences: {
        Row: {
          user_id: string
          theme: string | null
          notifications_enabled: boolean | null
          currency: string | null
          language: string | null
          budget_alerts: boolean | null
          bill_reminders: boolean | null
          weekly_reports: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          user_id: string
          theme?: string | null
          notifications_enabled?: boolean | null
          currency?: string | null
          language?: string | null
          budget_alerts?: boolean | null
          bill_reminders?: boolean | null
          weekly_reports?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          user_id?: string
          theme?: string | null
          notifications_enabled?: boolean | null
          currency?: string | null
          language?: string | null
          budget_alerts?: boolean | null
          bill_reminders?: boolean | null
          weekly_reports?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
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
