// application/schedule/services/GetWeekScheduleService.ts
import { EspnScheduleClient, EventDTO, WeekScheduleDTO } from "../../../infrastructure/espn/EspnScheduleClient";

export class GetWeekScheduleService {
  constructor(private scheduleClient: EspnScheduleClient) {}

  async execute(year: number, seasonType: number, week: number): Promise<WeekScheduleDTO> {
    const events = await this.scheduleClient.getWeekEvents(year, seasonType, week);
    return { year, seasonType, week, events };
  }
}
