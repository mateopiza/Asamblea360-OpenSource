
-- Enum para roles
CREATE TYPE public.app_role AS ENUM ('superadmin', 'admin', 'viewer');

-- Tabla de roles de usuario
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Función has_role (security definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Función para verificar si es admin o superadmin
CREATE OR REPLACE FUNCTION public.is_admin_or_superadmin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'superadmin')
  )
$$;

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Copropiedades
CREATE TABLE public.copropiedades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR NOT NULL,
  nit VARCHAR UNIQUE,
  direccion VARCHAR,
  email_contacto VARCHAR,
  logo_url VARCHAR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.copropiedades ENABLE ROW LEVEL SECURITY;

-- Unidades inmobiliarias
CREATE TABLE public.unidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  copropiedad_id UUID REFERENCES public.copropiedades(id) ON DELETE CASCADE NOT NULL,
  tipo VARCHAR,
  identificador VARCHAR,
  propietario_nombre VARCHAR,
  coeficiente NUMERIC(10,4) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.unidades ENABLE ROW LEVEL SECURITY;

-- Asambleas
CREATE TABLE public.asambleas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  copropiedad_id UUID REFERENCES public.copropiedades(id) ON DELETE CASCADE NOT NULL,
  titulo VARCHAR NOT NULL DEFAULT 'Asamblea',
  fecha_inicio TIMESTAMPTZ,
  fecha_fin TIMESTAMPTZ,
  estado VARCHAR NOT NULL DEFAULT 'programada',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.asambleas ENABLE ROW LEVEL SECURITY;

-- Participantes de asamblea
CREATE TABLE public.participantes_asamblea (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asamblea_id UUID REFERENCES public.asambleas(id) ON DELETE CASCADE NOT NULL,
  unidad_id UUID REFERENCES public.unidades(id) ON DELETE CASCADE NOT NULL,
  participante_nombre VARCHAR NOT NULL,
  email VARCHAR,
  telefono VARCHAR,
  qr_token VARCHAR UNIQUE DEFAULT gen_random_uuid()::text,
  estado_acreditacion VARCHAR NOT NULL DEFAULT 'sin_acreditar',
  delegado BOOLEAN DEFAULT false,
  acreditado_en TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.participantes_asamblea ENABLE ROW LEVEL SECURITY;

-- Preguntas de votación
CREATE TABLE public.preguntas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asamblea_id UUID REFERENCES public.asambleas(id) ON DELETE CASCADE NOT NULL,
  titulo VARCHAR NOT NULL,
  tipo_calculo VARCHAR NOT NULL DEFAULT 'mayoria_simple',
  activa BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.preguntas ENABLE ROW LEVEL SECURITY;

-- Registro de votos (solo n8n/Vera inserta)
CREATE TABLE public.registro_votos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pregunta_id UUID REFERENCES public.preguntas(id) ON DELETE CASCADE NOT NULL,
  participante_id UUID REFERENCES public.participantes_asamblea(id) ON DELETE CASCADE NOT NULL,
  opcion VARCHAR NOT NULL,
  fecha_voto TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.registro_votos ENABLE ROW LEVEL SECURITY;

-- Resultados de pregunta
CREATE TABLE public.resultados_pregunta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pregunta_id UUID REFERENCES public.preguntas(id) ON DELETE CASCADE NOT NULL,
  resultados JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.resultados_pregunta ENABLE ROW LEVEL SECURITY;

-- Soporte tickets
CREATE TABLE public.soporte_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  copropiedad_id UUID REFERENCES public.copropiedades(id) ON DELETE CASCADE,
  participante_id UUID REFERENCES public.participantes_asamblea(id) ON DELETE SET NULL,
  estado VARCHAR NOT NULL DEFAULT 'pendiente',
  prioridad VARCHAR NOT NULL DEFAULT 'media',
  mensaje TEXT NOT NULL,
  respuesta_admin TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.soporte_tickets ENABLE ROW LEVEL SECURITY;

-- Historial de conversaciones
CREATE TABLE public.conversations_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  copropiedad_id UUID REFERENCES public.copropiedades(id) ON DELETE CASCADE,
  participante_id UUID REFERENCES public.participantes_asamblea(id) ON DELETE SET NULL,
  mensaje_whatsapp TEXT NOT NULL,
  rol VARCHAR NOT NULL DEFAULT 'user',
  fecha TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.conversations_history ENABLE ROW LEVEL SECURITY;

-- Delegaciones
CREATE TABLE public.delegaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asamblea_id UUID REFERENCES public.asambleas(id) ON DELETE CASCADE NOT NULL,
  participante_id UUID REFERENCES public.participantes_asamblea(id) ON DELETE CASCADE NOT NULL,
  delegado_a_id UUID REFERENCES public.participantes_asamblea(id) ON DELETE CASCADE,
  tipo VARCHAR NOT NULL DEFAULT 'presencial',
  documento_url VARCHAR,
  estado VARCHAR NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.delegaciones ENABLE ROW LEVEL SECURITY;

-- Audit logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  copropiedad_id UUID REFERENCES public.copropiedades(id) ON DELETE SET NULL,
  tabla VARCHAR NOT NULL,
  registro_id UUID,
  accion VARCHAR NOT NULL,
  datos_previos JSONB,
  datos_nuevos JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ========== RLS POLICIES ==========

-- user_roles: solo admins y el propio usuario pueden ver
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Superadmins manage all roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'));

-- profiles
CREATE POLICY "Anyone can view profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- copropiedades: admins+ pueden gestionar, todos authenticated pueden leer
CREATE POLICY "Authenticated can read copropiedades" ON public.copropiedades
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage copropiedades" ON public.copropiedades
  FOR ALL TO authenticated
  USING (public.is_admin_or_superadmin(auth.uid()));

-- unidades
CREATE POLICY "Authenticated can read unidades" ON public.unidades
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage unidades" ON public.unidades
  FOR ALL TO authenticated
  USING (public.is_admin_or_superadmin(auth.uid()));

-- asambleas
CREATE POLICY "Authenticated can read asambleas" ON public.asambleas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage asambleas" ON public.asambleas
  FOR ALL TO authenticated
  USING (public.is_admin_or_superadmin(auth.uid()));

-- participantes_asamblea
CREATE POLICY "Authenticated can read participantes" ON public.participantes_asamblea
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage participantes" ON public.participantes_asamblea
  FOR ALL TO authenticated
  USING (public.is_admin_or_superadmin(auth.uid()));

-- preguntas
CREATE POLICY "Authenticated can read preguntas" ON public.preguntas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage preguntas" ON public.preguntas
  FOR ALL TO authenticated
  USING (public.is_admin_or_superadmin(auth.uid()));

-- registro_votos: solo lectura para admins, anon puede insertar (n8n/service role)
CREATE POLICY "Admins can read votos" ON public.registro_votos
  FOR SELECT TO authenticated
  USING (public.is_admin_or_superadmin(auth.uid()));

-- Allow anon/service to insert votes (from n8n)
CREATE POLICY "Service can insert votos" ON public.registro_votos
  FOR INSERT TO anon WITH CHECK (true);

-- resultados_pregunta: lectura pública, admins gestionan
CREATE POLICY "Anyone can read resultados" ON public.resultados_pregunta
  FOR SELECT USING (true);

CREATE POLICY "Admins manage resultados" ON public.resultados_pregunta
  FOR ALL TO authenticated
  USING (public.is_admin_or_superadmin(auth.uid()));

-- soporte_tickets
CREATE POLICY "Authenticated can read tickets" ON public.soporte_tickets
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage tickets" ON public.soporte_tickets
  FOR ALL TO authenticated
  USING (public.is_admin_or_superadmin(auth.uid()));

CREATE POLICY "Anon can insert tickets" ON public.soporte_tickets
  FOR INSERT TO anon WITH CHECK (true);

-- conversations_history
CREATE POLICY "Admins can read conversations" ON public.conversations_history
  FOR SELECT TO authenticated
  USING (public.is_admin_or_superadmin(auth.uid()));

CREATE POLICY "Anon can insert conversations" ON public.conversations_history
  FOR INSERT TO anon WITH CHECK (true);

-- delegaciones
CREATE POLICY "Authenticated can read delegaciones" ON public.delegaciones
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage delegaciones" ON public.delegaciones
  FOR ALL TO authenticated
  USING (public.is_admin_or_superadmin(auth.uid()));

-- audit_logs: solo superadmins
CREATE POLICY "Superadmins can read audit logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Authenticated can insert audit logs" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- ========== TRIGGERS ==========

-- updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_copropiedades_updated_at BEFORE UPDATE ON public.copropiedades FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_unidades_updated_at BEFORE UPDATE ON public.unidades FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_asambleas_updated_at BEFORE UPDATE ON public.asambleas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_participantes_updated_at BEFORE UPDATE ON public.participantes_asamblea FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_preguntas_updated_at BEFORE UPDATE ON public.preguntas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_resultados_updated_at BEFORE UPDATE ON public.resultados_pregunta FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.soporte_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_delegaciones_updated_at BEFORE UPDATE ON public.delegaciones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.participantes_asamblea;
ALTER PUBLICATION supabase_realtime ADD TABLE public.registro_votos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.resultados_pregunta;
ALTER PUBLICATION supabase_realtime ADD TABLE public.soporte_tickets;

-- RPC for QR accreditation
CREATE OR REPLACE FUNCTION public.acreditar_participante(p_qr_token VARCHAR)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_participante RECORD;
  v_result JSONB;
BEGIN
  SELECT * INTO v_participante
  FROM public.participantes_asamblea
  WHERE qr_token = p_qr_token;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'QR inválido');
  END IF;

  IF v_participante.estado_acreditacion = 'acreditado' THEN
    RETURN jsonb_build_object('status', 'already', 'message', 'Ya acreditado', 'nombre', v_participante.participante_nombre);
  END IF;

  IF v_participante.estado_acreditacion = 'bloqueado' THEN
    RETURN jsonb_build_object('status', 'blocked', 'message', 'Participante bloqueado');
  END IF;

  UPDATE public.participantes_asamblea
  SET estado_acreditacion = 'acreditado', acreditado_en = now()
  WHERE id = v_participante.id;

  RETURN jsonb_build_object(
    'status', 'success',
    'message', 'Acreditación exitosa',
    'nombre', v_participante.participante_nombre,
    'unidad_id', v_participante.unidad_id
  );
END;
$$;
