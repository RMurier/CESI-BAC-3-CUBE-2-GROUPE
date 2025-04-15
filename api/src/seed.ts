import prisma from "./utils/database";

async function main() {
  await prisma.category.create({
    data: {
      name: "Divers",
      description: "Contient des ressources diverses.",
    },
  });
  await prisma.role.createMany({
    data: [
      { name: "Citoyen" },
      { name: "Modérateur" },
      { name: "Admin" },
      { name: "Super-Admin" },
    ],
  });
  await prisma.ressourceType.createMany({
    data: [{ name: "Public" }, { name: "Privé" }, { name: "Partagé" }],
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
