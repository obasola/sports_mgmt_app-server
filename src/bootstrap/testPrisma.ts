import { prisma } from "@/infrastructure/database/prisma";

async function main() {
  const games = await prisma.game.findMany();
  console.log(games);
}

main();
