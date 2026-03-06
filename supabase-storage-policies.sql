-- Políticas para Storage (bucket "gallery") y tabla "gallery_items"
-- Ejecutá este script en Supabase: SQL Editor > New query > Pegar y Run

-- ========== TABLA gallery_items ==========
-- La galería pública (anon) solo puede leer. El admin (authenticated) puede insertar, actualizar y borrar.

CREATE POLICY "Cualquiera puede ver los ítems de la galería"
ON public.gallery_items FOR SELECT
TO anon
USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar en gallery_items"
ON public.gallery_items FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar gallery_items"
ON public.gallery_items FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Usuarios autenticados pueden borrar en gallery_items"
ON public.gallery_items FOR DELETE
TO authenticated
USING (true);

-- ========== STORAGE bucket gallery ==========

-- Permitir que usuarios autenticados suban archivos al bucket gallery
CREATE POLICY "Usuarios autenticados pueden subir a gallery"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'gallery');

-- Permitir que usuarios autenticados actualicen sus archivos (opcional)
CREATE POLICY "Usuarios autenticados pueden actualizar en gallery"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'gallery');

-- Permitir que usuarios autenticados borren archivos en gallery
CREATE POLICY "Usuarios autenticados pueden borrar en gallery"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'gallery');

-- Lectura pública: cualquiera puede ver los archivos del bucket (para la galería pública)
CREATE POLICY "Lectura pública del bucket gallery"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'gallery');
