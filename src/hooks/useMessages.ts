import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Message } from '../types'

export const useMessages = (leadId?: string) => {
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const fetchMessages = useCallback(async () => {
        if (!leadId) return
        try {
            setIsLoading(true)
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('lead_id', leadId)
                .order('created_at', { ascending: true })

            if (error) throw error
            setMessages(data || [])
        } catch (err) {
            console.error('Error fetching messages:', err)
        } finally {
            setIsLoading(false)
        }
    }, [leadId])

    useEffect(() => {
        fetchMessages()
    }, [fetchMessages])

    return { messages, isLoading, refetch: fetchMessages }
}
