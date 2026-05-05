const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // First register a user if none exists
  const userCount = await prisma.user.count()
  console.log('Total users:', userCount)

  if (userCount === 0) {
    console.log('No users found. Please register first at http://localhost:3000/register')
    process.exit(0)
  }

  // Set admin role
  const updated = await prisma.user.update({
    where: { email: 'gbenahonyessiho@gmail.com' },
    data:  { role: 'ADMIN' }
  })

  console.log('SUCCESS! User updated:')
  console.log('Name:', updated.name)
  console.log('Email:', updated.email)
  console.log('Role:', updated.role)
}

main()
  .catch(e => {
    console.error('FAILED:', e.message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect()) 
