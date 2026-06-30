// ============================================
// CONFIGURAÇÃO DO SUPABASE
// Cole aqui a chave "anon public" (Project Settings > API)
// ============================================
const SUPABASE_URL = "https://lyapughsalstcskzmeew.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_d4zGaW36mwGHfCtLP4__EQ_XdlnF5j5";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);