import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const email = "admin@dashboard.com"
  const password = "admin1234"

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log("Default пайдаланушы бар, өткізіп жіберіледі.")
    return
  }

  const hashed = await bcrypt.hash(password, 10)
  await prisma.user.create({
    data: {
      email,
      password: hashed,
      name: "Admin",
    },
  })

  console.log("✓ Default аккаунт жасалды:")
  console.log("  Email:    admin@dashboard.com")
  console.log("  Пароль:   admin1234")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
