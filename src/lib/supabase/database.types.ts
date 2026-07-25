export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_events: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_items: {
        Row: {
          amount: number
          budget_plan_id: string
          category: string | null
          confirmed_by_user: boolean
          created_at: string
          currency: string
          deleted_at: string | null
          document_id: string | null
          due_date: string | null
          expected_date: string | null
          id: string
          is_recurring: boolean
          item_type: Database["public"]["Enums"]["budget_item_type"]
          recurrence_parent_id: string | null
          recurrence_rule: string | null
          source: Database["public"]["Enums"]["budget_item_source"]
          status: Database["public"]["Enums"]["budget_item_status"]
          task_id: string | null
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          amount: number
          budget_plan_id: string
          category?: string | null
          confirmed_by_user?: boolean
          created_at?: string
          currency?: string
          deleted_at?: string | null
          document_id?: string | null
          due_date?: string | null
          expected_date?: string | null
          id?: string
          is_recurring?: boolean
          item_type: Database["public"]["Enums"]["budget_item_type"]
          recurrence_parent_id?: string | null
          recurrence_rule?: string | null
          source?: Database["public"]["Enums"]["budget_item_source"]
          status?: Database["public"]["Enums"]["budget_item_status"]
          task_id?: string | null
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          amount?: number
          budget_plan_id?: string
          category?: string | null
          confirmed_by_user?: boolean
          created_at?: string
          currency?: string
          deleted_at?: string | null
          document_id?: string | null
          due_date?: string | null
          expected_date?: string | null
          id?: string
          is_recurring?: boolean
          item_type?: Database["public"]["Enums"]["budget_item_type"]
          recurrence_parent_id?: string | null
          recurrence_rule?: string | null
          source?: Database["public"]["Enums"]["budget_item_source"]
          status?: Database["public"]["Enums"]["budget_item_status"]
          task_id?: string | null
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_budget_plan_id_fkey"
            columns: ["budget_plan_id"]
            isOneToOne: false
            referencedRelation: "budget_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_items_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_items_recurrence_parent_id_fkey"
            columns: ["recurrence_parent_id"]
            isOneToOne: false
            referencedRelation: "recurring_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_items_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_items_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_plans: {
        Row: {
          created_at: string
          currency: string
          data_completeness: Json | null
          expected_expenses: number
          expected_income: number
          id: string
          month: string
          opening_balance: number | null
          projected_balance: number | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          data_completeness?: Json | null
          expected_expenses?: number
          expected_income?: number
          id?: string
          month: string
          opening_balance?: number | null
          projected_balance?: number | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          data_completeness?: Json | null
          expected_expenses?: number
          expected_income?: number
          id?: string
          month?: string
          opening_balance?: number | null
          projected_balance?: number | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_plans_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      document_analyses: {
        Row: {
          analysis_version: number
          classification_result: Json | null
          completed_at: string | null
          created_at: string
          document_id: string
          error_code: string | null
          error_message: string | null
          explanation_result: Json | null
          extraction_result: Json | null
          id: string
          model: string | null
          prompt_version: string | null
          provider: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["analysis_status"]
          validation_result: Json | null
          workspace_id: string
        }
        Insert: {
          analysis_version?: number
          classification_result?: Json | null
          completed_at?: string | null
          created_at?: string
          document_id: string
          error_code?: string | null
          error_message?: string | null
          explanation_result?: Json | null
          extraction_result?: Json | null
          id?: string
          model?: string | null
          prompt_version?: string | null
          provider?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["analysis_status"]
          validation_result?: Json | null
          workspace_id: string
        }
        Update: {
          analysis_version?: number
          classification_result?: Json | null
          completed_at?: string | null
          created_at?: string
          document_id?: string
          error_code?: string | null
          error_message?: string | null
          explanation_result?: Json | null
          extraction_result?: Json | null
          id?: string
          model?: string | null
          prompt_version?: string | null
          provider?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["analysis_status"]
          validation_result?: Json | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_analyses_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_analyses_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      document_entities: {
        Row: {
          bounding_box: Json | null
          confidence: number | null
          confirmed_by_user: boolean
          corrected_value: string | null
          created_at: string
          document_id: string
          entity_type: string
          id: string
          page_number: number | null
          source_text: string | null
          updated_at: string
          value_json: Json | null
          value_text: string | null
          workspace_id: string
        }
        Insert: {
          bounding_box?: Json | null
          confidence?: number | null
          confirmed_by_user?: boolean
          corrected_value?: string | null
          created_at?: string
          document_id: string
          entity_type: string
          id?: string
          page_number?: number | null
          source_text?: string | null
          updated_at?: string
          value_json?: Json | null
          value_text?: string | null
          workspace_id: string
        }
        Update: {
          bounding_box?: Json | null
          confidence?: number | null
          confirmed_by_user?: boolean
          corrected_value?: string | null
          created_at?: string
          document_id?: string
          entity_type?: string
          id?: string
          page_number?: number | null
          source_text?: string | null
          updated_at?: string
          value_json?: Json | null
          value_text?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_entities_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_entities_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      document_pages: {
        Row: {
          created_at: string
          document_id: string
          extracted_text: string | null
          extraction_metadata: Json | null
          id: string
          image_storage_path: string | null
          page_number: number
          quality_score: number | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          document_id: string
          extracted_text?: string | null
          extraction_metadata?: Json | null
          id?: string
          image_storage_path?: string | null
          page_number: number
          quality_score?: number | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          document_id?: string
          extracted_text?: string | null
          extraction_metadata?: Json | null
          id?: string
          image_storage_path?: string | null
          page_number?: number
          quality_score?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_pages_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_pages_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      document_questions: {
        Row: {
          answer: string | null
          cited_entities: Json | null
          cited_pages: Json | null
          created_at: string
          document_id: string
          id: string
          model: string | null
          provider: string | null
          question: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          answer?: string | null
          cited_entities?: Json | null
          cited_pages?: Json | null
          created_at?: string
          document_id: string
          id?: string
          model?: string | null
          provider?: string | null
          question: string
          user_id: string
          workspace_id: string
        }
        Update: {
          answer?: string | null
          cited_entities?: Json | null
          cited_pages?: Json | null
          created_at?: string
          document_id?: string
          id?: string
          model?: string | null
          provider?: string | null
          question?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_questions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_questions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_questions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          analysis_confidence: number | null
          category: string | null
          completed_at: string | null
          contains_financial_impact: boolean | null
          created_at: string
          deleted_at: string | null
          detected_language: string | null
          document_date: string | null
          file_hash: string | null
          file_size: number | null
          id: string
          mime_type: string | null
          original_filename: string | null
          page_count: number
          recipient_name: string | null
          requires_action: boolean | null
          sender_name: string | null
          status: Database["public"]["Enums"]["document_status"]
          storage_path: string | null
          subcategory: string | null
          title: string | null
          updated_at: string
          uploaded_by: string
          user_confirmed_at: string | null
          workspace_id: string
        }
        Insert: {
          analysis_confidence?: number | null
          category?: string | null
          completed_at?: string | null
          contains_financial_impact?: boolean | null
          created_at?: string
          deleted_at?: string | null
          detected_language?: string | null
          document_date?: string | null
          file_hash?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          original_filename?: string | null
          page_count?: number
          recipient_name?: string | null
          requires_action?: boolean | null
          sender_name?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          storage_path?: string | null
          subcategory?: string | null
          title?: string | null
          updated_at?: string
          uploaded_by: string
          user_confirmed_at?: string | null
          workspace_id: string
        }
        Update: {
          analysis_confidence?: number | null
          category?: string | null
          completed_at?: string | null
          contains_financial_impact?: boolean | null
          created_at?: string
          deleted_at?: string | null
          detected_language?: string | null
          document_date?: string | null
          file_hash?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          original_filename?: string | null
          page_count?: number
          recipient_name?: string | null
          requires_action?: boolean | null
          sender_name?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          storage_path?: string | null
          subcategory?: string | null
          title?: string | null
          updated_at?: string
          uploaded_by?: string
          user_confirmed_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string | null
          read_at: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          type: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          read_at?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          type: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          read_at?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          type?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_items: {
        Row: {
          active: boolean
          amount: number
          category: string | null
          created_at: string
          currency: string
          day_of_month: number | null
          ends_on: string | null
          frequency: Database["public"]["Enums"]["recurrence_frequency"]
          id: string
          item_type: Database["public"]["Enums"]["budget_item_type"]
          source_document_id: string | null
          starts_on: string | null
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          active?: boolean
          amount: number
          category?: string | null
          created_at?: string
          currency?: string
          day_of_month?: number | null
          ends_on?: string | null
          frequency?: Database["public"]["Enums"]["recurrence_frequency"]
          id?: string
          item_type: Database["public"]["Enums"]["budget_item_type"]
          source_document_id?: string | null
          starts_on?: string | null
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          active?: boolean
          amount?: number
          category?: string | null
          created_at?: string
          currency?: string
          day_of_month?: number | null
          ends_on?: string | null
          frequency?: Database["public"]["Enums"]["recurrence_frequency"]
          id?: string
          item_type?: Database["public"]["Enums"]["budget_item_type"]
          source_document_id?: string | null
          starts_on?: string | null
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_items_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_items_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          channel: Database["public"]["Enums"]["reminder_channel"]
          created_at: string
          failure_reason: string | null
          id: string
          retry_count: number
          scheduled_at: string
          sent_at: string | null
          status: Database["public"]["Enums"]["reminder_status"]
          task_id: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          channel?: Database["public"]["Enums"]["reminder_channel"]
          created_at?: string
          failure_reason?: string | null
          id?: string
          retry_count?: number
          scheduled_at: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["reminder_status"]
          task_id: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["reminder_channel"]
          created_at?: string
          failure_reason?: string | null
          id?: string
          retry_count?: number
          scheduled_at?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["reminder_status"]
          task_id?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          action_type: Database["public"]["Enums"]["task_action_type"]
          amount: number | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          document_id: string | null
          due_at: string | null
          id: string
          priority: Database["public"]["Enums"]["task_priority"]
          source: Database["public"]["Enums"]["task_source"]
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          action_type?: Database["public"]["Enums"]["task_action_type"]
          amount?: number | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          document_id?: string | null
          due_at?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          source?: Database["public"]["Enums"]["task_source"]
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          action_type?: Database["public"]["Enums"]["task_action_type"]
          amount?: number | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          document_id?: string | null
          due_at?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          source?: Database["public"]["Enums"]["task_source"]
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          currency: string
          deleted_at: string | null
          display_name: string | null
          email: string
          email_reminders_enabled: boolean
          explanation_mode: Database["public"]["Enums"]["explanation_mode"]
          id: string
          preferred_language: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          deleted_at?: string | null
          display_name?: string | null
          email: string
          email_reminders_enabled?: boolean
          explanation_mode?: Database["public"]["Enums"]["explanation_mode"]
          id: string
          preferred_language?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          deleted_at?: string | null
          display_name?: string | null
          email?: string
          email_reminders_enabled?: boolean
          explanation_mode?: Database["public"]["Enums"]["explanation_mode"]
          id?: string
          preferred_language?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      workspace_members: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["workspace_role"]
          status: Database["public"]["Enums"]["member_status"]
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          status?: Database["public"]["Enums"]["member_status"]
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          status?: Database["public"]["Enums"]["member_status"]
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          id: string
          name: string
          type: Database["public"]["Enums"]["workspace_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          type?: Database["public"]["Enums"]["workspace_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["workspace_type"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      confirm_document: {
        Args: {
          p_document_id: string
          p_category: string
          p_amount?: string | null
          p_due_date?: string | null
          p_budget_action?: string
          p_budget_item_id?: string | null
          p_mark_done?: boolean
        }
        Returns: undefined
      }
      ensure_budget_plan: {
        Args: { p_month: string }
        Returns: string
      }
      queue_archive_analyse: {
        Args: { p_msg_id: number }
        Returns: boolean
      }
      queue_read_analyse: {
        Args: { batch?: number; vt?: number }
        Returns: {
          msg_id: number
          read_ct: number
          message: Json
        }[]
      }
      retry_document_analysis: {
        Args: { p_document_id: string }
        Returns: undefined
      }
    }
    Enums: {
      analysis_status:
        | "pending"
        | "preprocessing"
        | "text_extraction"
        | "classification"
        | "structured_extraction"
        | "validation"
        | "explanation_generation"
        | "completed"
        | "failed"
      budget_item_source: "manual" | "document"
      budget_item_status:
        | "planned"
        | "due"
        | "paid"
        | "received"
        | "postponed"
        | "cancelled"
      budget_item_type: "income" | "expense"
      document_status:
        | "uploaded"
        | "processing"
        | "ready_for_review"
        | "confirmed"
        | "action_open"
        | "completed"
        | "archived"
        | "failed"
      explanation_mode: "normal" | "simple"
      member_status: "active" | "invited" | "removed"
      recurrence_frequency:
        | "weekly"
        | "monthly"
        | "quarterly"
        | "semiannual"
        | "yearly"
      reminder_channel: "in_app" | "email"
      reminder_status: "scheduled" | "sent" | "failed" | "cancelled"
      task_action_type:
        | "pay"
        | "check"
        | "respond"
        | "call"
        | "fill_form"
        | "send_documents"
        | "schedule_appointment"
        | "file"
        | "other"
      task_priority: "low" | "medium" | "high" | "critical"
      task_source: "manual" | "document"
      task_status:
        | "open"
        | "in_progress"
        | "waiting"
        | "completed"
        | "not_required"
        | "overdue"
      workspace_role:
        | "owner"
        | "member"
        | "advisor"
        | "case_manager"
        | "organization_admin"
      workspace_type: "personal" | "organization"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      analysis_status: [
        "pending",
        "preprocessing",
        "text_extraction",
        "classification",
        "structured_extraction",
        "validation",
        "explanation_generation",
        "completed",
        "failed",
      ],
      budget_item_source: ["manual", "document"],
      budget_item_status: [
        "planned",
        "due",
        "paid",
        "received",
        "postponed",
        "cancelled",
      ],
      budget_item_type: ["income", "expense"],
      document_status: [
        "uploaded",
        "processing",
        "ready_for_review",
        "confirmed",
        "action_open",
        "completed",
        "archived",
        "failed",
      ],
      explanation_mode: ["normal", "simple"],
      member_status: ["active", "invited", "removed"],
      recurrence_frequency: [
        "weekly",
        "monthly",
        "quarterly",
        "semiannual",
        "yearly",
      ],
      reminder_channel: ["in_app", "email"],
      reminder_status: ["scheduled", "sent", "failed", "cancelled"],
      task_action_type: [
        "pay",
        "check",
        "respond",
        "call",
        "fill_form",
        "send_documents",
        "schedule_appointment",
        "file",
        "other",
      ],
      task_priority: ["low", "medium", "high", "critical"],
      task_source: ["manual", "document"],
      task_status: [
        "open",
        "in_progress",
        "waiting",
        "completed",
        "not_required",
        "overdue",
      ],
      workspace_role: [
        "owner",
        "member",
        "advisor",
        "case_manager",
        "organization_admin",
      ],
      workspace_type: ["personal", "organization"],
    },
  },
} as const
