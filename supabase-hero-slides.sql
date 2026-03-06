-- Tabla y políticas para el carrusel del hero (inicio)
-- Ejecutá este script en Supabase: SQL Editor > New query > Pegar y Run

-- ========== TABLA hero_slides ==========
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    image_url text NOT NULL,
    storage_path text NOT NULL,
    position int NOT NULL DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT hero_slides_pkey PRIMARY KEY (id)
);

-- RLS
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede ver los slides del hero (página pública)
CREATE POLICY "Cualquiera puede ver hero_slides"
ON public.hero_slides FOR SELECT
TO anon
USING (true);

-- Solo autenticados pueden insertar, actualizar y borrar
CREATE POLICY "Usuarios autenticados pueden insertar hero_slides"
ON public.hero_slides FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar hero_slides"
ON public.hero_slides FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden borrar hero_slides"
ON public.hero_slides FOR DELETE
TO authenticated
USING (true);

-- Las imágenes del hero se suben al bucket "gallery" con path "hero/nombre.jpg"
-- Las políticas existentes del bucket gallery ya permiten INSERT/DELETE para authenticated.
