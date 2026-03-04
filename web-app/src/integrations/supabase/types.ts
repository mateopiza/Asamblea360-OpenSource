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
      asambleas: {
        Row: {
          copropiedad_id: string
          created_at: string
          estado: string
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string
          titulo: string
          updated_at: string
        }
        Insert: {
          copropiedad_id: string
          created_at?: string
          estado?: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          titulo?: string
          updated_at?: string
        }
        Update: {
          copropiedad_id?: string
          created_at?: string
          estado?: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "asambleas_copropiedad_id_fkey"
            columns: ["copropiedad_id"]
            isOneToOne: false
            referencedRelation: "copropiedades"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          accion: string
          copropiedad_id: string | null
          created_at: string
          datos_nuevos: Json | null
          datos_previos: Json | null
          id: string
          registro_id: string | null
          tabla: string
          user_id: string | null
        }
        Insert: {
          accion: string
          copropiedad_id?: string | null
          created_at?: string
          datos_nuevos?: Json | null
          datos_previos?: Json | null
          id?: string
          registro_id?: string | null
          tabla: string
          user_id?: string | null
        }
        Update: {
          accion?: string
          copropiedad_id?: string | null
          created_at?: string
          datos_nuevos?: Json | null
          datos_previos?: Json | null
          id?: string
          registro_id?: string | null
          tabla?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_copropiedad_id_fkey"
            columns: ["copropiedad_id"]
            isOneToOne: false
            referencedRelation: "copropiedades"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations_history: {
        Row: {
          copropiedad_id: string | null
          fecha: string
          id: string
          mensaje_whatsapp: string
          participante_id: string | null
          rol: string
        }
        Insert: {
          copropiedad_id?: string | null
          fecha?: string
          id?: string
          mensaje_whatsapp: string
          participante_id?: string | null
          rol?: string
        }
        Update: {
          copropiedad_id?: string | null
          fecha?: string
          id?: string
          mensaje_whatsapp?: string
          participante_id?: string | null
          rol?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_history_copropiedad_id_fkey"
            columns: ["copropiedad_id"]
            isOneToOne: false
            referencedRelation: "copropiedades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_history_participante_id_fkey"
            columns: ["participante_id"]
            isOneToOne: false
            referencedRelation: "participantes_asamblea"
            referencedColumns: ["id"]
          },
        ]
      }
      copropiedades: {
        Row: {
          created_at: string
          direccion: string | null
          email_contacto: string | null
          id: string
          logo_url: string | null
          nit: string | null
          nombre: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          direccion?: string | null
          email_contacto?: string | null
          id?: string
          logo_url?: string | null
          nit?: string | null
          nombre: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          direccion?: string | null
          email_contacto?: string | null
          id?: string
          logo_url?: string | null
          nit?: string | null
          nombre?: string
          updated_at?: string
        }
        Relationships: []
      }
      delegaciones: {
        Row: {
          asamblea_id: string
          created_at: string
          delegado_a_id: string | null
          documento_url: string | null
          estado: string
          id: string
          participante_id: string
          tipo: string
          updated_at: string
        }
        Insert: {
          asamblea_id: string
          created_at?: string
          delegado_a_id?: string | null
          documento_url?: string | null
          estado?: string
          id?: string
          participante_id: string
          tipo?: string
          updated_at?: string
        }
        Update: {
          asamblea_id?: string
          created_at?: string
          delegado_a_id?: string | null
          documento_url?: string | null
          estado?: string
          id?: string
          participante_id?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delegaciones_asamblea_id_fkey"
            columns: ["asamblea_id"]
            isOneToOne: false
            referencedRelation: "asambleas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delegaciones_delegado_a_id_fkey"
            columns: ["delegado_a_id"]
            isOneToOne: false
            referencedRelation: "participantes_asamblea"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delegaciones_participante_id_fkey"
            columns: ["participante_id"]
            isOneToOne: false
            referencedRelation: "participantes_asamblea"
            referencedColumns: ["id"]
          },
        ]
      }
      participantes_asamblea: {
        Row: {
          acreditado_en: string | null
          asamblea_id: string
          created_at: string
          delegado: boolean | null
          email: string | null
          estado_acreditacion: string
          id: string
          participante_nombre: string
          qr_token: string | null
          telefono: string | null
          unidad_id: string
          updated_at: string
        }
        Insert: {
          acreditado_en?: string | null
          asamblea_id: string
          created_at?: string
          delegado?: boolean | null
          email?: string | null
          estado_acreditacion?: string
          id?: string
          participante_nombre: string
          qr_token?: string | null
          telefono?: string | null
          unidad_id: string
          updated_at?: string
        }
        Update: {
          acreditado_en?: string | null
          asamblea_id?: string
          created_at?: string
          delegado?: boolean | null
          email?: string | null
          estado_acreditacion?: string
          id?: string
          participante_nombre?: string
          qr_token?: string | null
          telefono?: string | null
          unidad_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "participantes_asamblea_asamblea_id_fkey"
            columns: ["asamblea_id"]
            isOneToOne: false
            referencedRelation: "asambleas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participantes_asamblea_unidad_id_fkey"
            columns: ["unidad_id"]
            isOneToOne: false
            referencedRelation: "unidades"
            referencedColumns: ["id"]
          },
        ]
      }
      preguntas: {
        Row: {
          activa: boolean | null
          asamblea_id: string
          created_at: string
          id: string
          tipo_calculo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          activa?: boolean | null
          asamblea_id: string
          created_at?: string
          id?: string
          tipo_calculo?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          activa?: boolean | null
          asamblea_id?: string
          created_at?: string
          id?: string
          tipo_calculo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "preguntas_asamblea_id_fkey"
            columns: ["asamblea_id"]
            isOneToOne: false
            referencedRelation: "asambleas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          onboarding_completed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      registro_votos: {
        Row: {
          fecha_voto: string
          id: string
          opcion: string
          participante_id: string
          pregunta_id: string
        }
        Insert: {
          fecha_voto?: string
          id?: string
          opcion: string
          participante_id: string
          pregunta_id: string
        }
        Update: {
          fecha_voto?: string
          id?: string
          opcion?: string
          participante_id?: string
          pregunta_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registro_votos_participante_id_fkey"
            columns: ["participante_id"]
            isOneToOne: false
            referencedRelation: "participantes_asamblea"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registro_votos_pregunta_id_fkey"
            columns: ["pregunta_id"]
            isOneToOne: false
            referencedRelation: "preguntas"
            referencedColumns: ["id"]
          },
        ]
      }
      resultados_pregunta: {
        Row: {
          id: string
          pregunta_id: string
          resultados: Json | null
          updated_at: string
        }
        Insert: {
          id?: string
          pregunta_id: string
          resultados?: Json | null
          updated_at?: string
        }
        Update: {
          id?: string
          pregunta_id?: string
          resultados?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resultados_pregunta_pregunta_id_fkey"
            columns: ["pregunta_id"]
            isOneToOne: false
            referencedRelation: "preguntas"
            referencedColumns: ["id"]
          },
        ]
      }
      soporte_tickets: {
        Row: {
          copropiedad_id: string | null
          created_at: string
          estado: string
          id: string
          mensaje: string
          participante_id: string | null
          prioridad: string
          respuesta_admin: string | null
          updated_at: string
        }
        Insert: {
          copropiedad_id?: string | null
          created_at?: string
          estado?: string
          id?: string
          mensaje: string
          participante_id?: string | null
          prioridad?: string
          respuesta_admin?: string | null
          updated_at?: string
        }
        Update: {
          copropiedad_id?: string | null
          created_at?: string
          estado?: string
          id?: string
          mensaje?: string
          participante_id?: string | null
          prioridad?: string
          respuesta_admin?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "soporte_tickets_copropiedad_id_fkey"
            columns: ["copropiedad_id"]
            isOneToOne: false
            referencedRelation: "copropiedades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "soporte_tickets_participante_id_fkey"
            columns: ["participante_id"]
            isOneToOne: false
            referencedRelation: "participantes_asamblea"
            referencedColumns: ["id"]
          },
        ]
      }
      unidades: {
        Row: {
          coeficiente: number
          copropiedad_id: string
          created_at: string
          id: string
          identificador: string | null
          propietario_nombre: string | null
          tipo: string | null
          updated_at: string
        }
        Insert: {
          coeficiente?: number
          copropiedad_id: string
          created_at?: string
          id?: string
          identificador?: string | null
          propietario_nombre?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Update: {
          coeficiente?: number
          copropiedad_id?: string
          created_at?: string
          id?: string
          identificador?: string | null
          propietario_nombre?: string | null
          tipo?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "unidades_copropiedad_id_fkey"
            columns: ["copropiedad_id"]
            isOneToOne: false
            referencedRelation: "copropiedades"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          copropiedad_id: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          copropiedad_id?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          copropiedad_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_copropiedad_id_fkey"
            columns: ["copropiedad_id"]
            isOneToOne: false
            referencedRelation: "copropiedades"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      acreditar_participante: { Args: { p_qr_token: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_superadmin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "superadmin" | "admin" | "viewer"
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
      app_role: ["superadmin", "admin", "viewer"],
    },
  },
} as const
