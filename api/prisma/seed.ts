import prisma from "../src/utils/database";

async function main() {
  await prisma.category.createMany({
    data: [
      {
      name: "Divers",
      description: "Contient des ressources diverses.",
    },
    {
      name: "family",
      description: "Ressources liées à la famille.",
    },
    {
      name: "couple",
      description: "Ressources liées au couple.",
    },
    {
      name: "friends",
      description: "Ressources liées aux amis.",
    },
    {
      name: "work",
      description: "Ressources liées au travail.",
    }
  ],
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
    data: [{ name: "Public" }, { name: "Privé" }],
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