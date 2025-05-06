import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'admin@diinponto.com'
  const adminPassword = 'admin123'
  const adminPin = '123456' // PIN de 6 dígitos

  // Verifica se o usuário admin já existe
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!existingAdmin) {
    const hashedPassword = await hash(adminPassword, 12)
    const hashedPin = await hash(adminPin, 12)

    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Administrador',
        password: hashedPassword,
        pin: hashedPin,
        role: 'ADMIN',
        employeeId: 'ADMIN001',
        barcode: 'ADMIN001',
      },
    })

    console.log('Usuário administrador criado com sucesso!')
  } else {
    console.log('Usuário administrador já existe.')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 