import { PrismaClient } from "@prisma/client";

export class VerifyEmailUseCase {
  constructor(private prisma: PrismaClient) {}

  async execute(token: string) {
    const record = await this.prisma.emailVerificationToken.findUnique({
      where: { token },
    });

    if (!record) throw new Error("Invalid token");
    if (record.expiresAt < new Date())
      throw new Error("Verification token expired");

    await this.prisma.person.update({
      where: { pid: record.personId },
      data: {
        emailVerified: true,
        verifiedAt: new Date(),
      },
    });

    // Delete token after use
    await this.prisma.emailVerificationToken.delete({
      where: { token },
    });

    return { message: "Email verified successfully" };
  }
}


