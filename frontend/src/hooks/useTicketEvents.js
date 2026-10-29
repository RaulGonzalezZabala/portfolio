import { useEffect, useState } from 'react'
import {
  createTicketEvent,
  deleteTicketEvent,
  getTicketEvents,
  updateTicketEvent,
} from '../services/ticketPulseApi'

export function useTicketEvents(enabled) {
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    let isActive = true

    async function loadEvents() {
      if (!enabled) {
        setEvents([])
        setApiError('')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setEvents([])
      setApiError('')

      try {
        const loadedEvents = await getTicketEvents()

        if (isActive) {
          setEvents(loadedEvents)
        }
      } catch (error) {
        if (isActive) {
          setApiError(error.message)
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    loadEvents()

    return () => {
      isActive = false
    }
  }, [enabled])

  async function createEvent(eventData) {
    const event = await createTicketEvent(eventData)
    setEvents((currentEvents) => [...currentEvents, event])
  }

  async function updateEvent(id, eventData) {
    const currentEvent = events.find((event) => event.id === id)
    const event = await updateTicketEvent(id, { ...currentEvent, ...eventData })

    setEvents((currentEvents) => currentEvents.map((currentEvent) => (
      currentEvent.id === id ? event : currentEvent
    )))
  }

  async function removeEvent(id) {
    await deleteTicketEvent(id)
    setEvents((currentEvents) => currentEvents.filter((event) => event.id !== id))
  }

  async function markEventFinished(id) {
    await updateEvent(id, { status: 'finished' })
  }

  return {
    events,
    isLoading,
    apiError,
    createEvent,
    updateEvent,
    removeEvent,
    markEventFinished,
  }
}