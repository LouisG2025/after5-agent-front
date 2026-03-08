import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Lead } from '../types'

export const useLeads = () => {
    const [leads, setLeads] = useState<Lead[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchLeads = useCallback(async () => {
        try {
            setIsLoading(true)
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setLeads(data || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchLeads()
    }, [fetchLeads])

    return { leads, isLoading, error, refetch: fetchLeads }
}
