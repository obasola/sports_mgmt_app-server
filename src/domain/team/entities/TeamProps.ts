import { TeamDivision } from "../value-objects/TeamDivision";
import { TeamLocation } from "../value-objects/TeamLocation";

export interface TeamProps {
  id?: number;
  name: string;
  location?: TeamLocation;
  division?: TeamDivision;
  scheduleId?: number;
}