import prisma from "../src/utils/database";

async function main() {
  // Création des catégories avec upsert
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "Divers" },
      update: {},
      create: {
        name: "Divers",
        description: "Contient des ressources diverses.",
      },
    }),
    prisma.category.upsert({
      where: { name: "family" },
      update: {},
      create: {
        name: "family",
        description: "Ressources liées à la famille.",
      },
    }),
    prisma.category.upsert({
      where: { name: "couple" },
      update: {},
      create: {
        name: "couple",
        description: "Ressources liées au couple.",
      },
    }),
    prisma.category.upsert({
      where: { name: "friends" },
      update: {},
      create: {
        name: "friends",
        description: "Ressources liées aux amis.",
      },
    }),
    prisma.category.upsert({
      where: { name: "work" },
      update: {},
      create: {
        name: "work",
        description: "Ressources liées au travail.",
      },
    }),
  ]);

  // Création des rôles avec upsert
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: "Citoyen" },
      update: {},
      create: { name: "Citoyen" },
    }),
    prisma.role.upsert({
      where: { name: "Modérateur" },
      update: {},
      create: { name: "Modérateur" },
    }),
    prisma.role.upsert({
      where: { name: "Admin" },
      update: {},
      create: { name: "Admin" },
    }),
    prisma.role.upsert({
      where: { name: "Super-Admin" },
      update: {},
      create: { name: "Super-Admin" },
    }),
  ]);

  // Création des types de ressources avec upsert
  const ressourceTypes = await Promise.all([
    prisma.ressourceType.upsert({
      where: { name: "Public" },
      update: {},
      create: { name: "Public" },
    }),
    prisma.ressourceType.upsert({
      where: { name: "Privé" },
      update: {},
      create: { name: "Privé" },
    }),
  ]);

  // Création d'un utilisateur système pour les ressources par défaut
  const systemUser = await prisma.user.upsert({
    where: { clerkUserId: "system-default" },
    update: {},
    create: {
      clerkUserId: "system-default",
      email: "system@example.com",
      name: "Système",
      roleId: roles.find(r => r.name === "Admin")?.id || 1,
    },
  });

  // Création d'une ressource par défaut pour chaque catégorie
  const defaultResources = [
    {
      title: "Ressource générale",
      description: "Cette ressource contient des informations générales utiles pour tous.",
      categoryName: "Divers",
    },
    {
      title: "Guide familial",
      description: "Un guide complet pour améliorer les relations familiales et créer des liens durables.",
      categoryName: "family",
    },
    {
      title: "Conseils pour couples",
      description: "Des conseils pratiques pour maintenir une relation de couple épanouie et harmonieuse.",
      categoryName: "couple",
    },
    {
      title: "Cultiver l'amitié",
      description: "Comment créer et maintenir des amitiés solides et durables dans votre vie.",
      categoryName: "friends",
    },
    {
      title: "Réussir au travail",
      description: "Stratégies et conseils pour exceller dans votre carrière professionnelle.",
      categoryName: "work",
    },
  ];

  const publicType = ressourceTypes.find(rt => rt.name === "Public")!;

  for (const resource of defaultResources) {
    const category = categories.find(c => c.name === resource.categoryName)!;
    
    await prisma.ressource.upsert({
      where: { 
        // Utilisation d'un identifiant unique basé sur le titre et la catégorie
        id: `default-${resource.categoryName.toLowerCase()}`,
      },
      update: {},
      create: {
        id: `default-${resource.categoryName.toLowerCase()}`,
        title: resource.title,
        description: resource.description,
        categoryId: category.id,
        ressourceTypeId: publicType.id,
        userId: systemUser.id,
      },
    });
  }

  console.log("✅ Seed terminé avec succès!");
  console.log(`📂 ${categories.length} catégories créées/vérifiées`);
  console.log(`👥 ${roles.length} rôles créés/vérifiés`);
  console.log(`📋 ${ressourceTypes.length} types de ressources créés/vérifiés`);
  console.log(`📄 ${defaultResources.length} ressources par défaut créées/vérifiées`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Erreur lors du seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });