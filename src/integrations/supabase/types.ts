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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      game_packages: {
        Row: {
          amount: number
          created_at: string
          emoji: string | null
          game_id: string
          id: string
          label: string
          popular: boolean
          price: number
        }
        Insert: {
          amount: number
          created_at?: string
          emoji?: string | null
          game_id: string
          id?: string
          label: string
          popular?: boolean
          price: number
        }
        Update: {
          amount?: number
          created_at?: string
          emoji?: string | null
          game_id?: string
          id?: string
          label?: string
          popular?: boolean
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "game_packages_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          active: boolean
          color: string | null
          created_at: string
          currency: string
          id: string
          image: string | null
          name: string
          slug: string
        }
        Insert: {
          active?: boolean
          color?: string | null
          created_at?: string
          currency?: string
          id?: string
          image?: string | null
          name: string
          slug: string
        }
        Update: {
          active?: boolean
          color?: string | null
          created_at?: string
          currency?: string
          id?: string
          image?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      gift_card_orders: {
        Row: {
          card_type: string
          created_at: string
          id: string
          order_id: string
          personal_message: string | null
          recipient_name: string
          recipient_whatsapp: string
        }
        Insert: {
          card_type: string
          created_at?: string
          id?: string
          order_id: string
          personal_message?: string | null
          recipient_name: string
          recipient_whatsapp: string
        }
        Update: {
          card_type?: string
          created_at?: string
          id?: string
          order_id?: string
          personal_message?: string | null
          recipient_name?: string
          recipient_whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_card_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_banners: {
        Row: {
          active: boolean
          created_at: string
          display_order: number
          id: string
          image_url: string
          subtitle: string
          title: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          subtitle?: string
          title?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          subtitle?: string
          title?: string
        }
        Relationships: []
      }
      order_proofs: {
        Row: {
          created_at: string
          game_name: string | null
          id: string
          order_tracking_id: string
          proof_url: string
          user_id: string
          visible: boolean
        }
        Insert: {
          created_at?: string
          game_name?: string | null
          id?: string
          order_tracking_id: string
          proof_url: string
          user_id: string
          visible?: boolean
        }
        Update: {
          created_at?: string
          game_name?: string | null
          id?: string
          order_tracking_id?: string
          proof_url?: string
          user_id?: string
          visible?: boolean
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          game_id: string | null
          id: string
          order_type: string
          package_id: string | null
          payment_method_id: string | null
          player_id: string
          player_name: string | null
          promo_code_id: string | null
          screenshot_url: string | null
          status: string
          total_price: number
          tracking_id: string
          transaction_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          game_id?: string | null
          id?: string
          order_type?: string
          package_id?: string | null
          payment_method_id?: string | null
          player_id: string
          player_name?: string | null
          promo_code_id?: string | null
          screenshot_url?: string | null
          status?: string
          total_price: number
          tracking_id: string
          transaction_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          game_id?: string | null
          id?: string
          order_type?: string
          package_id?: string | null
          payment_method_id?: string | null
          player_id?: string
          player_name?: string | null
          promo_code_id?: string | null
          screenshot_url?: string | null
          status?: string
          total_price?: number
          tracking_id?: string
          transaction_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "game_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      ott_plans: {
        Row: {
          created_at: string
          duration: string
          emoji: string | null
          id: string
          label: string
          platform_id: string
          popular: boolean
          price: number
        }
        Insert: {
          created_at?: string
          duration?: string
          emoji?: string | null
          id?: string
          label: string
          platform_id: string
          popular?: boolean
          price: number
        }
        Update: {
          created_at?: string
          duration?: string
          emoji?: string | null
          id?: string
          label?: string
          platform_id?: string
          popular?: boolean
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "ott_plans_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "ott_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      ott_platforms: {
        Row: {
          active: boolean
          color: string | null
          created_at: string
          description: string | null
          id: string
          image: string | null
          name: string
          slug: string
        }
        Insert: {
          active?: boolean
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name: string
          slug: string
        }
        Update: {
          active?: boolean
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          active: boolean
          created_at: string
          icon_url: string | null
          id: string
          name: string
          qr_image_url: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          icon_url?: string | null
          id?: string
          name: string
          qr_image_url?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          icon_url?: string | null
          id?: string
          name?: string
          qr_image_url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          active: boolean
          code: string
          created_at: string
          expires_at: string | null
          id: string
          type: string
          value: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          type: string
          value: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          type?: string
          value?: number
        }
        Relationships: []
      }
      rewards: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          title: string
          xp_cost: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          title: string
          xp_cost: number
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          xp_cost?: number
        }
        Relationships: []
      }
      social_profiles: {
        Row: {
          active: boolean
          created_at: string
          id: string
          label: string | null
          platform: string
          url: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          label?: string | null
          platform: string
          url: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          label?: string | null
          platform?: string
          url?: string
        }
        Relationships: []
      }
      steam_accounts: {
        Row: {
          created_at: string
          description: string | null
          details: string | null
          id: string
          image_url: string | null
          price: number
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          details?: string | null
          id?: string
          image_url?: string | null
          price: number
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          details?: string | null
          id?: string
          image_url?: string | null
          price?: number
          status?: string
          title?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          created_at: string
          id: string
          message: string
          order_id: string | null
          status: string
          subject: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          order_id?: string | null
          status?: string
          subject: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          order_id?: string | null
          status?: string
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_xp: {
        Row: {
          id: string
          total_earned: number
          updated_at: string
          user_id: string
          xp_points: number
        }
        Insert: {
          id?: string
          total_earned?: number
          updated_at?: string
          user_id: string
          xp_points?: number
        }
        Update: {
          id?: string
          total_earned?: number
          updated_at?: string
          user_id?: string
          xp_points?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_tracking_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
