import { Category } from "./category";

export interface Ressource {
    id: string | null;
    title: string;
    description: string;
    createdAt: string;
    modifiedAt: string;
    isActive: boolean;
    categoryId: number;
    category: Category;
  }