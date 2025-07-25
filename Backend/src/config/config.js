import dotenv from "dotenv";

dotenv.config()

export const NODE_ENV = 'production'//process.env.NODE_ENV || 'development'

export const DOMINIO_FRONTEND = NODE_ENV == 'production' ? process.env.DOMINIO_FRONTEND_PROD : process.env.DOMINIO_FRONTEND_DEV

// Añadir esta línea a tu configuración existente
export const APP_LOCALE = process.env.APP_LOCALE || 'es';

export const SUPABASE_URL = process.env.SUPABASE_URL
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

export const BUILDERBOT_URL = process.env.BUILDERBOT_URL
export const BUILDERBOT_KEY = process.env.BUILDERBOT_KEY

export const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL
export const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY