// src/modules/postSeasonResult/infrastructure/postSeasonResult.prisma.repository.ts
import { PrismaClient } from '@prisma/client';
import { PostSeasonResult } from '../../domain/post-season-result.entity';
import { PostSeasonResultRepository } from '../../domain/post-season-result.repository';
import { PostSeasonResultProps } from '../../domain/interface/post-season-props.interface';

export class PostSeasonResultPrismaRepository implements PostSeasonResultRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<PostSeasonResult[]> {
    const results = await this.prisma.postSeasonResult.findMany();

    return results.map(result => {
      // Create the props object with correct type handling
      const props: PostSeasonResultProps = {
        id: result.id,
        playoffYear: result.playoffYear,
        // Convert null to undefined or keep as is if it's a string
        lastRoundReached: result.lastRoundReached ?? undefined,
        winLose: result.winLose ?? undefined,
        opponentScore: result.opponentScore ?? undefined,
        teamScore: result.teamScore ?? undefined,
        teamId: result.teamId ?? undefined,
      };

      return new PostSeasonResult(props);
    });
  }

  async findById(id: number): Promise<PostSeasonResult | null> {
    const result = await this.prisma.postSeasonResult.findUnique({
      where: { id },
    });

    if (!result) return null;

    return new PostSeasonResult({
      id: result.id,
      playoffYear: result.playoffYear,
      lastRoundReached: result.lastRoundReached ?? undefined,
      winLose: result.winLose ?? undefined,
      opponentScore: result.opponentScore ?? undefined,
      teamScore: result.teamScore ?? undefined,
      teamId: result.teamId ?? undefined,
    });
  }

  async findByTeamId(teamId: number): Promise<PostSeasonResult[]> {
    const results = await this.prisma.postSeasonResult.findMany({
      where: { teamId },
    });

    return results.map(
      result =>
        new PostSeasonResult({
          id: result.id,
          playoffYear: result.playoffYear,
          lastRoundReached: result.lastRoundReached ?? undefined,
          winLose: result.winLose ?? undefined,
          opponentScore: result.opponentScore ?? undefined,
          teamScore: result.teamScore ?? undefined,
          teamId: result.teamId ?? undefined,
        }),
    );
  }

  async findByYear(year: number): Promise<PostSeasonResult[]> {
    const results = await this.prisma.postSeasonResult.findMany({
      where: { playoffYear: year },
    });

    return results.map(
      result =>
        new PostSeasonResult({
          id: result.id,
          playoffYear: result.playoffYear,
          lastRoundReached: result.lastRoundReached ?? undefined,
          winLose: result.winLose ?? undefined,
          opponentScore: result.opponentScore ?? undefined,
          teamScore: result.teamScore ?? undefined,
          teamId: result.teamId ?? undefined,
        }),
    );
  }

  async findByTeamAndYear(teamId: number, year: number): Promise<PostSeasonResult | null> {
    const result = await this.prisma.postSeasonResult.findFirst({
      where: {
        teamId,
        playoffYear: year,
      },
    });

    if (!result) return null;

    return new PostSeasonResult({
      id: result.id,
      playoffYear: result.playoffYear,
      lastRoundReached: result.lastRoundReached ?? undefined,
      winLose: result.winLose ?? undefined,
      opponentScore: result.opponentScore ?? undefined,
      teamScore: result.teamScore ?? undefined,
      teamId: result.teamId ?? undefined,
    });
  }

  async create(postSeasonResult: PostSeasonResult): Promise<PostSeasonResult> {
    const created = await this.prisma.postSeasonResult.create({
      data: {
        playoffYear: postSeasonResult.playoffYear,
        lastRoundReached: postSeasonResult.lastRoundReached,
        winLose: postSeasonResult.winLose,
        opponentScore: postSeasonResult.opponentScore,
        teamScore: postSeasonResult.teamScore,
        teamId: postSeasonResult.teamId,
      },
    });

    return new PostSeasonResult({
      id: created.id,
      playoffYear: created.playoffYear,
      lastRoundReached: created.lastRoundReached ?? undefined,
      winLose: created.winLose ?? undefined,
      opponentScore: created.opponentScore ?? undefined,
      teamScore: created.teamScore ?? undefined,
      teamId: created.teamId ?? undefined,
    });
  }

  async update(postSeasonResult: PostSeasonResult): Promise<PostSeasonResult> {
    const updated = await this.prisma.postSeasonResult.update({
      where: { id: postSeasonResult.id },
      data: {
        playoffYear: postSeasonResult.playoffYear,
        lastRoundReached: postSeasonResult.lastRoundReached,
        winLose: postSeasonResult.winLose,
        opponentScore: postSeasonResult.opponentScore,
        teamScore: postSeasonResult.teamScore,
        teamId: postSeasonResult.teamId,
      },
    });

    return new PostSeasonResult({
      id: updated.id,
      playoffYear: updated.playoffYear,
      lastRoundReached: updated.lastRoundReached ?? undefined,
      winLose: updated.winLose ?? undefined,
      opponentScore: updated.opponentScore ?? undefined,
      teamScore: updated.teamScore ?? undefined,
      teamId: updated.teamId ?? undefined,
    });
  }

  async delete(id: number): Promise<boolean> {
    await this.prisma.postSeasonResult.delete({
      where: { id },
    });
    return true;
  }
}
