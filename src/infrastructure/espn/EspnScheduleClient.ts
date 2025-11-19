// src/infrastructure/espn/EspnScheduleClient.ts

import axios from 'axios';

export interface EventDTO {
  id: string;
  date: string;
  name: string;
  shortName: string;
  // include other fields as needed
}

export interface WeekScheduleDTO {
  year: number;
  seasonType: number;
  week: number;
  events: EventDTO[];
}


export class EspnScheduleClient {
  async getWeekEvents(year: number, seasonType: number, week: number) {
    const url = `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/${year}/types/${seasonType}/weeks/${week}/events`
    const { data } = await axios.get(url)
    const items = data.items ?? []

    // fetch each event, extract id from $ref
    const events = await Promise.all(
      items.map(async (item: any) => {
        // extract numeric ID from $ref
        const match = item.$ref.match(/\/events\/(\d+)/)
        const eventId = match ? Number(match[1]) : NaN

        if (isNaN(eventId)) {
          console.warn('⚠️ [EspnScheduleClient] skipping invalid event ref:', item.$ref)
          return null
        }

        const eventData = await axios.get(item.$ref)
        const e = eventData.data

        return {
          id: eventId,
          date: e.date,
          name: e.name,
          shortName: e.shortName,
          status: e.status?.type?.name ?? 'unknown',
          seasonYear: year,
          seasonType,
          week,
        }
      })
    )

    return events.filter((e: any) => e !== null)
  }
}

