import { createClient } from '@supabase/supabase-js'

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('after5_supabase_url')
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('after5_supabase_key')

const isValidUrl = (url: string) => {
    try {
        new URL(url)
        return true
    } catch {
        return false
    }
}

// Check for placeholders in env
if (supabaseUrl === 'your_supabase_url_here') {
    supabaseUrl = localStorage.getItem('after5_supabase_url') || null
}
if (supabaseAnonKey === 'your_supabase_anon_key_here') {
    supabaseAnonKey = localStorage.getItem('after5_supabase_key') || null
}

export let supabase = createClient(
    isValidUrl(supabaseUrl || '') ? supabaseUrl! : 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
)

export const updateSupabaseConfig = (url: string, key: string) => {
    localStorage.setItem('after5_supabase_url', url)
    localStorage.setItem('after5_supabase_key', key)

    // Create new client instance
    supabase = createClient(url, key)

    // Force reload to pick up new client everywhere
    window.location.reload()
}

export const hasValidConfig = () => {
    return isValidUrl(supabaseUrl || '') && !!supabaseAnonKey && supabaseUrl !== 'your_supabase_url_here'
}
