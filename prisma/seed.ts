import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await Bun.password.hash("password123");

  const userEmail = [
    "johndoe@example.com",
    "janedoe@example.com",
    "alice@example.com",
    "bob@example.com",
    "charlie@example.com",
    "david@example.com",
    "eve@example.com",
  ];

  for (const email of userEmail) {
    await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name: email.split("@")[0],
        email,
        password: hashedPassword,
        image: `https://i.pravatar.cc/150?u=${email.split("@")[0]}`,
      },
    });
  }

  //   Create Categories
  const categories = ["Electronics", "Books", "Clothing", "Home", "Toys"];

  let categoryIds: string[] = [];
  for (const category of categories) {
    const createdCategory = await prisma.category.create({
      data: { name: category },
    });
    categoryIds.push(createdCategory.id);
  }

  //   Create Products
  const productsTitle = [
    "Laptop",
    "Smartphone",
    "Novel",
    "T-Shirt",
    "Action Figure",
  ];

  for (const name of productsTitle) {
    await prisma.product.create({
      data: {
        name,
        description: `${name} description`,
        stock: Math.floor(Math.random() * 100),
        image: `https://via.placeholder.com/150?text=${encodeURIComponent(
          name
        )}`,
        categoryId: categoryIds[Math.floor(Math.random() * categoryIds.length)],
        price: Math.random() * 1000000,
      },
    });
  }
}

main()
  .then(() => {
    console.log("✅ Seed completed with UUIDs!");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
