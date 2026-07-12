import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase 环境变量未配置，将使用只读模式");
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "");
