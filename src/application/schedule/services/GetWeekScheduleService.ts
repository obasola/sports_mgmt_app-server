// ..server/src/application/schedule/services/GetWeekScheduleService.ts
import { EspnScheduleClient } from "@/infrastructure/espn/EspnScheduleClient";
import { WeekScheduleDTO } from "@/utils/schedule/scheduleTypes";

export class GetWeekScheduleService {
  constructor(private scheduleClient: EspnScheduleClient) {}

  async execute(
    year: number,
    seasonType: number,
    week: number
  ): Promise<WeekScheduleDTO> {

    return await this.scheduleClient.getWeekEvents(year, seasonType, week);
  }
}
