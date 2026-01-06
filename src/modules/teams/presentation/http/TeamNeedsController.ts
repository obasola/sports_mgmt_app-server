import { Request, Response } from "express";
import { GetTeamNeedsPageUseCase } from "../../application/usecases/GetTeamNeedsPageUseCase";
import { UpsertTeamNeedUseCase } from "../../application/usecases/UpsertTeamNeedUseCase";
import { DeleteTeamNeedUseCase } from "../../application/usecases/DeleteTeamNeedUseCase";

interface UpsertBody {
  position: string;
  priority: number;
  draftYear?: number | null;
}

export class TeamNeedsController {
  public constructor(
    private readonly getPageUseCase: GetTeamNeedsPageUseCase,
    private readonly upsertUseCase: UpsertTeamNeedUseCase,
    private readonly deleteUseCase: DeleteTeamNeedUseCase
  ) {}

  public getNeedsPage = async (req: Request, res: Response): Promise<void> => {
    const teamId = Number(req.params.teamId);
    if (!Number.isInteger(teamId)) {
      res.status(400).json({ message: "Invalid teamId" });
      return;
    }

    const evaluationYearRaw = req.query.evaluationYear;
    const draftYearRaw = req.query.draftYear;

    const evaluationYear =
      typeof evaluationYearRaw === "string" && evaluationYearRaw.length > 0
        ? Number(evaluationYearRaw)
        : undefined;

    const draftYear =
      typeof draftYearRaw === "string" && draftYearRaw.length > 0
        ? Number(draftYearRaw)
        : null;

    const dto = await this.getPageUseCase.execute({
      teamId,
      evaluationYear: Number.isFinite(evaluationYear) ? evaluationYear : undefined,
      draftYear: Number.isFinite(draftYear) ? draftYear : null
    });

    res.status(200).json(dto);
  };

  public upsertTeamNeed = async (req: Request, res: Response): Promise<void> => {
    const teamId = Number(req.params.teamId);
    if (!Number.isInteger(teamId)) {
      res.status(400).json({ message: "Invalid teamId" });
      return;
    }

    const body = req.body as UpsertBody;

    if (!body || typeof body.position !== "string") {
      res.status(400).json({ message: "position is required" });
      return;
    }

    const saved = await this.upsertUseCase.execute({
      teamId,
      position: body.position,
      priority: body.priority,
      draftYear: body.draftYear ?? null
    });

    res.status(200).json(saved);
  };

  public deleteTeamNeed = async (req: Request, res: Response): Promise<void> => {
    const teamId = Number(req.params.teamId);
    const position = String(req.params.position ?? "");

    if (!Number.isInteger(teamId)) {
      res.status(400).json({ message: "Invalid teamId" });
      return;
    }

    await this.deleteUseCase.execute(teamId, position);
    res.status(204).send();
  };
}

