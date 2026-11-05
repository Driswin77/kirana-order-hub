import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 1. Create SKUs based on the sample data
  const biscuit = await prisma.sKU.create({
    data: {
      code: 'SKU-BS-075',
      name: 'Glucose biscuit 75 g, case of 96',
      dealerPrice: 8.10,
      stockCases: 340,
      schemes: {
        create: {
          type: 'BUY_X_GET_Y',
          buyQty: 10,
          freeQty: 1,
        }
      }
    },
  })

  const detergent = await prisma.sKU.create({
    data: {
      code: 'SKU-DT-1KG',
      name: 'Detergent powder 1 kg, case of 20',
      dealerPrice: 101.50,
      stockCases: 85,
      schemes: {
        create: {
          type: 'SLAB_DISCOUNT',
          minQty: 5,
          discountPct: 3,
        }
      }
    },
  })

  const tea = await prisma.sKU.create({
    data: {
      code: 'SKU-TE-250',
      name: 'Tea leaf 250 g, case of 40',
      dealerPrice: 118.00,
      stockCases: 0, // Out of stock
    },
  })

  // 2. Create a Demo Retailer
  const retailerUser = await prisma.user.create({
    data: {
      phone: '9876543210',
      name: 'Ramesh Gupta',
      role: 'RETAILER',
      retailer: {
        create: {
          shopName: 'Gupta Kirana Store',
          creditLimit: 50000,
        }
      }
    }
  })

  // 3. Create a Demo Order Desk User
  await prisma.user.create({
    data: {
      phone: '9999999999',
      name: 'Office Admin',
      role: 'ORDER_DESK',
    }
  })

  console.log('Seeding complete! 🌱')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })