export type RessourceEntity = {
  id: number;
  title: string;
  description: string;
  createdAt: Date;
  modifiedAt: Date;
  isActive: boolean;
  categoryId: number;
  category: Category;
};

export type RessourceTypeEntity = {
  id: number;
  name: string;
};
