'use strict';

// Configuración de Supabase para frontend.
// IMPORTANTE:
// - Usá SOLO la anon key (NUNCA la service role) en este archivo.
// - Reemplazá los valores de las constantes de abajo por los de tu proyecto.
//   (ya están configurados para tu instancia actual).

const SUPABASE_URL = 'https://npyhcgeraqcyhqqegjnf.supabase.co';
const SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5weWhjZ2VyYXFjeWhxcWVnam5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3OTY2NTEsImV4cCI6MjA4ODM3MjY1MX0.zymZyR9J-S5Pu9iMrrC9wnPoWLL8nuFkx2X1WtO7JxM';

if (!window.supabase) {
    console.error('La librería de Supabase no está cargada. Asegurate de incluirla antes de este script.');
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase: faltan SUPABASE_URL o SUPABASE_ANON_KEY en js/supabaseClient.js');
}

window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

