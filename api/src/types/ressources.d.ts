import { CategoryEntity } from "./category";
import { UserEntity } from "./user";

export type RessourceEntity = {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  modifiedAt: Date;
  isActive: boolean;
  categoryId: number;
  category: CategoryEntity;
  ressourceTypeId: number;
  ressourceType: RessourceTypeEntity;
  userId: number;
  user: UserEntity;
};

export type RessourceTypeEntity = {
  id: number;
  name: string;
  isActive: boolean;
  ressources: RessourceEntity[];
};

export interface RessourceCreateBody {
  title: string;
  description: string;
  categoryId: number;
  ressourceTypeId: number;
  userId: number;
}

export interface RessourceTypeCreateBody {
  name: string;
}
