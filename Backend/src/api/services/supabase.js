import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../config/config.js'

// Crea e inicializa el cliente
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
