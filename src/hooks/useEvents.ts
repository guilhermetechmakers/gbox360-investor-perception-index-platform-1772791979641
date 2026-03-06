import { useQuery } from "@tanstack/react-query"
import { eventsApi, type EventsListParams } from "@/api/events"

export const eventsKeys = {
  list: (params: EventsListParams) =>
    ["events", params.company_id ?? params.companyId, params.start, params.end, params.source ?? params.source_id, params.platform] as const,
  byId: (eventId: string) => ["events", "id", eventId] as const,
}

/** Fetch NarrativeEvents with optional source/platform filters. */
export function useEvents(
  params: EventsListParams,
  enabled = true
) {
  return useQuery({
    queryKey: eventsKeys.list(params),
    queryFn: async () => {
      const res = await eventsApi.getEvents(params)
      return res?.data ?? []
    },
    enabled:
      !!(params.company_id ?? params.companyId) &&
      !!params.start &&
      !!params.end &&
      enabled,
    staleTime: 1000 * 60 * 2,
  })
}

/** Fetch single narrative event by id. */
export function useEventById(eventId: string | null, enabled = true) {
  return useQuery({
    queryKey: eventsKeys.byId(eventId ?? ""),
    queryFn: () => eventsApi.getEventById(eventId!),
    enabled: !!eventId && enabled,
    staleTime: 1000 * 60 * 2,
  })
}
