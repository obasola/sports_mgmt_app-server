import { container } from "tsyringe";
import { PrismaAccessControlRepository } from "../persistence/prisma/PrismaAccessControlRepository";
import type { IAccessControlRepository } from "../../domain/repositories/IAccessControlRepository";

export function registerAccessControlModule(): void {
  container.register<IAccessControlRepository>("IAccessControlRepository", {
    useClass: PrismaAccessControlRepository,
  });
}
