import { PrismaClient } from '@prisma/client'
let prisma: PrismaClient

declare global { var __prisma__: PrismaClient | undefined }

if (process.env.NODE_ENV !== 'production') {
  if (!global.__prisma__) global.__prisma__ = new PrismaClient()
  prisma = global.__prisma__
} else {
  prisma = new PrismaClient()
}

export { prisma }
