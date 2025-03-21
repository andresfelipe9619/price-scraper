import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getAll () {
  const products = await prisma.product.findMany({
    where: { published: true },
    include: { author: true }
  })
  return products
}

async function create (props) {
  const { title, content, authorEmail } = props
  const product = await prisma.product.create({
    data: {
      title,
      content,
      published: false,
      author: { connect: { email: authorEmail } }
    }
  })
  return product
}

async function update (props) {
  const { id } = props
  const product = await prisma.product.update({
    where: { id },
    data: { published: true }
  })
  return product
}

async function destroy (props) {
  const { id } = props
  const product = await prisma.product.delete({
    where: {
      id
    }
  })
  return product
}

module.exports = { create, getAll, update, destroy }
